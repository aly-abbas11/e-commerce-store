import { listContactSubmissions, type InboxItem } from "@/lib/db/inbox-store";
import {
  buildCustomerRowsFromOrders,
  type CustomerRow,
} from "@/lib/db/customer-list";
import {
  inboxMatchesCustomer,
  orderMatchesCustomerKey,
} from "@/lib/db/customer-profile-rules";
import { getAllOrders } from "@/lib/order-store";
import type { Order } from "@/lib/types";

export type CustomerProfile = {
  customer: CustomerRow;
  orders: Order[];
  inbox: InboxItem[];
};

export async function getCustomerProfile(
  key: string
): Promise<CustomerProfile | null> {
  const decoded = decodeURIComponent(key);
  const orders = await getAllOrders();
  const rows = buildCustomerRowsFromOrders(orders);
  const customer = rows.find((r) => r.key === decoded);
  if (!customer) return null;

  const matchedOrders = orders.filter((o) =>
    orderMatchesCustomerKey(o, customer.key, customer.email, customer.phone)
  );

  const inboxAll = await listContactSubmissions({ includeDemo: false }).catch(
    () => [] as InboxItem[]
  );
  const inbox = inboxAll.filter((item) =>
    inboxMatchesCustomer(item, {
      email: customer.email,
      phone: customer.phone,
    })
  );

  return { customer, orders: matchedOrders, inbox };
}
