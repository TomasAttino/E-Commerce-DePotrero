import CatalogContent from "@/components/CatalogContent";
import { teamsMock } from "../../../public/camisetas/mock";
import { readStockState } from "@/lib/stock-blob";
import { resolveTeamsStock, resolveUnavailableTeamsStock } from "@/lib/stock";

export const dynamic = "force-dynamic";

export default async function CatalogPage() {
  let teams = resolveUnavailableTeamsStock(teamsMock);
  let stockError: string | undefined;

  try {
    teams = resolveTeamsStock(teamsMock, await readStockState());
  } catch (error) {
    stockError = error instanceof Error ? error.message : "No se pudo leer el stock persistente.";
  }

  return <CatalogContent teams={teams} stockError={stockError} />;
}
