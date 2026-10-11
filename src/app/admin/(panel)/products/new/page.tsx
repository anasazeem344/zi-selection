import { PageHeader } from "@/components/admin/ui";
import { ProductEditor } from "@/components/admin/ProductEditor";
import { adminCategories } from "@/lib/admin/queries";

export const metadata = { title: "New product" };

export default async function NewProduct() {
  const categories = await adminCategories();
  return (
    <>
      <PageHeader title="New product" />
      <ProductEditor product={null} categories={categories} />
    </>
  );
}
