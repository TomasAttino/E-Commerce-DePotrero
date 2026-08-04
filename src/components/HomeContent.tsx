"use client";

import { useState } from "react";
import Header from "@/components/Header";
import PromoBar from "@/components/PromoBar";
import Hero from "@/components/Hero";
import CartDrawer from "@/components/CartDrawer";
import WhatsAppButton from "@/components/WhatsAppButton";
import LeadCaptureModal from "@/components/LeadCaptureModal";
import type { TeamWithStock } from "@/lib/stock";

export default function HomeContent({ teams, stockError, catalogError }: { teams: TeamWithStock[]; stockError?: string; catalogError?: string }) {
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <main className="bg-black text-white selection:bg-white selection:text-black">
      <PromoBar />
       <Header onCartClick={() => setIsCartOpen(true)} />
      {stockError && (
        <div role="alert" className="border-y border-red-400/30 bg-red-400/10 px-4 py-3 text-center text-xs text-red-200">
          No se puede verificar el stock persistente. Las compras están temporalmente deshabilitadas. {stockError}
        </div>
      )}
      {catalogError && <div role="status" className="border-b border-amber-400/30 bg-amber-400/10 px-4 py-3 text-center text-xs text-amber-200">Se está mostrando el catálogo inicial mientras se recupera el catálogo editable.</div>}
      
      <Hero />
      
      <section className="border-y border-white/10 px-4 py-24 text-center sm:px-6" aria-labelledby="catalog-preview-title">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-zinc-500">Toda la colección</p>
        <h2 id="catalog-preview-title" className="text-4xl font-black uppercase italic tracking-tighter sm:text-6xl">Todos los equipos. Un solo catálogo.</h2>
        <p className="mx-auto mt-5 max-w-xl text-sm text-zinc-400">Filtrá por equipo, tipo, talle o disponibilidad y encontrá tu próxima camiseta.</p>
        <a href="/catalogo" className="mt-8 inline-flex bg-white px-8 py-4 text-sm font-bold uppercase tracking-widest text-black transition-colors hover:bg-zinc-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">Explorar catálogo</a>
      </section>

      <footer
  id="privacy"
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
    <div className="flex justify-center">
      <img
        src="/isologo2.png"
        alt="DePotrero"
        className="h-auto w-44 object-contain sm:w-52"
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

      <a
        href="#privacy"
        className="text-zinc-400 transition hover:text-lime-400"
      >
        Privacidad
      </a>
    </div>

    {/* Línea inferior */}
    <div className="mx-auto mt-10 max-w-3xl border-t border-white/10 pt-6">
      <p className="text-center text-xs leading-5 text-zinc-600">
        © 2026 DePotrero. Todos los derechos reservados.
        <br className="sm:hidden" />
        <span className="hidden sm:inline"> · </span>
        Tus datos se utilizan únicamente para gestionar tu compra.
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
