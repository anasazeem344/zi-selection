"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { Photo } from "@/components/ui/Media";
import { saveProduct } from "@/lib/actions/admin";
import { slugify } from "@/lib/format";
import { browserClient } from "@/lib/supabase/browser";
import type { Product, ProductImage, ProductStatus } from "@/lib/types";

const RING_SIZES = ["5", "6", "7", "8", "9", "10"];

async function toWebp(file: File, max = 1600): Promise<Blob> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bmp.width * scale);
  canvas.height = Math.round(bmp.height * scale);
  canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  bmp.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Could not process the photo."))), "image/webp", 0.82),
  );
}

type Props = {
  product: Product | null;
  categories: { slug: string; name: string }[];
};

export function ProductEditor({ product, categories }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [dirty, setDirty] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(product));
  const [category, setCategory] = useState(product?.category ?? categories[0]?.slug ?? "");
  const [price, setPrice] = useState(product?.price != null ? String(product.price) : "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [material, setMaterial] = useState(product?.material ?? "");
  const [tags, setTags] = useState((product?.tags ?? []).join(", "));
  const [status, setStatus] = useState<ProductStatus>(product?.status ?? "draft");
  const [featured, setFeatured] = useState(product?.featured ?? false);
  const [images, setImages] = useState<ProductImage[]>(product?.images ?? []);
  const [hasSizes, setHasSizes] = useState((product?.sizes.length ?? 0) > 0 || product?.category === "rings");
  const [stock, setStock] = useState<Record<string, number>>(product?.stock ?? {});
  const [lowStock, setLowStock] = useState(product?.low_stock ?? 2);

  const touch = () => setDirty(true);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const onName = (v: string) => {
    setName(v);
    if (!slugTouched) setSlug(slugify(v));
    touch();
  };

  const setStockFor = (key: string, v: string) => {
    setStock((s) => ({ ...s, [key]: Math.max(0, Math.floor(Number(v) || 0)) }));
    touch();
  };

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    setMessage(null);
    try {
      const db = browserClient();
      const added: ProductImage[] = [];
      for (const file of Array.from(files).slice(0, 8 - images.length)) {
        if (!file.type.startsWith("image/")) throw new Error(`“${file.name}” is not a photo.`);
        const blob = await toWebp(file);
        const path = `${crypto.randomUUID()}.webp`;
        const { error } = await db.storage.from("product-images").upload(path, blob, {
          contentType: "image/webp",
          cacheControl: "31536000",
        });
        if (error) throw new Error("Upload failed. Check that you are signed in and the storage bucket exists.");
        added.push({ path, alt: name });
      }
      setImages((cur) => [...cur, ...added].slice(0, 8));
      touch();
    } catch (e) {
      setMessage({ ok: false, text: e instanceof Error ? e.message : "Upload failed." });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const move = (i: number, d: -1 | 1) => {
    setImages((cur) => {
      const next = [...cur];
      const j = i + d;
      if (j < 0 || j >= next.length) return cur;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
    touch();
  };

  const save = () => {
    setMessage(null);
    const sizes = hasSizes ? RING_SIZES : [];
    const finalStock = hasSizes ? Object.fromEntries(RING_SIZES.map((s) => [s, stock[s] ?? 0])) : { all: stock.all ?? 0 };
    start(async () => {
      const res = await saveProduct({
        id: product?.id,
        name,
        slug,
        category,
        price: price.trim() === "" ? null : Number(price),
        description,
        material,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        status,
        featured,
        images: images.map((i) => ({ ...i, alt: i.alt || name })),
        sizes,
        stock: finalStock,
        low_stock: lowStock,
      });
      if (!res.ok) return setMessage({ ok: false, text: res.error });
      setDirty(false);
      setMessage({ ok: true, text: "Saved. The website is updated." });
      if (!product) router.replace(`/admin/products/${res.id}`);
      else router.refresh();
    });
  };

  const previewImg = images[0];

  return (
    <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
      <div className="space-y-6">
        <section className="space-y-5 border border-line bg-white p-5 sm:p-6">
          <div>
            <label htmlFor="name" className="label">Name</label>
            <input id="name" className="input" value={name} onChange={(e) => onName(e.target.value)} maxLength={120} required />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="category" className="label">Category</label>
              <select id="category" className="input" value={category} onChange={(e) => { setCategory(e.target.value); if (e.target.value === "rings") setHasSizes(true); touch(); }}>
                {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="price" className="label">Price (PKR)</label>
              <input id="price" className="input" inputMode="numeric" value={price} onChange={(e) => { setPrice(e.target.value.replace(/[^\d]/g, "")); touch(); }} placeholder="Empty = price on request" />
            </div>
          </div>
          <div>
            <label htmlFor="description" className="label">Description</label>
            <textarea id="description" className="input" value={description} onChange={(e) => { setDescription(e.target.value); touch(); }} maxLength={2000} />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="material" className="label">Material</label>
              <input id="material" className="input" value={material} onChange={(e) => { setMaterial(e.target.value); touch(); }} placeholder="e.g. Gold tone, CZ stones" maxLength={200} />
              <p className="mt-1.5 text-xs text-muted">Only write what you are sure of. Shown on the product page.</p>
            </div>
            <div>
              <label htmlFor="tags" className="label">Tags</label>
              <input id="tags" className="input" value={tags} onChange={(e) => { setTags(e.target.value); touch(); }} placeholder="new, pearl, gift" />
              <p className="mt-1.5 text-xs text-muted">Add “new” to show a New badge and list it in New Arrivals.</p>
            </div>
          </div>
          <div>
            <label htmlFor="slug" className="label">Web address</label>
            <div className="flex items-center gap-2">
              <span className="hidden text-sm text-muted sm:block">/product/</span>
              <input id="slug" className="input" value={slug} onChange={(e) => { setSlug(slugify(e.target.value)); setSlugTouched(true); touch(); }} />
            </div>
          </div>
        </section>

        <section className="border border-line bg-white p-5 sm:p-6" aria-labelledby="photos">
          <div className="flex items-center justify-between gap-3">
            <h2 id="photos" className="display text-2xl">Photos</h2>
            <button type="button" className="btn btn-outline" disabled={uploading || images.length >= 8} onClick={() => fileRef.current?.click()}>
              <Icon name="upload" size={16} /> {uploading ? "Uploading…" : "Add photos"}
            </button>
            <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => upload(e.target.files)} />
          </div>
          <p className="mt-2 text-xs text-muted">Up to 8 photos. They are resized and compressed automatically to keep the website fast. The first photo is the cover.</p>
          {images.length === 0 ? (
            <p className="mt-6 border border-dashed border-line p-8 text-center text-sm text-muted">No photos yet.</p>
          ) : (
            <ul className="mt-5 grid gap-4 sm:grid-cols-2">
              {images.map((img, i) => (
                <li key={img.path} className="flex gap-3 border border-line p-3">
                  <div className="relative h-24 w-20 shrink-0 overflow-hidden bg-paper"><Photo path={img.path} alt={img.alt} sizes="80px" /></div>
                  <div className="min-w-0 flex-1">
                    <label htmlFor={`alt-${i}`} className="label">{i === 0 ? "Cover · description" : "Description"}</label>
                    <input id={`alt-${i}`} className="input !min-h-10" value={img.alt} onChange={(e) => { setImages((cur) => cur.map((c, n) => (n === i ? { ...c, alt: e.target.value } : c))); touch(); }} placeholder="Describe the photo" maxLength={200} />
                    <div className="mt-1 flex items-center">
                      <button type="button" aria-label="Move earlier" disabled={i === 0} onClick={() => move(i, -1)} className="grid h-11 w-11 place-items-center disabled:opacity-30"><Icon name="chevronLeft" size={18} /></button>
                      <button type="button" aria-label="Move later" disabled={i === images.length - 1} onClick={() => move(i, 1)} className="grid h-11 w-11 place-items-center disabled:opacity-30"><Icon name="chevronRight" size={18} /></button>
                      <button type="button" aria-label="Remove photo" onClick={() => { setImages((cur) => cur.filter((_, n) => n !== i)); touch(); }} className="ml-auto grid h-11 w-11 place-items-center text-danger"><Icon name="trash" size={18} /></button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="border border-line bg-white p-5 sm:p-6" aria-labelledby="stock">
          <h2 id="stock" className="display text-2xl">Stock</h2>
          <label className="mt-4 flex min-h-11 items-center gap-3 text-sm">
            <input type="checkbox" className="h-5 w-5 accent-[var(--ink)]" checked={hasSizes} onChange={(e) => { setHasSizes(e.target.checked); touch(); }} />
            This piece comes in ring sizes
          </label>
          {hasSizes ? (
            <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-6">
              {RING_SIZES.map((s) => (
                <div key={s}>
                  <label htmlFor={`stock-${s}`} className="label">Size {s}</label>
                  <input id={`stock-${s}`} className="input" inputMode="numeric" value={stock[s] ?? 0} onChange={(e) => setStockFor(s, e.target.value)} />
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 max-w-[10rem]">
              <label htmlFor="stock-all" className="label">In stock</label>
              <input id="stock-all" className="input" inputMode="numeric" value={stock.all ?? 0} onChange={(e) => setStockFor("all", e.target.value)} />
            </div>
          )}
          <div className="mt-5 max-w-[12rem]">
            <label htmlFor="low" className="label">Low-stock warning at</label>
            <input id="low" className="input" inputMode="numeric" value={lowStock} onChange={(e) => { setLowStock(Math.max(0, Math.floor(Number(e.target.value) || 0))); touch(); }} />
          </div>
        </section>
      </div>

      <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
        <section className="border border-line bg-white p-5 sm:p-6">
          <label htmlFor="status" className="label">Status</label>
          <select id="status" className="input" value={status} onChange={(e) => { setStatus(e.target.value as ProductStatus); touch(); }}>
            <option value="active">Published, visible on the website</option>
            <option value="draft">Draft, not visible</option>
            <option value="hidden">Hidden, not visible</option>
          </select>
          <label className="mt-4 flex min-h-11 items-center gap-3 text-sm">
            <input type="checkbox" className="h-5 w-5 accent-[var(--ink)]" checked={featured} onChange={(e) => { setFeatured(e.target.checked); touch(); }} />
            Feature on the home page
          </label>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button type="button" onClick={save} disabled={pending || uploading || !name.trim()} className="btn btn-gold">
              {pending ? "Saving…" : product ? "Save changes" : "Create product"}
            </button>
            <Link href="/admin/products" className="inline-flex min-h-11 items-center text-xs tracking-[0.12em] uppercase underline underline-offset-4">Back</Link>
          </div>
          <p role="status" aria-live="polite" className={`mt-3 text-sm ${message && !message.ok ? "text-danger" : "text-ok"}`}>{message?.text}</p>
          {dirty && !message?.ok && <p className="mt-2 text-xs text-muted">You have unsaved changes.</p>}
        </section>

        <section className="border border-line bg-white p-5" aria-label="Preview">
          <p className="label">Preview</p>
          <div className="mx-auto max-w-[14rem]">
            <div className="relative aspect-[4/5] overflow-hidden bg-paper"><Photo path={previewImg?.path} alt={name || "Preview"} sizes="224px" /></div>
            <p className="display mt-3 text-lg leading-tight">{name || "Product name"}</p>
            <p className="mt-1 text-sm text-muted">{price ? `PKR ${Number(price).toLocaleString("en-PK")}` : "Price on request"}</p>
          </div>
        </section>
      </aside>
    </div>
  );
}
