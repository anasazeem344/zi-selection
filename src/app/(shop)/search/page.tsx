import { Suspense } from "react";
import type { Metadata } from "next";
import { SearchList } from "@/components/shop/Lists";
import { getCategories, getProducts, inStock } from "@/lib/data";

export const metadata: Metadata = { title: "Search" };

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export default async function SearchPage() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);
  const name = new Map(categories.map((c) => [c.slug, c.name]));

  const list = products.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    price: p.price,
    images: p.images,
    category: p.category,
    soldOut: !inStock(p),
    isNew: p.tags.includes("new"),
    haystack: norm([p.name, p.description, p.material, name.get(p.category) ?? p.category, ...p.tags].join(" ")),
  }));

  const popular = categories.map((c) => c.name);

  return (
    <div className="shell pt-8 pb-20 lg:pt-12 lg:pb-28">
      <h1 className="display text-[clamp(2.6rem,6vw,4.5rem)]">Search</h1>
      <Suspense fallback={<div className="h-14" />}>
        <SearchList products={list} popular={popular} />
      </Suspense>
    </div>
  );
}
