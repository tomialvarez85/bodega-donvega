import { jwtVerify, SignJWT } from "jose";

// Sin next/headers ni server-only: lo importa también proxy.ts.

export const SESSION_COOKIE = "dv_admin_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 días, en segundos

function getKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "SESSION_SECRET no está definida o tiene menos de 32 caracteres. Ver .env.example.",
    );
  }
  return new TextEncoder().encode(secret);
}

export async function signSessionToken() {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getKey());
}

export async function verifySessionToken(token: string | undefined) {
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, getKey(), {
      algorithms: ["HS256"],
    });
    return payload.role === "admin";
  } catch {
    // Firma inválida, token vencido o SESSION_SECRET ausente: sin sesión.
    return false;
  }
}
