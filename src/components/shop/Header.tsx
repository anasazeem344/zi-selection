import Link from "next/link";
import { getCategories, getSettings } from "@/lib/data";
import { HeaderActions } from "./HeaderActions";

export async function Header() {
  const [settings, categories] = await Promise.all([getSettings(), getCategories()]);
  const links = [
    { href: "/shop/all", label: "Shop" },
    ...categories.map((c) => ({ href: `/shop/${c.slug}`, label: c.name })),
  ];

  return (
    <>
      {settings.announce_on && settings.announce && (
        <p className="bg-ink px-4 py-2.5 text-center text-xs tracking-[0.12em] text-[#f7f2e9] uppercase">{settings.announce}</p>
      )}
      <header className="sticky top-0 z-40 border-b border-line bg-canvas/95 backdrop-blur">
        <nav aria-label="Primary" className="shell grid min-h-[72px] grid-cols-[1fr_auto_1fr] items-center lg:min-h-[84px]">
          <ul className="col-start-1 row-start-1 hidden items-center gap-7 lg:flex">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="py-1 text-xs font-medium tracking-[0.13em] uppercase hover:text-gold-deep">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/" aria-label={`${settings.shop_name} home`} className="display col-start-2 text-2xl whitespace-nowrap sm:text-[1.75rem]">
            {settings.shop_name}
          </Link>
          <HeaderActions links={links} />
        </nav>
      </header>
    </>
  );
}
