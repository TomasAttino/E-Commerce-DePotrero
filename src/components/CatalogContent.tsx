"use client";

import { useMemo, useState } from "react";
import Header from "@/components/Header";
import PromoBar from "@/components/PromoBar";
import ProductCard from "@/components/ProductCard";
import CartDrawer from "@/components/CartDrawer";
import WhatsAppButton from "@/components/WhatsAppButton";
import type { TeamWithStock } from "@/lib/stock";
import Image from "next/image";

type CatalogProduct = TeamWithStock["products"][number] & { teamName: string; teamSlug: string };
const PRODUCTS_PER_PAGE = 24;

export default function CatalogContent({
  teams,
  catalogFallback,
}: {
  teams: TeamWithStock[];
  catalogFallback?: boolean;
}) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [teamFilter, setTeamFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [includeSoldOut, setIncludeSoldOut] = useState(true);
  const [page, setPage] = useState(1);

  const products = useMemo<CatalogProduct[]>(
    () => {
      const interleaved: CatalogProduct[] = [];
      const maxProducts = Math.max(0, ...teams.map((team) => team.products.length));

      for (let index = 0; index < maxProducts; index += 1) {
        for (const team of teams) {
          const product = team.products[index];
          if (product) interleaved.push({ ...product, teamName: team.name, teamSlug: team.slug });
        }
      }

      return interleaved;
    },
    [teams],
  );
  const categories = useMemo(() => [...new Set(products.map((product) => product.category))].sort(), [products]);
  const sizes = useMemo(() => [...new Set(products.flatMap((product) => product.sizes))].sort(), [products]);
  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return products.filter((product) => {
      const matchesQuery = !normalizedQuery || [product.teamName, product.name, product.id]
        .some((value) => value.toLowerCase().includes(normalizedQuery));
      const matchesTeam = teamFilter === "all" || product.teamSlug === teamFilter;
      const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
      const matchesSizes = selectedSizes.length === 0 || selectedSizes.some((size) =>
        (product.stockVerified ? product.availableSizes : product.sizes).includes(size),
      );
      const matchesStock = includeSoldOut || !product.stockVerified || product.inStock;
      return matchesQuery && matchesTeam && matchesCategory && matchesSizes && matchesStock;
    });
  }, [categoryFilter, includeSoldOut, products, query, selectedSizes, teamFilter]);
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const visibleProducts = filteredProducts.slice((currentPage - 1) * PRODUCTS_PER_PAGE, currentPage * PRODUCTS_PER_PAGE);

  const resetPage = () => setPage(1);

  const toggleSize = (size: string) => {
    setSelectedSizes((current) => current.includes(size)
      ? current.filter((selected) => selected !== size)
      : [...current, size]);
  };

  return (
    <main className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      <PromoBar />
       <Header onCartClick={() => setIsCartOpen(true)} />
      <section className="mx-auto max-w-7xl px-4 pb-16 pt-32 sm:px-6 lg:px-8" aria-labelledby="catalog-title">
        {catalogFallback && <div role="status" className="mb-8 border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-center text-xs text-amber-200">Se está mostrando la colección inicial por el momento.</div>}
        <div className="mb-10 max-w-3xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-zinc-500">Colección completa</p>
          <h1 id="catalog-title" className="text-4xl font-black uppercase italic tracking-tighter sm:text-6xl">Catálogo</h1>
          <p className="mt-4 text-sm text-zinc-400 sm:text-base">Encontrá camisetas y próximos productos de todos los equipos en un solo lugar.</p>
        </div>

        <div className="mb-10 space-y-5 border-y border-white/10 py-5" aria-label="Filtros del catálogo">
          <div className="grid gap-4 md:grid-cols-[minmax(0,2fr)_1fr_1fr]">
            <div>
              <label htmlFor="catalog-search" className="mb-2 block text-xs font-bold uppercase tracking-widest text-zinc-400">Buscar</label>
              <input
                id="catalog-search"
                type="search"
                value={query}
                 onChange={(event) => { setQuery(event.target.value); resetPage(); }}
                placeholder="Equipo, nombre o ID"
                className="w-full border border-white/15 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-zinc-600 focus-visible:border-white"
              />
            </div>
            <div>
              <label htmlFor="catalog-team" className="mb-2 block text-xs font-bold uppercase tracking-widest text-zinc-400">Equipo</label>
               <select id="catalog-team" value={teamFilter} onChange={(event) => { setTeamFilter(event.target.value); resetPage(); }} className="w-full border border-white/15 bg-zinc-950 px-4 py-3 text-sm text-white outline-none focus-visible:border-white">
                <option value="all">Todos los equipos</option>
                {teams.map((team) => <option key={team.slug} value={team.slug}>{team.name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="catalog-category" className="mb-2 block text-xs font-bold uppercase tracking-widest text-zinc-400">Tipo</label>
               <select id="catalog-category" value={categoryFilter} onChange={(event) => { setCategoryFilter(event.target.value); resetPage(); }} className="w-full border border-white/15 bg-zinc-950 px-4 py-3 text-sm text-white outline-none focus-visible:border-white">
                <option value="all">Todos los tipos</option>
                {categories.map((category) => <option key={category} value={category}>{category}</option>)}
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <fieldset>
              <legend className="mb-2 text-xs font-bold uppercase tracking-widest text-zinc-400">Talles disponibles</legend>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <label key={size} className="inline-flex cursor-pointer items-center gap-2 border border-white/15 px-3 py-2 text-xs text-zinc-300 has-[:checked]:border-white has-[:checked]:bg-white has-[:checked]:text-black">
                    <input type="checkbox" checked={selectedSizes.includes(size)} onChange={() => { toggleSize(size); resetPage(); }} className="sr-only" />
                    {size}
                  </label>
                ))}
              </div>
            </fieldset>
            <label className="inline-flex cursor-pointer items-center gap-3 text-sm text-zinc-300">
               <input type="checkbox" checked={includeSoldOut} onChange={(event) => { setIncludeSoldOut(event.target.checked); resetPage(); }} className="h-4 w-4 accent-white" />
              Incluir agotados
            </label>
          </div>
        </div>

        <div className="mb-5 flex items-center justify-between text-xs text-zinc-500">
          <span>{filteredProducts.length} productos</span>
          {selectedSizes.length > 0 && <span>Mostrando productos con al menos uno de los talles seleccionados</span>}
        </div>
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
             {visibleProducts.map((product) => <div key={product.id}><ProductCard product={product} teamName={product.teamName} /></div>)}
          </div>
        ) : (
          <p className="border border-dashed border-white/15 px-6 py-16 text-center text-sm text-zinc-500">No encontramos productos con esos filtros.</p>
        )}
        {filteredProducts.length > 0 && (
          <nav className="mt-10 flex flex-wrap items-center justify-center gap-2" aria-label="Paginación del catálogo">
            <button type="button" onClick={() => setPage(currentPage - 1)} disabled={currentPage === 1} className="border border-white/15 px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors hover:border-white disabled:cursor-not-allowed disabled:opacity-30">Anterior</button>
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
              <button key={pageNumber} type="button" onClick={() => setPage(pageNumber)} aria-current={pageNumber === currentPage ? "page" : undefined} aria-label={`Página ${pageNumber}`} className={`h-9 min-w-9 border px-3 text-xs font-bold transition-colors ${pageNumber === currentPage ? "border-white bg-white text-black" : "border-white/15 text-zinc-300 hover:border-white"}`}>{pageNumber}</button>
            ))}
            <button type="button" onClick={() => setPage(currentPage + 1)} disabled={currentPage === totalPages} className="border border-white/15 px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors hover:border-white disabled:cursor-not-allowed disabled:opacity-30">Siguiente</button>
            <span className="sr-only">Página {currentPage} de {totalPages}</span>
          </nav>
        )}
      </section>
      <footer
  id="privacy"
  className="relative overflow-hidden border-t border-white/10 bg-black py-14"
>
  {/* Resplandor verde detrás del logo */}
  <div
    aria-hidden="true"
    className="pointer-events-none absolute left-1/2 top-0 h-48 w-80 
               -translate-x-1/2 rounded-full bg-lime-500/10 blur-3xl"
  />

  <div className="relative mx-auto max-w-7xl px-4">
    {/* Logo */}
    <div className="flex justify-center">
      <Image
        src="/isologo2.png"
        alt="DePotrero"
        width={512}
        height={512}
        className="h-auto w-44 object-contain sm:w-52"
      />
    </div>

    <p className="mx-auto mt-5 max-w-md text-center text-sm leading-6 text-zinc-400">
      Camisetas retro, fútbol y pasión.
      <br />
      Envíos a todo el país coordinados vía WhatsApp.
    </p>

    {/* Accesos */}
    <div className="mt-7 flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm">
      <a
        href="https://www.instagram.com/depotrero.retro"
        target="_blank"
        rel="noreferrer"
        className="text-zinc-400 transition hover:text-lime-400"
      >
        Instagram
      </a>

      <a
        href="/catalogo"
        className="text-zinc-400 transition hover:text-lime-400"
      >
        Camisetas
      </a>
    </div>

    {/* Línea inferior */}
    <div className="mx-auto mt-10 max-w-3xl border-t border-white/10 pt-6">
      <p className="text-center text-xs leading-5 text-zinc-600">
        © 2026 DePotrero. Todos los derechos reservados.
        <br className="sm:hidden" /> <br></br>
        Desarrollado por <span className="text-lime-400">Tomas Attino Castro</span>.
      </p>
    </div>
  </div>
</footer>
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <WhatsAppButton />
    </main>
  );
}
