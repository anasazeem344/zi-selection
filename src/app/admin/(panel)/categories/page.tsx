import { AdminForm, Field } from "@/components/admin/AdminForm";
import { CategoryDelete } from "@/components/admin/RowActions";
import { Card, PageHeader } from "@/components/admin/ui";
import { saveCategory } from "@/lib/actions/admin";
import { getAdmin } from "@/lib/admin/auth";
import { adminCategories, adminProducts } from "@/lib/admin/queries";

export const metadata = { title: "Categories" };

export default async function CategoriesPage() {
  const [categories, products, admin] = await Promise.all([adminCategories(), adminProducts(), getAdmin()]);

  return (
    <>
      <PageHeader title="Categories" sub="Control the order, visibility and cover photo of each category. Hidden categories disappear from the menu." />
      <div className="space-y-6">
        {categories.map((c) => {
          const photos = products.filter((p) => p.category === c.slug).flatMap((p) => p.images.map((i, n) => ({ path: i.path, label: `${p.name} · photo ${n + 1}` })));
          const count = products.filter((p) => p.category === c.slug).length;
          return (
            <Card key={c.slug}>
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="display text-2xl">{c.name}</h2>
                <span className="text-sm text-muted">{count} {count === 1 ? "product" : "products"}</span>
              </div>
              <AdminForm action={saveCategory} submitLabel="Save category">
                <input type="hidden" name="slug" value={c.slug} />
                <div className="grid gap-5 sm:grid-cols-[1fr_6rem_1fr]">
                  <Field label="Name" htmlFor={`name-${c.slug}`}><input id={`name-${c.slug}`} name="name" defaultValue={c.name} className="input" required maxLength={60} /></Field>
                  <Field label="Order" htmlFor={`pos-${c.slug}`}><input id={`pos-${c.slug}`} name="position" defaultValue={c.position} className="input" inputMode="numeric" /></Field>
                  <Field label="Cover photo" htmlFor={`cover-${c.slug}`}>
                    <select id={`cover-${c.slug}`} name="cover" defaultValue={c.cover ?? ""} className="input">
                      <option value="">Automatic (first product photo)</option>
                      {photos.map((p) => <option key={p.path} value={p.path}>{p.label}</option>)}
                    </select>
                  </Field>
                </div>
                <label className="mt-4 flex min-h-11 items-center gap-3 text-sm">
                  <input type="checkbox" name="visible" defaultChecked={c.visible} className="h-5 w-5 accent-[var(--ink)]" /> Show on the website
                </label>
              </AdminForm>
              {admin?.role === "owner" && <div className="mt-2"><CategoryDelete slug={c.slug} name={c.name} /></div>}
            </Card>
          );
        })}

        <Card title="Add a category">
          <AdminForm action={saveCategory} submitLabel="Add category" resetOnSuccess>
            <div className="grid gap-5 sm:grid-cols-[1fr_6rem]">
              <Field label="Name" htmlFor="new-name"><input id="new-name" name="name" className="input" required maxLength={60} /></Field>
              <Field label="Order" htmlFor="new-pos"><input id="new-pos" name="position" defaultValue={categories.length + 1} className="input" inputMode="numeric" /></Field>
            </div>
            <label className="mt-4 flex min-h-11 items-center gap-3 text-sm">
              <input type="checkbox" name="visible" defaultChecked className="h-5 w-5 accent-[var(--ink)]" /> Show on the website
            </label>
          </AdminForm>
        </Card>
      </div>
    </>
  );
}
