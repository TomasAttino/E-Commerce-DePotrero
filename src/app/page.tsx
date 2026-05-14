import { getTeams } from "./actions/products";
import HomeContent from "@/components/HomeContent";

export const dynamic = "force-dynamic";

export default async function Home() {
  let teamsRaw: any[] = [];
  try {
    teamsRaw = await getTeams();
  } catch (error) {
    console.error("Error fetching teams:", error);
  }
  
  // Mapear los datos para que coincidan con la estructura que espera el frontend
  // (especialmente parsear los JSON strings de sizes y colors)
  const teams = teamsRaw.map((team: any) => ({
    ...team,
    products: team.products.map((product: any) => {
      let sizes = [];
      let colors = [];
      try {
        sizes = JSON.parse(product.sizes);
        colors = JSON.parse(product.colors);
      } catch (e) {
        console.error("Error parsing product data:", e);
      }
      return {
        ...product,
        sizes,
        colors,
      };
    })
  }));

  return <HomeContent teams={teams} />;
}
