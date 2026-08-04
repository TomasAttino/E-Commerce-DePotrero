"use client";

import Image from "next/image";
import { useState } from "react";
import { exhaustStockProduct, toggleStockSize } from "@/app/actions/stock";
import {
  exhaustProduct,
  filterStockTeams,
  resolveProductStock,
  toggleProductSize,
  type StockState,
  type TeamWithStock,
} from "@/lib/stock";

type Lead = {
  id: string;
  name: string;
  email: string;
  team: string;
  createdAt: Date;
};

function stockPriority(product: TeamWithStock["products"][number]) {
  if (!product.inStock) return 0;
  if (product.availableSizes.length < product.sizes.length) return 1;
  return 2;
}

export default function DashboardContent({
  initialTeams,
  initialStock,
  stockError,
  leads,
}: {
  initialTeams: TeamWithStock[];
  initialStock: StockState;
  stockError?: string;
  leads: Lead[];
}) {
  const [teams, setTeams] = useState(initialTeams);
  const [stock, setStock] = useState(initialStock);
  const [searchTerm, setSearchTerm] = useState("");
  const [feedback, setFeedback] = useState<Record<string, string>>({});

  const filteredTeams = filterStockTeams(teams, searchTerm).map((team) => ({
    ...team,
    products: team.products.sort((a, b) => stockPriority(a) - stockPriority(b)),
  }));

  async function changeSize(productId: string, size: string) {
    const previousStock = stock;
    const product = teams.flatMap((team) => team.products).find((item) => item.id === productId);
    if (!product) return;

    const nextStock = toggleProductSize(stock, product, size);
    setStock(nextStock);
    setTeams((current) => current.map((team) => ({
      ...team,
      products: team.products.map((item) =>
        item.id === productId ? resolveProductStock(item, nextStock) : item,
      ),
    })));
    setFeedback((current) => ({ ...current, [productId]: "Guardando..." }));

    const result = await toggleStockSize(productId, size, previousStock.version);
    if (result.status === "success") {
      setStock(result.state);
      setFeedback((current) => ({ ...current, [productId]: result.message }));
      return;
    }

    setStock(previousStock);
    setTeams((current) => current.map((team) => ({
      ...team,
      products: team.products.map((item) =>
        item.id === productId ? resolveProductStock(item, previousStock) : item,
      ),
    })));
    setFeedback((current) => ({ ...current, [productId]: `Error: ${result.message}` }));
  }

  async function exhaustModel(productId: string) {
    const previousStock = stock;
    const product = teams.flatMap((team) => team.products).find((item) => item.id === productId);
    if (!product) return;

    const nextStock = exhaustProduct(stock, product);
    setStock(nextStock);
    setTeams((current) => current.map((team) => ({
      ...team,
      products: team.products.map((item) =>
        item.id === productId ? resolveProductStock(item, nextStock) : item,
      ),
    })));
    setFeedback((current) => ({ ...current, [productId]: "Guardando..." }));

    const result = await exhaustStockProduct(productId, previousStock.version);
    if (result.status === "success") {
      setStock(result.state);
      setFeedback((current) => ({ ...current, [productId]: result.message }));
      return;
    }

    setStock(previousStock);
    setTeams((current) => current.map((team) => ({
      ...team,
      products: team.products.map((item) =>
        item.id === productId ? resolveProductStock(item, previousStock) : item,
      ),
    })));
    setFeedback((current) => ({ ...current, [productId]: `Error: ${result.message}` }));
  }

  return (
    <div className="space-y-10">
      <header className="space-y-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-zinc-500">Catálogo público</p>
          <h1 className="text-3xl font-black uppercase tracking-tight">Gestión manual de stock</h1>
        </div>
        <input
          type="search"
          placeholder="Buscar por equipo, modelo o id..."
          aria-label="Buscar por equipo, modelo o id"
          className="w-full max-w-xl bg-zinc-900 border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-white/40"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
      </header>

      {stockError && (
        <div role="alert" className="border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300">
          No se puede cargar el stock persistente: {stockError}
        </div>
      )}

      {filteredTeams.map((team) => (
        <section key={team.id} aria-labelledby={`team-${team.id}`} className="space-y-4">
          <div className="flex items-end justify-between border-b border-white/10 pb-3">
            <h2 id={`team-${team.id}`} className="text-2xl font-black uppercase tracking-tight">{team.name}</h2>
            <span className="text-xs text-zinc-500">{team.products.length} modelos</span>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {team.products.map((product) => (
              <article key={product.id} className="flex gap-4 border border-white/10 bg-zinc-900 p-4">
                <div className="relative h-28 w-24 shrink-0 overflow-hidden bg-black">
                  <Image src={product.image} alt="" fill sizes="96px" className="object-cover" />
                </div>
                <div className="min-w-0 flex-1 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="truncate font-bold uppercase">{product.name}</h3>
                      <p className="text-xs text-zinc-500">ID / modelo: {product.id}</p>
                    </div>
                    <span className={`shrink-0 text-[10px] font-black uppercase ${product.inStock ? "text-emerald-400" : "text-red-400"}`}>
                      {product.inStock ? `${product.availableSizes.length}/${product.sizes.length} disponibles` : "Sin stock"}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => {
                      const available = product.availableSizes.includes(size);
                      return (
                        <button
                          key={size}
                          type="button"
                          aria-pressed={available}
                          aria-label={`${size}: ${available ? "Disponible" : "Agotado"}. Cambiar estado`}
                          onClick={() => changeSize(product.id, size)}
                          className={`min-w-12 border px-2 py-2 text-xs font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-white ${available ? "border-emerald-400/60 bg-emerald-400/10 text-emerald-300" : "border-red-400/50 bg-red-400/10 text-red-300"}`}
                        >
                          {size} · {available ? "Disponible" : "Agotado"}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => exhaustModel(product.id)}
                      className="border border-white/20 px-3 py-2 text-[10px] font-black uppercase tracking-wide hover:border-white/60"
                    >
                      Agotar modelo
                    </button>
                    <span aria-live="polite" className={`text-xs ${feedback[product.id]?.startsWith("Error") ? "text-red-400" : "text-zinc-400"}`}>
                      {feedback[product.id]}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}

      {filteredTeams.length === 0 && <p className="text-sm text-zinc-500">No se encontraron productos.</p>}

      <section className="border border-white/10 bg-zinc-900 p-5">
        <h2 className="mb-5 text-xl font-black uppercase tracking-tight">Leads de primera compra</h2>
        {leads.length === 0 ? <p className="text-sm text-zinc-500">Todavía no hay leads registrados.</p> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className="border-b border-white/10 text-xs uppercase tracking-wider text-zinc-500">
                <tr><th className="pb-3 pr-4">Nombre</th><th className="pb-3 pr-4">Email</th><th className="pb-3 pr-4">Equipo</th><th className="pb-3">Fecha</th></tr>
              </thead>
              <tbody>{leads.map((lead) => (
                <tr key={lead.id} className="border-b border-white/5 last:border-0">
                  <td className="py-3 pr-4">{lead.name}</td><td className="py-3 pr-4 text-zinc-300">{lead.email}</td><td className="py-3 pr-4">{lead.team}</td><td className="py-3 text-zinc-400">{new Intl.DateTimeFormat("es-AR", { dateStyle: "medium", timeStyle: "short" }).format(lead.createdAt)}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
