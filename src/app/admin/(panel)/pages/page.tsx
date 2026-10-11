import Link from "next/link";
import { PageHeader } from "@/components/admin/ui";
import { requireOwner } from "@/lib/admin/auth";
import { adminPages } from "@/lib/admin/queries";

export const metadata = { title: "Pages" };

export default async function PagesList() {
  await requireOwner();
  const pages = await adminPages();
  return (
    <>
      <PageHeader title="Pages and policies" sub="Write your shipping, returns, care and story pages in your own words. A page only appears on the website once it is published.">
        <Link href="/admin/pages/new" className="btn btn-gold">Add page</Link>
      </PageHeader>
      <ul className="divide-y divide-line border border-line bg-white">
        {pages.map((p) => (
          <li key={p.slug}>
            <Link href={`/admin/pages/${p.slug}`} className="flex flex-wrap items-center justify-between gap-3 p-4 hover:bg-paper">
              <span>
                <span className="font-medium">{p.title}</span>
                <span className="block text-xs text-muted">/{p.slug}</span>
              </span>
              <span className={`chip ${p.published ? "text-ok" : "text-muted"}`}>{p.published ? "Published" : "Not published"}</span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
