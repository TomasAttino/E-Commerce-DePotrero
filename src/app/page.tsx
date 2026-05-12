import { getTeams } from "./actions/products";
import HomeContent from "@/components/HomeContent";

export default async function Home() {
  const teamsRaw = await getTeams();
  
  // Mapear los datos para que coincidan con la estructura que espera el frontend
  // (especialmente parsear los JSON strings de sizes y colors)
  const teams = teamsRaw.map(team => ({
    ...team,
    products: team.products.map(product => ({
      ...product,
      sizes: JSON.parse(product.sizes),
      colors: JSON.parse(product.colors),
    }))
  }));

  return <HomeContent teams={teams} />;
}
