"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

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
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      // 400 = credenciales inválidas; cualquier otra cosa es un problema del servicio.
      if (error.status === 400 || error.code === "invalid_credentials") {
        return { error: "Email o contraseña incorrectos." };
      }
      console.error("[admin login]", error);
      return { error: "No se pudo iniciar sesión. Probá de nuevo en un momento." };
    }
  } catch (error) {
    console.error("[admin login]", error);
    return {
      error:
        "No se pudo iniciar sesión. Revisá la configuración de Supabase del servidor.",
    };
  }

  redirect(safeNext(formData.get("next")));
}

export async function logout() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch (error) {
    console.error("[admin logout]", error);
  }
  redirect("/admin/login");
}
