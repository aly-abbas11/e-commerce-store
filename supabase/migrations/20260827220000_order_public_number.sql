CREATE SEQUENCE IF NOT EXISTS public.order_public_number
  AS bigint
  START WITH 1001
  INCREMENT BY 1
  NO MINVALUE
  NO CYCLE;

CREATE OR REPLACE FUNCTION public.next_order_public_number()
RETURNS bigint
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT nextval('public.order_public_number');
$$;

REVOKE ALL ON FUNCTION public.next_order_public_number() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.next_order_public_number() TO service_role;
GRANT USAGE ON SEQUENCE public.order_public_number TO service_role;

DO $$
DECLARE
  max_n bigint;
BEGIN
  SELECT COALESCE(
    MAX((regexp_match(order_id, '^VG-([0-9]+)$'))[1]::bigint),
    1000
  )
  INTO max_n
  FROM public.orders
  WHERE order_id ~ '^VG-[0-9]+$';

  PERFORM setval('public.order_public_number', GREATEST(max_n, 1000), true);
END $$;
