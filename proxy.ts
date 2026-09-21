import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth/token";

// Next 16: "middleware" pasó a llamarse "proxy". Barrera optimista: solo verifica
// la firma de la cookie. Las páginas de /admin vuelven a chequear con requireAdmin().
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isLogin = pathname === "/admin/login";
  const hasSession = await verifySessionToken(
    request.cookies.get(SESSION_COOKIE)?.value,
  );

  if (isLogin) {
    return hasSession
      ? NextResponse.redirect(new URL("/admin", request.url))
      : NextResponse.next();
  }

  if (!hasSession) {
    const loginUrl = new URL("/admin/login", request.url);
    if (pathname !== "/admin") loginUrl.searchParams.set("next", pathname + search);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
