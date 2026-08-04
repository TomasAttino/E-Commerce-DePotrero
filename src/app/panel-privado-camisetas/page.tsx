import DashboardContent from "@/components/admin/DashboardContent";
import { getLeads } from "../actions/leads";
import { getPanelStockState } from "../actions/stock";
import { resolveTeamsStock, resolveUnavailableTeamsStock, emptyStockState } from "@/lib/stock";
import { teamsMock } from "../../../public/camisetas/mock";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  let stock = undefined;
  let stockError: string | undefined;
  try {
    stock = await getPanelStockState();
  } catch (error) {
    stockError = error instanceof Error ? error.message : "No se pudo leer el stock persistente.";
  }
  const leads = await getLeads();

  const initialStock = stock ?? emptyStockState();
  const initialTeams = stock
    ? resolveTeamsStock(teamsMock, stock)
    : resolveUnavailableTeamsStock(teamsMock);
  return <DashboardContent initialTeams={initialTeams} initialStock={initialStock} stockError={stockError} leads={leads} />;
}
