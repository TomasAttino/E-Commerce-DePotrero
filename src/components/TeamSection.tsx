"use client";

import type { TeamWithStock } from "@/lib/stock";
import Image from "next/image";
import ProductCard from "./ProductCard";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";

export default function TeamSection({ team }: { team: TeamWithStock }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' 
        ? scrollLeft - clientWidth 
        : scrollLeft + clientWidth;
      
      scrollRef.current.scrollTo({
        left: scrollTo,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section id={team.slug} className="scroll-mt-[98px] py-12 md:py-20">
      
      {/* 1. BLOQUE DEL BANNER (Separado del resto) */}
      <div className="relative h-[250px] sm:h-[300px] md:h-[400px] mb-8 md:mb-12 overflow-hidden border-b border-white/10">
        
        {/* Foto para Celular */}
        <div className="absolute inset-0 transition-transform duration-1000 hover:scale-105 md:hidden">
          <Image
            src={team.bannerMobile}
            alt=""
            fill
            sizes="100vw"
            quality={85}
            loading="lazy"
            className="object-cover object-center"
          />
        </div>
        
        {/* Foto para PC */}
        <div className="absolute inset-0 transition-transform duration-1000 hover:scale-105 hidden md:block">
          <Image
            src={team.bannerDesktop}
            alt=""
            fill
            sizes="100vw"
            quality={85}
            loading="lazy"
            className="object-cover object-center"
          />
        </div>
        
        {/* Degradado y Título */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex items-center justify-center">
          <h2 className="text-4xl sm:text-5xl md:text-7xl font-black uppercase italic tracking-tighter text-white text-center mt-12 md:mt-0 drop-shadow-lg">
            {team.name}
          </h2>
        </div>
      </div>
      
      {/* 2. BLOQUE DEL CARRUSEL (Fondo negro sólido) */}
      <div className="max-w-7xl mx-auto relative group/section">
        {team.products.length > 4 && (
          <>
            <button 
              onClick={() => scroll('left')}
              className="absolute -left-4 md:-left-12 top-1/2 -translate-y-1/2 z-20 bg-black/80 p-2 rounded-full border border-white/10 opacity-0 group-hover/section:opacity-100 transition-opacity hidden md:block"
            >
              <ChevronLeft size={24} />
            </button>
            <button 
              onClick={() => scroll('right')}
              className="absolute -right-4 md:-right-12 top-1/2 -translate-y-1/2 z-20 bg-black/80 p-2 rounded-full border border-white/10 opacity-0 group-hover/section:opacity-100 transition-opacity hidden md:block"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}

        <div 
          ref={scrollRef}
          className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory no-scrollbar scroll-smooth px-4 md:px-0"
        >
          {team.products.map(product => (
            <div key={product.id} className="snap-start flex-none w-[280px] md:w-[301px]">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
