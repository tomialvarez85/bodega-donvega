// Sin imports de servidor: lo usan los tres clientes de Supabase (navegador, servidor y proxy).
// Las variables NEXT_PUBLIC_* se referencian literalmente para que Next las inyecte en el cliente.

export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY en el entorno. Ver .env.example.",
    );
  }
  return { url, anonKey };
}
