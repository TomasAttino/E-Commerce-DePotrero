"use client";

import { ShoppingCart, Menu } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function Header({ onCartClick }: { onCartClick: () => void }) {
  const { totalItems } = useCart();
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-md border-b border-white/10">
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
          <button className="md:hidden p-2">
            <Menu size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}
