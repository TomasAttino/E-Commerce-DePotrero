"use server";

import { Prisma } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { teamsMock } from "../../../public/camisetas/mock";

export type LeadActionState = {
  status: "idle" | "error" | "success";
  message: string;
};

export async function createLead(
  _previousState: LeadActionState,
  formData: FormData,
): Promise<LeadActionState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const teamValue = String(formData.get("team") ?? "").trim();
  const privacyAccepted = formData.get("privacyAccepted") === "on";

  if (!name || name.length > 120) {
    return { status: "error", message: "Ingresá un nombre válido." };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return { status: "error", message: "Ingresá un email válido." };
  }

  if (!teamValue || teamValue.length > 120) {
    return { status: "error", message: "Elegí tu equipo favorito." };
  }

  if (!privacyAccepted) {
    return { status: "error", message: "Tenés que aceptar la política de privacidad." };
  }

  try {
    const staticTeam = teamsMock.find(
      (team) => team.slug === teamValue || team.name === teamValue,
    );
    const team = staticTeam
      ? { name: staticTeam.name }
      : await prisma.team.findFirst({
          where: {
            OR: [{ slug: teamValue }, { name: teamValue }],
          },
          select: { name: true },
        });

    if (!team) {
      return { status: "error", message: "Elegí un equipo válido." };
    }

    await prisma.lead.create({ data: { name, email, team: team.name } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { status: "error", message: "Ese email ya está registrado." };
    }

    return { status: "error", message: "No pudimos guardar tus datos. Intentá nuevamente." };
  }

  return { status: "success", message: "Listo. Tu 10% de descuento te espera en tu primera compra." };
}

export async function getLeads() {
  await requireAdmin();
  return prisma.lead.findMany({ orderBy: { createdAt: "desc" } });
}
