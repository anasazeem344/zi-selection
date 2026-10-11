import { BagDrawer } from "@/components/shop/BagDrawer";
import { Footer } from "@/components/shop/Footer";
import { Header } from "@/components/shop/Header";
import { ShopProvider } from "@/components/shop/ShopProvider";
import { getSettings } from "@/lib/data";
import { formatHours } from "@/lib/format";

export default async function ShopLayout({ children }: LayoutProps<"/">) {
  const s = await getSettings();
  const contact = { whatsapp: s.whatsapp, instagram: s.instagram, hours: formatHours(s.hours_open, s.hours_close) };

  return (
    <ShopProvider contact={contact}>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-ink focus:px-4 focus:py-3 focus:text-white">
        Skip to content
      </a>
      <Header />
      <main id="main" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <Footer />
      <BagDrawer />
    </ShopProvider>
  );
}
