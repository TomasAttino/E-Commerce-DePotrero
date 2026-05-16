import { getTeams } from "../actions/products";
import DashboardContent from "@/components/admin/DashboardContent";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const teams = await getTeams();

  return <DashboardContent initialTeams={teams} />;
}
