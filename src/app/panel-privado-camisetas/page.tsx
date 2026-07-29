import { getTeams } from "../actions/products";
import DashboardContent from "@/components/admin/DashboardContent";
import { getLeads } from "../actions/leads";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const teams = await getTeams();
  const leads = await getLeads();

  return <DashboardContent initialTeams={teams} leads={leads} />;
}
