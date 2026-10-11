import Link from "next/link";

export default function NotFound() {
  return (
    <div className="shell grid min-h-[60vh] place-items-center py-20 text-center">
      <div>
        <p className="display text-[clamp(6rem,22vw,12rem)] leading-none text-transparent [-webkit-text-stroke:1px_var(--gold)]" aria-hidden="true">404</p>
        <h1 className="display mt-2 text-4xl">This page could not be found</h1>
        <p className="mx-auto mt-4 max-w-sm text-sm leading-7 text-muted">The piece or page you are looking for may have moved or sold out.</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn btn-dark">Back to home</Link>
          <Link href="/shop/all" className="btn btn-outline">Browse the collection</Link>
        </div>
      </div>
    </div>
  );
}
