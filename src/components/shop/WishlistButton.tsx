"use client";

import { Icon } from "@/components/ui/Icon";
import { useShop } from "./ShopProvider";

export function WishlistButton({ id, name, className = "" }: { id: string; name: string; className?: string }) {
  const { wishlist, toggleWishlist } = useShop();
  const on = wishlist.includes(id);
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={`${on ? "Remove" : "Save"} ${name} ${on ? "from" : "to"} wishlist`}
      onClick={() => toggleWishlist(id)}
      className={`grid h-11 w-11 place-items-center rounded-full border border-line bg-canvas/90 backdrop-blur transition-colors hover:text-gold-deep ${on ? "text-gold-deep" : ""} ${className}`}
    >
      <Icon name="heart" size={18} filled={on} />
    </button>
  );
}
