import { getTeams } from "@/app/actions/products";
import ProductForm from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const teams = await getTeams();

  return <ProductForm teams={teams} />;
}
