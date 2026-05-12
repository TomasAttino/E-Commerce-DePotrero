import { getTeams } from "../actions/products";
import Link from "next/link";
import Image from "next/image";

export default async function AdminPage() {
  const teams = await getTeams();

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black">Dashboard</h1>
        <div className="space-x-4">
          <Link 
            href="/admin/teams/new" 
            className="border border-white text-white px-4 py-2 font-bold hover:bg-white hover:text-black transition-colors"
          >
            Nuevo Equipo
          </Link>
          <Link 
            href="/admin/products/new" 
            className="bg-white text-black px-4 py-2 font-bold hover:bg-zinc-200 transition-colors"
          >
            Nuevo Producto
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map((team) => (
          <div key={team.id} className="border border-white/10 bg-zinc-900 rounded-lg overflow-hidden">
            <div className="relative h-32 w-full">
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
                  href={`/admin/teams/${team.id}`}
                  className="absolute bottom-2 right-2 opacity-0 group-hover/banner:opacity-100 bg-white/10 hover:bg-white/20 text-[10px] px-2 py-1 rounded transition-all"
                >
                  Editar Equipo
                </Link>
              </div>
            </div>
            <div className="p-4">
              <h3 className="text-sm font-semibold text-zinc-400 mb-4">{team.products.length} Productos</h3>
              <div className="space-y-2">
                {team.products.map((product) => (
                  <Link 
                    key={product.id} 
                    href={`/admin/products/${product.id}`}
                    className="flex items-center justify-between group hover:bg-white/5 p-1 rounded transition-colors"
                  >
                    <span className="text-sm truncate mr-2">{product.name}</span>
                    <div className="flex items-center space-x-2">
                      {!product.inStock && (
                        <span className="text-[10px] bg-red-500/20 text-red-500 px-1 font-bold uppercase">Sin Stock</span>
                      )}
                      <span className="text-xs text-zinc-500">${product.price.toLocaleString()}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
