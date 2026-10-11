import { AdminForm, Field } from "@/components/admin/AdminForm";
import { ReviewActions } from "@/components/admin/RowActions";
import { Card, EmptyRow, PageHeader, StatusChip } from "@/components/admin/ui";
import { saveReview } from "@/lib/actions/admin";
import { adminReviews } from "@/lib/admin/queries";

export const metadata = { title: "Reviews" };

export default async function ReviewsPage() {
  const reviews = await adminReviews();
  return (
    <>
      <PageHeader title="Reviews" sub="Only real customer words. Paste what a customer actually sent you, with their permission. Nothing here is ever generated." />
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div>
          {reviews.length === 0 ? (
            <EmptyRow title="No reviews yet" body="Add a real customer comment and it appears on the home page." />
          ) : (
            <ul className="divide-y divide-line border border-line bg-white">
              {reviews.map((r) => (
                <li key={r.id} className="p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-medium">{r.name}{r.city && <span className="font-normal text-muted"> · {r.city}</span>} <span className="text-gold-deep" aria-label={`${r.rating} out of 5`}>{"★".repeat(r.rating)}</span></p>
                    <StatusChip status={r.status} />
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted">“{r.text}”</p>
                  <ReviewActions id={r.id} status={r.status} />
                </li>
              ))}
            </ul>
          )}
        </div>
        <Card title="Add a review">
          <AdminForm action={saveReview} submitLabel="Add review" resetOnSuccess>
            <div className="space-y-4">
              <Field label="Customer name" htmlFor="name"><input id="name" name="name" className="input" required maxLength={60} /></Field>
              <Field label="City (optional)" htmlFor="city"><input id="city" name="city" className="input" maxLength={60} /></Field>
              <Field label="Rating" htmlFor="rating">
                <select id="rating" name="rating" defaultValue="5" className="input">
                  {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} out of 5</option>)}
                </select>
              </Field>
              <Field label="What they said" htmlFor="text"><textarea id="text" name="text" className="input" required maxLength={600} /></Field>
            </div>
          </AdminForm>
        </Card>
      </div>
    </>
  );
}
