import { PageHeader } from "@/components/admin/ui";
import { NewOrderForm } from "@/components/admin/NewOrderForm";
import { adminProducts } from "@/lib/admin/queries";

export const metadata = { title: "New order" };

export default async function NewOrder() {
  const products = (await adminProducts()).filter((p) => p.status !== "hidden");
  return (
    <>
      <PageHeader title="New order" sub="Record an order that came in through a chat, a call or in person." />
      <NewOrderForm products={products.map((p) => ({ id: p.id, name: p.name, price: p.price, sizes: p.sizes }))} />
    </>
  );
}
