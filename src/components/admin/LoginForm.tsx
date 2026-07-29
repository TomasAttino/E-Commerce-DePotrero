"use client";

import { loginAdmin, type AdminLoginState } from "@/app/actions/auth";
import { useActionState } from "react";

const initialState: AdminLoginState = { message: "" };

export default function LoginForm() {
  const [state, action, pending] = useActionState(loginAdmin, initialState);

  return (
    <form action={action} className="mt-8 space-y-5">
      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-bold uppercase text-zinc-500">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="w-full border border-white/20 bg-black p-3 text-white outline-none focus:border-white"
        />
      </div>
      {state.message && <p className="text-sm text-red-400">{state.message}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full bg-white py-4 font-black uppercase text-black transition-colors hover:bg-zinc-200 disabled:opacity-50"
      >
        {pending ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
