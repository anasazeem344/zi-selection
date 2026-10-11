import type { MetadataRoute } from "next";
import { getCategories, getProducts, getPublishedPages } from "@/lib/data";

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories, pages] = await Promise.all([getProducts(), getCategories(), getPublishedPages()]);
  return [
    { url: base, priority: 1 },
    { url: `${base}/shop/all`, priority: 0.9 },
    ...categories.map((c) => ({ url: `${base}/shop/${c.slug}`, priority: 0.8 })),
    ...products.map((p) => ({ url: `${base}/product/${p.slug}`, priority: 0.7 })),
    ...pages.map((p) => ({ url: `${base}/${p.slug}`, priority: 0.4 })),
  ];
}
