"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { useShop } from "./ShopProvider";

type NavLink = { href: string; label: string };

export function HeaderActions({ links }: { links: NavLink[] }) {
  const { count, wishlist, setBagOpen } = useShop();
  const [menu, setMenu] = useState(false);
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (menu && !d.open) d.showModal();
    if (!menu && d.open) d.close();
  }, [menu]);

  const badge = "absolute right-0.5 top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-ink px-1 text-[0.6875rem] leading-none text-white";

  return (
    <>
      <div className="col-start-3 flex items-center justify-end">
        <Link href="/search" aria-label="Search" className="grid h-11 w-11 place-items-center hover:text-gold-deep">
          <Icon name="search" />
        </Link>
        <Link href="/wishlist" aria-label={`Wishlist, ${wishlist.length} saved`} className="relative grid h-11 w-11 place-items-center hover:text-gold-deep">
          <Icon name="heart" filled={wishlist.length > 0} />
          {wishlist.length > 0 && <span className={badge}>{wishlist.length}</span>}
        </Link>
        <button type="button" onClick={() => setBagOpen(true)} aria-label={`Open bag, ${count} items`} className="relative grid h-11 w-11 place-items-center hover:text-gold-deep">
          <Icon name="bag" />
          {count > 0 && <span className={badge}>{count}</span>}
        </button>
      </div>

      <button type="button" onClick={() => setMenu(true)} aria-label="Open menu" className="col-start-1 row-start-1 grid h-11 w-11 place-items-center lg:hidden">
        <Icon name="menu" />
      </button>

      <dialog
        ref={ref}
        aria-label="Menu"
        onClose={() => setMenu(false)}
        onClick={(e) => e.target === ref.current && setMenu(false)}
        className="m-0 h-dvh max-h-none w-full max-w-sm bg-canvas p-0 text-ink backdrop:bg-ink/40"
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <p className="display text-2xl">Menu</p>
          <button type="button" onClick={() => setMenu(false)} aria-label="Close menu" className="grid h-11 w-11 place-items-center">
            <Icon name="close" />
          </button>
        </div>
        <nav aria-label="Mobile">
          <ul className="px-5 py-4">
            {links.map((l) => (
              <li key={l.href} className="border-b border-line">
                <Link href={l.href} onClick={() => setMenu(false)} className="display flex min-h-14 items-center text-3xl">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </dialog>
    </>
  );
}
