import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/ui";
import { ProductEditor } from "@/components/admin/ProductEditor";
import { adminCategories, adminProduct } from "@/lib/admin/queries";

export const metadata = { title: "Edit product" };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function EditProduct({ params }: PageProps<"/admin/products/[id]">) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  const [product, categories] = await Promise.all([adminProduct(id), adminCategories()]);
  if (!product) notFound();
  return (
    <>
      <PageHeader title={product.name} sub={product.is_sample ? "This is a sample product. Saving it turns it into a real one." : undefined} />
      <ProductEditor key={product.id} product={product} categories={categories} />
    </>
  );
}
