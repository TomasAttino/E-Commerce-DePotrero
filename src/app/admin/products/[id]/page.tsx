import { getTeams, getProductById } from "@/app/actions/products";
import ProductForm from "@/components/admin/ProductForm";
import { notFound } from "next/navigation";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [teams, product] = await Promise.all([
    getTeams(),
    getProductById(id)
  ]);

  if (!product) {
    notFound();
  }

  return <ProductForm teams={teams} initialData={product} />;
}
