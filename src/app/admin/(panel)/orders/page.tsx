import Link from "next/link";
import { EmptyRow, PageHeader, StatusChip } from "@/components/admin/ui";
import { adminOrders } from "@/lib/admin/queries";
import { formatDate, orderCode, orderSubtotal, pkr } from "@/lib/format";
import { ORDER_SOURCES, ORDER_STATUSES } from "@/lib/types";

export const metadata = { title: "Orders" };

export default async function OrdersPage({ searchParams }: PageProps<"/admin/orders">) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim().toLowerCase() : "";
  const status = typeof sp.status === "string" ? sp.status : "";
  const source = typeof sp.source === "string" ? sp.source : "";

  const all = await adminOrders();
  const list = all.filter(
    (o) =>
      (!status || o.status === status) &&
      (!source || o.source === source) &&
      (!q || orderCode(o.id).toLowerCase().includes(q) || o.customer_name.toLowerCase().includes(q) || o.phone.includes(q.replace(/\D/g, "") || "—")),
  );

  return (
    <>
      <PageHeader title="Orders" sub="Orders arrive here when a customer sends their bag on WhatsApp or Instagram, or when you add one yourself.">
        <Link href="/admin/orders/new" className="btn btn-gold">New order</Link>
      </PageHeader>

      <form className="mb-6 grid gap-3 sm:grid-cols-[1fr_auto_auto_auto]" role="search">
        <label className="sr-only" htmlFor="q">Search orders</label>
        <input id="q" name="q" defaultValue={q} placeholder="Order number, name or phone" className="input" />
        <label className="sr-only" htmlFor="status">Status</label>
        <select id="status" name="status" defaultValue={status} className="input sm:w-40">
          <option value="">All statuses</option>
          {ORDER_STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <label className="sr-only" htmlFor="source">Source</label>
        <select id="source" name="source" defaultValue={source} className="input sm:w-40">
          <option value="">All sources</option>
          {ORDER_SOURCES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <button type="submit" className="btn btn-outline">Filter</button>
      </form>

      {list.length === 0 ? (
        <EmptyRow title={all.length ? "No orders match" : "No orders yet"} body={all.length ? "Try clearing the filters." : "When a customer sends their bag, it shows up here as a New order."}>
          <Link href="/admin/orders/new" className="btn btn-dark">Add an order</Link>
        </EmptyRow>
      ) : (
        <ul className="divide-y divide-line border border-line bg-white">
          {list.map((o) => (
            <li key={o.id}>
              <Link href={`/admin/orders/${o.id}`} className="flex flex-wrap items-center justify-between gap-3 p-4 hover:bg-paper">
                <span className="min-w-[10rem]">
                  <span className="font-medium">{orderCode(o.id)}</span>
                  <span className="text-sm text-muted"> · {o.customer_name || "Customer"}{o.city && ` · ${o.city}`}</span>
                  <span className="block text-xs text-muted">{formatDate(o.created_at)} · {o.source} · {o.items.reduce((n, i) => n + i.qty, 0)} items</span>
                </span>
                <span className="flex items-center gap-4">
                  <span className="text-sm">{pkr(orderSubtotal(o.items) + o.delivery_fee || null)}</span>
                  <StatusChip status={o.status} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
