import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";
import { signOut } from "@/lib/actions/admin";
import type { AdminUser } from "@/lib/admin/auth";
import { AdminNav } from "./AdminNav";

export function Frame({ admin, children }: { admin: AdminUser; children: ReactNode }) {
  return (
    <div className="flex min-h-dvh">
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-line bg-paper lg:flex">
        <Link href="/admin" className="flex h-16 items-center gap-3 border-b border-line px-5" aria-label="Admin home">
          <span className="grid h-10 w-10 place-items-center border border-gold text-xl text-gold display">Z</span>
          <span className="display text-xl">Zi&apos;s Admin</span>
        </Link>
        <div className="flex-1 overflow-y-auto">
          <AdminNav role={admin.role} variant="side" />
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-line bg-canvas/95 px-4 backdrop-blur lg:px-8">
          <Link href="/admin" className="display text-xl lg:hidden">Zi&apos;s Admin</Link>
          <span className="hidden lg:block" />
          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/" target="_blank" className="hidden min-h-11 items-center text-xs tracking-[0.12em] uppercase underline underline-offset-4 sm:inline-flex">
              View website
            </Link>
            <span className="hidden text-sm text-muted md:block">{admin.email}</span>
            <span className="chip text-gold-deep capitalize">{admin.role}</span>
            <form action={signOut}>
              <button type="submit" className="grid h-11 w-11 place-items-center" aria-label="Sign out">
                <Icon name="out" />
              </button>
            </form>
          </div>
        </header>
        <div className="mx-auto max-w-[1200px] px-4 py-8 pb-28 lg:px-8 lg:pb-12">{children}</div>
      </div>
      <AdminNav role={admin.role} variant="tabs" />
    </div>
  );
}
