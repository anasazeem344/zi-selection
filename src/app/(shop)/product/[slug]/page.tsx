import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Gallery } from "@/components/shop/Gallery";
import { ProductBuy } from "@/components/shop/ProductBuy";
import { ProductCard } from "@/components/shop/ProductCard";
import { getCategories, getProduct, getProducts, inStock } from "@/lib/data";
import { pkr } from "@/lib/format";
import { imageUrl } from "@/lib/supabase/public";

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/product/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProduct(slug);
  if (!p) return {};
  const img = imageUrl(p.images[0]?.path);
  return {
    title: p.name,
    description: p.description || `${p.name} from Zi's Selection.`,
    openGraph: img ? { images: [img] } : undefined,
  };
}

export default function ProductPage({ params }: PageProps<"/product/[slug]">) {
  return (
    <div className="shell pt-6 pb-20 lg:pt-10 lg:pb-28">
      <Suspense fallback={<div className="h-[70vh]" aria-busy="true" />}>
        <Product params={params} />
      </Suspense>
    </div>
  );
}

async function Product({ params }: { params: PageProps<"/product/[slug]">["params"] }) {
  const { slug } = await params;
  const [product, categories, all] = await Promise.all([getProduct(slug), getCategories(), getProducts()]);
  if (!product) notFound();

  const category = categories.find((c) => c.slug === product.category);
  const soldOut = !inStock(product);
  const related = all
    .filter((p) => p.id !== product.id && p.category === product.category)
    .concat(all.filter((p) => p.id !== product.id && p.category !== product.category))
    .slice(0, 4);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || undefined,
    image: product.images.map((i) => imageUrl(i.path)).filter(Boolean),
    ...(product.price != null && {
      offers: {
        "@type": "Offer",
        priceCurrency: "PKR",
        price: product.price,
        availability: soldOut ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
      },
    }),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <nav aria-label="Breadcrumb" className="text-xs tracking-[0.12em] text-muted uppercase">
        <Link href="/" className="hover:text-ink">Home</Link> /{" "}
        {category && <><Link href={`/shop/${category.slug}`} className="hover:text-ink">{category.name}</Link> / </>}
        <span className="text-ink">{product.name}</span>
      </nav>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
        <Gallery images={product.images} name={product.name} />

        <div className="lg:pt-2">
          <p className="eyebrow">{category?.name ?? "Jewelry"}{product.tags.includes("new") ? " · New" : ""}</p>
          <h1 className="display mt-4 text-[clamp(2.3rem,4.5vw,3.6rem)]">{product.name}</h1>
          <p className="mt-4 text-xl">{pkr(product.price)}</p>
          {product.description && <p className="mt-5 max-w-lg text-sm leading-7 text-muted">{product.description}</p>}

          <dl className="mt-6 grid max-w-lg grid-cols-[auto_1fr] gap-x-6 gap-y-2 border-y border-line py-5 text-sm">
            {product.material && (<><dt className="text-xs tracking-[0.12em] text-muted uppercase">Material</dt><dd>{product.material}</dd></>)}
            <dt className="text-xs tracking-[0.12em] text-muted uppercase">Availability</dt>
            <dd className={soldOut ? "text-danger" : "text-ok"}>{soldOut ? "Currently sold out" : "In stock"}</dd>
          </dl>

          <ProductBuy
            product={{ id: product.id, slug: product.slug, name: product.name, price: product.price, image: product.images[0]?.path ?? null }}
            sizes={product.sizes}
            stock={product.stock}
            soldOut={soldOut}
          />
          <p className="mt-4 max-w-lg text-xs leading-6 text-muted">
            Orders are confirmed with you in the chat: availability, price and delivery. <Link href="/how-to-order" className="link">How ordering works</Link>.
          </p>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20" aria-labelledby="related">
          <h2 id="related" className="display text-[clamp(2rem,4vw,3rem)]">You may also like</h2>
          <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-5 lg:grid-cols-4">
            {related.map((p, i) => (
              <li key={p.id}><ProductCard product={p} index={i} /></li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
