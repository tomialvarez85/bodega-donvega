"use server";

import { redirect } from "next/navigation";

import {
  AdminNotConfiguredError,
  checkAdminCredentials,
} from "@/lib/auth/credentials";
import { createSession, destroySession } from "@/lib/auth/session";

export type LoginState = { error?: string } | undefined;

// Solo rutas internas de /admin: evita usar ?next= como open redirect.
function safeNext(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return "/admin";
  if (!value.startsWith("/admin") || value.startsWith("//")) return "/admin";
  if (value.startsWith("/admin/login")) return "/admin";
  return value;
}

export async function login(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
    return { error: "Ingresá tu email y contraseña." };
  }

  try {
    if (!(await checkAdminCredentials(email, password))) {
      return { error: "Email o contraseña incorrectos." };
    }
    await createSession();
  } catch (error) {
    console.error("[admin login]", error);
    return {
      error:
        error instanceof AdminNotConfiguredError
          ? "El acceso de administrador no está configurado en el servidor."
          : "No se pudo iniciar sesión. Revisá la configuración del servidor.",
    };
  }

  redirect(safeNext(formData.get("next")));
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}
