import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminForm, Field } from "@/components/admin/AdminForm";
import { Setup } from "@/components/admin/ui";
import { signIn } from "@/lib/actions/admin";
import { getAdmin } from "@/lib/admin/auth";
import { isSupabaseConfigured } from "@/lib/supabase/public";

export const metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh" aria-busy="true" />}>
      <Login />
    </Suspense>
  );
}

async function Login() {
  if (!isSupabaseConfigured) return <Setup />;
  if (await getAdmin()) redirect("/admin");

  return (
    <div className="grid min-h-dvh lg:grid-cols-[1fr_1.1fr]">
      <div className="hidden bg-ink p-12 text-[#f5efe6] lg:flex lg:flex-col lg:justify-between">
        <span className="display text-[20rem] leading-[0.8] text-transparent [-webkit-text-stroke:1px_rgba(197,168,128,0.5)]" aria-hidden="true">Z</span>
        <div>
          <p className="display text-4xl">Zi&apos;s Selection</p>
          <p className="mt-3 text-sm text-[#bdb3a6]">Shop admin: orders, products and content in one place.</p>
        </div>
      </div>
      <div className="grid place-items-center px-5 py-12">
        <div className="w-full max-w-sm">
          <p className="display text-3xl lg:hidden">Zi&apos;s Selection</p>
          <h1 className="display mt-6 text-4xl lg:mt-0">Sign in</h1>
          <AdminForm action={signIn} submitLabel="Sign in" className="mt-8 space-y-5" buttonClass="btn btn-gold w-full">
            <Field label="Email" htmlFor="email">
              <input id="email" name="email" type="email" autoComplete="email" required className="input" />
            </Field>
            <Field label="Password" htmlFor="password">
              <input id="password" name="password" type="password" autoComplete="current-password" required minLength={6} className="input" />
            </Field>
          </AdminForm>
          <Link href="/" className="mt-8 inline-flex min-h-11 items-center text-xs tracking-[0.12em] text-muted uppercase underline underline-offset-4">
            Back to website
          </Link>
        </div>
      </div>
    </div>
  );
}
