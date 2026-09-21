"use client";

import { useEffect } from "react";

export default function AdminError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-semibold text-cream">
        Ocurrió un error
      </h1>
      <p className="mt-2 text-sm text-sand">
        No se pudo cargar esta pantalla. Suele ser un problema temporal con la
        base de datos.
        {error.digest ? ` (código ${error.digest})` : ""}
      </p>
      <button
        type="button"
        onClick={() => retry()}
        className="mt-4 h-10 bg-cream px-5 text-sm font-medium text-ink transition-colors hover:bg-cream/90"
      >
        Reintentar
      </button>
    </div>
  );
}
