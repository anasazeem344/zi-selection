-- Zi's Selection: database schema
-- Run once in the Supabase SQL editor (Project → SQL Editor → New query).

------------------------------------------------------------------
-- Tables
------------------------------------------------------------------
create table if not exists public.categories (
  slug      text primary key,
  name      text not null,
  cover     text,
  position  integer not null default 0,
  visible   boolean not null default true
);

create table if not exists public.products (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        text not null,
  category    text not null references public.categories(slug) on update cascade on delete restrict,
  price       integer check (price is null or price >= 0),   -- PKR; null = price on request
  description text not null default '',
  material    text not null default '',
  tags        text[] not null default '{}',
  status      text not null default 'draft' check (status in ('active','draft','hidden')),
  images      jsonb not null default '[]'::jsonb,            -- [{ "path": "...", "alt": "..." }]
  sizes       text[] not null default '{}',                  -- ring sizes offered
  stock       jsonb not null default '{}'::jsonb,            -- {"all": 3} or {"5": 2, "6": 1, ...}
  low_stock   integer not null default 2,
  featured    boolean not null default false,
  position    integer not null default 0,
  is_sample   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists products_status_category_idx on public.products (status, category);

create table if not exists public.orders (
  id            bigint generated always as identity primary key,
  created_at    timestamptz not null default now(),
  source        text not null check (source in ('Website','WhatsApp','Instagram')),
  status        text not null default 'New'
                check (status in ('New','Confirmed','Packed','Shipped','Delivered','Cancelled','Returned')),
  items         jsonb not null default '[]'::jsonb,
  customer_name text not null default '',
  phone         text not null default '',
  city          text not null default '',
  address       text not null default '',
  delivery_fee  integer not null default 0 check (delivery_fee >= 0),
  paid          boolean not null default false,
  notes         text not null default '',
  timeline      jsonb not null default '[]'::jsonb
);
create index if not exists orders_created_idx on public.orders (created_at desc);
create index if not exists orders_status_idx on public.orders (status);

create table if not exists public.reviews (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  city       text not null default '',
  rating     integer not null check (rating between 1 and 5),
  text       text not null,
  status     text not null default 'approved' check (status in ('approved','hidden')),
  created_at timestamptz not null default now()
);

create table if not exists public.pages (
  slug       text primary key,
  title      text not null,
  body       text not null default '',
  published  boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  id   integer primary key check (id = 1),
  data jsonb not null default '{}'::jsonb
);

create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role    text not null default 'staff' check (role in ('owner','staff'))
);

------------------------------------------------------------------
-- Helper functions (security definer so policies don't recurse)
------------------------------------------------------------------
create or replace function public.is_admin() returns boolean
language sql security definer stable set search_path = '' as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

create or replace function public.is_owner() returns boolean
language sql security definer stable set search_path = '' as $$
  select exists (select 1 from public.admins where user_id = auth.uid() and role = 'owner');
$$;

------------------------------------------------------------------
-- Row level security
-- Public: published content only. Admins: everything. Owner-only: settings and pages.
-- The browser can NEVER read orders; the website logs them with the service role key.
------------------------------------------------------------------
alter table public.categories    enable row level security;
alter table public.products      enable row level security;
alter table public.orders        enable row level security;
alter table public.reviews       enable row level security;
alter table public.pages         enable row level security;
alter table public.site_settings enable row level security;
alter table public.admins        enable row level security;

drop policy if exists categories_read  on public.categories;
drop policy if exists categories_write on public.categories;
create policy categories_read  on public.categories for select using (visible or public.is_admin());
create policy categories_write on public.categories for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists products_read  on public.products;
drop policy if exists products_write on public.products;
create policy products_read  on public.products for select using (status = 'active' or public.is_admin());
create policy products_write on public.products for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists orders_admin on public.orders;
create policy orders_admin on public.orders for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists reviews_read  on public.reviews;
drop policy if exists reviews_write on public.reviews;
create policy reviews_read  on public.reviews for select using (status = 'approved' or public.is_admin());
create policy reviews_write on public.reviews for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists pages_read  on public.pages;
drop policy if exists pages_write on public.pages;
create policy pages_read  on public.pages for select using (published or public.is_admin());
create policy pages_write on public.pages for all to authenticated using (public.is_owner()) with check (public.is_owner());

drop policy if exists settings_read  on public.site_settings;
drop policy if exists settings_write on public.site_settings;
create policy settings_read  on public.site_settings for select using (true);
create policy settings_write on public.site_settings for all to authenticated using (public.is_owner()) with check (public.is_owner());

drop policy if exists admins_self on public.admins;
create policy admins_self on public.admins for select to authenticated using (user_id = auth.uid());

------------------------------------------------------------------
-- Storage: public bucket for product photos, only admins can write
------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 5242880, array['image/webp','image/jpeg','image/png'])
on conflict (id) do nothing;

drop policy if exists "product images read"   on storage.objects;
drop policy if exists "product images insert" on storage.objects;
drop policy if exists "product images update" on storage.objects;
drop policy if exists "product images delete" on storage.objects;
create policy "product images read"   on storage.objects for select using (bucket_id = 'product-images');
create policy "product images insert" on storage.objects for insert to authenticated with check (bucket_id = 'product-images' and public.is_admin());
create policy "product images update" on storage.objects for update to authenticated using (bucket_id = 'product-images' and public.is_admin());
create policy "product images delete" on storage.objects for delete to authenticated using (bucket_id = 'product-images' and public.is_admin());
