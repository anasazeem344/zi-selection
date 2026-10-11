"use client";

import { useMemo, useState } from "react";
import { ProductCard, type CardProduct } from "./ProductCard";

type Sort = "featured" | "low" | "high" | "new";
type Item = CardProduct & { position: number; featured: boolean };

export function ProductGrid({ products }: { products: Item[] }) {
  const [sort, setSort] = useState<Sort>("featured");

  const sorted = useMemo(() => {
    const list = [...products];
    if (sort === "low") list.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
    if (sort === "high") list.sort((a, b) => (b.price ?? -1) - (a.price ?? -1));
    if (sort === "new") list.sort((a, b) => Number(b.isNew ?? false) - Number(a.isNew ?? false));
    if (sort === "featured") list.sort((a, b) => Number(b.featured) - Number(a.featured) || a.position - b.position);
    return list;
  }, [products, sort]);

  const hasPrices = products.some((p) => p.price != null);

  return (
    <>
      <div className="flex items-center justify-between gap-4 border-y border-line py-3">
        <p className="text-sm text-muted" aria-live="polite">
          {products.length} {products.length === 1 ? "piece" : "pieces"}
        </p>
        <div className="flex items-center gap-2">
          <label htmlFor="sort" className="text-xs tracking-[0.12em] text-muted uppercase">Sort</label>
          <select id="sort" value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="input !min-h-11 !w-auto !py-1 text-sm">
            <option value="featured">Featured</option>
            <option value="new">New first</option>
            {hasPrices && <option value="low">Price: low to high</option>}
            {hasPrices && <option value="high">Price: high to low</option>}
          </select>
        </div>
      </div>
      <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-5 lg:grid-cols-4">
        {sorted.map((p, i) => (
          <li key={p.id}>
            <ProductCard product={p} index={i} priority={i < 4} />
          </li>
        ))}
      </ul>
    </>
  );
}
