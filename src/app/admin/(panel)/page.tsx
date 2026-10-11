import Link from "next/link";
import { Card, EmptyRow, PageHeader, StatusChip } from "@/components/admin/ui";
import { adminOrders, adminProducts, isLowStock, stockTotal } from "@/lib/admin/queries";
import { formatDate, orderCode, orderSubtotal, pkr } from "@/lib/format";

const TZ = "Asia/Karachi";
const day = (d: Date | string) => new Date(d).toLocaleDateString("en-CA", { timeZone: TZ });

export default async function Dashboard({ searchParams }: PageProps<"/admin">) {
  const [orders, products, sp] = await Promise.all([adminOrders(), adminProducts(), searchParams]);

  const today = day(new Date());
  const month = today.slice(0, 7);
  const live = orders.filter((o) => o.status !== "Cancelled" && o.status !== "Returned");
  const todayCount = orders.filter((o) => day(o.created_at) === today).length;
  const newCount = orders.filter((o) => o.status === "New").length;
  const monthOrders = live.filter((o) => day(o.created_at).startsWith(month));
  const revenue = monthOrders.reduce((s, o) => s + orderSubtotal(o.items) + o.delivery_fee, 0);
  const unpriced = monthOrders.some((o) => o.items.some((i) => i.price == null));
  const low = products.filter((p) => p.status === "active" && isLowStock(p));

  const sold = new Map<string, { name: string; qty: number }>();
  for (const o of live) for (const i of o.items) {
    const key = i.product_id ?? i.name;
    sold.set(key, { name: i.name, qty: (sold.get(key)?.qty ?? 0) + i.qty });
  }
  const top = [...sold.values()].sort((a, b) => b.qty - a.qty).slice(0, 5);

  const tiles: [string, string | number, string?][] = [
    ["Orders today", todayCount],
    ["New, to confirm", newCount],
    ["Revenue this month", pkr(revenue), unpriced ? "Excludes items priced on request" : undefined],
    ["Low stock", low.length],
  ];

  return (
    <>
      {sp.denied && (
        <p role="alert" className="mb-6 border border-danger/50 p-4 text-sm text-danger">That screen is for the shop owner only.</p>
      )}
      <PageHeader title="Dashboard">
        <Link href="/admin/products/new" className="btn btn-gold">Add product</Link>
        <Link href="/admin/orders/new" className="btn btn-outline">New order</Link>
      </PageHeader>

      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tiles.map(([label, value, note]) => (
          <div key={label} className="border border-line bg-white p-5">
            <dt className="text-xs tracking-[0.12em] text-muted uppercase">{label}</dt>
            <dd className="display mt-2 text-3xl">{value}</dd>
            {note && <p className="mt-1 text-xs text-muted">{note}</p>}
          </div>
        ))}
      </dl>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card title="Recent orders">
          {orders.length === 0 ? (
            <EmptyRow title="No orders yet" body="Orders sent from the website bag, or added by you, appear here." />
          ) : (
            <ul className="divide-y divide-line">
              {orders.slice(0, 6).map((o) => (
                <li key={o.id}>
                  <Link href={`/admin/orders/${o.id}`} className="flex min-h-14 flex-wrap items-center justify-between gap-2 py-2 hover:bg-paper">
                    <span>
                      <span className="text-sm font-medium">{orderCode(o.id)}</span>
                      <span className="text-sm text-muted"> · {o.customer_name || "Customer"} · {o.source}</span>
                      <span className="block text-xs text-muted">{formatDate(o.created_at)}</span>
                    </span>
                    <StatusChip status={o.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <Link href="/admin/orders" className="mt-4 inline-flex min-h-11 items-center text-xs tracking-[0.12em] uppercase underline underline-offset-4">All orders</Link>
        </Card>

        <div className="space-y-6">
          <Card title="Low stock">
            {low.length === 0 ? (
              <p className="text-sm text-muted">Everything is well stocked.</p>
            ) : (
              <ul className="divide-y divide-line">
                {low.slice(0, 6).map((p) => (
                  <li key={p.id}>
                    <Link href={`/admin/products/${p.id}`} className="flex min-h-11 items-center justify-between gap-3 py-2 text-sm hover:bg-paper">
                      <span className="truncate">{p.name}</span>
                      <span className="shrink-0 text-danger">{stockTotal(p)} left</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
          <Card title="Best sellers">
            {top.length === 0 ? (
              <p className="text-sm text-muted">Appears once you have orders.</p>
            ) : (
              <ol className="space-y-2 text-sm">
                {top.map((t) => (
                  <li key={t.name} className="flex justify-between gap-3"><span className="truncate">{t.name}</span><span className="text-muted">{t.qty} sold</span></li>
                ))}
              </ol>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
