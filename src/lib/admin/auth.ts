import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { sessionClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/public";

export type Role = "owner" | "staff";
export type AdminUser = { id: string; email: string; role: Role };

/**
 * The session token is verified locally (getClaims checks its signature, no network round trip),
 * then the role is read from the admins table under row level security. Memoised per request so
 * the layout, page and actions share one lookup.
 */
export const getAdmin = cache(async (): Promise<AdminUser | null> => {
  if (!isSupabaseConfigured) return null;
  const db = await sessionClient();
  const { data } = await db.auth.getClaims();
  const claims = data?.claims;
  if (!claims?.sub) return null;
  const { data: row } = await db.from("admins").select("role").eq("user_id", claims.sub).maybeSingle();
  if (!row) return null;
  return { id: claims.sub, email: typeof claims.email === "string" ? claims.email : "", role: row.role as Role };
});

export async function requireAdmin(): Promise<AdminUser> {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}

export async function requireOwner(): Promise<AdminUser> {
  const admin = await requireAdmin();
  if (admin.role !== "owner") redirect("/admin?denied=1");
  return admin;
}
