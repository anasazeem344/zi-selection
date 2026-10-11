"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ActionButton } from "./AdminForm";
import { deleteProduct, deleteReview, setProductStatus, setReviewStatus, deleteCategory } from "@/lib/actions/admin";
import type { ProductStatus } from "@/lib/types";

const small = "inline-flex min-h-11 items-center px-2 text-xs tracking-[0.1em] uppercase underline underline-offset-4";

export function ProductRowActions({ id, name, status, isOwner }: { id: string; name: string; status: ProductStatus; isOwner: boolean }) {
  const router = useRouter();
  const next: ProductStatus = status === "active" ? "hidden" : "active";
  return (
    <div className="flex flex-wrap items-center">
      <Link href={`/admin/products/${id}`} className={small}>Edit</Link>
      <ActionButton action={() => setProductStatus(id, next)} onDone={() => router.refresh()} className={small}>
        {status === "active" ? "Hide" : "Publish"}
      </ActionButton>
      {isOwner && (
        <ActionButton
          action={() => deleteProduct(id)}
          confirmText={`Delete “${name}” permanently? This cannot be undone. (Use Hide to keep it.)`}
          onDone={() => router.refresh()}
          className={`${small} text-danger`}
        >
          Delete
        </ActionButton>
      )}
    </div>
  );
}

export function ReviewActions({ id, status }: { id: string; status: "approved" | "hidden" }) {
  const router = useRouter();
  return (
    <div className="flex items-center">
      <ActionButton action={() => setReviewStatus(id, status === "approved" ? "hidden" : "approved")} onDone={() => router.refresh()} className={small}>
        {status === "approved" ? "Hide" : "Show"}
      </ActionButton>
      <ActionButton action={() => deleteReview(id)} confirmText="Delete this review permanently?" onDone={() => router.refresh()} className={`${small} text-danger`}>
        Delete
      </ActionButton>
    </div>
  );
}

export function CategoryDelete({ slug, name }: { slug: string; name: string }) {
  const router = useRouter();
  return (
    <ActionButton action={() => deleteCategory(slug)} confirmText={`Delete the “${name}” category?`} onDone={() => router.refresh()} className={`${small} text-danger`}>
      Delete
    </ActionButton>
  );
}
