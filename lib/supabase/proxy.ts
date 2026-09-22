import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getSupabaseEnv } from "./env";

// Refresca la sesión de Supabase en cada request y devuelve la respuesta con las cookies al día.
// Patrón estándar de @supabase/ssr ("updateSession"), adaptado al proxy de Next 16.
export async function updateSession(request: NextRequest) {
  const { url, anonKey } = getSupabaseEnv();
  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
        // Evita que un CDN cachee una respuesta que renueva la sesión.
        for (const [key, value] of Object.entries(headers ?? {})) {
          response.headers.set(key, value);
        }
      },
    },
  });

  // No poner código entre createServerClient y getClaims: puede romper el refresco de sesión.
  // getClaims valida el JWT (con las claves públicas del proyecto cuando las hay) y renueva el
  // token si venció. La verificación final la hace requireAdmin() con getUser().
  const { data } = await supabase.auth.getClaims();

  return { response: () => response, authenticated: Boolean(data?.claims) };
}

// Copia las cookies renovadas a una respuesta nueva (por ejemplo, un redirect).
export function withCookiesFrom(from: NextResponse, to: NextResponse) {
  for (const cookie of from.cookies.getAll()) to.cookies.set(cookie);
  from.headers.forEach((value, key) => {
    if (key === "cache-control" || key === "expires" || key === "pragma") {
      to.headers.set(key, value);
    }
  });
  return to;
}
