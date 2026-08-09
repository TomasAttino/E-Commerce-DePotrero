"use client";

import { useState } from "react";
import Header from "@/components/Header";
import PromoBar from "@/components/PromoBar";
import Hero from "@/components/Hero";
import CartDrawer from "@/components/CartDrawer";
import WhatsAppButton from "@/components/WhatsAppButton";
import LeadCaptureModal from "@/components/LeadCaptureModal";
import type { TeamWithStock } from "@/lib/stock";
import Image from "next/image";

export default function HomeContent({ teams, catalogFallback }: { teams: TeamWithStock[]; catalogFallback?: boolean }) {
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <main className="bg-black text-white selection:bg-white selection:text-black">
      <PromoBar />
       <Header onCartClick={() => setIsCartOpen(true)} />
      {catalogFallback && <div role="status" className="border-b border-amber-400/30 bg-amber-400/10 px-4 py-3 text-center text-xs text-amber-200">Se está mostrando la colección inicial por el momento.</div>}
      
      <Hero />
      
      <footer
  className="relative overflow-hidden border-t border-white/10 bg-black py-14"
>
  {/* Resplandor verde detrás del logo */}
  <div
    aria-hidden="true"
    className="pointer-events-none absolute left-1/2 top-0 h-48 w-80 
               -translate-x-1/2 rounded-full bg-lime-500/10 blur-3xl"
  />

  <div className="relative mx-auto max-w-7xl px-4">
    {/* Logo */}
    <div className="relative mx-auto h-56 w-56 sm:h-64 sm:w-64">
      <Image
        src="/isologo2.png"
        alt="DePotrero"
        fill
        sizes="(max-width: 640px) 224px, 256px"
        className="object-contain"
      />
    </div>

    <p className="mx-auto mt-5 max-w-md text-center text-sm leading-6 text-zinc-400">
      Camisetas retro, fútbol y pasión.
      <br />
      Envíos a todo el país coordinados vía WhatsApp.
    </p>

    {/* Accesos */}
    <div className="mt-7 flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm">
      <a
        href="https://www.instagram.com/depotrero.retro"
        target="_blank"
        rel="noreferrer"
        className="text-zinc-400 transition hover:text-lime-400"
      >
        Instagram
      </a>

      <a
        href="#productos"
        className="text-zinc-400 transition hover:text-lime-400"
      >
        Camisetas
      </a>

    </div>

    {/* Línea inferior */}
    <div className="mx-auto mt-10 max-w-3xl border-t border-white/10 pt-6">
      <p className="text-center text-xs leading-5 text-zinc-600">
         © 2026 DePotrero. Todos los derechos reservados.
         <br className="sm:hidden" />
         <span className="hidden sm:inline"> · </span>
         Desarrollado por <span className="text-lime-400">Tomas Attino Castro</span>.
      </p>
    </div>
  </div>
</footer>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <WhatsAppButton />
      <LeadCaptureModal teams={teams} />
    </main>
  );
}
