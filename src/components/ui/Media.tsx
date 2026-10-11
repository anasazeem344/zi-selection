import Image from "next/image";
import { imageUrl } from "@/lib/supabase/public";

const TONES = [
  ["#dfe5f2", "#c9c4dd"],
  ["#e9e4f0", "#d9dfee"],
  ["#efe9dd", "#e2d7c3"],
  ["#dde4ee", "#cdd7e6"],
];

/** Lightweight stand-in until a real photo is uploaded. Pure CSS/SVG, no network request. */
export function Placeholder({ label, seed = 0 }: { label: string; seed?: number }) {
  const [a, b] = TONES[Math.abs(seed) % TONES.length];
  return (
    <div
      role="img"
      aria-label={`${label} (photo coming soon)`}
      className="grid h-full w-full place-items-center"
      style={{ background: `linear-gradient(145deg, ${a}, ${b})` }}
    >
      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#8a6f4d" strokeWidth="1" aria-hidden="true">
        <path d="M6 3h12l4 6-10 12L2 9l4-6Z" />
        <path d="M2 9h20M9 3l3 18M15 3l-3 18" />
      </svg>
    </div>
  );
}

type Props = {
  path: string | null | undefined;
  alt: string;
  seed?: number;
  priority?: boolean;
  sizes?: string;
  className?: string;
};

/** Optimised remote image (AVIF/WebP, responsive) or the placeholder when there is no photo. */
export function Photo({ path, alt, seed = 0, priority, sizes = "(min-width:1024px) 25vw, 50vw", className = "" }: Props) {
  const src = imageUrl(path);
  if (!src) return <Placeholder label={alt} seed={seed} />;
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      quality={75}
      className={`object-cover ${className}`}
    />
  );
}
