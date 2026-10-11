import type { Metadata } from "next";
import { WishlistList } from "@/components/shop/Lists";
import { getProducts, inStock } from "@/lib/data";

export const metadata: Metadata = { title: "Wishlist" };

export default async function WishlistPage() {
  const products = await getProducts();
  const list = products.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    price: p.price,
    images: p.images,
    category: p.category,
    soldOut: !inStock(p),
    isNew: p.tags.includes("new"),
    haystack: "",
  }));

  return (
    <div className="shell pt-8 pb-20 lg:pt-12 lg:pb-28">
      <h1 className="display text-[clamp(2.6rem,6vw,4.5rem)]">Wishlist</h1>
      <WishlistList products={list} />
    </div>
  );
}
