"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function SiteError({
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
    <section className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 py-28 text-center md:py-40">
      <p className="text-xs tracking-[0.22em] text-sand uppercase">
        Algo salió mal
      </p>
      <h1 className="font-display text-5xl leading-tight text-cream md:text-6xl">
        No pudimos cargar esta página
      </h1>
      <div className="h-px w-16 bg-gold" />
      <p className="max-w-xl text-lg leading-relaxed text-sand">
        Fue un problema de nuestro lado. Probá de nuevo en unos segundos.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-8">
        <button
          type="button"
          onClick={() => retry()}
          className="border-b border-gold pb-1 text-xs tracking-[0.18em] text-gold uppercase transition-colors hover:text-cream"
        >
          Reintentar
        </button>
        <Link
          href="/"
          className="border-b border-sand pb-1 text-xs tracking-[0.18em] text-sand uppercase transition-colors hover:text-gold"
        >
          Ir al inicio
        </Link>
      </div>
    </section>
  );
}
