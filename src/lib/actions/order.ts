"use server";

import { serviceClient } from "@/lib/supabase/server";
import type { OrderItem, OrderSource } from "@/lib/types";

type Input = {
  items: { id: string; size?: string; qty: number }[];
  name?: string;
  city?: string;
  source: Extract<OrderSource, "WhatsApp" | "Instagram">;
};

const clean = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/**
 * Records an enquiry when a customer sends their bag on WhatsApp or Instagram,
 * so the owner sees it in the admin as a "New" order. Prices are re-read from
 * the database, never trusted from the browser. Best effort: failure never
 * blocks the customer from messaging.
 */
export async function logOrder(input: Input): Promise<{ ok: boolean }> {
  try {
    const db = serviceClient();
    if (!db) return { ok: false };
    if (!Array.isArray(input.items) || input.items.length === 0 || input.items.length > 30) return { ok: false };
    if (input.source !== "WhatsApp" && input.source !== "Instagram") return { ok: false };

    const ids = [...new Set(input.items.map((i) => clean(i.id, 64)))];
    const { data: products } = await db.from("products").select("id,name,price").in("id", ids);
    const byId = new Map((products ?? []).map((p) => [p.id as string, p]));

    const items: OrderItem[] = [];
    for (const i of input.items) {
      const p = byId.get(clean(i.id, 64));
      if (!p) continue;
      const qty = Math.min(9, Math.max(1, Math.floor(Number(i.qty)) || 1));
      items.push({
        product_id: p.id,
        name: p.name,
        size: clean(i.size, 8) || undefined,
        qty,
        price: p.price ?? null,
      });
    }
    if (!items.length) return { ok: false };

    const now = new Date().toISOString();
    const { error } = await db.from("orders").insert({
      source: input.source,
      status: "New",
      items,
      customer_name: clean(input.name, 80),
      phone: "",
      city: clean(input.city, 60),
      address: "",
      delivery_fee: 0,
      paid: false,
      notes: "Sent from the website bag. Confirm details in chat.",
      timeline: [{ status: "New", at: now, by: "Website" }],
    });
    return { ok: !error };
  } catch {
    return { ok: false };
  }
}
