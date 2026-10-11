"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { Photo } from "@/components/ui/Media";
import { logOrder } from "@/lib/actions/order";
import { igLink, pkr, waLink } from "@/lib/format";
import { useShop, type BagItem } from "./ShopProvider";

function buildMessage(items: BagItem[], name: string, city: string) {
  const lines = items.map((i, n) => {
    const size = i.size ? ` (size ${i.size})` : "";
    const price = i.price != null ? ` — ${pkr(i.price * i.qty)}` : "";
    return `${n + 1}. ${i.name}${size} × ${i.qty}${price}`;
  });
  const total = items.reduce((s, i) => s + (i.price ?? 0) * i.qty, 0);
  const hasAllPrices = items.every((i) => i.price != null);
  return [
    "Hello Zi's Selection! I'd like to order:",
    "",
    ...lines,
    ...(hasAllPrices && total > 0 ? ["", `Total: ${pkr(total)}`] : []),
    ...(name || city ? [""] : []),
    ...(name ? [`Name: ${name}`] : []),
    ...(city ? [`City: ${city}`] : []),
  ].join("\n");
}

export function BagDrawer() {
  const { items, count, subtotal, setQty, remove, clear, bagOpen, setBagOpen, contact } = useShop();
  const ref = useRef<HTMLDialogElement>(null);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (bagOpen && !d.open) d.showModal();
    if (!bagOpen && d.open) d.close();
  }, [bagOpen]);

  const hasWhatsApp = contact.whatsapp.trim().length > 0;
  const hasAllPrices = items.every((i) => i.price != null);

  const send = (via: "WhatsApp" | "Instagram") => {
    const text = buildMessage(items, name.trim(), city.trim());
    const href = via === "WhatsApp" && hasWhatsApp ? waLink(contact.whatsapp, text) : igLink(contact.instagram);
    if (via === "Instagram") {
      // Instagram DMs can't be pre-filled, so copy the message to paste.
      void navigator.clipboard?.writeText(text).catch(() => {});
    }
    window.open(href, "_blank", "noopener");
    void logOrder({
      items: items.map((i) => ({ id: i.id, size: i.size, qty: i.qty })),
      name: name.trim(),
      city: city.trim(),
      source: via,
    });
  };

  return (
    <dialog
      ref={ref}
      aria-label="Shopping bag"
      onClose={() => setBagOpen(false)}
      onClick={(e) => e.target === ref.current && setBagOpen(false)}
      className="m-0 ml-auto h-dvh max-h-none w-full max-w-md bg-canvas p-0 text-ink backdrop:bg-ink/40"
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="display text-2xl">Your bag{count > 0 && <span className="text-base text-muted"> · {count}</span>}</h2>
          <button type="button" onClick={() => setBagOpen(false)} aria-label="Close bag" className="grid h-11 w-11 place-items-center">
            <Icon name="close" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="grid flex-1 place-items-center px-6 text-center">
            <div>
              <p className="display text-3xl">Your bag is empty</p>
              <p className="mt-3 text-sm text-muted">Add a piece or two, then send your selection to us in one tap.</p>
              <Link href="/shop/all" onClick={() => setBagOpen(false)} className="btn btn-dark mt-6">
                Browse the collection
              </Link>
            </div>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-line overflow-y-auto px-5">
              {items.map((i) => (
                <li key={`${i.id}:${i.size ?? ""}`} className="flex gap-4 py-4">
                  <div className="relative h-24 w-20 shrink-0 overflow-hidden bg-paper">
                    <Photo path={i.image} alt={i.name} sizes="80px" />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <Link href={`/product/${i.slug}`} onClick={() => setBagOpen(false)} className="display text-lg leading-tight">
                      {i.name}
                    </Link>
                    <p className="mt-1 text-xs text-muted">{i.size ? `Size ${i.size} · ` : ""}{pkr(i.price)}</p>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="flex items-center border border-line">
                        <button type="button" aria-label={`Decrease quantity of ${i.name}`} disabled={i.qty <= 1} onClick={() => setQty(i.id, i.size, i.qty - 1)} className="grid h-11 w-11 place-items-center disabled:opacity-40">
                          <Icon name="minus" size={16} />
                        </button>
                        <span className="w-8 text-center text-sm" aria-live="polite">{i.qty}</span>
                        <button type="button" aria-label={`Increase quantity of ${i.name}`} disabled={i.qty >= 9} onClick={() => setQty(i.id, i.size, i.qty + 1)} className="grid h-11 w-11 place-items-center disabled:opacity-40">
                          <Icon name="plus" size={16} />
                        </button>
                      </div>
                      <button type="button" onClick={() => remove(i.id, i.size)} className="min-h-11 px-2 text-xs uppercase tracking-[0.12em] text-muted underline underline-offset-4">
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t border-line bg-paper px-5 py-5">
              {hasAllPrices && subtotal > 0 && (
                <p className="mb-4 flex items-baseline justify-between">
                  <span className="text-sm text-muted">Estimated total</span>
                  <span className="display text-2xl">{pkr(subtotal)}</span>
                </p>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="bag-name" className="label">Your name (optional)</label>
                  <input id="bag-name" className="input" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} />
                </div>
                <div>
                  <label htmlFor="bag-city" className="label">City (optional)</label>
                  <input id="bag-city" className="input" autoComplete="address-level2" value={city} onChange={(e) => setCity(e.target.value)} maxLength={60} />
                </div>
              </div>
              <div className="mt-4 grid gap-3">
                {hasWhatsApp && (
                  <button type="button" onClick={() => send("WhatsApp")} className="btn btn-gold w-full">
                    <Icon name="whatsapp" size={18} /> Order on WhatsApp
                  </button>
                )}
                <button type="button" onClick={() => send("Instagram")} className={`btn w-full ${hasWhatsApp ? "btn-outline" : "btn-gold"}`}>
                  <Icon name="instagram" size={18} /> Order on Instagram
                </button>
              </div>
              <p className="mt-3 text-xs leading-5 text-muted">
                We confirm availability, price and delivery with you in the chat. Open daily {contact.hours}.
                {" "}Instagram can&apos;t pre-fill messages, so your list is copied: just paste it.
              </p>
              <button type="button" onClick={clear} className="mt-2 min-h-11 text-xs uppercase tracking-[0.12em] text-muted underline underline-offset-4">
                Clear bag
              </button>
            </div>
          </>
        )}
      </div>
    </dialog>
  );
}
