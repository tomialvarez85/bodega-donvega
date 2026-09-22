import Link from "next/link";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

// 404 global (rutas que no existen). Lleva el marco del sitio porque vive fuera de (site).
export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 py-28 text-center md:py-40">
          <p className="text-xs tracking-[0.22em] text-sand uppercase">
            Error 404
          </p>
          <h1 className="font-display text-5xl leading-tight text-cream md:text-6xl">
            Página no encontrada
          </h1>
          <div className="h-px w-16 bg-gold" />
          <Link
            href="/catalogo"
            className="relative after:absolute after:inset-x-0 after:top-1/2 after:h-11 after:-translate-y-1/2 after:content-[''] border-b border-gold pb-1 text-xs tracking-[0.18em] text-gold uppercase transition-colors hover:text-cream focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
          >
            Ver el catálogo
          </Link>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
