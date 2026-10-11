# Zi's Selection: website + admin

A fast, light online shop and a simple admin panel for Zi's Selection. Customers browse, build a bag, and
send it to you on **WhatsApp or Instagram**. You manage products, photos, orders and content in `/admin`.

Built with Next.js (App Router, static pages), Tailwind CSS and Supabase (database, login, photo storage).

## Run it now (sample mode)

```bash
npm install
npm run dev        # http://localhost:3000
```

With no Supabase keys the shop runs read-only with **sample products** (no photos, "price on request").
`/admin` shows a setup notice until Supabase is connected.

## Connect Supabase (10 minutes, free tier is enough)

1. Create a project at <https://supabase.com>.
2. **SQL Editor**: run `supabase/schema.sql`, then `supabase/seed.sql`.
3. Copy `.env.example` to `.env.local` and fill in the keys from **Project Settings → API**.
   Keep `SUPABASE_SERVICE_ROLE_KEY` secret (server only).
4. **Authentication → Users → Add user**: create your login (email + password).
5. Make yourself the owner, in the SQL editor:
   ```sql
   insert into public.admins (user_id, role)
   select id, 'owner' from auth.users where email = 'YOUR-EMAIL-HERE';
   ```
   Add staff the same way with `'staff'`. Staff can manage products, orders and reviews. Only the owner can
   change settings and pages, delete things, or see those screens.
6. Restart `npm run dev`, open `/admin`, sign in.

## First things to do in the admin

1. **Settings**: add your WhatsApp number (or leave empty to use Instagram only), hours, announcement.
2. **Products**: upload your real photos, set names, prices and ring-size stock. Delete or edit the samples.
3. **Pages**: write Shipping & Returns, Jewelry Care, Size Guide and FAQ **in your own words** and publish them.
   Nothing is invented for you: unpublished pages don't appear on the site.
4. **Reviews**: add only real customer comments (with permission).

## How ordering works

- The customer adds pieces to the bag and taps **Order on WhatsApp** (or Instagram). The message is pre-filled.
- The site also records the enquiry as a **New order** in the admin (prices are re-read from the database).
- You confirm price, delivery and payment in the chat, then update the order status.
- Instagram can't pre-fill DMs, so the list is copied to the clipboard for the customer to paste.

## Why it's fast

- Storefront pages are **pre-rendered static HTML** served from cache; admin edits refresh them instantly
  (`updateTag`). Visitors never wait for the database.
- Photos are resized and compressed **in the browser before upload** (WebP, max 1600 px), then served through
  `next/image` (AVIF/WebP, responsive sizes, lazy loading).
- Two self-hosted fonts, no third-party scripts, no tracking, no UI library.
- The bag, wishlist and menu are the only client-side JavaScript on the storefront.

## Deploy

Vercel works out of the box: import the repo, add the four environment variables from `.env.example`, deploy.
Set `NEXT_PUBLIC_SITE_URL` to your real domain. Any Node host works with `npm run build && npm start`.

## Security notes

- The browser can only read **published** products, categories, pages, reviews and settings (row level security).
- Orders can't be read or written from the browser at all. Only signed-in admins (and the server) can.
- Every admin page and action re-checks the signed-in user and role on the server.
- The "send order" action is public by design. If you ever see spam orders, add rate limiting (e.g. Vercel
  firewall) or a captcha.

## Not included yet

Online card/JazzCash/Easypaisa payment, automatic stock deduction, discount codes, email notifications,
customer accounts, multi-language. All can be added later; the data model leaves room for them.
