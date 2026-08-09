import HomeContent from "@/components/HomeContent";
import { teamsMock } from "../../public/camisetas/mock";
import { readCatalogState } from "@/lib/catalog-blob";
import { readStockState } from "@/lib/stock-blob";
import { resolveTeamsStock, resolveUnavailableTeamsStock } from "@/lib/stock";

export const dynamic = "force-dynamic"; 

export default async function Home() {
  let catalogTeams = teamsMock;
  let catalogFallback = false;
  try {
    catalogTeams = (await readCatalogState()).teams;
  } catch {
    catalogFallback = true;
  }
  let teams = resolveUnavailableTeamsStock(catalogTeams);
  try {
    const stock = await readStockState();
    teams = resolveTeamsStock(catalogTeams, stock);
  } catch {
    // Keep the catalog visible while ProductCard blocks purchases until stock is verified.
  }

  return <HomeContent teams={teams} catalogFallback={catalogFallback} />;
}
