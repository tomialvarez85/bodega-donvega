import { createBrowserClient } from "@supabase/ssr";

import { getSupabaseEnv } from "./env";

// Cliente para Client Components. El login y el logout del admin pasan por Server Actions
// (las cookies de sesión se escriben en el servidor), así que hoy no se usa en ningún lado;
// queda listo para cuando un componente de cliente lo necesite.
export function createClient() {
  const { url, anonKey } = getSupabaseEnv();
  return createBrowserClient(url, anonKey);
}
