"use client";

import { ShoppingCart, Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import type { Team } from "../../public/camisetas/mock";

export default function Header({
  onCartClick,
  teams,
}: {
  onCartClick: () => void;
  teams: Pick<Team, "name" | "slug">[];
}) {
  const { totalItems } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };
    const closeOnHashChange = () => setIsMenuOpen(false);

    document.addEventListener("keydown", closeOnEscape);
    window.addEventListener("hashchange", closeOnHashChange);

    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      window.removeEventListener("hashchange", closeOnHashChange);
    };
  }, []);

  const closeMenu = () => setIsMenuOpen(false);
  
  return (
    <header className="fixed top-[34px] left-0 right-0 z-50 bg-black/50 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="text-xl font-bold tracking-tighter">Indumentaria</div>
        
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-300">
          <a href="#hero" className="hover:text-white transition-colors">Inicio</a>
          <a href="#river" className="hover:text-white transition-colors">River</a>
          <a href="#boca" className="hover:text-white transition-colors">Boca</a>
          <a href="#independiente" className="hover:text-white transition-colors">Independiente</a>
          <a href="#racing" className="hover:text-white transition-colors">Racing</a>
        </nav>

        <div className="flex items-center gap-4">
          <button 
            onClick={onCartClick}
            className="relative p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <ShoppingCart size={20} />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-white text-black text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                {totalItems}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setIsMenuOpen((open) => !open)}
            className="md:hidden p-2 hover:bg-white/10 rounded-full transition-colors"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-team-navigation"
            aria-label={isMenuOpen ? "Cerrar navegación de equipos" : "Abrir navegación de equipos"}
          >
            <Menu size={20} aria-hidden="true" />
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <>
          <button
            type="button"
            onClick={closeMenu}
            className="fixed inset-0 top-[98px] bg-black/60 md:hidden"
            aria-label="Cerrar navegación de equipos"
          />
          <nav
            id="mobile-team-navigation"
            aria-label="Navegación de equipos"
            className="absolute top-full left-0 right-0 z-10 max-h-[calc(100vh-98px)] overflow-y-auto border-t border-white/10 bg-black/95 p-4 shadow-2xl backdrop-blur-md md:hidden"
          >
            <ul className="space-y-1">
              <li>
                <a
                  href="#hero"
                  onClick={closeMenu}
                  className="block px-4 py-3 text-sm font-medium text-zinc-200 hover:bg-white/10 hover:text-white transition-colors"
                >
                  Inicio
                </a>
              </li>
              {teams.map((team) => (
                <li key={team.slug}>
                  <a
                    href={`#${team.slug}`}
                    onClick={closeMenu}
                    className="block px-4 py-3 text-sm font-medium text-zinc-200 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    {team.name}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </>
      )}
    </header>
  );
}
