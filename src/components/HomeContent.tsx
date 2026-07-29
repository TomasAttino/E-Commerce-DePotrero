"use client";

import { useState } from "react";
import Header from "@/components/Header";
import PromoBar from "@/components/PromoBar";
import Hero from "@/components/Hero";
import TeamSection from "@/components/TeamSection";
import CartDrawer from "@/components/CartDrawer";
import WhatsAppButton from "@/components/WhatsAppButton";
import LeadCaptureModal from "@/components/LeadCaptureModal";
import type { Team } from "../../public/camisetas/mock";

export default function HomeContent({ teams }: { teams: Team[] }) {
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <main className="bg-black text-white selection:bg-white selection:text-black">
      <PromoBar />
      <Header onCartClick={() => setIsCartOpen(true)} teams={teams} />
      
      <Hero />
      
      <div className="space-y-0">
        {teams.map(team => (
          <TeamSection key={team.id} team={team} />
        ))}
      </div>

       <footer id="privacy" className="py-20 border-t border-white/10 text-center">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-2xl font-black italic tracking-tighter mb-8">CAMISETAS</div>
           <p className="text-zinc-500 text-sm max-w-md mx-auto">
             © 2024 Camisetas. Todos los derechos reservados.
             <br />
             Envíos a todo el país coordinados vía WhatsApp.
             <br />
             Tus datos se usan únicamente para gestionar esta promoción.
           </p>
        </div>
      </footer>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <WhatsAppButton />
      <LeadCaptureModal teams={teams} />
    </main>
  );
}
