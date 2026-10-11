import { notFound } from "next/navigation";
import Link from "next/link";
import { AdminForm, Field } from "@/components/admin/AdminForm";
import { OrderControls, OrderNote } from "@/components/admin/OrderControls";
import { Card, PageHeader, StatusChip } from "@/components/admin/ui";
import { saveOrderDetails } from "@/lib/actions/admin";
import { getAdmin } from "@/lib/admin/auth";
import { adminOrder } from "@/lib/admin/queries";
import { formatDate, orderCode, orderSubtotal, pkr, waLink } from "@/lib/format";

export const metadata = { title: "Order" };

export default async function OrderPage({ params }: PageProps<"/admin/orders/[id]">) {
  const { id: raw } = await params;
  const id = Number(raw);
  if (!Number.isInteger(id) || id < 1) notFound();
  const [order, admin] = await Promise.all([adminOrder(id), getAdmin()]);
  if (!order) notFound();

  const subtotal = orderSubtotal(order.items);
  const unpriced = order.items.some((i) => i.price == null);
  const save = saveOrderDetails.bind(null, order.id);

  return (
    <>
      <PageHeader title={orderCode(order.id)} sub={`${formatDate(order.created_at)} · from ${order.source}`}>
        <StatusChip status={order.status} />
        {order.phone && (
          <a href={waLink(order.phone, `Hello ${order.customer_name || ""}, this is Zi's Selection about your order ${orderCode(order.id)}.`)} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
            Message customer
          </a>
        )}
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <Card title="Items">
            <div className="print-area">
              <p className="hidden print:block">Zi&apos;s Selection · packing slip · {orderCode(order.id)}</p>
              <ul className="divide-y divide-line">
                {order.items.map((i, n) => (
                  <li key={n} className="flex items-center justify-between gap-4 py-3 text-sm">
                    <span>
                      {i.name}
                      <span className="text-muted">{i.size ? ` · size ${i.size}` : ""} × {i.qty}</span>
                    </span>
                    <span>{pkr(i.price != null ? i.price * i.qty : null)}</span>
                  </li>
                ))}
              </ul>
              <dl className="mt-4 space-y-1 border-t border-line pt-4 text-sm">
                <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd>{unpriced && !subtotal ? "To be confirmed" : pkr(subtotal)}</dd></div>
                <div className="flex justify-between"><dt className="text-muted">Delivery</dt><dd>{order.delivery_fee ? pkr(order.delivery_fee) : "—"}</dd></div>
                <div className="flex justify-between text-base font-medium"><dt>Total</dt><dd>{unpriced ? "To be confirmed" : pkr(subtotal + order.delivery_fee)}</dd></div>
              </dl>
              <div className="mt-5 text-sm leading-6">
                <p className="text-xs tracking-[0.12em] text-muted uppercase">Deliver to</p>
                <p>{order.customer_name || "—"}{order.phone && ` · ${order.phone}`}</p>
                <p>{[order.address, order.city].filter(Boolean).join(", ") || "Address to be confirmed"}</p>
              </div>
            </div>
            {unpriced && <p className="mt-3 text-xs text-muted">Some items are “price on request”. Confirm the price with the customer, then record the delivery fee below.</p>}
          </Card>

          <Card title="Customer and delivery">
            <AdminForm action={save} submitLabel="Save details">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Name" htmlFor="customer_name"><input id="customer_name" name="customer_name" defaultValue={order.customer_name} className="input" maxLength={80} /></Field>
                <Field label="Mobile" htmlFor="phone" hint="Used for the “Message customer” button."><input id="phone" name="phone" defaultValue={order.phone} className="input" inputMode="tel" placeholder="0300 1234567" /></Field>
                <Field label="City" htmlFor="city"><input id="city" name="city" defaultValue={order.city} className="input" maxLength={60} /></Field>
                <Field label="Delivery fee (PKR)" htmlFor="delivery_fee"><input id="delivery_fee" name="delivery_fee" defaultValue={order.delivery_fee} className="input" inputMode="numeric" /></Field>
                <Field label="Address" htmlFor="address" className="sm:col-span-2"><input id="address" name="address" defaultValue={order.address} className="input" maxLength={300} /></Field>
                <Field label="Notes" htmlFor="notes" className="sm:col-span-2"><textarea id="notes" name="notes" defaultValue={order.notes} className="input" maxLength={500} /></Field>
              </div>
            </AdminForm>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Manage">
            <OrderControls id={order.id} status={order.status} paid={order.paid} isOwner={admin?.role === "owner"} />
          </Card>
          <Card title="Timeline">
            <ol className="space-y-3 text-sm">
              {[...order.timeline].reverse().map((t, n) => (
                <li key={n} className="border-l-2 border-gold pl-3">
                  <p className="font-medium">{t.status === "Note" ? "Note" : t.status}</p>
                  {t.text && <p className="text-muted">{t.text}</p>}
                  <p className="text-xs text-muted">{formatDate(t.at)} · {t.by}</p>
                </li>
              ))}
            </ol>
            <OrderNote id={order.id} />
          </Card>
          <Link href="/admin/orders" className="inline-flex min-h-11 items-center text-xs tracking-[0.12em] uppercase underline underline-offset-4">Back to orders</Link>
        </div>
      </div>
    </>
  );
}
