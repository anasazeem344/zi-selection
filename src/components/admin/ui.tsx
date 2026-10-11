import type { ReactNode } from "react";
import type { OrderStatus, ProductStatus } from "@/lib/types";

const STATUS_TONE: Record<string, string> = {
  New: "text-gold-deep",
  Confirmed: "text-[#2f5d8a]",
  Packed: "text-[#6a4c93]",
  Shipped: "text-[#2f6f7a]",
  Delivered: "text-ok",
  Cancelled: "text-danger",
  Returned: "text-danger",
  active: "text-ok",
  draft: "text-muted",
  hidden: "text-muted",
  approved: "text-ok",
  low: "text-danger",
};

const LABEL: Record<string, string> = { active: "Published", draft: "Draft", hidden: "Hidden", approved: "Shown", low: "Low stock" };

export function StatusChip({ status }: { status: OrderStatus | ProductStatus | "approved" | "hidden" | "low" }) {
  return (
    <span className={`chip ${STATUS_TONE[status] ?? "text-muted"}`}>
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />
      {LABEL[status] ?? status}
    </span>
  );
}

export function PageHeader({ title, children, sub }: { title: string; sub?: string; children?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="display text-[clamp(2rem,4vw,3rem)]">{title}</h1>
        {sub && <p className="mt-2 max-w-xl text-sm text-muted">{sub}</p>}
      </div>
      {children && <div className="flex flex-wrap gap-3">{children}</div>}
    </div>
  );
}

export function EmptyRow({ title, body, children }: { title: string; body?: string; children?: ReactNode }) {
  return (
    <div className="border border-dashed border-line px-6 py-14 text-center">
      <p className="display text-2xl">{title}</p>
      {body && <p className="mx-auto mt-2 max-w-md text-sm text-muted">{body}</p>}
      {children && <div className="mt-5">{children}</div>}
    </div>
  );
}

export function Card({ title, children, className = "" }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <section className={`border border-line bg-white p-5 sm:p-6 ${className}`}>
      {title && <h2 className="display mb-4 text-2xl">{title}</h2>}
      {children}
    </section>
  );
}

export function SampleTag() {
  return <span className="chip text-muted">Sample</span>;
}

export function AdminSkeleton() {
  return (
    <div className="p-8" aria-busy="true" aria-label="Loading admin">
      <div className="h-8 w-56 animate-pulse bg-line" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((n) => <div key={n} className="h-28 animate-pulse bg-line" />)}
      </div>
    </div>
  );
}

export function Setup() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-16">
      <h1 className="display text-4xl">Connect Supabase to use the admin</h1>
      <p className="mt-4 text-sm leading-7 text-muted">
        The website is running with sample products, read only. To manage products, orders and content here, create a free Supabase
        project and add its keys. Full steps are in <code>README.md</code>.
      </p>
      <ol className="mt-6 list-decimal space-y-2 pl-5 text-sm leading-7">
        <li>Create a project at supabase.com.</li>
        <li>Run <code>supabase/schema.sql</code>, then <code>supabase/seed.sql</code>, in the SQL editor.</li>
        <li>Copy <code>.env.example</code> to <code>.env.local</code> and fill in the three keys.</li>
        <li>Create your user in Supabase Auth and make it an owner (command in the README).</li>
      </ol>
    </div>
  );
}
