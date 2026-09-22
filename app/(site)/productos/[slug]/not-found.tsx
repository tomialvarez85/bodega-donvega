import Link from "next/link";

export default function ProductoNoEncontrado() {
  return (
    <section className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 py-28 text-center md:py-40">
      <p className="text-xs tracking-[0.22em] text-sand uppercase">
        Error 404
      </p>
      <h1 className="font-display text-5xl leading-tight text-cream md:text-6xl">
        Este vino no está en nuestra carta
      </h1>
      <div className="h-px w-16 bg-gold" />
      <p className="max-w-xl text-lg leading-relaxed text-sand">
        Puede que ya no esté disponible o que el enlace sea incorrecto.
      </p>
      <Link
        href="/catalogo"
        className="relative after:absolute after:inset-x-0 after:top-1/2 after:h-11 after:-translate-y-1/2 after:content-[''] border-b border-gold pb-1 text-xs tracking-[0.18em] text-gold uppercase transition-colors hover:text-cream focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
      >
        Ver el catálogo
      </Link>
    </section>
  );
}
