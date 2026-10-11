// Usage: npm run check:supabase   (reads .env.local; never prints your keys)
const env = process.env;
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const anon = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const service = env.SUPABASE_SERVICE_ROLE_KEY;

const ok = (m) => console.log(`  ✓ ${m}`);
const bad = (m) => { console.log(`  ✗ ${m}`); failed = true; };
let failed = false;

const placeholder = (v) => !v || /YOUR-|your-/.test(v);
console.log("Checking .env.local");
if (placeholder(url)) bad("NEXT_PUBLIC_SUPABASE_URL is missing"); else ok("URL set");
if (placeholder(anon)) bad("NEXT_PUBLIC_SUPABASE_ANON_KEY is missing"); else ok("anon key set");
if (placeholder(service)) bad("SUPABASE_SERVICE_ROLE_KEY is missing"); else ok("service role key set");
if (failed) process.exit(1);

const get = (path, key) => fetch(`${url}${path}`, { headers: { apikey: key, Authorization: `Bearer ${key}` } });

console.log("\nChecking database (public, as a visitor)");
for (const t of ["categories", "products", "pages", "site_settings"]) {
  const r = await get(`/rest/v1/${t}?select=*&limit=1`, anon);
  r.ok ? ok(`table ${t} readable`) : bad(`table ${t}: HTTP ${r.status}. Did you run supabase/schema.sql?`);
}
const p = await get("/rest/v1/products?select=id&status=eq.active", anon);
if (p.ok) { const n = (await p.json()).length; n ? ok(`${n} published products`) : bad("no published products. Did you run supabase/seed.sql?"); }

console.log("\nChecking that visitors cannot read private data");
const o = await get("/rest/v1/orders?select=id&limit=1", anon);
const oRows = o.ok ? await o.json() : [];
(!o.ok || oRows.length === 0) ? ok("orders are not readable by visitors") : bad("orders ARE readable by visitors. Re-run schema.sql");

console.log("\nChecking admin setup (server key)");
const a = await get("/rest/v1/admins?select=role", service);
if (!a.ok) bad(`admins table: HTTP ${a.status}`);
else {
  const rows = await a.json();
  rows.some((r) => r.role === "owner") ? ok("an owner account exists") : bad("no owner yet. Run the 'insert into public.admins' command from the README");
}
const b = await get("/storage/v1/bucket/product-images", service);
b.ok ? ok("photo bucket 'product-images' exists") : bad("photo bucket missing. Re-run schema.sql");

console.log(failed ? "\nSome checks failed. Fix the ✗ items above." : "\nAll good. Start the site with: npm run dev");
process.exit(failed ? 1 : 0);
