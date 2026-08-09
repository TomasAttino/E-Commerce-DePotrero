"use client";

import { ShoppingCart, Menu } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";

export default function Header({
  onCartClick,
}: {
  onCartClick: () => void;
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
    <header className="fixed inset-x-0 top-[34px] z-[70] border-b border-white/10 bg-black/50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/#hero" className="relative block h-16 w-32 shrink-0 sm:w-40" aria-label="DePotrero, ir al inicio">
          <Image
            src="/isologo.png"
            alt="DePotrero"
            width={144}
            height={144}
            sizes="(max-width: 640px) 128px, 144px"
            className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 object-contain sm:h-36 sm:w-36"
            priority
          />
        </Link>
        
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-300" aria-label="Navegación principal">
          <Link href="/#hero" className="hover:text-white transition-colors">Inicio</Link>
          <Link href="/catalogo" className="hover:text-white transition-colors">Catálogo</Link>
        </nav>

        <div className="flex items-center gap-4">
          <a
            href="https://www.instagram.com/depotrero.retro"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Visitar DePotrero en Instagram"
            title="Instagram de DePotrero"
            className="rounded-full p-2 transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
            </svg>
          </a>
          <button 
            type="button"
            onClick={onCartClick}
            aria-label="Abrir carrito"
            className="relative rounded-full p-2 transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
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
             aria-controls="mobile-navigation"
             aria-label={isMenuOpen ? "Cerrar navegación" : "Abrir navegación"}
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
             aria-label="Cerrar navegación"
          />
          <nav
             id="mobile-navigation"
             aria-label="Navegación principal"
            className="absolute top-full left-0 right-0 z-10 max-h-[calc(100vh-98px)] overflow-y-auto border-t border-white/10 bg-black/95 p-4 shadow-2xl backdrop-blur-md md:hidden"
          >
            <ul className="space-y-1">
              <li>
                <Link
                  href="/#hero"
                  onClick={closeMenu}
                  className="block px-4 py-3 text-sm font-medium text-zinc-200 hover:bg-white/10 hover:text-white transition-colors"
                >
                  Inicio
                </Link>
              </li>
              <li>
                <a href="/catalogo" onClick={closeMenu} className="block px-4 py-3 text-sm font-medium text-zinc-200 hover:bg-white/10 hover:text-white transition-colors">
                  Catálogo
                </a>
              </li>
            </ul>
          </nav>
        </>
      )}
    </header>
  );
}
