import Link from "next/link";

export default function AdminNotFound() {
  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-semibold text-cream">
        No encontramos esta página
      </h1>
      <p className="mt-2 text-sm text-sand">
        El recurso no existe, se eliminó, o todavía no está implementado.
      </p>
      <Link
        href="/admin"
        className="mt-4 inline-block text-sm font-medium text-gold underline-offset-4 hover:underline"
      >
        Volver al resumen
      </Link>
    </div>
  );
}
