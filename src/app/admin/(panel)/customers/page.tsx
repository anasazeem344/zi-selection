import Link from "next/link";
import { EmptyRow, PageHeader } from "@/components/admin/ui";
import { adminOrders } from "@/lib/admin/queries";
import { formatDate, orderSubtotal, pkr } from "@/lib/format";

export const metadata = { title: "Customers" };

export default async function CustomersPage() {
  const orders = (await adminOrders()).filter((o) => o.status !== "Cancelled");

  type C = { key: string; name: string; phone: string; city: string; orders: number; spent: number; last: string };
  const map = new Map<string, C>();
  for (const o of orders) {
    const key = o.phone || o.customer_name.toLowerCase() || `order-${o.id}`;
    const cur = map.get(key);
    const spent = orderSubtotal(o.items) + o.delivery_fee;
    if (cur) {
      cur.orders += 1;
      cur.spent += spent;
      if (!cur.phone && o.phone) cur.phone = o.phone;
      if (!cur.city && o.city) cur.city = o.city;
    } else {
      map.set(key, { key, name: o.customer_name || "Unnamed customer", phone: o.phone, city: o.city, orders: 1, spent, last: o.created_at });
    }
  }
  const customers = [...map.values()].sort((a, b) => b.last.localeCompare(a.last));

  return (
    <>
      <PageHeader title="Customers" sub="Built automatically from your orders, grouped by mobile number." />
      {customers.length === 0 ? (
        <EmptyRow title="No customers yet" body="Customers appear here after their first order." />
      ) : (
        <ul className="divide-y divide-line border border-line bg-white">
          {customers.map((c) => (
            <li key={c.key} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <span className="min-w-[10rem]">
                <span className="font-medium">{c.name}</span>
                <span className="block text-xs text-muted">{[c.phone, c.city].filter(Boolean).join(" · ") || "No contact details yet"}</span>
              </span>
              <span className="flex items-center gap-6 text-sm">
                <span className="text-muted">{c.orders} {c.orders === 1 ? "order" : "orders"}</span>
                <span>{c.spent ? pkr(c.spent) : "—"}</span>
                <span className="hidden text-xs text-muted sm:block">Last {formatDate(c.last)}</span>
                {c.phone && <Link href={`/admin/orders?q=${encodeURIComponent(c.phone)}`} className="inline-flex min-h-11 items-center text-xs tracking-[0.1em] uppercase underline underline-offset-4">Orders</Link>}
              </span>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
