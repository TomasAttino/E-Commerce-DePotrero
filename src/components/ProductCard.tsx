"use client";

import { useState } from "react";
import Image from "next/image";
import type { ProductWithStock } from "@/lib/stock";
import { useCart } from "@/context/CartContext";
import { Plus } from "lucide-react";

export default function ProductCard({ product, teamName }: { product: ProductWithStock; teamName?: string }) {
  const { addToCart } = useCart();
  const availableSizes = product.availableSizes;
  const isUnknown = !product.stockVerified;
  const isAvailable = product.stockVerified && product.inStock && availableSizes.length > 0;
  const isExhausted = product.stockVerified && !isAvailable;
  const [selectedSize, setSelectedSize] = useState(availableSizes[0] ?? product.sizes[0]);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
       className={`flex-none w-full bg-zinc-900/50 group/card border border-white/5 overflow-hidden transition-opacity ${isExhausted ? 'opacity-60' : ''}`}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-transparent">
        <Image
          src={(isHovered && product.hoverImage) ? product.hoverImage : product.image}
          alt={product.name}
          fill
          sizes="(max-width: 767px) 280px, 320px"
          quality={85}
          loading="lazy"
          className="object-cover transition-transform duration-500 group-hover/card:scale-110"
        />
        {isExhausted && (
          <div className="absolute top-4 right-4 bg-red-600 text-white text-[10px] font-black px-2 py-1 uppercase tracking-tighter">
             Sin stock
          </div>
        )}
        {isUnknown && (
          <div className="absolute top-4 right-4 bg-zinc-700 text-zinc-100 text-[10px] font-black px-2 py-1 uppercase tracking-tighter">
            Disponibilidad a confirmar
          </div>
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/card:opacity-100 transition-opacity flex items-center justify-center">
          {isAvailable ? (
            <button 
              // Le sacamos el selectedColor de acá
              onClick={() => addToCart(product, selectedSize)}
              aria-label={`Agregar ${product.name} al carrito`}
              className="transform rounded-full bg-white p-4 text-black transition-all duration-300 group-hover/card:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <Plus size={24} />
            </button>
          ) : isExhausted ? (
            <span className="bg-zinc-800 text-zinc-400 px-4 py-2 font-bold uppercase text-xs">Sin stock</span>
          ) : (
            <span className="bg-zinc-800 text-zinc-300 px-4 py-2 font-bold uppercase text-xs">Disponibilidad a confirmar</span>
          )}
        </div>
      </div>
      
      <div className="p-4 space-y-4">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0 mr-2">
            <h3 className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest">{teamName ? `${teamName} · ` : ""}{product.category}</h3>
            <h2 className="text-base font-bold break-words uppercase tracking-tighter">{product.name}</h2>
            {product.year && <p className="text-xs text-zinc-400">Año: {product.year}</p>}
            <p className="text-xl font-black mt-1">${product.price.toLocaleString('es-AR')}</p>
          </div>
          <button 
            // Y le sacamos el selectedColor de acá también
            onClick={() => addToCart(product, selectedSize)}
             disabled={!isAvailable}
             className={`px-4 py-2 text-[11px] font-black uppercase tracking-tighter transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
               isAvailable
               ? 'bg-white text-black hover:bg-zinc-200'
               : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
             }`}
          >
             {isAvailable ? 'Comprar' : isExhausted ? 'Sin stock' : 'Disponibilidad a confirmar'}
          </button>
        </div>

        <div className="flex flex-wrap gap-1">
          {product.sizes.map(size => (
            <button
              key={size}
              onClick={() => setSelectedSize(size)}
               disabled={isExhausted || !product.sizes.includes(size)}
               aria-label={`${size}: ${isUnknown ? 'Disponibilidad a confirmar' : availableSizes.includes(size) ? 'Disponible' : 'Agotado'}`}
                className={`text-[9px] w-7 h-7 flex items-center justify-center border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
                 isExhausted && !availableSizes.includes(size) ? 'border-white/5 text-white/20 line-through cursor-not-allowed' : selectedSize === size ? 'border-white bg-white text-black' : 'border-white/10 text-white/40 hover:border-white/30'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
