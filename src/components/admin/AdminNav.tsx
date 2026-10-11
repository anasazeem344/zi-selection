"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "@/components/ui/Icon";

type Item = { href: string; label: string; icon: IconName; owner?: boolean };

export const ADMIN_NAV: Item[] = [
  { href: "/admin", label: "Dashboard", icon: "home" },
  { href: "/admin/orders", label: "Orders", icon: "orders" },
  { href: "/admin/customers", label: "Customers", icon: "users" },
  { href: "/admin/products", label: "Products", icon: "box" },
  { href: "/admin/categories", label: "Categories", icon: "grid" },
  { href: "/admin/reviews", label: "Reviews", icon: "star" },
  { href: "/admin/pages", label: "Pages", icon: "page", owner: true },
  { href: "/admin/settings", label: "Settings", icon: "gear", owner: true },
];

const active = (path: string, href: string) => (href === "/admin" ? path === "/admin" : path === href || path.startsWith(`${href}/`));

export function AdminNav({ role, variant }: { role: "owner" | "staff"; variant: "side" | "tabs" }) {
  const path = usePathname();
  const items = ADMIN_NAV.filter((i) => !i.owner || role === "owner");

  if (variant === "tabs") {
    const main = items.slice(0, 4);
    const more = items.slice(4);
    const moreActive = more.some((i) => active(path, i.href));
    return (
      <nav aria-label="Admin" className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-line bg-canvas pb-[env(safe-area-inset-bottom)] lg:hidden">
        {main.map((i) => (
          <Link key={i.href} href={i.href} aria-current={active(path, i.href) ? "page" : undefined} className={`flex min-h-14 flex-col items-center justify-center gap-0.5 border-t-2 text-xs ${active(path, i.href) ? "border-gold font-medium" : "border-transparent text-muted"}`}>
            <Icon name={i.icon} size={22} />
            {i.label}
          </Link>
        ))}
        <details className="group relative">
          <summary className={`flex min-h-14 cursor-pointer list-none flex-col items-center justify-center gap-0.5 border-t-2 text-xs ${moreActive ? "border-gold font-medium" : "border-transparent text-muted"}`}>
            <Icon name="menu" size={22} />
            More
          </summary>
          <ul className="absolute right-0 bottom-full w-52 border border-line bg-canvas">
            {more.map((i) => (
              <li key={i.href}>
                <Link href={i.href} className="flex min-h-12 items-center gap-3 px-4 text-sm hover:bg-paper">
                  <Icon name={i.icon} size={18} /> {i.label}
                </Link>
              </li>
            ))}
          </ul>
        </details>
      </nav>
    );
  }

  return (
    <nav aria-label="Admin" className="px-3 py-4">
      <ul>
        {items.map((i) => (
          <li key={i.href}>
            <Link href={i.href} aria-current={active(path, i.href) ? "page" : undefined} className={`flex min-h-11 items-center gap-3 border-l-2 px-3 text-sm ${active(path, i.href) ? "border-gold bg-canvas font-medium" : "border-transparent text-muted hover:bg-canvas"}`}>
              <Icon name={i.icon} size={20} /> {i.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
