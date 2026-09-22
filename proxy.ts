import { NextResponse, type NextRequest } from "next/server";

import { updateSession, withCookiesFrom } from "@/lib/supabase/proxy";

// Next 16: "middleware" pasó a llamarse "proxy" (este archivo cumple el rol de middleware.ts).
// Refresca la sesión de Supabase y hace de barrera optimista: las páginas y acciones de /admin
// vuelven a verificar con requireAdmin().
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isLogin = pathname === "/admin/login";

  let session: Awaited<ReturnType<typeof updateSession>> | null = null;
  try {
    session = await updateSession(request);
  } catch (error) {
    // Falla cerrada: sin configuración o sin respuesta de Supabase, no hay sesión válida.
    console.error("[proxy] no se pudo verificar la sesión", error);
  }
  const authenticated = session?.authenticated ?? false;
  const passThrough = () => session?.response() ?? NextResponse.next();

  if (isLogin) {
    return authenticated
      ? withCookiesFrom(passThrough(), NextResponse.redirect(new URL("/admin", request.url)))
      : passThrough();
  }

  // Una Server Action sin sesión no se redirige acá: un 307 a un POST rompe la pantalla con
  // "unexpected response". Cada acción de /admin llama a requireAdmin() antes de hacer nada, y
  // ese redirect sí lo entiende el cliente.
  if (!authenticated && request.headers.has("next-action")) {
    return passThrough();
  }

  if (!authenticated) {
    const loginUrl = new URL("/admin/login", request.url);
    if (pathname !== "/admin") loginUrl.searchParams.set("next", pathname + search);
    return withCookiesFrom(passThrough(), NextResponse.redirect(loginUrl));
  }

  return passThrough();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
