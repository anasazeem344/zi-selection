import "server-only";
import { sessionClient } from "@/lib/supabase/server";
import {
  DEFAULT_SETTINGS,
  type Category,
  type Order,
  type PageDoc,
  type Product,
  type Review,
  type SiteSettings,
} from "@/lib/types";

const PRODUCT_COLUMNS =
  "id,slug,name,category,price,description,material,tags,status,images,sizes,stock,low_stock,featured,position,is_sample";

export const stockTotal = (p: Pick<Product, "stock">) => Object.values(p.stock).reduce((a, b) => a + b, 0);
export const isLowStock = (p: Pick<Product, "stock" | "low_stock">) => stockTotal(p) <= p.low_stock;

export async function adminProducts(): Promise<Product[]> {
  const db = await sessionClient();
  const { data } = await db.from("products").select(PRODUCT_COLUMNS).order("position").order("created_at", { ascending: false });
  return (data as Product[] | null) ?? [];
}

export async function adminProduct(id: string): Promise<Product | null> {
  const db = await sessionClient();
  const { data } = await db.from("products").select(PRODUCT_COLUMNS).eq("id", id).maybeSingle();
  return (data as Product | null) ?? null;
}

export async function adminCategories(): Promise<Category[]> {
  const db = await sessionClient();
  const { data } = await db.from("categories").select("slug,name,cover,position,visible").order("position");
  return (data as Category[] | null) ?? [];
}

export async function adminOrders(limit = 500): Promise<Order[]> {
  const db = await sessionClient();
  const { data } = await db.from("orders").select("*").order("created_at", { ascending: false }).limit(limit);
  return (data as Order[] | null) ?? [];
}

export async function adminOrder(id: number): Promise<Order | null> {
  const db = await sessionClient();
  const { data } = await db.from("orders").select("*").eq("id", id).maybeSingle();
  return (data as Order | null) ?? null;
}

export async function adminReviews(): Promise<Review[]> {
  const db = await sessionClient();
  const { data } = await db.from("reviews").select("*").order("created_at", { ascending: false });
  return (data as Review[] | null) ?? [];
}

export async function adminPages(): Promise<PageDoc[]> {
  const db = await sessionClient();
  const { data } = await db.from("pages").select("slug,title,body,published").order("title");
  return (data as PageDoc[] | null) ?? [];
}

export async function adminPage(slug: string): Promise<PageDoc | null> {
  const db = await sessionClient();
  const { data } = await db.from("pages").select("slug,title,body,published").eq("slug", slug).maybeSingle();
  return (data as PageDoc | null) ?? null;
}

export async function adminSettings(): Promise<SiteSettings> {
  const db = await sessionClient();
  const { data } = await db.from("site_settings").select("data").eq("id", 1).maybeSingle();
  return { ...DEFAULT_SETTINGS, ...(data?.data ?? {}) };
}
