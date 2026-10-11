"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { ProductCard, type CardProduct } from "./ProductCard";
import { useShop } from "./ShopProvider";

export type ListProduct = CardProduct & { haystack: string };

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export function SearchList({ products, popular }: { products: ListProduct[]; popular: string[] }) {
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");

  const results = useMemo(() => {
    const tokens = norm(q).split(/\s+/).filter(Boolean);
    if (!tokens.length) return [];
    return products.filter((p) => tokens.every((t) => p.haystack.includes(t)));
  }, [q, products]);

  return (
    <>
      <div role="search" className="relative mt-8 max-w-2xl">
        <label htmlFor="q" className="sr-only">Search jewelry</label>
        <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted"><Icon name="search" /></span>
        <input id="q" type="search" autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search rings, brooches, pearl…" className="input !min-h-14 !pl-12 text-base" autoComplete="off" />
      </div>

      {!q.trim() ? (
        <div className="mt-8">
          <p className="eyebrow">Popular searches</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {popular.map((p) => (
              <li key={p}>
                <button type="button" onClick={() => setQ(p)} className="chip min-h-11 px-4 text-sm hover:bg-ink hover:text-white">{p}</button>
              </li>
            ))}
          </ul>
        </div>
      ) : results.length === 0 ? (
        <div className="mt-12 text-center" role="status">
          <p className="display text-3xl">No matches for “{q}”</p>
          <p className="mt-3 text-sm text-muted">Try a simpler word, or browse everything.</p>
          <Link href="/shop/all" className="btn btn-dark mt-6">Browse all jewelry</Link>
        </div>
      ) : (
        <>
          <p className="mt-8 text-sm text-muted" role="status">{results.length} {results.length === 1 ? "result" : "results"}</p>
          <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-5 lg:grid-cols-4">
            {results.map((p, i) => (
              <li key={p.id}><ProductCard product={p} index={i} /></li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}

export function WishlistList({ products }: { products: ListProduct[] }) {
  const { wishlist } = useShop();
  const saved = products.filter((p) => wishlist.includes(p.id));

  if (saved.length === 0) {
    return (
      <div className="mt-12 text-center" role="status">
        <p className="display text-3xl">Nothing saved yet</p>
        <p className="mx-auto mt-3 max-w-sm text-sm text-muted">Tap the heart on any piece to keep it here. Saved pieces stay on this device.</p>
        <Link href="/shop/all" className="btn btn-dark mt-6">Browse the collection</Link>
      </div>
    );
  }
  return (
    <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-5 lg:grid-cols-4">
      {saved.map((p, i) => (
        <li key={p.id}><ProductCard product={p} index={i} /></li>
      ))}
    </ul>
  );
}
