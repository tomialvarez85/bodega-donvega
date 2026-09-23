import Link from "next/link";

import { ghostButton, solidButton } from "@/components/home/buttons";

export function Hero() {
  return (
    // min-h resta los 72px del header fijo (components/site-header.tsx): centra en el alto
    // visible de la pantalla, no en el alto de documento completo.
    <section
      aria-labelledby="hero-title"
      className="mx-auto flex min-h-[calc(100dvh-72px)] max-w-[1200px] flex-col items-center justify-center px-6 py-[clamp(72px,10vw,128px)] text-center sm:px-8"
    >
      <p className="mb-6 text-[11px] font-medium tracking-[0.14em] text-sand uppercase">
        Tinogasta, Catamarca — 1.230 msnm
      </p>

      <div className="mb-8 h-px w-10 bg-gold" />

      <h1
        id="hero-title"
        className="mb-10 max-w-[680px] font-display text-[clamp(48px,8vw,80px)] leading-[1.05] font-light tracking-[-0.01em] text-cream"
      >
        Vinos de altura,
        <br />
        nacidos al pie de la cordillera.
      </h1>

      <p className="mb-12 max-w-[520px] text-base leading-[1.75] text-sand">
        Más de 70 años de tradición familiar al pie de los Andes. Uvas
        cultivadas a 1.230 msnm en Tinogasta, donde la amplitud térmica y el
        sol catamarqueño concentran en cada grano lo que ningún otro suelo
        puede dar.
      </p>

      <div className="flex flex-wrap justify-center gap-4">
        <Link href="/catalogo" className={solidButton}>
          Ver catálogo
        </Link>
        <Link href="#nosotros" className={ghostButton}>
          Nuestra historia
        </Link>
      </div>

      <div className="mt-20 flex w-full max-w-[420px] items-center gap-6" aria-hidden>
        <div className="h-px flex-1 bg-hairline-mid" />
        <span className="font-display text-[13px] tracking-[0.06em] whitespace-nowrap text-sand">
          Viñedos desde 1945
        </span>
        <div className="h-px flex-1 bg-hairline-mid" />
      </div>
    </section>
  );
}
