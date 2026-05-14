"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTeam, updateTeam, deleteTeam } from "@/app/actions/products";

interface Team {
  id: string;
  name: string;
  slug: string;
  banner: string;
}

export default function TeamForm({ initialData }: { initialData?: Team }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (initialData && confirm("¿Estás seguro de que quieres eliminar este equipo? Esto borrará también todos sus productos.")) {
      setLoading(true);
      await deleteTeam(initialData.id);
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
        await updateTeam(initialData.id, formData);
      } else {
        await createTeam(formData);
      }
      router.push("/panel-privado-camisetas");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Error al guardar el equipo");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black uppercase">{initialData ? 'EDITAR EQUIPO' : 'NUEVO EQUIPO'}</h1>
        {initialData && (
          <button 
            onClick={handleDelete}
            disabled={loading}
            className="text-red-500 hover:text-red-400 font-bold text-sm uppercase tracking-wider"
          >
            Eliminar Equipo
          </button>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6 bg-zinc-900 p-8 border border-white/10 rounded-lg">
        <div className="space-y-2">
          <label className="text-sm font-bold uppercase text-zinc-500">Nombre del Equipo</label>
          <input 
            name="name" 
            required 
            defaultValue={initialData?.name}
            className="w-full bg-black border border-white/20 p-3 text-white focus:border-white outline-none"
            placeholder="Ej: San Lorenzo"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold uppercase text-zinc-500">Slug (URL)</label>
          <input 
            name="slug" 
            required 
            defaultValue={initialData?.slug}
            className="w-full bg-black border border-white/20 p-3 text-white focus:border-white outline-none"
            placeholder="ej: san-lorenzo"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold uppercase text-zinc-500">Banner {initialData && "(dejar vacío para mantener actual)"}</label>
          <input 
            name="banner" 
            type="file" 
            accept="image/*"
            required={!initialData}
            className="w-full bg-black border border-white/20 p-3 text-white focus:border-white outline-none"
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-white text-black font-black py-4 uppercase hover:bg-zinc-200 transition-colors disabled:opacity-50"
        >
          {loading ? "Guardando..." : (initialData ? "Actualizar Equipo" : "Crear Equipo")}
        </button>
      </form>
    </div>
  );
}
