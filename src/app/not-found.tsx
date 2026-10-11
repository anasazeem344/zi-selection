import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid min-h-dvh place-items-center px-6 text-center">
      <div>
        <h1 className="display text-5xl">Page not found</h1>
        <p className="mt-4 text-sm text-muted">The page you are looking for does not exist.</p>
        <Link href="/" className="btn btn-dark mt-7">Back to home</Link>
      </div>
    </div>
  );
}
