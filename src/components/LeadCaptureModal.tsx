"use client";

import { useActionState, useEffect, useState } from "react";
import { createLead, type LeadActionState } from "@/app/actions/leads";
import type { Team } from "../../public/camisetas/mock";

const DISMISSAL_KEY = "camisetas-first-purchase-lead-dismissed";
const initialLeadActionState: LeadActionState = { status: "idle", message: "" };

export default function LeadCaptureModal({ teams }: { teams: Pick<Team, "name" | "slug">[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, pending] = useActionState(createLead, initialLeadActionState);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setIsOpen(window.localStorage.getItem(DISMISSAL_KEY) !== "true");
    }, 0);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (state.status === "success") {
      window.localStorage.setItem(DISMISSAL_KEY, "true");
      const timeout = window.setTimeout(() => setIsOpen(false), 1400);
      return () => window.clearTimeout(timeout);
    }
  }, [state.status]);

  const close = () => {
    window.localStorage.setItem(DISMISSAL_KEY, "true");
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm" role="presentation">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="lead-modal-title"
        className="relative w-full max-w-lg border border-white/15 bg-zinc-950 p-6 text-white shadow-2xl sm:p-9"
      >
        <button
          type="button"
          onClick={close}
          className="absolute right-4 top-4 p-2 text-2xl leading-none text-zinc-400 transition-colors hover:text-white"
          aria-label="Cerrar promoción"
        >
          <span aria-hidden="true">×</span>
        </button>

        <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-zinc-400">Bienvenido a DePotrero</p>
        <h2 id="lead-modal-title" className="max-w-sm text-4xl font-black uppercase italic leading-none tracking-tighter sm:text-5xl">
          10% OFF en tu primera compra
        </h2>
        <p className="mt-4 max-w-md text-sm leading-6 text-zinc-400">
          Dejanos tus datos y recibí el beneficio para elegir la camiseta de tu equipo.
        </p>

        <form action={formAction} className="mt-7 space-y-4">
          <label className="block text-sm font-medium">
            Nombre
            <input name="name" required maxLength={120} className="mt-2 block w-full border border-white/15 bg-white/5 px-4 py-3 text-white outline-none transition-colors focus:border-white" autoComplete="name" />
          </label>
          <label className="block text-sm font-medium">
            Email
            <input name="email" type="email" required maxLength={254} className="mt-2 block w-full border border-white/15 bg-white/5 px-4 py-3 text-white outline-none transition-colors focus:border-white" autoComplete="email" />
          </label>
          <label className="block text-sm font-medium">
            Equipo favorito
            <select name="team" required defaultValue="" className="mt-2 block w-full border border-white/15 bg-zinc-900 px-4 py-3 text-white outline-none transition-colors focus:border-white">
              <option value="" disabled>Elegí un equipo</option>
              {teams.map((team) => <option key={team.slug} value={team.slug}>{team.name}</option>)}
            </select>
          </label>
          <label className="flex items-start gap-3 text-xs leading-5 text-zinc-400">
            <input name="privacyAccepted" type="checkbox" required className="mt-1 size-4 accent-white" />
            <span>Acepto el uso de mis datos para recibir esta comunicación. Consultá nuestra <a href="#privacy" className="text-white underline">política de privacidad</a>.</span>
          </label>

          {state.message && <p role={state.status === "error" ? "alert" : "status"} className={state.status === "error" ? "text-sm text-red-400" : "text-sm text-emerald-400"}>{state.message}</p>}
          <button type="submit" disabled={pending} className="w-full bg-white px-5 py-3 text-sm font-black uppercase tracking-wide text-black transition-colors hover:bg-zinc-200 disabled:cursor-wait disabled:opacity-60">
            {pending ? "Guardando..." : "Quiero mi descuento"}
          </button>
        </form>
      </section>
    </div>
  );
}
