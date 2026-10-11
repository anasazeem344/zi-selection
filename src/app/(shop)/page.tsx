import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { Photo } from "@/components/ui/Media";
import { ProductCard } from "@/components/shop/ProductCard";
import { getCategories, getProducts, getReviews, getSettings } from "@/lib/data";
import { igProfile } from "@/lib/format";

export default async function HomePage() {
  const [settings, categories, products, reviews] = await Promise.all([
    getSettings(),
    getCategories(),
    getProducts(),
    getReviews(),
  ]);

  const featured = products.filter((p) => p.featured);
  const edit = (featured.length >= 4 ? featured : products).slice(0, 8);
  const heroImage = settings.hero_image || null;
  const jewel = edit[1] ?? edit[0];
  const headWords = settings.hero_headline.trim().split(/\s+/);
  const split = Math.ceil(headWords.length / 2);
  const coverFor = (slug: string, cover: string | null) =>
    cover || products.find((p) => p.category === slug && p.images[0])?.images[0]?.path || null;

  return (
    <>
      {/* Hero */}
      <section className="hero-section" aria-labelledby="hero-title">
        <div className="hero-copy">
          <div className="max-w-[540px]">
            <p className="eyebrow">The Signature Collection</p>
            <h1
              id="hero-title"
              className="display mt-6 text-[clamp(2.5rem,6.1vw,6.4rem)] leading-[0.86] tracking-[-0.05em]"
            >
              {headWords.slice(0, split).join(" ")}
              <br />
              {headWords.slice(split, -1).join(" ")}{headWords.length > split + 1 && " "}
              <em className="font-light text-gold">{headWords.at(-1)}</em>
            </h1>
            <p className="mt-7 max-w-[430px] text-[0.9rem] leading-7 text-[#c7bdb0]">{settings.hero_sub}</p>
            <Link href="/shop/all" className="hero-cta mt-8">
              Shop The Edit
              <Icon name="arrow" size={18} />
            </Link>
          </div>
          <div className="hero-edition">
            <span>@{settings.instagram}</span>
            <span>Edition No. 01</span>
          </div>
        </div>
        <div className="hero-visual">
          <span className="hero-monogram" aria-hidden="true">Z</span>
          <div className="hero-silk" aria-hidden="true"><span>Quietly extraordinary</span></div>
          <div className="hero-image">
            <div className="hero-photo">
              {heroImage ? (
                <Photo path={heroImage} alt="Zi's Selection jewelry" priority sizes="(min-width:1024px) 45vw, 80vw" seed={1} />
              ) : (
                <Image src="/hero.webp" alt="Gold ring and earrings on champagne silk" fill priority sizes="(min-width:1024px) 45vw, 80vw" className="object-cover" />
              )}
            </div>
            <div className="hero-image-note">
              <span>Selected, not simply found</span>
              <span>Zi&apos;s / 01</span>
            </div>
          </div>
          {jewel && (
            <Link href={`/product/${jewel.slug}`} className="hero-jewel">
              <div className="hero-jewel-photo">
                <Photo path={jewel.images[0]?.path} alt={jewel.name} sizes="(min-width:1024px) 14vw, 40vw" seed={2} />
              </div>
              <p><span>Object 01</span>{jewel.name}</p>
            </Link>
          )}
        </div>
      </section>

      {/* Categories */}
      <section aria-labelledby="cats-title" className="section shell">
        <div className="text-center">
          <p className="eyebrow">Discover by piece</p>
          <h2 id="cats-title" className="display mt-3 text-[clamp(2.2rem,5vw,3.75rem)]">Objects of affection</h2>
        </div>
        <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-5 lg:grid-cols-4">
          {categories.map((c, i) => (
            <li key={c.slug}>
              <Link href={`/shop/${c.slug}`} className="group block">
                <div className="relative aspect-[4/5] overflow-hidden border border-line bg-paper">
                  <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-[1.03]">
                    <Photo path={coverFor(c.slug, c.cover)} alt={c.name} seed={i + 2} />
                  </div>
                </div>
                <div className="flex items-end justify-between gap-3 pt-4">
                  <h3 className="display text-2xl">{c.name}</h3>
                  <span className="hidden items-center gap-2 text-xs tracking-[0.14em] uppercase sm:flex">
                    Explore <Icon name="arrow" size={16} className="transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* The Edit */}
      <section aria-labelledby="edit-title" className="section border-y border-line bg-paper">
        <div className="shell">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="eyebrow">A considered collection</p>
              <h2 id="edit-title" className="display mt-3 text-[clamp(2.2rem,5vw,3.75rem)]">The Zi Edit</h2>
            </div>
            <Link href="/shop/all" className="hidden min-h-11 items-center gap-2 text-xs tracking-[0.14em] uppercase sm:flex">
              View all <Icon name="arrow" size={16} />
            </Link>
          </div>
          <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-5 lg:grid-cols-4">
            {edit.map((p, i) => (
              <li key={p.id}><ProductCard product={p} index={i} /></li>
            ))}
          </ul>
          <div className="mt-10 text-center sm:hidden">
            <Link href="/shop/all" className="btn btn-outline">View all jewelry</Link>
          </div>
        </div>
      </section>

      {/* How to order */}
      <section aria-labelledby="order-title" className="section shell">
        <div className="text-center">
          <p className="eyebrow">Simple and personal</p>
          <h2 id="order-title" className="display mt-3 text-[clamp(2.2rem,5vw,3.75rem)]">How to order</h2>
        </div>
        <ol className="mt-10 grid gap-px border border-line bg-line md:grid-cols-3">
          {[
            ["01", "Choose your pieces", "Browse the collection and add what you love to your bag."],
            ["02", "Send us your bag", "One tap opens WhatsApp or Instagram with your selection filled in."],
            ["03", "We confirm with you", "We reply in the chat to confirm availability, price and delivery."],
          ].map(([n, title, body]) => (
            <li key={n} className="bg-canvas p-8 sm:p-10">
              <span className="display text-4xl text-gold">{n}</span>
              <h3 className="display mt-4 text-2xl">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-muted">{body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Reviews: only real, approved ones from the admin */}
      {reviews.length > 0 && (
        <section aria-labelledby="reviews-title" className="section border-t border-line bg-paper">
          <div className="shell">
            <h2 id="reviews-title" className="display text-center text-[clamp(2.2rem,5vw,3.75rem)]">Kind words</h2>
            <ul className="mt-10 grid gap-px border border-line bg-line lg:grid-cols-3">
              {reviews.slice(0, 3).map((r) => (
                <li key={r.id} className="flex flex-col bg-canvas p-8">
                  <blockquote className="display flex-1 text-xl leading-snug">“{r.text}”</blockquote>
                  <p className="mt-6 border-t border-line pt-4 text-sm">
                    {r.name}{r.city && <span className="text-muted"> · {r.city}</span>}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Instagram */}
      <section className="section shell text-center">
        <p className="eyebrow">Follow along</p>
        <h2 className="display mt-3 text-[clamp(2.2rem,5vw,3.75rem)]">@{settings.instagram}</h2>
        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-muted">
          New pieces, styling ideas and behind-the-scenes, shared first on Instagram.
        </p>
        <a href={igProfile(settings.instagram)} target="_blank" rel="noopener noreferrer" className="btn btn-outline mt-7">
          <Icon name="instagram" size={18} /> Follow on Instagram
        </a>
      </section>
    </>
  );
}
