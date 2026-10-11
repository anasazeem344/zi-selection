"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { createOrder } from "@/lib/actions/admin";
import { pkr } from "@/lib/format";
import { ORDER_SOURCES } from "@/lib/types";
import { AdminForm, Field } from "./AdminForm";

type P = { id: string; name: string; price: number | null; sizes: string[] };
type Line = { id: string; name: string; price: number | null; size?: string; qty: number };

export function NewOrderForm({ products }: { products: P[] }) {
  const [lines, setLines] = useState<Line[]>([]);
  const [pick, setPick] = useState("");
  const [size, setSize] = useState("");
  const [qty, setQty] = useState(1);
  const [error, setError] = useState("");

  const selected = products.find((p) => p.id === pick);

  const add = () => {
    if (!selected) return setError("Choose a product first.");
    if (selected.sizes.length && !size) return setError("Choose a ring size.");
    setError("");
    setLines((cur) => {
      const found = cur.find((l) => l.id === selected.id && (l.size ?? "") === size);
      if (found) return cur.map((l) => (l === found ? { ...l, qty: l.qty + qty } : l));
      return [...cur, { id: selected.id, name: selected.name, price: selected.price, size: size || undefined, qty }];
    });
    setPick("");
    setSize("");
    setQty(1);
  };

  const subtotal = lines.reduce((s, l) => s + (l.price ?? 0) * l.qty, 0);

  return (
    <AdminForm action={createOrder} submitLabel="Create order">
      <input type="hidden" name="items" value={JSON.stringify(lines.map((l) => ({ id: l.id, size: l.size, qty: l.qty })))} />

      <section className="border border-line bg-white p-5 sm:p-6">
        <h2 className="display text-2xl">Items</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_8rem_6rem_auto] sm:items-end">
          <Field label="Product" htmlFor="pick">
            <select id="pick" className="input" value={pick} onChange={(e) => { setPick(e.target.value); setSize(""); }}>
              <option value="">Choose a product…</option>
              {products.map((p) => <option key={p.id} value={p.id}>{p.name} · {pkr(p.price)}</option>)}
            </select>
          </Field>
          <Field label="Ring size" htmlFor="size">
            <select id="size" className="input" value={size} onChange={(e) => setSize(e.target.value)} disabled={!selected?.sizes.length}>
              <option value="">{selected?.sizes.length ? "Select" : "—"}</option>
              {selected?.sizes.map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Qty" htmlFor="qty">
            <input id="qty" className="input" inputMode="numeric" value={qty} onChange={(e) => setQty(Math.max(1, Math.min(99, Math.floor(Number(e.target.value) || 1))))} />
          </Field>
          <button type="button" onClick={add} className="btn btn-outline"><Icon name="plus" size={16} /> Add</button>
        </div>
        {error && <p role="alert" className="mt-2 text-sm text-danger">{error}</p>}

        {lines.length > 0 && (
          <>
            <ul className="mt-5 divide-y divide-line border-y border-line">
              {lines.map((l, i) => (
                <li key={`${l.id}-${l.size}`} className="flex items-center justify-between gap-3 py-2 text-sm">
                  <span>{l.name}<span className="text-muted">{l.size ? ` · size ${l.size}` : ""} × {l.qty}</span></span>
                  <span className="flex items-center gap-2">
                    {pkr(l.price != null ? l.price * l.qty : null)}
                    <button type="button" aria-label={`Remove ${l.name}`} onClick={() => setLines((cur) => cur.filter((_, n) => n !== i))} className="grid h-11 w-11 place-items-center text-danger"><Icon name="trash" size={18} /></button>
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-right text-sm text-muted">Items total: <span className="text-ink">{pkr(subtotal || null)}</span></p>
          </>
        )}
      </section>

      <section className="mt-6 border border-line bg-white p-5 sm:p-6">
        <h2 className="display text-2xl">Customer</h2>
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <Field label="Where did the order come from?" htmlFor="source">
            <select id="source" name="source" className="input" defaultValue="WhatsApp">
              {ORDER_SOURCES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Name" htmlFor="customer_name"><input id="customer_name" name="customer_name" className="input" required maxLength={80} /></Field>
          <Field label="Mobile" htmlFor="phone"><input id="phone" name="phone" className="input" inputMode="tel" placeholder="0300 1234567" /></Field>
          <Field label="City" htmlFor="city"><input id="city" name="city" className="input" maxLength={60} /></Field>
          <Field label="Address" htmlFor="address" className="sm:col-span-2"><input id="address" name="address" className="input" maxLength={300} /></Field>
          <Field label="Delivery fee (PKR)" htmlFor="delivery_fee"><input id="delivery_fee" name="delivery_fee" className="input" inputMode="numeric" defaultValue="0" /></Field>
          <Field label="Notes" htmlFor="notes"><input id="notes" name="notes" className="input" maxLength={500} /></Field>
        </div>
      </section>
    </AdminForm>
  );
}
