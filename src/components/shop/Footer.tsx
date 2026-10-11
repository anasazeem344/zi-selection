import Link from "next/link";
import { cacheLife } from "next/cache";
import { Icon } from "@/components/ui/Icon";
import { getCategories, getPublishedPages, getSettings } from "@/lib/data";
import { displayPhone, formatHours, igProfile, waLink } from "@/lib/format";

export async function Footer() {
  const [settings, categories, pages] = await Promise.all([getSettings(), getCategories(), getPublishedPages()]);
  const hours = formatHours(settings.hours_open, settings.hours_close);
  const link = "text-sm text-[#bdb3a6] hover:text-white";

  return (
    <footer className="bg-ink text-[#f5efe6]">
      <div className="shell grid gap-12 py-14 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div className="max-w-xs">
          <p className="display text-3xl">{settings.shop_name}</p>
          <p className="mt-5 text-sm leading-6 text-[#bdb3a6]">
            Jewelry with a point of view, selected for the way you live and the signature you leave behind.
          </p>
          <div className="mt-6 flex gap-2">
            <a href={igProfile(settings.instagram)} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="grid h-11 w-11 place-items-center rounded-full border border-white/20 hover:border-gold hover:text-gold">
              <Icon name="instagram" size={18} />
            </a>
            {settings.whatsapp && (
              <a href={waLink(settings.whatsapp, "Hello Zi's Selection!")} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="grid h-11 w-11 place-items-center rounded-full border border-white/20 hover:border-gold hover:text-gold">
                <Icon name="whatsapp" size={18} />
              </a>
            )}
          </div>
        </div>

        <FooterColumn title="Shop">
          <li><Link className={link} href="/shop/all">All jewelry</Link></li>
          {categories.map((c) => (
            <li key={c.slug}><Link className={link} href={`/shop/${c.slug}`}>{c.name}</Link></li>
          ))}
        </FooterColumn>

        <FooterColumn title="Help">
          {pages.map((p) => (
            <li key={p.slug}><Link className={link} href={`/${p.slug}`}>{p.title}</Link></li>
          ))}
          <li><Link className={link} href="/wishlist">Wishlist</Link></li>
        </FooterColumn>

        <FooterColumn title="Order with us">
          <li className="text-sm text-[#bdb3a6]">Open daily · {hours}</li>
          {settings.whatsapp && (
            <li>
              <a className={link} href={waLink(settings.whatsapp, "Hello Zi's Selection!")} target="_blank" rel="noopener noreferrer">
                WhatsApp {displayPhone(settings.whatsapp)}
              </a>
            </li>
          )}
          {settings.email && (
            <li><a className={link} href={`mailto:${settings.email}`}>{settings.email}</a></li>
          )}
          <li>
            <a className={link} href={igProfile(settings.instagram)} target="_blank" rel="noopener noreferrer">@{settings.instagram}</a>
          </li>
          {settings.delivery_note && <li className="max-w-[16rem] text-sm leading-6 text-[#bdb3a6]">{settings.delivery_note}</li>}
        </FooterColumn>
      </div>
      <div className="border-t border-white/10">
        <p className="shell py-6 text-xs tracking-[0.12em] text-[#a39b90] uppercase">
          © <Year /> {settings.shop_name}. Selected with intention.
        </p>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-xs tracking-[0.2em] text-gold uppercase">{title}</h2>
      <ul className="mt-5 space-y-3">{children}</ul>
    </div>
  );
}

async function Year() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}
