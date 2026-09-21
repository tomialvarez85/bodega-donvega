import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  signSessionToken,
  verifySessionToken,
} from "./token";

// Path limitado a /admin: el navegador no manda la cookie al sitio público.
const COOKIE_PATH = "/admin";

export async function createSession() {
  const token = await signSessionToken();
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: COOKIE_PATH,
    maxAge: SESSION_MAX_AGE,
  });
}

export async function destroySession() {
  (await cookies()).set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: COOKIE_PATH,
    maxAge: 0,
  });
}

export const hasValidSession = cache(async () =>
  verifySessionToken((await cookies()).get(SESSION_COOKIE)?.value),
);

// Segunda barrera además de proxy.ts: llamarla en cada página/acción de /admin.
export async function requireAdmin() {
  if (!(await hasValidSession())) redirect("/admin/login");
}
