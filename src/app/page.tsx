import HomeContent from "@/components/HomeContent";
import { teamsMock } from "../../public/camisetas/mock";
import { readCatalogState } from "@/lib/catalog-blob";
import { readStockState } from "@/lib/stock-blob";
import { resolveTeamsStock, resolveUnavailableTeamsStock } from "@/lib/stock";

export const dynamic = "force-dynamic"; 

export default async function Home() {
  let catalogTeams = teamsMock;
  let catalogError: string | undefined;
  try {
    catalogTeams = (await readCatalogState()).teams;
  } catch (error) {
    catalogError = error instanceof Error ? error.message : "No se pudo leer el catálogo editable.";
  }
  let teams = resolveUnavailableTeamsStock(catalogTeams);
  let stockError: string | undefined;
  try {
    const stock = await readStockState();
    teams = resolveTeamsStock(catalogTeams, stock);
  } catch (error) {
    stockError = error instanceof Error ? error.message : "No se pudo leer el stock persistente.";
  }

  return <HomeContent teams={teams} stockError={stockError} catalogError={catalogError} />;
}
