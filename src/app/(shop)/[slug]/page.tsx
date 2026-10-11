import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getPage, getPublishedPages } from "@/lib/data";

export async function generateStaticParams() {
  const pages = await getPublishedPages();
  return pages.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPage(slug);
  return page ? { title: page.title } : {};
}

export default function InfoPage({ params }: PageProps<"/[slug]">) {
  return (
    <div className="shell pt-8 pb-20 lg:pt-12 lg:pb-28">
      <Suspense fallback={<div className="h-96" aria-busy="true" />}>
        <Body params={params} />
      </Suspense>
    </div>
  );
}

/** Plain-text bodies: blank line = new paragraph, "## " = heading, "- " = bullet list. No HTML is ever rendered. */
function Rich({ text }: { text: string }) {
  const blocks = text.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
  return (
    <div className="mt-8 max-w-2xl space-y-5 text-[0.95rem] leading-8 text-muted">
      {blocks.map((b, i) => {
        if (b.startsWith("## ")) return <h2 key={i} className="display pt-4 text-3xl text-ink">{b.slice(3)}</h2>;
        const lines = b.split("\n");
        if (lines.every((l) => l.startsWith("- "))) {
          return (
            <ul key={i} className="list-disc space-y-1.5 pl-5">
              {lines.map((l, n) => <li key={n}>{l.slice(2)}</li>)}
            </ul>
          );
        }
        return <p key={i} className="whitespace-pre-line">{b}</p>;
      })}
    </div>
  );
}

async function Body({ params }: { params: PageProps<"/[slug]">["params"] }) {
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page) notFound();
  return (
    <>
      <nav aria-label="Breadcrumb" className="text-xs tracking-[0.12em] text-muted uppercase">
        <Link href="/" className="hover:text-ink">Home</Link> / <span className="text-ink">{page.title}</span>
      </nav>
      <h1 className="display mt-5 text-[clamp(2.6rem,6vw,4.5rem)]">{page.title}</h1>
      <Rich text={page.body} />
    </>
  );
}
