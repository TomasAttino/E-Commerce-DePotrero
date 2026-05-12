"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import TeamSection from "@/components/TeamSection";
import CartDrawer from "@/components/CartDrawer";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  sizes: string[];
  colors: string[];
  category: string;
}

interface Team {
  id: string;
  name: string;
  slug: string;
  banner: string;
  products: Product[];
}

export default function HomeContent({ teams }: { teams: Team[] }) {
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <main className="bg-black text-white selection:bg-white selection:text-black">
      <Header onCartClick={() => setIsCartOpen(true)} />
      
      <Hero />
      
      <div className="space-y-0">
        {teams.map(team => (
          <TeamSection key={team.id} team={team} />
        ))}
      </div>

      <footer className="py-20 border-t border-white/10 text-center">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-2xl font-black italic tracking-tighter mb-8">CAMISETAS</div>
          <p className="text-zinc-500 text-sm max-w-md mx-auto">
            © 2024 Camisetas. Todos los derechos reservados.
            <br />
            Envíos a todo el país coordinados vía WhatsApp.
          </p>
        </div>
      </footer>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </main>
  );
}
