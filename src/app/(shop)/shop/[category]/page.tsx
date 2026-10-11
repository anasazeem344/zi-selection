import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { getCategories, getProducts } from "@/lib/data";
import { inStock } from "@/lib/data";

const COPY: Record<string, { title: string; blurb: string }> = {
  all: { title: "All Jewelry", blurb: "Every piece in the Zi's Selection edit, in one place." },
  new: { title: "New Arrivals", blurb: "The latest pieces to join the edit." },
  rings: { title: "Rings", blurb: "Gold-tone bands, stackable sets and statement stones." },
  brooches: { title: "Brooches", blurb: "Small, authored objects for lapels, scarves and saris." },
  necklaces: { title: "Necklaces", blurb: "Fine chains and pendants that layer with ease." },
  earrings: { title: "Earrings", blurb: "Studs and drops that frame the face." },
};

export async function generateStaticParams() {
  const categories = await getCategories();
  return [{ category: "all" }, { category: "new" }, ...categories.map((c) => ({ category: c.slug }))];
}

export async function generateMetadata({ params }: PageProps<"/shop/[category]">): Promise<Metadata> {
  const { category } = await params;
  const categories = await getCategories();
  const name = COPY[category]?.title ?? categories.find((c) => c.slug === category)?.name;
  return name ? { title: name, description: COPY[category]?.blurb } : {};
}

export default function CollectionPage({ params }: PageProps<"/shop/[category]">) {
  return (
    <div className="shell pt-8 pb-20 lg:pt-12 lg:pb-28">
      <Suspense fallback={<div className="h-96" aria-busy="true" />}>
        <Collection params={params} />
      </Suspense>
    </div>
  );
}

async function Collection({ params }: { params: PageProps<"/shop/[category]">["params"] }) {
  const { category } = await params;
  const [categories, all] = await Promise.all([getCategories(), getProducts()]);

  const known = category === "all" || category === "new" || categories.some((c) => c.slug === category);
  if (!known) notFound();

  const list = all
    .filter((p) => (category === "all" ? true : category === "new" ? p.tags.includes("new") : p.category === category))
    .map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      price: p.price,
      images: p.images,
      category: p.category,
      position: p.position,
      featured: p.featured,
      soldOut: !inStock(p),
      isNew: p.tags.includes("new"),
    }));

  const copy = COPY[category] ?? { title: categories.find((c) => c.slug === category)!.name, blurb: "" };
  const tabs = [{ slug: "all", name: "All" }, ...categories.map((c) => ({ slug: c.slug, name: c.name }))];

  return (
    <>
      <nav aria-label="Breadcrumb" className="text-xs tracking-[0.12em] text-muted uppercase">
        <Link href="/" className="hover:text-ink">Home</Link> / <span className="text-ink">{copy.title}</span>
      </nav>
      <h1 className="display mt-5 text-[clamp(2.6rem,6vw,4.5rem)]">{copy.title}</h1>
      {copy.blurb && <p className="mt-4 max-w-xl text-sm leading-7 text-muted">{copy.blurb}</p>}

      <ul className="mt-8 mb-8 flex gap-2 overflow-x-auto pb-1" aria-label="Categories">
        {tabs.map((t) => (
          <li key={t.slug} className="shrink-0">
            <Link
              href={`/shop/${t.slug}`}
              aria-current={t.slug === category ? "page" : undefined}
              className={`chip min-h-11 px-4 text-sm ${t.slug === category ? "bg-ink text-white" : "hover:bg-ink hover:text-white"}`}
            >
              {t.name}
            </Link>
          </li>
        ))}
      </ul>

      {list.length === 0 ? (
        <div className="py-16 text-center">
          <p className="display text-3xl">Nothing here yet</p>
          <p className="mt-3 text-sm text-muted">New pieces are added often. Check the full collection meanwhile.</p>
          <Link href="/shop/all" className="btn btn-dark mt-6">Browse all jewelry</Link>
        </div>
      ) : (
        <ProductGrid products={list} />
      )}
    </>
  );
}
