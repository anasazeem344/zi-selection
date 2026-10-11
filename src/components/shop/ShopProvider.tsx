"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type BagItem = {
  id: string;
  slug: string;
  name: string;
  price: number | null;
  image: string | null;
  size?: string;
  qty: number;
};

export type Contact = { whatsapp: string; instagram: string; hours: string };

type Ctx = {
  contact: Contact;
  items: BagItem[];
  count: number;
  subtotal: number;
  add: (item: Omit<BagItem, "qty">, qty?: number) => void;
  setQty: (id: string, size: string | undefined, qty: number) => void;
  remove: (id: string, size: string | undefined) => void;
  clear: () => void;
  bagOpen: boolean;
  setBagOpen: (open: boolean) => void;
  wishlist: string[];
  toggleWishlist: (id: string) => void;
};

const ShopCtx = createContext<Ctx | null>(null);

export const useShop = () => {
  const v = useContext(ShopCtx);
  if (!v) throw new Error("ShopProvider missing");
  return v;
};

const BAG_KEY = "zs-bag";
const WISH_KEY = "zs-wishlist";

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Private mode or storage full: the bag still works for this visit.
  }
}

const same = (a: BagItem, id: string, size?: string) => a.id === id && (a.size ?? "") === (size ?? "");

export function ShopProvider({ contact, children }: { contact: Contact; children: ReactNode }) {
  const [items, setItems] = useState<BagItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [bagOpen, setBagOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Load after hydration so server and client HTML match.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems(read<BagItem[]>(BAG_KEY, []));
    setWishlist(read<string[]>(WISH_KEY, []));
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) write(BAG_KEY, items);
  }, [items, ready]);
  useEffect(() => {
    if (ready) write(WISH_KEY, wishlist);
  }, [wishlist, ready]);

  const add: Ctx["add"] = useCallback((item, qty = 1) => {
    setItems((cur) => {
      const found = cur.find((i) => same(i, item.id, item.size));
      if (found) return cur.map((i) => (i === found ? { ...i, qty: Math.min(9, i.qty + qty) } : i));
      return [...cur, { ...item, qty }];
    });
    setBagOpen(true);
  }, []);

  const setQty: Ctx["setQty"] = useCallback((id, size, qty) => {
    setItems((cur) => cur.map((i) => (same(i, id, size) ? { ...i, qty: Math.max(1, Math.min(9, qty)) } : i)));
  }, []);

  const remove: Ctx["remove"] = useCallback((id, size) => {
    setItems((cur) => cur.filter((i) => !same(i, id, size)));
  }, []);

  const toggleWishlist = useCallback((id: string) => {
    setWishlist((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      contact,
      items,
      count: items.reduce((n, i) => n + i.qty, 0),
      subtotal: items.reduce((n, i) => n + (i.price ?? 0) * i.qty, 0),
      add,
      setQty,
      remove,
      clear: () => setItems([]),
      bagOpen,
      setBagOpen,
      wishlist,
      toggleWishlist,
    }),
    [contact, items, add, setQty, remove, bagOpen, wishlist, toggleWishlist],
  );

  return <ShopCtx.Provider value={value}>{children}</ShopCtx.Provider>;
}
