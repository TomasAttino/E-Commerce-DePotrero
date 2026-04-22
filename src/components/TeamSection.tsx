import { Team } from "@/data/mock";
import ProductCard from "./ProductCard";

export default function TeamSection({ team }: { team: Team }) {
  return (
    <section id={team.slug} className="py-20">
      <div className="relative h-[400px] mb-12 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 hover:scale-105"
          style={{ backgroundImage: `url(${team.banner})` }}
        />
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter text-white">
            {team.name}
          </h2>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory no-scrollbar">
          {team.products.map(product => (
            <div key={product.id} className="snap-start">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
