-- PENDING: move into a CLI-generated migration before deployment

-- 1. Nullable integer `quantity` on products and product_variants.
-- 2. Constraints allowing only NULL or quantity >= 0.
ALTER TABLE products 
ADD COLUMN quantity integer DEFAULT NULL CHECK (quantity >= 0);

ALTER TABLE product_variants 
ADD COLUMN quantity integer DEFAULT NULL CHECK (quantity >= 0);

-- 3. Existing out-of-stock records become 0.
-- 4. Existing in-stock and low-stock records remain NULL (unconfigured/setup required).
UPDATE products SET quantity = 0 WHERE stock_status = 'out-of-stock';
UPDATE product_variants SET quantity = 0 WHERE stock_status = 'out-of-stock';

-- Note on 5: NULL means inventory setup required and unavailable once numeric inventory is activated.
-- This will be enforced by the RPC and application code.

CREATE OR REPLACE FUNCTION get_low_stock_threshold() RETURNS integer AS $$ SELECT 5; $$ LANGUAGE sql IMMUTABLE;

-- 6. Complete atomic order-placement function
-- SECURITY INVOKER to run as the caller (service_role via API).
CREATE OR REPLACE FUNCTION checkout_decrement_inventory(
    p_order_id text,
    p_customer jsonb,
    p_payment text,
    p_subtotal numeric,
    p_shipping numeric,
    p_total numeric,
    p_is_demo boolean,
    p_items jsonb -- array of objects: { slug, quantity, variantKey, name, price, variantName, variantSku, lineTotal }
) RETURNS jsonb AS $$
DECLARE
    item record;
    v_product_id bigint;
    v_variant_id bigint;
    v_qty integer;
    v_price numeric;
    v_current_stock integer;
    v_order_pk bigint;
    v_low_stock integer;
BEGIN
    v_low_stock := get_low_stock_threshold();

    -- Lock rows deterministically by sorting slugs and variantKeys
    FOR item IN SELECT * FROM jsonb_array_elements(p_items) ORDER BY value->>'slug', value->>'variantKey' LOOP
        v_qty := (item.value->>'quantity')::integer;
        IF v_qty IS NULL OR v_qty <= 0 THEN
            RAISE EXCEPTION 'BUSINESS_ERROR: Invalid quantity % for %', v_qty, item.value->>'slug';
        END IF;

        IF item.value->>'variantKey' IS NOT NULL THEN
            -- Variant ownership
            SELECT pv.id, pv.quantity, pv.price INTO v_variant_id, v_current_stock, v_price
            FROM products p
            JOIN product_variants pv ON p.id = pv.product_id
            WHERE p.slug = item.value->>'slug' AND pv.key = item.value->>'variantKey'
            FOR UPDATE; -- Lock the variant row

            IF NOT FOUND THEN
                RAISE EXCEPTION 'BUSINESS_ERROR: Variant not found for % %', item.value->>'slug', item.value->>'variantKey';
            END IF;

            IF v_current_stock IS NULL THEN
                RAISE EXCEPTION 'BUSINESS_ERROR: Inventory not configured for % %', item.value->>'slug', item.value->>'variantKey';
            END IF;

            IF v_current_stock < v_qty THEN
                RAISE EXCEPTION 'BUSINESS_ERROR: Insufficient stock for % %', item.value->>'slug', item.value->>'variantKey';
            END IF;

            -- Decrement variant ONLY
            UPDATE product_variants 
            SET quantity = quantity - v_qty 
            WHERE id = v_variant_id;
            
            -- Recalculate status for variant
            IF (v_current_stock - v_qty) = 0 THEN
                UPDATE product_variants SET stock_status = 'out-of-stock' WHERE id = v_variant_id;
            ELSIF (v_current_stock - v_qty) <= v_low_stock THEN
                UPDATE product_variants SET stock_status = 'low-stock' WHERE id = v_variant_id;
            ELSE
                UPDATE product_variants SET stock_status = 'in-stock' WHERE id = v_variant_id;
            END IF;

        ELSE
            -- Product ownership
            SELECT id, quantity, price INTO v_product_id, v_current_stock, v_price
            FROM products
            WHERE slug = item.value->>'slug'
            FOR UPDATE; -- Lock the product row

            IF NOT FOUND THEN
                RAISE EXCEPTION 'BUSINESS_ERROR: Product not found for %', item.value->>'slug';
            END IF;

            IF v_current_stock IS NULL THEN
                RAISE EXCEPTION 'BUSINESS_ERROR: Inventory not configured for %', item.value->>'slug';
            END IF;

            IF v_current_stock < v_qty THEN
                RAISE EXCEPTION 'BUSINESS_ERROR: Insufficient stock for %', item.value->>'slug';
            END IF;

            -- Decrement product ONLY
            UPDATE products 
            SET quantity = quantity - v_qty 
            WHERE id = v_product_id;
            
            -- Recalculate status for product
            IF (v_current_stock - v_qty) = 0 THEN
                UPDATE products SET stock_status = 'out-of-stock' WHERE id = v_product_id;
            ELSIF (v_current_stock - v_qty) <= v_low_stock THEN
                UPDATE products SET stock_status = 'low-stock' WHERE id = v_product_id;
            ELSE
                UPDATE products SET stock_status = 'in-stock' WHERE id = v_product_id;
            END IF;

        END IF;
    END LOOP;

    -- Create order
    INSERT INTO orders (order_id, customer, payment, subtotal, shipping, total, status, is_demo)
    VALUES (p_order_id, p_customer, p_payment, p_subtotal, p_shipping, p_total, 'new', p_is_demo)
    RETURNING id INTO v_order_pk;

    -- Create initial history
    INSERT INTO order_status_history (order_id, status, note, at) 
    VALUES (v_order_pk, 'new', 'Order placed', NOW());

    -- Create items
    FOR item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
        INSERT INTO order_items (order_id, slug, name, price, quantity, variant_key, variant_name, variant_sku, line_total)
        VALUES (
            v_order_pk,
            item.value->>'slug',
            item.value->>'name',
            (item.value->>'price')::numeric,
            (item.value->>'quantity')::integer,
            item.value->>'variantKey',
            item.value->>'variantName',
            item.value->>'variantSku',
            (item.value->>'lineTotal')::numeric
        );
    END LOOP;

    -- Return success payload
    RETURN jsonb_build_object('ok', true, 'order_id', p_order_id, 'internal_id', v_order_pk);
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;

REVOKE ALL ON FUNCTION checkout_decrement_inventory FROM PUBLIC;
REVOKE ALL ON FUNCTION checkout_decrement_inventory FROM anon;
REVOKE ALL ON FUNCTION checkout_decrement_inventory FROM authenticated;
GRANT EXECUTE ON FUNCTION checkout_decrement_inventory TO service_role;

-- 7. Complete idempotent cancellation/restoration function
CREATE OR REPLACE FUNCTION cancel_order_restore_inventory(
    p_order_id text,
    p_note text
) RETURNS jsonb AS $$
DECLARE
    v_order record;
    item record;
    v_current_stock integer;
    v_low_stock integer;
BEGIN
    v_low_stock := get_low_stock_threshold();

    SELECT * INTO v_order FROM orders WHERE order_id = p_order_id FOR UPDATE;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'BUSINESS_ERROR: Order not found';
    END IF;

    IF v_order.status = 'cancelled' THEN
        -- Idempotent, already cancelled
        RETURN jsonb_build_object('ok', true, 'status', 'cancelled');
    END IF;

    -- Prevent cancelling delivered orders unless forced (which isn't supported here)
    IF v_order.status = 'delivered' THEN
        RAISE EXCEPTION 'BUSINESS_ERROR: Cannot cancel a delivered order';
    END IF;

    -- Update order status
    UPDATE orders SET status = 'cancelled', status_updated_at = NOW() WHERE id = v_order.id;
    INSERT INTO order_status_history (order_id, status, note, at) VALUES (v_order.id, 'cancelled', p_note, NOW());

    -- Restore inventory
    FOR item IN SELECT * FROM order_items WHERE order_id = v_order.id LOOP
        IF item.variant_key IS NOT NULL THEN
            UPDATE product_variants 
            SET quantity = quantity + item.quantity 
            WHERE key = item.variant_key AND product_id = (SELECT id FROM products WHERE slug = item.slug);

            -- recalculate status
            SELECT quantity INTO v_current_stock FROM product_variants WHERE key = item.variant_key AND product_id = (SELECT id FROM products WHERE slug = item.slug);
            IF v_current_stock IS NOT NULL THEN
                IF v_current_stock <= v_low_stock THEN
                    UPDATE product_variants SET stock_status = 'low-stock' WHERE key = item.variant_key AND product_id = (SELECT id FROM products WHERE slug = item.slug);
                ELSE
                    UPDATE product_variants SET stock_status = 'in-stock' WHERE key = item.variant_key AND product_id = (SELECT id FROM products WHERE slug = item.slug);
                END IF;
            END IF;
        ELSE
            UPDATE products 
            SET quantity = quantity + item.quantity 
            WHERE slug = item.slug;

            -- recalculate status
            SELECT quantity INTO v_current_stock FROM products WHERE slug = item.slug;
            IF v_current_stock IS NOT NULL THEN
                IF v_current_stock <= v_low_stock THEN
                    UPDATE products SET stock_status = 'low-stock' WHERE slug = item.slug;
                ELSE
                    UPDATE products SET stock_status = 'in-stock' WHERE slug = item.slug;
                END IF;
            END IF;
        END IF;
    END LOOP;

    RETURN jsonb_build_object('ok', true, 'status', 'cancelled');
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;

REVOKE ALL ON FUNCTION cancel_order_restore_inventory FROM PUBLIC;
REVOKE ALL ON FUNCTION cancel_order_restore_inventory FROM anon;
REVOKE ALL ON FUNCTION cancel_order_restore_inventory FROM authenticated;
GRANT EXECUTE ON FUNCTION cancel_order_restore_inventory TO service_role;
