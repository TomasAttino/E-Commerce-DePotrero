import HomeContent from "@/components/HomeContent";
import { teamsMock } from "../../public/camisetas/mock";

export const dynamic = "force-dynamic"; 

export default function Home() {
  return <HomeContent teams={teamsMock} />;
}