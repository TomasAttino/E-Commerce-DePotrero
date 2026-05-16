"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

type Product = {
  id: string;
  name: string;
  price: number;
  inStock: boolean;
};

type Team = {
  id: string;
  name: string;
  banner: string;
  products: Product[];
};

export default function DashboardContent({ initialTeams }: { initialTeams: Team[] }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTeams = initialTeams.map(team => ({
    ...team,
    products: team.products.filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(team => team.products.length > 0 || team.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-black">Dashboard</h1>
        <div className="flex flex-wrap gap-4 w-full md:w-auto">
          <input
            type="text"
            placeholder="Buscar camiseta o equipo..."
            className="flex-1 md:w-64 bg-zinc-900 border border-white/10 px-4 py-2 text-sm focus:outline-none focus:border-white/30 transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Link 
            href="/panel-privado-camisetas/teams/new" 
            className="border border-white text-white px-4 py-2 font-bold hover:bg-white hover:text-black transition-colors text-sm"
          >
            Nuevo Equipo
          </Link>
          <Link 
            href="/panel-privado-camisetas/products/new" 
            className="bg-white text-black px-4 py-2 font-bold hover:bg-zinc-200 transition-colors text-sm"
          >
            Nuevo Producto
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeams.map((team) => (
          <div key={team.id} className="border border-white/10 bg-zinc-900 rounded-lg overflow-hidden flex flex-col">
            <div className="relative h-32 w-full shrink-0">
              {team.banner ? (
                <Image 
                  src={team.banner} 
                  alt={team.name} 
                  fill 
                  className="object-cover opacity-50"
                />
              ) : (
                <div className="w-full h-full bg-zinc-800" />
              )}
              <div className="absolute inset-0 flex items-center justify-center group/banner">
                <h2 className="text-xl font-bold uppercase tracking-tighter">{team.name}</h2>
                <Link 
                  href={`/panel-privado-camisetas/teams/${team.id}`}
                  className="absolute bottom-2 right-2 opacity-0 group-hover/banner:opacity-100 bg-white/10 hover:bg-white/20 text-[10px] px-2 py-1 rounded transition-all"
                >
                  Editar Equipo
                </Link>
              </div>
            </div>
            <div className="p-4 flex-1 flex flex-col min-h-0">
              <h3 className="text-sm font-semibold text-zinc-400 mb-4">{team.products.length} Productos</h3>
              <div className="space-y-2 overflow-y-auto max-h-64 pr-2 custom-scrollbar">
                {team.products.map((product) => (
                  <Link 
                    key={product.id} 
                    href={`/panel-privado-camisetas/products/${product.id}`}
                    className="flex items-center justify-between group hover:bg-white/5 p-1 rounded transition-colors"
                  >
                    <span className="text-sm truncate mr-2">{product.name}</span>
                    <div className="flex items-center space-x-2 shrink-0">
                      {!product.inStock && (
                        <span className="text-[10px] bg-red-500/20 text-red-500 px-1 font-bold uppercase">Sin Stock</span>
                      )}
                      <span className="text-xs text-zinc-500">${product.price.toLocaleString()}</span>
                    </div>
                  </Link>
                ))}
                {team.products.length === 0 && (
                  <p className="text-xs text-zinc-600 italic">No se encontraron productos</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
