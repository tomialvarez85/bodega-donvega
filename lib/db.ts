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

// prepare: false => compatible con el pooler de Supabase (modo transaction) y con Neon/Vercel.
const client =
  globalForDb.pgClient ?? postgres(connectionString, { prepare: false });

if (process.env.NODE_ENV !== "production") {
  globalForDb.pgClient = client;
}

export const db = drizzle(client, { schema });
export { client as sql };
