import { getTeams } from "@/app/actions/products";
import ProductForm from "@/components/admin/ProductForm";

export default async function NewProductPage() {
  const teams = await getTeams();

  return <ProductForm teams={teams} />;
}
