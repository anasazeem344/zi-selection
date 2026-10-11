"use client";

import { useState } from "react";
import { Photo } from "@/components/ui/Media";
import type { ProductImage } from "@/lib/types";

export function Gallery({ images, name }: { images: ProductImage[]; name: string }) {
  const [i, setI] = useState(0);
  const list = images.length ? images : [{ path: "", alt: name }];
  const current = list[Math.min(i, list.length - 1)];

  return (
    <div className="flex flex-col gap-3 lg:flex-row-reverse lg:gap-4">
      <div className="relative aspect-[4/5] min-w-0 flex-1 overflow-hidden bg-paper">
        <Photo path={current.path} alt={current.alt || name} priority sizes="(min-width:1024px) 50vw, 100vw" />
      </div>
      {list.length > 1 && (
        <div className="flex gap-3 overflow-x-auto lg:w-20 lg:flex-col lg:overflow-visible" role="group" aria-label="Product photos">
          {list.map((img, n) => (
            <button
              key={`${img.path}-${n}`}
              type="button"
              aria-label={`Show photo ${n + 1}`}
              aria-pressed={n === i}
              onClick={() => setI(n)}
              className={`relative h-20 w-16 shrink-0 overflow-hidden border lg:h-24 lg:w-full ${n === i ? "border-ink" : "border-line opacity-70 hover:opacity-100"}`}
            >
              <Photo path={img.path} alt="" sizes="80px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
