export type CategorySlug = "rings" | "brooches" | "necklaces" | "earrings";

export type ProductStatus = "active" | "draft" | "hidden";
export type ProductImage = { path: string; alt: string };

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  /** PKR. null means "price on request". */
  price: number | null;
  description: string;
  material: string;
  tags: string[];
  status: ProductStatus;
  images: ProductImage[];
  /** Ring sizes offered. Empty for non-rings. */
  sizes: string[];
  /** Stock keyed by size, or "all" when the product has no sizes. */
  stock: Record<string, number>;
  low_stock: number;
  featured: boolean;
  position: number;
  is_sample: boolean;
};

export type Category = {
  slug: string;
  name: string;
  cover: string | null;
  position: number;
  visible: boolean;
};

export type OrderStatus =
  | "New"
  | "Confirmed"
  | "Packed"
  | "Shipped"
  | "Delivered"
  | "Cancelled"
  | "Returned";

export const ORDER_STATUSES: OrderStatus[] = [
  "New",
  "Confirmed",
  "Packed",
  "Shipped",
  "Delivered",
  "Cancelled",
  "Returned",
];

export type OrderSource = "Website" | "WhatsApp" | "Instagram";
export const ORDER_SOURCES: OrderSource[] = ["Website", "WhatsApp", "Instagram"];

export type OrderItem = {
  product_id: string | null;
  name: string;
  size?: string;
  qty: number;
  price: number | null;
};

export type TimelineEntry = { status: OrderStatus | "Note"; at: string; by: string; text?: string };

export type Order = {
  id: number;
  created_at: string;
  source: OrderSource;
  status: OrderStatus;
  items: OrderItem[];
  customer_name: string;
  phone: string;
  city: string;
  address: string;
  delivery_fee: number;
  paid: boolean;
  notes: string;
  timeline: TimelineEntry[];
};

export type Review = {
  id: string;
  name: string;
  city: string;
  rating: number;
  text: string;
  status: "approved" | "hidden";
  created_at: string;
};

export type PageDoc = {
  slug: string;
  title: string;
  body: string;
  published: boolean;
};

export type SiteSettings = {
  shop_name: string;
  whatsapp: string;
  email: string;
  instagram: string;
  hours_open: string;
  hours_close: string;
  announce_on: boolean;
  announce: string;
  hero_headline: string;
  hero_sub: string;
  hero_image: string;
  delivery_note: string;
};

export const DEFAULT_SETTINGS: SiteSettings = {
  shop_name: "Zi's Selection",
  whatsapp: "",
  email: "",
  instagram: "zi_selection518",
  hours_open: "08:00",
  hours_close: "20:00",
  announce_on: true,
  announce: "Order on WhatsApp or Instagram · Open daily, 8 AM – 8 PM",
  hero_headline: "Where Selection Becomes Signature",
  hero_sub: "Handpicked jewelry, chosen with intention and worn as your own.",
  hero_image: "",
  delivery_note: "",
};
