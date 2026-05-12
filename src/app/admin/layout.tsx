import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <nav className="border-b border-white/10 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/admin" className="text-xl font-bold italic tracking-tighter">
            ADMIN PANEL
          </Link>
          <div className="space-x-4">
            <Link href="/" className="text-sm text-zinc-400 hover:text-white transition-colors">
              Ir a la web
            </Link>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto p-8">
        {children}
      </main>
    </div>
  );
}
