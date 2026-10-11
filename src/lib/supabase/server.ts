import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { connection } from "next/server";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** Cookie-bound client: acts as the signed-in admin. Reads cookies, so use it only in dynamic code. */
export async function sessionClient() {
  // Read request data first so admin pages are always rendered at request time, never at build time.
  const store = await cookies();
  // Auth uses the current time, so this must always run per request, never in a prerender.
  await connection();
  if (!URL || !KEY) throw new Error("Supabase is not configured.");
  return createServerClient(URL, KEY, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // Called from a Server Component: cookies are refreshed by proxy.ts instead.
        }
      },
    },
  });
}

/** Service-role client. Server only. Used for the public "send order" action. */
export function serviceClient() {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!URL || !secret) return null;
  return createClient(URL, secret, { auth: { persistSession: false, autoRefreshToken: false } });
}
