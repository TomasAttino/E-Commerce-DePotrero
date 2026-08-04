import CatalogContent from "@/components/CatalogContent";
import { teamsMock } from "../../../public/camisetas/mock";
import { readStockState } from "@/lib/stock-blob";
import { resolveTeamsStock, resolveUnavailableTeamsStock } from "@/lib/stock";
import { readCatalogState } from "@/lib/catalog-blob";

export const dynamic = "force-dynamic";

export default async function CatalogPage() {
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
    teams = resolveTeamsStock(catalogTeams, await readStockState());
  } catch (error) {
    stockError = error instanceof Error ? error.message : "No se pudo leer el stock persistente.";
  }

  return <CatalogContent teams={teams} stockError={stockError} catalogError={catalogError} />;
}
