"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProduct, updateProduct, deleteProduct } from "@/app/actions/products";

interface Team {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  sizes: string;
  colors: string;
  inStock: boolean;
  image: string;
  hoverImage?: string | null;
  teamId: string;
}

export default function ProductForm({ teams, initialData }: { teams: Team[], initialData?: Product }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (initialData && confirm("¿Estás seguro de que quieres eliminar este producto?")) {
      setLoading(true);
      await deleteProduct(initialData.id);
      router.push("/panel-privado-camisetas");
      router.refresh();
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      if (initialData) {
        await updateProduct(initialData.id, formData);
      } else {
        await createProduct(formData);
      }
      router.push("/panel-privado-camisetas");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Error al guardar el producto");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black uppercase">{initialData ? 'EDITAR PRODUCTO' : 'NUEVO PRODUCTO'}</h1>
        {initialData && (
          <button 
            onClick={handleDelete}
            disabled={loading}
            className="text-red-500 hover:text-red-400 font-bold text-sm uppercase tracking-wider"
          >
            Eliminar Producto
          </button>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6 bg-zinc-900 p-8 border border-white/10 rounded-lg">
        <div className="space-y-2">
          <label className="text-sm font-bold uppercase text-zinc-500">Nombre del Producto</label>
          <input 
            name="name" 
            required 
            defaultValue={initialData?.name}
            className="w-full bg-black border border-white/20 p-3 text-white focus:border-white outline-none"
            placeholder="Ej: Camiseta Titular 24/25"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-bold uppercase text-zinc-500">Precio</label>
            <input 
              name="price" 
              type="number" 
              required 
              defaultValue={initialData?.price}
              className="w-full bg-black border border-white/20 p-3 text-white focus:border-white outline-none"
              placeholder="0.00"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold uppercase text-zinc-500">Categoría</label>
            <select 
              name="category" 
              required 
              defaultValue={initialData?.category || "Camisetas"}
              className="w-full bg-black border border-white/20 p-3 text-white focus:border-white outline-none"
            >
              <option value="Camisetas">Camisetas</option>
              <option value="Indumentaria">Indumentaria</option>
              <option value="Accesorios">Accesorios</option>
            </select>
          </div>
        </div>

        {!initialData && (
          <div className="space-y-2">
            <label className="text-sm font-bold uppercase text-zinc-500">Equipo</label>
            <select 
              name="teamId" 
              required 
              className="w-full bg-black border border-white/20 p-3 text-white focus:border-white outline-none"
            >
              {teams.map(team => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </select>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-bold uppercase text-zinc-500">Talles (JSON)</label>
            <input 
              name="sizes" 
              defaultValue={initialData?.sizes || '["S", "M", "L", "XL"]'}
              className="w-full bg-black border border-white/20 p-3 text-white focus:border-white outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold uppercase text-zinc-500">Colores (JSON)</label>
            <input 
              name="colors" 
              defaultValue={initialData?.colors || '["Titular"]'}
              className="w-full bg-black border border-white/20 p-3 text-white focus:border-white outline-none"
            />
          </div>
        </div>

        <div className="flex items-center space-x-3 bg-black/50 p-4 border border-white/10">
          <input 
            type="checkbox" 
            name="inStock" 
            id="inStock"
            defaultChecked={initialData ? initialData.inStock : true}
            className="w-5 h-5 accent-white"
          />
          <label htmlFor="inStock" className="text-sm font-bold uppercase cursor-pointer">En Stock</label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold uppercase text-zinc-500">Imagen Principal {initialData && "(opcional)"}</label>
            <input 
              name="image" 
              type="file" 
              accept="image/*"
              required={!initialData}
              className="w-full bg-black border border-white/20 p-3 text-white focus:border-white outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold uppercase text-zinc-500">Imagen Hover (opcional)</label>
            <input 
              name="hoverImage" 
              type="file" 
              accept="image/*"
              className="w-full bg-black border border-white/20 p-3 text-white focus:border-white outline-none"
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-white text-black font-black py-4 uppercase hover:bg-zinc-200 transition-colors disabled:opacity-50"
        >
          {loading ? "Guardando..." : (initialData ? "Actualizar Producto" : "Crear Producto")}
        </button>
      </form>
    </div>
  );
}


