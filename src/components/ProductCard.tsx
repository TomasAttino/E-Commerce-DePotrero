"use client";

import { useState } from "react";
import { Product } from "@/data/mock";
import { useCart } from "@/context/CartContext";
import { Plus } from "lucide-react";

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const [selectedColor] = useState(product.colors[0]);

  return (
    <div className="flex-none w-[280px] md:w-[320px] bg-zinc-900/50 group border border-white/5 overflow-hidden">
      <div className="relative aspect-[4/5] overflow-hidden bg-zinc-800">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button 
            onClick={() => addToCart(product, selectedSize, selectedColor)}
            className="bg-white text-black p-4 rounded-full transform translate-y-4 group-hover:translate-y-0 transition-all duration-300"
          >
            <Plus size={24} />
          </button>
        </div>
      </div>
      
      <div className="p-4 space-y-4">
        <div>
          <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-widest">{product.category}</h3>
          <h2 className="text-lg font-bold truncate">{product.name}</h2>
          <p className="text-xl font-black mt-1">${product.price.toLocaleString('es-AR')}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {product.sizes.map(size => (
            <button
              key={size}
              onClick={() => setSelectedSize(size)}
              className={`text-[10px] w-8 h-8 flex items-center justify-center border transition-colors ${
                selectedSize === size ? 'border-white bg-white text-black' : 'border-white/20 text-white/50 hover:border-white/50'
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
