import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL no está definida. Copiá .env.example a .env y pegá tu connection string.",
  );
}

// En dev, HMR re-evalúa este módulo: cacheamos el cliente para no abrir conexiones de más.
const globalForDb = globalThis as unknown as {
  pgClient?: ReturnType<typeof postgres>;
};

const isLocal = /@(localhost|127\.0\.0\.1|\[::1\])[:/]/.test(connectionString);
const urlDecidesSsl = /[?&]sslmode=/.test(connectionString);

const client =
  globalForDb.pgClient ??
  postgres(connectionString, {
    // prepare: false => compatible con el pooler de Supabase (modo transaction) y con Neon.
    prepare: false,
    // Bases alojadas (Supabase, Neon…) exigen TLS. Si la URL ya trae ?sslmode=, manda ella.
    ssl: isLocal || urlDecidesSsl ? undefined : "require",
    // Serverless: cada instancia abre pocas conexiones y las suelta rápido, para no agotar
    // el pool de la base cuando escala.
    max: process.env.NODE_ENV === "production" ? 5 : 10,
    idle_timeout: 20,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.pgClient = client;
}

export const db = drizzle(client, { schema });
export { client as sql };
