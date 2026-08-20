"use client";

import { useState } from "react";
import Image from "next/image";
import type { ProductWithStock } from "@/lib/stock";
import { getProductGallery } from "@/lib/catalog";
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
  const gallery = getProductGallery(product);
  const [imageIndex, setImageIndex] = useState(0);
  const hasGallery = gallery.length > 1;
  const displayedImage = imageIndex === 0 && isHovered && product.hoverImage && !product.images?.length
    ? product.hoverImage
    : gallery[imageIndex];

  function changeImage(direction: 1 | -1) {
    setImageIndex((current) => (current + direction + gallery.length) % gallery.length);
  }

  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
       className={`flex-none w-full min-w-0 bg-zinc-900/50 group/card border border-white/5 overflow-hidden transition-opacity ${isExhausted ? 'opacity-60' : ''}`}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-transparent">
        <Image
          src={displayedImage}
          alt={product.name}
          fill
          sizes="(max-width: 767px) 280px, 320px"
          quality={85}
          loading="lazy"
          className="object-cover transition-transform duration-500 group-hover/card:scale-110"
        />
        {product.isNew && (
          <div className="absolute left-2 top-2 z-20 bg-lime-400 px-1.5 py-1 text-[9px] font-black uppercase tracking-wider text-black sm:left-4 sm:top-4">
            Nuevo
          </div>
        )}
        {hasGallery && <>
          <button type="button" onClick={() => changeImage(-1)} aria-label={`Imagen anterior de ${product.name}`} className="absolute left-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/60 px-2 py-1 text-lg text-white hover:bg-black/80 focus-visible:outline-2 focus-visible:outline-white">‹</button>
          <button type="button" onClick={() => changeImage(1)} aria-label={`Imagen siguiente de ${product.name}`} className="absolute right-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/60 px-2 py-1 text-lg text-white hover:bg-black/80 focus-visible:outline-2 focus-visible:outline-white">›</button>
          <div className="absolute bottom-2 left-1/2 z-20 flex -translate-x-1/2 gap-1" aria-label="Selector de imágenes">
            {gallery.map((image, index) => <button key={`${image}-${index}`} type="button" onClick={() => setImageIndex(index)} aria-label={`Ver imagen ${index + 1} de ${gallery.length}`} aria-current={imageIndex === index} className={`h-1.5 w-1.5 rounded-full border border-white ${imageIndex === index ? "bg-white" : "bg-transparent"}`} />)}
          </div>
        </>}
        {isExhausted && (
          <div className="absolute top-2 right-2 max-w-[90%] bg-red-600 text-white text-[9px] sm:text-[10px] font-black px-1.5 sm:px-2 py-1 uppercase tracking-tighter text-right sm:top-4 sm:right-4">
             Sin stock
          </div>
        )}
        {isUnknown && (
          <div className="absolute top-2 right-2 max-w-[90%] bg-zinc-700 text-zinc-100 text-[9px] sm:text-[10px] font-black px-1.5 sm:px-2 py-1 uppercase tracking-tighter text-right sm:top-4 sm:right-4">
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
            <span className="max-w-[90%] bg-zinc-800 text-zinc-400 px-3 sm:px-4 py-2 font-bold uppercase text-[10px] sm:text-xs text-center">Sin stock</span>
          ) : (
            <span className="max-w-[90%] bg-zinc-800 text-zinc-300 px-3 sm:px-4 py-2 font-bold uppercase text-[10px] sm:text-xs text-center">Disponibilidad a confirmar</span>
          )}
        </div>
      </div>
      
      <div className="p-3 space-y-3 sm:p-4 sm:space-y-4">
        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:justify-between sm:items-start sm:gap-0">
          <div className="flex-1 min-w-0 sm:mr-2">
            <h3 className="text-[9px] sm:text-[10px] font-medium text-zinc-500 uppercase tracking-widest break-words [overflow-wrap:anywhere]">{teamName ? `${teamName} · ` : ""}{product.category}</h3>
            <h2 className="text-sm sm:text-base font-bold break-words [overflow-wrap:anywhere] uppercase tracking-tighter">{product.name}</h2>
            {product.year && <p className="text-[11px] sm:text-xs text-zinc-400 break-words">Año: {product.year}</p>}
            <p className="text-lg sm:text-xl font-black mt-1 break-words">${product.price.toLocaleString('es-AR')}</p>
          </div>
          <button 
            // Y le sacamos el selectedColor de acá también
            onClick={() => addToCart(product, selectedSize)}
             disabled={!isAvailable}
             className={`w-full sm:w-auto shrink-0 px-3 sm:px-4 py-2 text-[10px] sm:text-[11px] leading-tight font-black uppercase tracking-tighter transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
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
