"use client";

import { useState } from "react";
import { Product } from "../../public/camisetas/mock"; // O la ruta correcta a tu mock
import { useCart } from "@/context/CartContext";
import { Plus } from "lucide-react";

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`flex-none w-[280px] md:w-[320px] bg-zinc-900/50 group/card border border-white/5 overflow-hidden transition-opacity ${!product.inStock ? 'opacity-60' : ''}`}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-transparent">
        <img 
          src={(isHovered && product.hoverImage) ? product.hoverImage : product.image} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-110"
        />
        {!product.inStock && (
          <div className="absolute top-4 right-4 bg-red-600 text-white text-[10px] font-black px-2 py-1 uppercase tracking-tighter">
            Sin Stock
          </div>
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/card:opacity-100 transition-opacity flex items-center justify-center">
          {product.inStock ? (
            <button 
              // Le sacamos el selectedColor de acá
              onClick={() => addToCart(product, selectedSize)}
              className="bg-white text-black p-4 rounded-full transform translate-y-4 group-hover/card:translate-y-0 transition-all duration-300"
            >
              <Plus size={24} />
            </button>
          ) : (
            <span className="bg-zinc-800 text-zinc-400 px-4 py-2 font-bold uppercase text-xs">Agotado</span>
          )}
        </div>
      </div>
      
      <div className="p-4 space-y-4">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0 mr-2">
            <h3 className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest">{product.category}</h3>
            <h2 className="text-base font-bold truncate uppercase tracking-tighter">{product.name}</h2>
            <p className="text-xl font-black mt-1">${product.price.toLocaleString('es-AR')}</p>
          </div>
          <button 
            // Y le sacamos el selectedColor de acá también
            onClick={() => addToCart(product, selectedSize)}
            disabled={!product.inStock}
            className={`px-4 py-2 text-[11px] font-black uppercase tracking-tighter transition-all ${
              product.inStock 
              ? 'bg-white text-black hover:bg-zinc-200' 
              : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
            }`}
          >
            {product.inStock ? 'Comprar' : 'Agotado'}
          </button>
        </div>

        <div className="flex flex-wrap gap-1">
          {product.sizes.map(size => (
            <button
              key={size}
              onClick={() => setSelectedSize(size)}
              className={`text-[9px] w-7 h-7 flex items-center justify-center border transition-colors ${
                selectedSize === size ? 'border-white bg-white text-black' : 'border-white/10 text-white/40 hover:border-white/30'
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