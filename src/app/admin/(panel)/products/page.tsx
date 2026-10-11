import Link from "next/link";
import { EmptyRow, PageHeader, SampleTag, StatusChip } from "@/components/admin/ui";
import { ProductRowActions } from "@/components/admin/RowActions";
import { Photo } from "@/components/ui/Media";
import { getAdmin } from "@/lib/admin/auth";
import { adminCategories, adminProducts, isLowStock, stockTotal } from "@/lib/admin/queries";
import { pkr } from "@/lib/format";

export const metadata = { title: "Products" };

export default async function ProductsPage({ searchParams }: PageProps<"/admin/products">) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim().toLowerCase() : "";
  const status = typeof sp.status === "string" ? sp.status : "";
  const category = typeof sp.category === "string" ? sp.category : "";

  const [all, categories, admin] = await Promise.all([adminProducts(), adminCategories(), getAdmin()]);
  const catName = new Map(categories.map((c) => [c.slug, c.name]));
  const list = all.filter(
    (p) => (!q || p.name.toLowerCase().includes(q)) && (!status || p.status === status) && (!category || p.category === category),
  );

  return (
    <>
      <PageHeader title="Products" sub={`${all.length} in total. Hidden and draft products never appear on the website.`}>
        <Link href="/admin/products/new" className="btn btn-gold">Add product</Link>
      </PageHeader>

      <form className="mb-6 grid gap-3 sm:grid-cols-[1fr_auto_auto_auto]" role="search">
        <label className="sr-only" htmlFor="q">Search products</label>
        <input id="q" name="q" defaultValue={q} placeholder="Search by name" className="input" />
        <label className="sr-only" htmlFor="status">Status</label>
        <select id="status" name="status" defaultValue={status} className="input sm:w-40">
          <option value="">All statuses</option>
          <option value="active">Published</option>
          <option value="draft">Draft</option>
          <option value="hidden">Hidden</option>
        </select>
        <label className="sr-only" htmlFor="category">Category</label>
        <select id="category" name="category" defaultValue={category} className="input sm:w-44">
          <option value="">All categories</option>
          {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
        </select>
        <button type="submit" className="btn btn-outline">Filter</button>
      </form>

      {list.length === 0 ? (
        <EmptyRow title={all.length ? "No products match" : "No products yet"} body={all.length ? "Try clearing the filters." : "Add your first piece, with photos, price and ring sizes."}>
          <Link href="/admin/products/new" className="btn btn-dark">Add product</Link>
        </EmptyRow>
      ) : (
        <ul className="divide-y divide-line border border-line bg-white">
          {list.map((p, i) => (
            <li key={p.id} className="flex flex-wrap items-center gap-4 p-4">
              <div className="relative h-16 w-14 shrink-0 overflow-hidden bg-paper">
                <Photo path={p.images[0]?.path} alt={p.name} seed={i} sizes="56px" />
              </div>
              <div className="min-w-[10rem] flex-1">
                <p className="display text-lg leading-tight">{p.name} {p.is_sample && <SampleTag />}</p>
                <p className="mt-1 text-xs text-muted">{catName.get(p.category) ?? p.category} · {pkr(p.price)}</p>
              </div>
              <div className="flex items-center gap-3">
                <StatusChip status={p.status} />
                {isLowStock(p) ? <StatusChip status="low" /> : <span className="text-xs text-muted">{stockTotal(p)} in stock</span>}
              </div>
              <ProductRowActions id={p.id} name={p.name} status={p.status} isOwner={admin?.role === "owner"} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
