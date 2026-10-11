import Link from "next/link";
import { Photo } from "@/components/ui/Media";
import { pkr } from "@/lib/format";
import type { Product } from "@/lib/types";
import { WishlistButton } from "./WishlistButton";

export type CardProduct = Pick<Product, "id" | "slug" | "name" | "price" | "images" | "category"> & { soldOut?: boolean; isNew?: boolean };

export function ProductCard({ product, index = 0, priority = false }: { product: CardProduct; index?: number; priority?: boolean }) {
  const img = product.images[0];
  return (
    <article className="group">
      <div className="relative aspect-[4/5] overflow-hidden bg-paper">
        <Link href={`/product/${product.slug}`} aria-label={product.name} className="absolute inset-0 block">
          <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-[1.03]">
            <Photo path={img?.path} alt={img?.alt || product.name} seed={index} priority={priority} />
          </div>
        </Link>
        <WishlistButton id={product.id} name={product.name} className="absolute top-3 right-3" />
        {(product.soldOut || product.isNew) && (
          <span className={`chip absolute top-3 left-3 bg-canvas/90 ${product.soldOut ? "text-danger" : "text-gold-deep"}`}>
            {product.soldOut ? "Sold out" : "New"}
          </span>
        )}
      </div>
      <div className="pt-4">
        <h3 className="display text-xl leading-tight">
          <Link href={`/product/${product.slug}`} className="hover:text-gold-deep">{product.name}</Link>
        </h3>
        <p className="mt-1.5 text-sm text-muted">{pkr(product.price)}</p>
      </div>
    </article>
  );
}
