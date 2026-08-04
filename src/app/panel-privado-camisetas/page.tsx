import DashboardContent from "@/components/admin/DashboardContent";
import { getLeads } from "../actions/leads";
import { getPanelStockState } from "../actions/stock";
import { resolveTeamsStock, resolveUnavailableTeamsStock, emptyStockState } from "@/lib/stock";
import { teamsMock } from "../../../public/camisetas/mock";
import { readCatalogState } from "@/lib/catalog-blob";
import { createCatalogState } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  let stock = undefined;
  let stockError: string | undefined;
  let catalog = createCatalogState(teamsMock);
  let catalogError: string | undefined;
  try {
    catalog = await readCatalogState();
  } catch (error) {
    catalogError = error instanceof Error ? error.message : "No se pudo leer el catálogo editable.";
  }
  try {
    stock = await getPanelStockState();
  } catch (error) {
    stockError = error instanceof Error ? error.message : "No se pudo leer el stock persistente.";
  }
  const leads = await getLeads();

  const initialStock = stock ?? emptyStockState();
  const initialTeams = stock
    ? resolveTeamsStock(catalog.teams, stock)
    : resolveUnavailableTeamsStock(catalog.teams);
  return <DashboardContent initialCatalog={catalog} initialTeams={initialTeams} initialStock={initialStock} stockError={stockError} catalogError={catalogError} leads={leads} />;
}
