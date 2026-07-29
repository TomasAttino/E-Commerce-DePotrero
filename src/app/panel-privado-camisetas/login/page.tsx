import LoginForm from "@/components/admin/LoginForm";

export const dynamic = "force-dynamic";

export default function AdminLoginPage() {
  if (!process.env.ADMIN_PASSWORD) {
    return (
      <div className="mx-auto max-w-md border border-red-500/30 bg-zinc-900 p-8">
        <h1 className="text-3xl font-black uppercase tracking-tight">Panel unavailable</h1>
        <p className="mt-3 text-sm text-red-400">
          ADMIN_PASSWORD is not configured on the server. Set it before using the private panel.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md border border-white/10 bg-zinc-900 p-8">
      <h1 className="text-3xl font-black uppercase tracking-tight">Private panel</h1>
      <p className="mt-3 text-sm text-zinc-400">Enter the administrator password to continue.</p>
      <LoginForm />
    </div>
  );
}
