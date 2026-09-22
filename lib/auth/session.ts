import "server-only";

import { redirect } from "next/navigation";
import { cache } from "react";

import { createClient } from "@/lib/supabase/server";

// Usuario de Supabase con sesión válida, o null. getUser() consulta al servidor de Auth (no se
// fía solo de la cookie), y `cache` evita repetir la consulta dentro de una misma request.
export const getAdminUser = cache(async () => {
  // Fuera del try/catch a propósito: cookies() avisa a Next que la página es dinámica lanzando
  // una señal interna que no hay que tragarse (si no, el build intentaría prerenderizar el admin).
  const supabase = await createClient();

  try {
    const { data, error } = await supabase.auth.getUser();
    return error ? null : data.user;
  } catch (error) {
    // Supabase no responde: sin verificación no hay sesión (falla cerrada).
    console.error("[auth] no se pudo verificar la sesión", error);
    return null;
  }
});

// Segunda barrera además de proxy.ts: llamarla en cada página/acción de /admin.
// El registro público de Supabase está desactivado: el único usuario es el admin.
export async function requireAdmin() {
  const user = await getAdminUser();
  if (!user) redirect("/admin/login");
  return user;
}
