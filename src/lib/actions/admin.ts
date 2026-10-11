"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { getAdmin, requireAdmin, requireOwner } from "@/lib/admin/auth";
import { normalisePhone, slugify } from "@/lib/format";
import { sessionClient } from "@/lib/supabase/server";
import {
  ORDER_SOURCES,
  ORDER_STATUSES,
  type OrderItem,
  type OrderSource,
  type OrderStatus,
  type ProductImage,
  type ProductStatus,
  type SiteSettings,
} from "@/lib/types";

export type FormState = { ok?: boolean; error?: string; message?: string };

const str = (fd: FormData, key: string, max = 500) => String(fd.get(key) ?? "").trim().slice(0, max);
const PATH = /^[\w\-./]{1,160}$/;
/**
 * New URLs are rendered on their first visit. Visiting them once right after a save
 * (after the response is sent) means customers always get the finished page.
 */
function warm(...paths: string[]) {
  const base = process.env.NEXT_PUBLIC_SITE_URL;
  if (!base) return;
  after(async () => {
    await Promise.allSettled(paths.map((p) => fetch(new URL(p, base), { cache: "no-store" })));
  });
}

const fail = (error: string): FormState => ({ ok: false, error });

function dbError(error: { code?: string; message: string }): FormState {
  if (error.code === "23505") return fail("That URL name is already used by another item. Change it and try again.");
  if (error.code === "23503") return fail("This item is still in use, so it can't be removed.");
  if (error.code === "42501") return fail("You don't have permission to do that.");
  return fail("Something went wrong saving to the database. Please try again.");
}

/* ───────────── Auth ───────────── */

export async function signIn(_: FormState, fd: FormData): Promise<FormState> {
  const email = str(fd, "email", 200);
  const password = String(fd.get("password") ?? "");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return fail("Enter a valid email address.");
  if (password.length < 6) return fail("Enter your password.");

  const db = await sessionClient();
  const { error } = await db.auth.signInWithPassword({ email, password });
  if (error) return fail("Incorrect email or password.");

  if (!(await getAdmin())) {
    await db.auth.signOut();
    return fail("This account has not been given admin access.");
  }
  redirect("/admin");
}

export async function signOut() {
  const db = await sessionClient();
  await db.auth.signOut();
  redirect("/admin/login");
}

/* ───────────── Products ───────────── */

export type ProductInput = {
  id?: string;
  name: string;
  slug: string;
  category: string;
  price: number | null;
  description: string;
  material: string;
  tags: string[];
  status: ProductStatus;
  featured: boolean;
  images: ProductImage[];
  sizes: string[];
  stock: Record<string, number>;
  low_stock: number;
};

export async function saveProduct(input: ProductInput): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  await requireAdmin();

  const name = String(input.name ?? "").trim();
  if (!name || name.length > 120) return { ok: false, error: "Give the product a name (up to 120 characters)." };
  const slug = slugify(input.slug || name);
  if (!slug) return { ok: false, error: "The URL name can only use letters, numbers and dashes." };
  if (!input.category) return { ok: false, error: "Choose a category." };
  const price = input.price == null ? null : Math.round(Number(input.price));
  if (price != null && (!Number.isFinite(price) || price < 0 || price > 10_000_000)) {
    return { ok: false, error: "Enter a valid price, or leave it empty for “price on request”." };
  }
  if (!["active", "draft", "hidden"].includes(input.status)) return { ok: false, error: "Choose a status." };

  const images = (input.images ?? []).slice(0, 8).map((i) => ({ path: String(i.path), alt: String(i.alt ?? "").slice(0, 200) }));
  if (images.some((i) => !PATH.test(i.path))) return { ok: false, error: "One of the photos has an invalid file name." };

  const stock: Record<string, number> = {};
  for (const [k, v] of Object.entries(input.stock ?? {})) {
    if (!/^[\w.-]{1,8}$/.test(k)) continue;
    stock[k] = Math.max(0, Math.min(9999, Math.floor(Number(v) || 0)));
  }

  const row = {
    name,
    slug,
    category: input.category,
    price,
    description: String(input.description ?? "").slice(0, 2000),
    material: String(input.material ?? "").slice(0, 200),
    tags: (input.tags ?? []).map((t) => t.trim().toLowerCase().slice(0, 24)).filter(Boolean).slice(0, 10),
    status: input.status,
    featured: Boolean(input.featured),
    images,
    sizes: (input.sizes ?? []).filter((s) => /^[\w.-]{1,8}$/.test(s)).slice(0, 20),
    stock,
    low_stock: Math.max(0, Math.min(999, Math.floor(Number(input.low_stock) || 0))),
    is_sample: false,
    updated_at: new Date().toISOString(),
  };

  const db = await sessionClient();
  const result = input.id
    ? await db.from("products").update(row).eq("id", input.id).select("id").single()
    : await db.from("products").insert(row).select("id").single();
  if (result.error) return { ok: false, error: dbError(result.error).error! };

  updateTag("products");
  if (row.status === "active") warm(`/product/${slug}`, `/shop/${row.category}`, "/shop/all", "/");
  return { ok: true, id: result.data.id as string };
}

export async function setProductStatus(id: string, status: ProductStatus): Promise<FormState> {
  await requireAdmin();
  if (!["active", "draft", "hidden"].includes(status)) return fail("Invalid status.");
  const db = await sessionClient();
  const { error } = await db.from("products").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) return dbError(error);
  updateTag("products");
  return { ok: true };
}

export async function deleteProduct(id: string): Promise<FormState> {
  await requireOwner();
  const db = await sessionClient();
  const { error } = await db.from("products").delete().eq("id", id);
  if (error) return dbError(error);
  updateTag("products");
  return { ok: true };
}

/* ───────────── Categories ───────────── */

export async function saveCategory(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const name = str(fd, "name", 60);
  if (!name) return fail("Give the category a name.");
  const existing = str(fd, "slug", 60);
  const slug = existing || slugify(name);
  const cover = str(fd, "cover", 160);
  if (cover && !PATH.test(cover)) return fail("Invalid cover photo.");
  const row = {
    slug,
    name,
    cover: cover || null,
    position: Math.max(0, Math.min(999, Number(fd.get("position")) || 0)),
    visible: fd.get("visible") === "on",
  };
  const db = await sessionClient();
  const { error } = await db.from("categories").upsert(row, { onConflict: "slug" });
  if (error) return dbError(error);
  updateTag("categories");
  updateTag("products");
  if (row.visible) warm(`/shop/${slug}`, "/");
  return { ok: true, message: "Saved." };
}

export async function deleteCategory(slug: string): Promise<FormState> {
  await requireOwner();
  const db = await sessionClient();
  const { count } = await db.from("products").select("id", { count: "exact", head: true }).eq("category", slug);
  if (count) return fail("Move or delete the products in this category first.");
  const { error } = await db.from("categories").delete().eq("slug", slug);
  if (error) return dbError(error);
  updateTag("categories");
  return { ok: true };
}

/* ───────────── Orders ───────────── */

async function loadOrder(id: number) {
  const db = await sessionClient();
  const { data } = await db.from("orders").select("*").eq("id", id).maybeSingle();
  return { db, order: data };
}

export async function updateOrderStatus(id: number, status: OrderStatus): Promise<FormState> {
  const admin = await requireAdmin();
  if (!ORDER_STATUSES.includes(status)) return fail("Invalid status.");
  const { db, order } = await loadOrder(id);
  if (!order) return fail("Order not found.");
  if (order.status === status) return { ok: true };
  const timeline = [...(order.timeline ?? []), { status, at: new Date().toISOString(), by: admin.email }];
  const { error } = await db.from("orders").update({ status, timeline }).eq("id", id);
  return error ? dbError(error) : { ok: true };
}

export async function setOrderPaid(id: number, paid: boolean): Promise<FormState> {
  await requireAdmin();
  const db = await sessionClient();
  const { error } = await db.from("orders").update({ paid }).eq("id", id);
  return error ? dbError(error) : { ok: true };
}

export async function addOrderNote(id: number, text: string): Promise<FormState> {
  const admin = await requireAdmin();
  const note = text.trim().slice(0, 500);
  if (!note) return fail("Write a note first.");
  const { db, order } = await loadOrder(id);
  if (!order) return fail("Order not found.");
  const timeline = [...(order.timeline ?? []), { status: "Note", at: new Date().toISOString(), by: admin.email, text: note }];
  const { error } = await db.from("orders").update({ timeline }).eq("id", id);
  return error ? dbError(error) : { ok: true };
}

export async function saveOrderDetails(id: number, _: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const phoneRaw = str(fd, "phone", 30);
  const phone = phoneRaw ? normalisePhone(phoneRaw) : "";
  if (phone === null) return fail("Enter a Pakistani mobile number, like 0300 1234567.");
  const fee = Math.round(Number(fd.get("delivery_fee")) || 0);
  if (fee < 0 || fee > 100000) return fail("Enter a valid delivery fee.");
  const db = await sessionClient();
  const { error } = await db
    .from("orders")
    .update({
      customer_name: str(fd, "customer_name", 80),
      phone,
      city: str(fd, "city", 60),
      address: str(fd, "address", 300),
      delivery_fee: fee,
      notes: str(fd, "notes", 500),
    })
    .eq("id", id);
  return error ? dbError(error) : { ok: true, message: "Saved." };
}

export async function createOrder(_: FormState, fd: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  let raw: { id: string; size?: string; qty: number }[] = [];
  try {
    raw = JSON.parse(String(fd.get("items") ?? "[]"));
  } catch {
    return fail("The order items could not be read.");
  }
  if (!Array.isArray(raw) || raw.length === 0) return fail("Add at least one product.");
  if (raw.length > 30) return fail("That's too many lines for one order.");

  const source = str(fd, "source", 20) as OrderSource;
  if (!ORDER_SOURCES.includes(source)) return fail("Choose where the order came from.");
  const name = str(fd, "customer_name", 80);
  if (!name) return fail("Enter the customer's name.");
  const phoneRaw = str(fd, "phone", 30);
  const phone = phoneRaw ? normalisePhone(phoneRaw) : "";
  if (phone === null) return fail("Enter a Pakistani mobile number, like 0300 1234567.");
  const fee = Math.round(Number(fd.get("delivery_fee")) || 0);
  if (fee < 0 || fee > 100000) return fail("Enter a valid delivery fee.");

  const db = await sessionClient();
  const { data: products } = await db.from("products").select("id,name,price").in("id", raw.map((r) => String(r.id)));
  const byId = new Map((products ?? []).map((p) => [p.id as string, p]));
  const items: OrderItem[] = [];
  for (const r of raw) {
    const p = byId.get(String(r.id));
    if (!p) continue;
    items.push({
      product_id: p.id,
      name: p.name,
      size: r.size ? String(r.size).slice(0, 8) : undefined,
      qty: Math.min(99, Math.max(1, Math.floor(Number(r.qty)) || 1)),
      price: p.price ?? null,
    });
  }
  if (!items.length) return fail("None of the selected products could be found.");

  const { data, error } = await db
    .from("orders")
    .insert({
      source,
      status: "New",
      items,
      customer_name: name,
      phone,
      city: str(fd, "city", 60),
      address: str(fd, "address", 300),
      delivery_fee: fee,
      paid: false,
      notes: str(fd, "notes", 500),
      timeline: [{ status: "New", at: new Date().toISOString(), by: admin.email }],
    })
    .select("id")
    .single();
  if (error) return dbError(error);
  redirect(`/admin/orders/${data.id}`);
}

export async function deleteOrder(id: number): Promise<FormState> {
  await requireOwner();
  const db = await sessionClient();
  const { error } = await db.from("orders").delete().eq("id", id);
  return error ? dbError(error) : { ok: true };
}

/* ───────────── Reviews (only ever entered by the owner) ───────────── */

export async function saveReview(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const name = str(fd, "name", 60);
  const text = str(fd, "text", 600);
  const rating = Math.round(Number(fd.get("rating")));
  if (!name) return fail("Enter the customer's name.");
  if (!text) return fail("Paste what the customer said.");
  if (!(rating >= 1 && rating <= 5)) return fail("Choose a rating from 1 to 5.");
  const db = await sessionClient();
  const { error } = await db.from("reviews").insert({ name, city: str(fd, "city", 60), rating, text, status: "approved" });
  if (error) return dbError(error);
  updateTag("reviews");
  return { ok: true, message: "Review added." };
}

export async function setReviewStatus(id: string, status: "approved" | "hidden"): Promise<FormState> {
  await requireAdmin();
  const db = await sessionClient();
  const { error } = await db.from("reviews").update({ status }).eq("id", id);
  if (error) return dbError(error);
  updateTag("reviews");
  return { ok: true };
}

export async function deleteReview(id: string): Promise<FormState> {
  await requireAdmin();
  const db = await sessionClient();
  const { error } = await db.from("reviews").delete().eq("id", id);
  if (error) return dbError(error);
  updateTag("reviews");
  return { ok: true };
}

/* ───────────── Pages and settings (owner only) ───────────── */

export async function savePage(_: FormState, fd: FormData): Promise<FormState> {
  await requireOwner();
  const slug = slugify(str(fd, "slug", 60));
  const title = str(fd, "title", 100);
  if (!slug || !title) return fail("A page needs a title.");
  const body = String(fd.get("body") ?? "").slice(0, 20000);
  const published = fd.get("published") === "on";
  if (published && !body.trim()) return fail("Write some content before publishing, or leave the page unpublished.");
  const db = await sessionClient();
  const { error } = await db.from("pages").upsert({ slug, title, body, published, updated_at: new Date().toISOString() }, { onConflict: "slug" });
  if (error) return dbError(error);
  updateTag("pages");
  if (published) warm(`/${slug}`);
  return { ok: true, message: "Saved." };
}

export async function saveSettings(_: FormState, fd: FormData): Promise<FormState> {
  await requireOwner();
  const whatsappRaw = str(fd, "whatsapp", 30);
  const whatsapp = whatsappRaw ? normalisePhone(whatsappRaw) : "";
  if (whatsapp === null) return fail("Enter the WhatsApp number as 0300 1234567 (or +92 300 1234567).");
  const email = str(fd, "email", 120);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return fail("Enter a valid contact email address.");
  const instagram = str(fd, "instagram", 60).replace(/^@/, "").replace(/^https?:\/\/(www\.)?instagram\.com\//, "").replace(/\/.*$/, "");
  if (!instagram) return fail("Enter your Instagram handle.");
  const time = /^([01]\d|2[0-3]):[0-5]\d$/;
  const open = str(fd, "hours_open", 5);
  const close = str(fd, "hours_close", 5);
  if (!time.test(open) || !time.test(close)) return fail("Enter opening and closing times.");
  const hero = str(fd, "hero_image", 160);
  if (hero && !PATH.test(hero)) return fail("Invalid hero photo.");

  const data: SiteSettings = {
    shop_name: str(fd, "shop_name", 60) || "Zi's Selection",
    whatsapp,
    email,
    instagram,
    hours_open: open,
    hours_close: close,
    announce_on: fd.get("announce_on") === "on",
    announce: str(fd, "announce", 160),
    hero_headline: str(fd, "hero_headline", 80),
    hero_sub: str(fd, "hero_sub", 220),
    hero_image: hero,
    delivery_note: str(fd, "delivery_note", 220),
  };
  const db = await sessionClient();
  const { error } = await db.from("site_settings").upsert({ id: 1, data }, { onConflict: "id" });
  if (error) return dbError(error);
  updateTag("settings");
  return { ok: true, message: "Settings saved. The website is updated." };
}
