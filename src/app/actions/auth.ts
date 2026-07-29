"use server";

import { redirect } from "next/navigation";
import {
  createAdminSession,
  deleteAdminSession,
  verifyAdminPassword,
} from "@/lib/admin-auth";
import {
  clearLoginAttempts,
  consumeLoginAttempt,
} from "@/lib/admin-rate-limit";

export type AdminLoginState = {
  message: string;
};

export async function loginAdmin(
  _previousState: AdminLoginState,
  formData: FormData,
): Promise<AdminLoginState> {
  const rateLimit = await consumeLoginAttempt();
  if (!rateLimit.allowed) {
    return { message: "Too many sign-in attempts. Try again later." };
  }

  const password = formData.get("password");
  if (typeof password !== "string" || !password || !process.env.ADMIN_PASSWORD || !verifyAdminPassword(password)) {
    return { message: "Invalid password." };
  }

  clearLoginAttempts(rateLimit.key);
  await createAdminSession();
  redirect("/panel-privado-camisetas");
}

export async function logoutAdmin() {
  await deleteAdminSession();
  redirect("/panel-privado-camisetas/login");
}
