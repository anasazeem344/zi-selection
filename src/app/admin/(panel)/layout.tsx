import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AdminSkeleton, Setup } from "@/components/admin/ui";
import { Frame } from "@/components/admin/Frame";
import { getAdmin } from "@/lib/admin/auth";
import { isSupabaseConfigured } from "@/lib/supabase/public";

// The admin sits behind login, so never prefetch it: it would only cost server work.
export const prefetch = "force-disabled";

export default function PanelLayout({ children }: LayoutProps<"/admin">) {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <Gate>{children}</Gate>
    </Suspense>
  );
}

async function Gate({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured) return <Setup />;
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return <Frame admin={admin}>{children}</Frame>;
}
