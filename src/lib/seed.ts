import type { Category, PageDoc, Product } from "./types";
import { slugify } from "./format";

/**
 * Sample catalogue used when Supabase is not connected yet (and as the
 * starting content for supabase/seed.sql). Names describe the pieces
 * photographed on the Instagram profile. Prices are intentionally empty
 * ("price on request") and materials are left for the owner to fill in.
 */
export const seedCategories: Category[] = [
  { slug: "rings", name: "Rings", cover: null, position: 1, visible: true },
  { slug: "brooches", name: "Brooches", cover: null, position: 2, visible: true },
  { slug: "necklaces", name: "Necklaces", cover: null, position: 3, visible: true },
  { slug: "earrings", name: "Earrings", cover: null, position: 4, visible: true },
];

const RING_SIZES = ["5", "6", "7", "8", "9", "10"];

type Row = [category: string, name: string, description: string, featured: boolean];

const rows: Row[] = [
  ["rings", "Solitaire CZ Ring", "A fine gold-tone ring set with a single clear stone.", true],
  ["rings", "Triple Band Set", "Three slim gold-tone bands that stack or wear apart.", true],
  ["rings", "Clover CZ Ring", "A clover motif set with clear stones.", true],
  ["rings", "Star Stack Ring", "A delicate stackable ring with a star detail.", false],
  ["rings", "Ribbed Open Ring", "A ribbed gold-tone band with an open back.", false],
  ["rings", "Pearl Statement Ring", "A bold cocktail ring with a pearl-look centre.", false],
  ["brooches", "Gold Flower Brooch", "A gold-tone flower spray with crystal accents.", true],
  ["brooches", "Crystal Wreath Brooch", "A wreath of clear crystals in a gold-tone setting.", true],
  ["brooches", "Peacock Leaf Brooch", "A leaf-and-feather brooch with opal-look stones.", false],
  ["necklaces", "Layered Lariat Necklace", "A double fine chain with ball drops.", true],
  ["necklaces", "Black Stone Pendant", "A fine chain with a dark stone and square crystal pendant.", false],
  ["earrings", "CZ Circle Drops", "Clear-stone circles with a small drop.", true],
  ["earrings", "Blue Halo Studs", "Deep blue stones framed by a crystal halo.", false],
  ["earrings", "Pearl Studs", "Simple studs with a pearl-look finish.", false],
];

export const seedProducts: Product[] = rows.map(([category, name, description, featured], i) => ({
  id: `sample-${i + 1}`,
  slug: slugify(name),
  name,
  category,
  price: null,
  description,
  material: "",
  tags: [],
  status: "active",
  images: [],
  sizes: category === "rings" ? RING_SIZES : [],
  stock: category === "rings" ? Object.fromEntries(RING_SIZES.map((s) => [s, 3])) : { all: 3 },
  low_stock: 2,
  featured,
  position: i + 1,
  is_sample: true,
}));

export const seedPages: PageDoc[] = [
  {
    slug: "how-to-order",
    title: "How to order",
    published: true,
    body: [
      "1. Browse the collection and add the pieces you like to your bag.",
      "2. Send your bag to us on WhatsApp or Instagram with one tap. Your selection is filled in for you.",
      "3. We confirm availability, price, delivery details and payment with you directly in the chat.",
    ].join("\n\n"),
  },
  { slug: "shipping-returns", title: "Shipping & Returns", published: false, body: "" },
  { slug: "jewelry-care", title: "Jewelry Care", published: false, body: "" },
  { slug: "size-guide", title: "Ring Size Guide", published: false, body: "" },
  { slug: "faq", title: "FAQ", published: false, body: "" },
  { slug: "our-story", title: "Our Story", published: false, body: "" },
  { slug: "privacy", title: "Privacy", published: false, body: "" },
];
