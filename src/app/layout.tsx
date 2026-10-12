import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Montserrat } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const serif = Bodoni_Moda({
  subsets: ["latin"],
  variable: "--f-serif",
  display: "swap",
});

const sans = Montserrat({
  subsets: ["latin"],
  variable: "--f-sans",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Zi's Selection · Where Selection Becomes Signature", template: "%s · Zi's Selection" },
  description:
    "Handpicked gold-tone and crystal jewelry: rings, brooches, necklaces and earrings. Order on WhatsApp or Instagram.",
  openGraph: { siteName: "Zi's Selection", type: "website", locale: "en_PK" },
};

export const viewport: Viewport = {
  themeColor: "#faf8f5",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
