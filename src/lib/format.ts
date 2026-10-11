import type { OrderItem } from "./types";

export const pkr = (value: number | null | undefined) =>
  value == null ? "Price on request" : `PKR ${value.toLocaleString("en-PK")}`;

export const slugify = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export const orderCode = (id: number) => `ZS-${1000 + id}`;

export const orderSubtotal = (items: OrderItem[]) =>
  items.reduce((sum, i) => sum + (i.price ?? 0) * i.qty, 0);

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleString("en-PK", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });

/** Pakistani mobile numbers, normalised to 923XXXXXXXXX. Returns null if invalid. */
export function normalisePhone(input: string): string | null {
  const digits = input.replace(/[^\d]/g, "");
  if (/^03\d{9}$/.test(digits)) return `92${digits.slice(1)}`;
  if (/^923\d{9}$/.test(digits)) return digits;
  return null;
}

/** 923186708684 → 0318 6708684 */
export function displayPhone(input: string) {
  const n = normalisePhone(input);
  return n ? `0${n.slice(2, 5)} ${n.slice(5)}` : input;
}

export function waLink(number: string, text: string) {
  const n = normalisePhone(number) ?? number.replace(/[^\d]/g, "");
  return `https://wa.me/${n}?text=${encodeURIComponent(text)}`;
}

export function igLink(handle: string) {
  return `https://ig.me/m/${handle.replace(/^@/, "")}`;
}

export function igProfile(handle: string) {
  return `https://www.instagram.com/${handle.replace(/^@/, "")}/`;
}

export function formatHours(open: string, close: string) {
  const f = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    const hh = h % 12 || 12;
    return `${hh}${m ? `:${String(m).padStart(2, "0")}` : ""} ${h >= 12 ? "PM" : "AM"}`;
  };
  return `${f(open)} – ${f(close)}`;
}
