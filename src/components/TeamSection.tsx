"use client";

import { Team } from "@/data/mock";
import ProductCard from "./ProductCard";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";

export default function TeamSection({ team }: { team: Team }) {
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
    <section id={team.slug} className="py-20">
      <div className="relative h-[400px] mb-12 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 hover:scale-105"
          style={{ backgroundImage: `url(${team.banner})` }}
        />
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter text-white text-center">
            {team.name}
          </h2>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto relative group/section">
        {team.products.length > 4 && (
          <>
            <button 
              onClick={() => scroll('left')}
              className="absolute -left-12 top-1/2 -translate-y-1/2 z-10 bg-black/80 p-2 rounded-full border border-white/10 opacity-0 group-hover/section:opacity-100 transition-opacity hidden xl:block"
            >
              <ChevronLeft size={24} />
            </button>
            <button 
              onClick={() => scroll('right')}
              className="absolute -right-12 top-1/2 -translate-y-1/2 z-10 bg-black/80 p-2 rounded-full border border-white/10 opacity-0 group-hover/section:opacity-100 transition-opacity hidden xl:block"
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
