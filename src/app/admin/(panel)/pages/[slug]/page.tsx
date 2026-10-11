import { notFound } from "next/navigation";
import Link from "next/link";
import { AdminForm, Field } from "@/components/admin/AdminForm";
import { Card, PageHeader } from "@/components/admin/ui";
import { savePage } from "@/lib/actions/admin";
import { requireOwner } from "@/lib/admin/auth";
import { adminPage } from "@/lib/admin/queries";

export const metadata = { title: "Edit page" };

export default async function EditPage({ params }: PageProps<"/admin/pages/[slug]">) {
  await requireOwner();
  const { slug } = await params;
  const isNew = slug === "new";
  const page = isNew ? null : await adminPage(slug);
  if (!isNew && !page) notFound();

  return (
    <>
      <PageHeader title={isNew ? "New page" : page!.title} />
      <Card>
        <AdminForm action={savePage} submitLabel="Save page">
          <div className="space-y-5">
            <Field label="Title" htmlFor="title"><input id="title" name="title" defaultValue={page?.title ?? ""} className="input" required maxLength={100} /></Field>
            {isNew ? (
              <Field label="Web address" htmlFor="slug" hint="Letters, numbers and dashes, e.g. gift-wrapping."><input id="slug" name="slug" className="input" required maxLength={60} /></Field>
            ) : (
              <input type="hidden" name="slug" value={page!.slug} />
            )}
            <Field label="Content" htmlFor="body" hint="Leave a blank line between paragraphs. Start a line with “## ” for a heading, or with “- ” for bullet points.">
              <textarea id="body" name="body" defaultValue={page?.body ?? ""} className="input !min-h-80" maxLength={20000} />
            </Field>
            <label className="flex min-h-11 items-center gap-3 text-sm">
              <input type="checkbox" name="published" defaultChecked={page?.published ?? false} className="h-5 w-5 accent-[var(--ink)]" />
              Published: show on the website and in the footer
            </label>
          </div>
        </AdminForm>
      </Card>
      <Link href="/admin/pages" className="mt-6 inline-flex min-h-11 items-center text-xs tracking-[0.12em] uppercase underline underline-offset-4">Back to pages</Link>
    </>
  );
}
