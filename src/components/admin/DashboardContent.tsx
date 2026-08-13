"use client";

import Image from "next/image";
import { ArrowDown, ArrowUp, Pencil, Trash2, X } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { createCatalogProduct, createCatalogTeam, deleteCatalogProduct, saveCatalogProduct, type CatalogActionResult } from "@/app/actions/catalog";
import { exhaustStockProduct, toggleStockSize } from "@/app/actions/stock";
import { getProductGallery, MAX_PRODUCT_IMAGES, paginate, filterCatalogProducts, type CatalogState } from "@/lib/catalog";
import { resolveProductStock, type StockState, type TeamWithStock } from "@/lib/stock";

type Lead = { id: string; name: string; email: string; team: string; createdAt: Date };
type Feedback = { status: "success" | "error" | "pending"; message: string };

type GalleryItem = { type: "url" | "file"; value: string | number; label: string };

const MAX_GALLERY_UPLOAD_BYTES = 16 * 1024 * 1024;
const IMAGE_PREPARATION_THRESHOLD = 2 * 1024 * 1024;
const MAX_IMAGE_DIMENSION = 2400;
const pendingGalleryPreparations = new WeakMap<HTMLFormElement, Promise<void>>();

async function prepareImage(file: File) {
  if (file.type === "image/svg+xml" || file.size <= IMAGE_PREPARATION_THRESHOLD) return file;

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    const preserveTransparency = file.type === "image/png" || file.type === "image/webp";
    const outputType = preserveTransparency ? "image/webp" : "image/jpeg";
    const extension = preserveTransparency ? "webp" : "jpg";
    const baseName = file.name.replace(/\.[^.]+$/, "") || "image";
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, outputType, 0.82));
    return blob ? new File([blob], `${baseName}.${extension}`, { type: outputType }) : file;
  } catch {
    return file;
  }
}

function GalleryEditor({ gallery, required = false }: { gallery: string[]; required?: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<GalleryItem[]>(gallery.map((url) => ({ type: "url", value: url, label: url })));
  const filesRef = useRef<File[]>([]);
  const fileSignaturesRef = useRef<string[]>([]);
  const [error, setError] = useState("");

  function getFileSignature(file: File) {
    return [file.name, file.size, file.lastModified, file.type].join("\u0000");
  }

  async function updateFiles(files: File[]) {
    const currentFiles = filesRef.current;
    const currentSignatures = new Set(fileSignaturesRef.current);
    const newFiles = files.filter((file) => {
      const signature = getFileSignature(file);
      if (currentSignatures.has(signature)) return false;
      currentSignatures.add(signature);
      return true;
    });
    if (items.length + newFiles.length > MAX_PRODUCT_IMAGES) {
      setError(`Un producto puede tener como máximo ${MAX_PRODUCT_IMAGES} imágenes.`);
      return;
    }
    const form = inputRef.current?.form;
    const preparation = Promise.all(newFiles.map(prepareImage));
    const preparationBarrier = preparation.then(() => undefined);
    if (form) {
      pendingGalleryPreparations.set(form, preparationBarrier);
      form.querySelectorAll<HTMLButtonElement>("button[type=submit], button:not([type])").forEach((button) => button.setAttribute("disabled", ""));
    }
    const preparedFiles = await preparation;
    if (form && pendingGalleryPreparations.get(form) === preparationBarrier) {
      pendingGalleryPreparations.delete(form);
      form.querySelectorAll<HTMLButtonElement>("button[type=submit], button:not([type])").forEach((button) => button.removeAttribute("disabled"));
    }
    const nextFiles = [...currentFiles, ...preparedFiles];
    if (nextFiles.reduce((total, file) => total + file.size, 0) > MAX_GALLERY_UPLOAD_BYTES) {
      setError("Las imágenes seleccionadas superan el límite de 16 MB. Elegí archivos más chicos.");
      return;
    }
    const next = [...items, ...preparedFiles.map((file, index) => ({ type: "file" as const, value: currentFiles.length + index, label: file.name }))];
    setItems(next);
    filesRef.current = nextFiles;
    fileSignaturesRef.current = [...fileSignaturesRef.current, ...newFiles.map(getFileSignature)];
    setError("");
    if (inputRef.current) {
      const dataTransfer = new DataTransfer();
      nextFiles.forEach((file) => dataTransfer.items.add(file));
      inputRef.current.files = dataTransfer.files;
    }
  }

  function remove(index: number) {
    const removed = items[index];
    if (!removed) return;
    const remainingFiles = removed.type === "file" && typeof removed.value === "number"
      ? filesRef.current.filter((_, fileIndex) => fileIndex !== removed.value)
      : filesRef.current;
    const remainingSignatures = removed.type === "file" && typeof removed.value === "number"
      ? fileSignaturesRef.current.filter((_, fileIndex) => fileIndex !== removed.value)
      : fileSignaturesRef.current;
    const next = items.filter((_, itemIndex) => itemIndex !== index).map((item) => item.type === "file" && typeof item.value === "number" && typeof removed.value === "number" && item.value > removed.value ? { ...item, value: item.value - 1 } : item);
    setItems(next);
    filesRef.current = remainingFiles;
    fileSignaturesRef.current = remainingSignatures;
    if (removed.type === "file" && inputRef.current) {
      const dataTransfer = new DataTransfer();
      remainingFiles.forEach((file) => dataTransfer.items.add(file));
      inputRef.current.files = dataTransfer.files;
    }
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    setItems(next);
  }

  return <div className="md:col-span-2">
    <label className="text-xs text-zinc-500">Galería · máximo {MAX_PRODUCT_IMAGES} imágenes</label>
    <input ref={inputRef} name="image" multiple type="file" accept="image/*" required={required && items.length === 0} onChange={(event) => { const files = Array.from(event.target.files ?? []); event.currentTarget.value = ""; void updateFiles(files); }} className="mt-1 block w-full text-xs" />
    <input type="hidden" name="galleryOrder" value={JSON.stringify(items.map(({ type, value }) => ({ type, value })))} readOnly />
    {error && <p role="alert" className="mt-2 text-xs text-red-300">{error}</p>}
    <div className="mt-2 space-y-2">
      {items.map((item, index) => <div key={`${item.type}-${item.value}`} className="flex items-center gap-2 border border-white/10 bg-black px-2 py-2 text-xs">
        {item.type === "url" && <div className="relative h-10 w-8 shrink-0 overflow-hidden bg-zinc-900"><Image src={item.label} alt="" fill sizes="32px" className="object-cover" /></div>}
        <span className="min-w-0 flex-1 truncate">{index + 1}. {item.label}</span>
        <button type="button" onClick={() => move(index, -1)} disabled={index === 0} aria-label="Move image up" className="p-1 disabled:opacity-30"><ArrowUp size={14} /></button>
        <button type="button" onClick={() => move(index, 1)} disabled={index === items.length - 1} aria-label="Move image down" className="p-1 disabled:opacity-30"><ArrowDown size={14} /></button>
        <button type="button" onClick={() => remove(index)} aria-label={`Remove image ${index + 1}`} className="p-1 text-red-300"><X size={14} /></button>
      </div>)}
    </div>
  </div>;
}

export default function DashboardContent({
  initialCatalog,
  initialTeams,
  initialStock,
  stockError,
  catalogError,
  leads,
}: {
  initialCatalog: CatalogState;
  initialTeams: TeamWithStock[];
  initialStock: StockState;
  stockError?: string;
  catalogError?: string;
  leads: Lead[];
}) {
  const [catalog, setCatalog] = useState(initialCatalog);
  const [teams, setTeams] = useState(initialTeams);
  const [, setStock] = useState(initialStock);
  const [query, setQuery] = useState("");
  const [teamFilter, setTeamFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [feedback, setFeedback] = useState<Feedback>({ status: "success", message: "" });
  const [newTeamOpen, setNewTeamOpen] = useState(false);
  const [newProductOpen, setNewProductOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const savingProductIds = useRef(new Set<string>());
  const catalogVersion = useRef(initialCatalog.version);
  const stockRef = useRef(initialStock);
  const catalogMutationQueue = useRef(Promise.resolve());

  const filtered = useMemo(() => paginate(filterCatalogProducts(catalog, query, teamFilter), page), [catalog, page, query, teamFilter]);
  const stockById = useMemo(() => new Map(teams.flatMap((team) => team.products.map((product) => [product.id, product]))), [teams]);

  function show(result: Feedback) {
    setFeedback(result);
  }

  function applyCatalogState(state: CatalogState) {
    catalogVersion.current = state.version;
    setCatalog(state);
    setTeams(state.teams.map((team) => ({ ...team, products: team.products.map((product) => resolveProductStock(product, stockRef.current)) })));
  }

  function setCurrentStock(next: StockState) {
    stockRef.current = next;
    setStock(next);
  }

  function enqueueCatalogMutation(mutation: (version: number) => Promise<CatalogActionResult>) {
    const operation = catalogMutationQueue.current.then(async () => {
      try {
        const result = await mutation(catalogVersion.current);
        if (result.status === "success") applyCatalogState(result.state);
        show({ status: result.status, message: result.message });
        return result;
      } catch (error) {
        const result = { status: "error" as const, message: error instanceof Error ? error.message : "No se pudo guardar el cambio." };
        show(result);
        return result;
      }
    });
    catalogMutationQueue.current = operation.then(() => undefined, () => undefined);
    return operation;
  }

  async function saveProduct(productId: string, form: HTMLFormElement) {
    if (savingProductIds.current.has(productId)) return;
    savingProductIds.current.add(productId);
    const submitButton = form.querySelector("button[type=submit], button:not([type])") as HTMLButtonElement | null;
    submitButton?.setAttribute("disabled", "");
    try {
      await (pendingGalleryPreparations.get(form) ?? Promise.resolve());
      const submittedData = new FormData(form);
      const result = await enqueueCatalogMutation(async (version) => {
        show({ status: "pending", message: "Guardando producto..." });
        return saveCatalogProduct(productId, submittedData, version);
      });
      if (result.status === "success") setEditingProductId(null);
    } finally {
      savingProductIds.current.delete(productId);
      submitButton?.removeAttribute("disabled");
    }
  }

  async function deleteProduct(productId: string, productName: string) {
    if (savingProductIds.current.has(productId)) return;
    if (!window.confirm(`¿Eliminar el producto "${productName}"? Esta acción no se puede deshacer.`)) return;
    savingProductIds.current.add(productId);
    try {
      const result = await enqueueCatalogMutation(async (version) => {
        show({ status: "pending", message: "Eliminando producto..." });
        return deleteCatalogProduct(productId, version);
      });
      if (result.status === "success" && editingProductId === productId) setEditingProductId(null);
    } finally {
      savingProductIds.current.delete(productId);
    }
  }

  async function submitNewTeam(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const submittedData = new FormData(form);
    const result = await enqueueCatalogMutation(async (version) => {
      show({ status: "pending", message: "Guardando equipo..." });
      return createCatalogTeam(submittedData, version);
    });
    if (result.status === "success") {
      form.reset();
      setNewTeamOpen(false);
    }
  }

  async function submitNewProduct(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    await (pendingGalleryPreparations.get(form) ?? Promise.resolve());
    const submittedData = new FormData(form);
    const result = await enqueueCatalogMutation(async (version) => {
      show({ status: "pending", message: "Subiendo imagen y guardando producto..." });
      return createCatalogProduct(submittedData, version);
    });
    if (result.status === "success") {
      form.reset();
      setNewProductOpen(false);
      setPage(1);
    }
  }

  async function changeSize(productId: string, size: string) {
    const product = stockById.get(productId);
    if (!product) return;
    const previous = stockRef.current;
    const resolved = resolveProductStock(product, previous);
    const next = { ...previous, products: { ...previous.products, [productId]: { exhausted: false, unavailableSizes: resolved.availableSizes.includes(size) ? [...resolved.unavailableSizes, size] : resolved.unavailableSizes.filter((item) => item !== size) } } };
    setCurrentStock(next);
    setTeams((current) => current.map((team) => ({ ...team, products: team.products.map((item) => item.id === productId ? resolveProductStock(item, next) : item) })));
    show({ status: "pending", message: "Guardando stock..." });
    const result = await toggleStockSize(productId, size, previous.version);
    if (result.status === "success") setCurrentStock(result.state);
    else {
      setCurrentStock(previous);
      setTeams((current) => current.map((team) => ({ ...team, products: team.products.map((item) => item.id === productId ? resolveProductStock(item, previous) : item) })));
    }
    show({ status: result.status, message: result.message });
  }

  async function exhaustModel(productId: string) {
    const product = stockById.get(productId);
    if (!product) return;
    const previous = stockRef.current;
    const next = { ...previous, products: { ...previous.products, [productId]: { exhausted: true, unavailableSizes: [] } } };
    setCurrentStock(next);
    setTeams((current) => current.map((team) => ({ ...team, products: team.products.map((item) => item.id === productId ? resolveProductStock(item, next) : item) })));
    show({ status: "pending", message: "Guardando stock..." });
    const result = await exhaustStockProduct(productId, previous.version);
    if (result.status === "success") setCurrentStock(result.state);
    else { setCurrentStock(previous); setTeams((current) => current.map((team) => ({ ...team, products: team.products.map((item) => item.id === productId ? resolveProductStock(item, previous) : item) }))); }
    show({ status: result.status, message: result.message });
  }

  return <div className="space-y-10">
    <header className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-xs font-bold uppercase tracking-[0.25em] text-lime-400">Catálogo público · Blob</p><h1 className="text-3xl font-black uppercase tracking-tight">Panel de producción</h1><p className="mt-2 text-sm text-zinc-400">Los cambios de esta pantalla se publican en la web.</p></div>
        <div className="flex gap-2"><button type="button" onClick={() => setNewTeamOpen((value) => !value)} className="border border-white/20 px-4 py-3 text-xs font-bold uppercase hover:border-white">Nuevo equipo</button><button type="button" onClick={() => setNewProductOpen((value) => !value)} className="bg-white px-4 py-3 text-xs font-bold uppercase text-black hover:bg-zinc-200">Nuevo producto</button></div>
      </div>
      <div className="grid gap-3 md:grid-cols-[minmax(0,2fr)_1fr]"><input type="search" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Buscar por equipo, nombre o ID..." aria-label="Buscar catálogo" className="border border-white/10 bg-zinc-900 px-4 py-3 text-sm outline-none focus:border-white/50" /><select value={teamFilter} onChange={(event) => { setTeamFilter(event.target.value); setPage(1); }} aria-label="Filtrar por equipo" className="border border-white/10 bg-zinc-900 px-4 py-3 text-sm outline-none focus:border-white/50"><option value="all">Todos los equipos</option>{catalog.teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}</select></div>
    </header>
    {(stockError || catalogError) && <div role="alert" className="border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300">{catalogError ? `Catálogo en modo fallback: ${catalogError}` : `Stock no verificable: ${stockError}`}</div>}
    {feedback.message && <div role={feedback.status === "error" ? "alert" : "status"} className={`border p-3 text-sm ${feedback.status === "error" ? "border-red-500/40 text-red-300" : feedback.status === "success" ? "border-emerald-500/40 text-emerald-300" : "border-white/10 text-zinc-300"}`}>{feedback.message}</div>}

    {newTeamOpen && <form onSubmit={submitNewTeam} className="grid gap-3 border border-white/10 bg-zinc-900 p-5 md:grid-cols-[1fr_1fr_auto]"><input name="name" required placeholder="Nombre del equipo" className="border border-white/10 bg-black px-3 py-3 text-sm" /><input name="slug" required pattern="[a-z0-9-]+" placeholder="slug-seguro" className="border border-white/10 bg-black px-3 py-3 text-sm" /><button className="bg-white px-4 py-3 text-xs font-bold uppercase text-black">Guardar equipo</button></form>}
     {newProductOpen && <form onSubmit={submitNewProduct} className="grid gap-4 border border-white/10 bg-zinc-900 p-5 md:grid-cols-2"><input name="id" required placeholder="ID único (ej. boca-buzo-1)" className="border border-white/10 bg-black px-3 py-3 text-sm" /><input name="name" required placeholder="Nombre visible" className="border border-white/10 bg-black px-3 py-3 text-sm" /><input name="year" placeholder="Año / temporada (ej. 2025/26)" className="border border-white/10 bg-black px-3 py-3 text-sm" /><input name="price" required type="number" min="0" step="1" placeholder="Precio" className="border border-white/10 bg-black px-3 py-3 text-sm" /><select name="teamId" required className="border border-white/10 bg-black px-3 py-3 text-sm">{catalog.teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}</select><input name="category" required defaultValue="Camisetas" placeholder="Categoría / tipo" className="border border-white/10 bg-black px-3 py-3 text-sm" /><input name="sizes" required defaultValue="S, M, L, XL" placeholder="Talles separados por coma" className="border border-white/10 bg-black px-3 py-3 text-sm" /><label className="flex items-center gap-3 border border-white/10 bg-black px-3 py-3 text-sm text-zinc-300 md:col-span-2"><input name="isNew" type="checkbox" className="h-4 w-4 accent-white" />Mostrar en “Recién llegados”</label><GalleryEditor gallery={[]} required /><button className="bg-white px-4 py-3 text-xs font-bold uppercase text-black md:col-span-2">Subir y guardar producto</button></form>}

    <div className="flex items-center justify-between text-xs text-zinc-500"><span>{filtered.items.length} de {filterCatalogProducts(catalog, query, teamFilter).length} productos</span><span>Página {filtered.currentPage} de {filtered.totalPages}</span></div>
    <div className="space-y-4">{filtered.items.map(({ product, team }) => {
      const withStock = stockById.get(product.id);
      const isEditing = editingProductId === product.id;
      return <article key={product.id} className="border border-white/10 bg-zinc-900 p-4">
        <div className="flex flex-col gap-4 xl:flex-row">
           <div className="relative h-36 w-28 shrink-0 overflow-hidden bg-black"><Image src={product.image} alt="" fill sizes="112px" className="object-cover" /></div>
          {isEditing ? <form onSubmit={(event) => { event.preventDefault(); void saveProduct(product.id, event.currentTarget); }} className="grid min-w-0 flex-1 gap-3 md:grid-cols-4">
            <div className="md:col-span-2"><label className="text-[10px] uppercase text-zinc-500">Nombre · {product.id}</label><input name="name" required defaultValue={product.name} className="mt-1 w-full border border-white/10 bg-black px-3 py-2 text-sm" /></div>
            <div><label className="text-[10px] uppercase text-zinc-500">Año / temporada</label><input name="year" defaultValue={product.year ?? ""} placeholder="Ej. 2025/26" className="mt-1 w-full border border-white/10 bg-black px-3 py-2 text-sm" /></div>
            <div><label className="text-[10px] uppercase text-zinc-500">Precio</label><input name="price" required type="number" min="0" defaultValue={product.price} className="mt-1 w-full border border-white/10 bg-black px-3 py-2 text-sm" /></div>
            <div><label className="text-[10px] uppercase text-zinc-500">Equipo</label><select name="teamId" defaultValue={team.id} className="mt-1 w-full border border-white/10 bg-black px-3 py-2 text-sm">{catalog.teams.map((candidate) => <option key={candidate.id} value={candidate.id}>{candidate.name}</option>)}</select></div>
            <div><label className="text-[10px] uppercase text-zinc-500">Categoría</label><input name="category" required defaultValue={product.category} className="mt-1 w-full border border-white/10 bg-black px-3 py-2 text-sm" /></div>
            <div><label className="text-[10px] uppercase text-zinc-500">Talles</label><input name="sizes" required defaultValue={product.sizes.join(", ")} className="mt-1 w-full border border-white/10 bg-black px-3 py-2 text-sm" /></div>
             <label className="flex items-center gap-3 text-xs text-zinc-400 md:col-span-2"><input name="isNew" type="checkbox" defaultChecked={product.isNew === true} className="h-4 w-4 accent-white" />Mostrar en “Recién llegados”</label>
                <GalleryEditor gallery={getProductGallery(product)} required />
            <div className="flex items-end gap-2"><button type="submit" className="bg-white px-3 py-2 text-xs font-bold uppercase text-black">Guardar cambios</button><button type="button" onClick={() => setEditingProductId(null)} className="border border-white/20 px-3 py-2 text-xs font-bold uppercase">Cancelar</button></div>
          </form> : <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3"><div><h2 className="text-lg font-bold">{product.name}</h2><p className="text-xs text-zinc-500">{product.id}</p></div><div className="flex gap-2"><button type="button" onClick={() => setEditingProductId(product.id)} aria-label={`Editar ${product.name}`} title={`Editar ${product.name}`} className="border border-white/20 p-2 text-zinc-300 hover:border-white hover:text-white"><Pencil size={16} aria-hidden="true" /></button><button type="button" onClick={() => void deleteProduct(product.id, product.name)} aria-label={`Eliminar ${product.name}`} title={`Eliminar ${product.name}`} className="border border-red-400/40 p-2 text-red-300 hover:border-red-300 hover:text-red-200"><Trash2 size={16} aria-hidden="true" /></button></div></div>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3"><div><dt className="text-[10px] uppercase text-zinc-500">Año / temporada</dt><dd>{product.year ?? "Sin especificar"}</dd></div><div><dt className="text-[10px] uppercase text-zinc-500">Precio</dt><dd>${product.price}</dd></div><div><dt className="text-[10px] uppercase text-zinc-500">Equipo</dt><dd>{team.name}</dd></div></dl>
          </div>}
        </div>
        <div className="mt-4 border-t border-white/10 pt-4"><div className="mb-2 flex items-center justify-between"><span className="text-xs font-bold uppercase text-zinc-400">Talles y stock manual</span><button type="button" onClick={() => void exhaustModel(product.id)} className="text-[10px] font-bold uppercase text-red-300 hover:text-red-200">Agotar modelo</button></div><div className="flex flex-wrap gap-2">{product.sizes.map((size) => { const available = withStock?.availableSizes.includes(size) ?? false; return <button key={size} type="button" aria-pressed={available} onClick={() => void changeSize(product.id, size)} className={`border px-3 py-2 text-xs font-bold ${available ? "border-emerald-400/50 text-emerald-300" : "border-red-400/50 text-red-300"}`}>{size} · {available ? "Disponible" : "Agotado"}</button>; })}</div></div>
      </article>;
    })}</div>

    <nav className="flex justify-center gap-2" aria-label="Paginación del panel"><button type="button" disabled={filtered.currentPage === 1} onClick={() => setPage(filtered.currentPage - 1)} className="border border-white/15 px-4 py-2 text-xs uppercase disabled:opacity-30">Anterior</button><button type="button" disabled={filtered.currentPage === filtered.totalPages} onClick={() => setPage(filtered.currentPage + 1)} className="border border-white/15 px-4 py-2 text-xs uppercase disabled:opacity-30">Siguiente</button></nav>

     <section className="border border-white/10 bg-zinc-900 p-5"><h2 className="mb-5 text-xl font-black uppercase tracking-tight">Leads de primera compra</h2>{leads.length === 0 ? <p className="text-sm text-zinc-500">Todavía no hay leads registrados.</p> : <div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm"><thead className="border-b border-white/10 text-xs uppercase tracking-wider text-zinc-500"><tr><th className="pb-3 pr-4">Nombre</th><th className="pb-3 pr-4">Email</th><th className="pb-3 pr-4">Equipo</th><th className="pb-3">Fecha</th></tr></thead><tbody>{leads.map((lead) => <tr key={lead.id} className="border-b border-white/5 last:border-0"><td className="py-3 pr-4">{lead.name}</td><td className="py-3 pr-4 text-zinc-300">{lead.email}</td><td className="py-3 pr-4">{lead.team}</td><td className="py-3 text-zinc-400">{new Intl.DateTimeFormat("es-AR", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }).format(lead.createdAt)}</td></tr>)}</tbody></table></div>}</section>
  </div>;
}
