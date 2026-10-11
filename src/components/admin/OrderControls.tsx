"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { addOrderNote, deleteOrder, setOrderPaid, updateOrderStatus } from "@/lib/actions/admin";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/types";
import { ActionButton } from "./AdminForm";

export function OrderControls({ id, status, paid, isOwner }: { id: number; status: OrderStatus; paid: boolean; isOwner: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState("");

  return (
    <div className="space-y-5">
      <div>
        <label htmlFor="order-status" className="label">Status</label>
        <select
          id="order-status"
          className="input"
          value={status}
          disabled={pending}
          onChange={(e) =>
            start(async () => {
              const res = await updateOrderStatus(id, e.target.value as OrderStatus);
              setError(res.error ?? "");
              router.refresh();
            })
          }
        >
          {ORDER_STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        {error && <p role="alert" className="mt-2 text-sm text-danger">{error}</p>}
      </div>

      <label className="flex min-h-11 items-center gap-3 text-sm">
        <input
          type="checkbox"
          className="h-5 w-5 accent-[var(--ink)]"
          checked={paid}
          disabled={pending}
          onChange={(e) => start(async () => { await setOrderPaid(id, e.target.checked); router.refresh(); })}
        />
        Payment received
      </label>

      <div className="flex flex-wrap gap-3">
        <button type="button" className="btn btn-outline" onClick={() => window.print()}>Print packing slip</button>
        {isOwner && (
          <ActionButton
            action={() => deleteOrder(id)}
            confirmText="Delete this order permanently? Use the Cancelled status to keep a record."
            onDone={() => router.push("/admin/orders")}
            className="btn btn-outline !border-danger text-danger"
          >
            Delete order
          </ActionButton>
        )}
      </div>
    </div>
  );
}

export function OrderNote({ id }: { id: number }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  return (
    <form
      className="mt-4"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const res = await addOrderNote(id, text);
          if (res.error) return setError(res.error);
          setError("");
          setText("");
          router.refresh();
        });
      }}
    >
      <label htmlFor="note" className="label">Add an internal note</label>
      <div className="flex gap-2">
        <input id="note" className="input" value={text} onChange={(e) => setText(e.target.value)} maxLength={500} placeholder="e.g. Customer will pay on delivery" />
        <button type="submit" disabled={pending || !text.trim()} className="btn btn-outline">Add</button>
      </div>
      {error && <p role="alert" className="mt-2 text-sm text-danger">{error}</p>}
    </form>
  );
}
