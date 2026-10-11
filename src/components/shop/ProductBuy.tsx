"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { igLink, pkr, waLink } from "@/lib/format";
import { logOrder } from "@/lib/actions/order";
import { WishlistButton } from "./WishlistButton";
import { useShop } from "./ShopProvider";

type Props = {
  product: { id: string; slug: string; name: string; price: number | null; image: string | null };
  sizes: string[];
  stock: Record<string, number>;
  soldOut: boolean;
};

export function ProductBuy({ product, sizes, stock, soldOut }: Props) {
  const { add, contact } = useShop();
  const [size, setSize] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState(false);
  const sizeRef = useRef<HTMLDivElement>(null);

  const needsSize = sizes.length > 0;

  const guard = () => {
    if (needsSize && !size) {
      setError(true);
      sizeRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return false;
    }
    return true;
  };

  const addToBag = () => {
    if (!guard()) return;
    add({ id: product.id, slug: product.slug, name: product.name, price: product.price, image: product.image, size: size ?? undefined }, qty);
  };

  const orderNow = (via: "WhatsApp" | "Instagram") => {
    if (!guard()) return;
    const text = `Hello Zi's Selection! I'd like to order:\n\n1. ${product.name}${size ? ` (size ${size})` : ""} × ${qty}${product.price != null ? ` — ${pkr(product.price * qty)}` : ""}`;
    const useWa = via === "WhatsApp" && contact.whatsapp.trim();
    if (!useWa) void navigator.clipboard?.writeText(text).catch(() => {});
    window.open(useWa ? waLink(contact.whatsapp, text) : igLink(contact.instagram), "_blank", "noopener");
    void logOrder({ items: [{ id: product.id, size: size ?? undefined, qty }], source: useWa ? "WhatsApp" : "Instagram" });
  };

  const hasWhatsApp = contact.whatsapp.trim().length > 0;

  return (
    <div>
      {needsSize && (
        <div className="mt-7" ref={sizeRef}>
          <div className="flex items-center justify-between">
            <p id="size-label" className="text-xs tracking-[0.14em] uppercase">
              Ring size{size && <span className="text-muted normal-case tracking-normal"> · {size}</span>}
            </p>
            <Link href="/size-guide" className="inline-flex min-h-11 items-center text-xs tracking-[0.1em] uppercase underline underline-offset-4">
              Size guide
            </Link>
          </div>
          <div role="radiogroup" aria-labelledby="size-label" className="mt-1 flex flex-wrap gap-2">
            {sizes.map((s) => {
              const out = (stock[s] ?? 0) <= 0;
              const on = size === s;
              return (
                <button
                  key={s}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  disabled={out || soldOut}
                  aria-label={`Size ${s}${out ? ", unavailable" : ""}`}
                  onClick={() => {
                    setSize(s);
                    setError(false);
                  }}
                  className={`grid h-11 min-w-11 place-items-center border px-3 text-sm transition-colors disabled:text-muted/50 disabled:line-through ${
                    on ? "border-ink bg-ink text-white" : "border-line hover:border-ink"
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </div>
          {error && (
            <p role="alert" className="mt-2 text-sm text-danger">
              Please choose a ring size first.
            </p>
          )}
        </div>
      )}

      <div className="mt-6 flex items-center gap-4">
        <div className="flex items-center border border-line">
          <button type="button" aria-label="Decrease quantity" disabled={qty <= 1} onClick={() => setQty(qty - 1)} className="grid h-11 w-11 place-items-center disabled:opacity-40">
            <Icon name="minus" size={16} />
          </button>
          <span className="w-8 text-center text-sm" aria-live="polite">{qty}</span>
          <button type="button" aria-label="Increase quantity" disabled={qty >= 9} onClick={() => setQty(qty + 1)} className="grid h-11 w-11 place-items-center disabled:opacity-40">
            <Icon name="plus" size={16} />
          </button>
        </div>
        <WishlistButton id={product.id} name={product.name} />
      </div>

      <div className="mt-5 grid gap-3">
        <button type="button" disabled={soldOut} onClick={addToBag} className="btn btn-dark w-full">
          {soldOut ? "Sold out" : product.price != null ? `Add to bag · ${pkr(product.price * qty)}` : "Add to bag"}
        </button>
        {!soldOut && (
          <button type="button" onClick={() => orderNow(hasWhatsApp ? "WhatsApp" : "Instagram")} className="btn btn-gold w-full">
            <Icon name={hasWhatsApp ? "whatsapp" : "instagram"} size={18} />
            {hasWhatsApp ? "Order on WhatsApp" : "Order on Instagram"}
          </button>
        )}
      </div>
    </div>
  );
}
