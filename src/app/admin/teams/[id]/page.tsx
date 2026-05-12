import { getTeamById } from "@/app/actions/products";
import TeamForm from "@/components/admin/TeamForm";
import { notFound } from "next/navigation";

export default async function EditTeamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const team = await getTeamById(id);

  if (!team) {
    notFound();
  }

  return <TeamForm initialData={team} />;
}
