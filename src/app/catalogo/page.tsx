import CatalogContent from "@/components/CatalogContent";
import { teamsMock } from "../../../public/camisetas/mock";
import { readStockState } from "@/lib/stock-blob";
import { resolveTeamsStock, resolveUnavailableTeamsStock } from "@/lib/stock";
import { readCatalogState } from "@/lib/catalog-blob";

export const dynamic = "force-dynamic";

export default async function CatalogPage() {
  let catalogTeams = teamsMock;
  let catalogFallback = false;
  try {
    catalogTeams = (await readCatalogState()).teams;
  } catch {
    catalogFallback = true;
  }
  let teams = resolveUnavailableTeamsStock(catalogTeams);

  try {
    teams = resolveTeamsStock(catalogTeams, await readStockState());
  } catch {
    // Keep the catalog visible while ProductCard blocks purchases until stock is verified.
  }

  return <CatalogContent teams={teams} catalogFallback={catalogFallback} />;
}
