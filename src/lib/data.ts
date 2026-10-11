import { cacheLife, cacheTag } from "next/cache";
import { publicClient } from "./supabase/public";
import { seedCategories, seedPages, seedProducts } from "./seed";
import {
  DEFAULT_SETTINGS,
  type Category,
  type PageDoc,
  type Product,
  type Review,
  type SiteSettings,
} from "./types";

/*
 * Public, cacheable reads. They use the anonymous Supabase client (no cookies),
 * so pages built from them are served as static HTML. Admin edits call
 * updateTag() with the tags below, which refreshes the pages straight away.
 * When Supabase isn't configured the sample catalogue is returned instead.
 */

const PRODUCT_COLUMNS =
  "id,slug,name,category,price,description,material,tags,status,images,sizes,stock,low_stock,featured,position,is_sample";

export async function getSettings(): Promise<SiteSettings> {
  "use cache";
  cacheLife("hours");
  cacheTag("settings");
  const db = publicClient();
  if (!db) return DEFAULT_SETTINGS;
  const { data } = await db.from("site_settings").select("data").eq("id", 1).maybeSingle();
  return { ...DEFAULT_SETTINGS, ...(data?.data ?? {}) };
}

export async function getCategories(): Promise<Category[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("categories");
  const db = publicClient();
  if (!db) return seedCategories;
  const { data } = await db
    .from("categories")
    .select("slug,name,cover,position,visible")
    .eq("visible", true)
    .order("position");
  return (data as Category[] | null) ?? [];
}

export async function getProducts(): Promise<Product[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("products");
  const db = publicClient();
  if (!db) return seedProducts;
  const { data } = await db
    .from("products")
    .select(PRODUCT_COLUMNS)
    .eq("status", "active")
    .order("position")
    .order("created_at", { ascending: false });
  return (data as Product[] | null) ?? [];
}

export async function getProduct(slug: string): Promise<Product | null> {
  const all = await getProducts();
  return all.find((p) => p.slug === slug) ?? null;
}

export async function getPage(slug: string): Promise<PageDoc | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("pages");
  const db = publicClient();
  if (!db) return seedPages.find((p) => p.slug === slug && p.published) ?? null;
  const { data } = await db
    .from("pages")
    .select("slug,title,body,published")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  return (data as PageDoc | null) ?? null;
}

export async function getPublishedPages(): Promise<Pick<PageDoc, "slug" | "title">[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("pages");
  const db = publicClient();
  if (!db) return seedPages.filter((p) => p.published);
  const { data } = await db.from("pages").select("slug,title").eq("published", true).order("title");
  return data ?? [];
}

export async function getReviews(): Promise<Review[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("reviews");
  const db = publicClient();
  if (!db) return [];
  const { data } = await db
    .from("reviews")
    .select("id,name,city,rating,text,status,created_at")
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(6);
  return (data as Review[] | null) ?? [];
}

export const inStock = (p: Product) =>
  Object.values(p.stock).some((n) => n > 0) || Object.keys(p.stock).length === 0;
