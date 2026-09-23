import Image from "next/image";
import Link from "next/link";

import { ghostButton, solidButton } from "@/components/home/buttons";

export function Hero() {
  return (
    // min-h resta los 72px del header fijo (components/site-header.tsx): ocupa el alto
    // visible de la pantalla, no el alto de documento completo.
    <section
      aria-labelledby="hero-title"
      className="grid grid-cols-1 lg:min-h-[calc(100dvh-72px)] lg:grid-cols-2"
    >
      <div className="order-2 flex flex-col justify-center bg-[linear-gradient(160deg,#1c0810_0%,#0e0d0c_60%)] px-6 py-16 sm:px-8 lg:order-1 lg:px-[clamp(48px,6vw,96px)] lg:py-24">
        <div className="mx-auto w-full max-w-[480px] text-center lg:mx-0 lg:text-left">
          <p className="mb-6 text-[11px] font-medium tracking-[0.14em] text-sand uppercase">
            Tinogasta, Catamarca — 1.230 msnm
          </p>

          <div className="mx-auto mb-8 h-px w-10 bg-gold lg:mx-0" />

          <h1
            id="hero-title"
            className="mb-10 font-display text-[clamp(40px,6vw,64px)] leading-[1.05] font-light tracking-[-0.01em] text-cream"
          >
            Vinos de altura,
            <br />
            nacidos al pie de la cordillera.
          </h1>

          <p className="mb-12 text-base leading-[1.75] text-sand">
            Más de 70 años de tradición familiar al pie de los Andes. Uvas
            cultivadas a 1.230 msnm en Tinogasta, donde la amplitud térmica y
            el sol catamarqueño concentran en cada grano lo que ningún otro
            suelo puede dar.
          </p>

          <div className="mb-16 flex flex-wrap justify-center gap-4 lg:justify-start">
            <Link href="/catalogo" className={solidButton}>
              Ver catálogo
            </Link>
            <Link href="#nosotros" className={ghostButton}>
              Nuestra historia
            </Link>
          </div>

          <div className="flex w-full items-center gap-6" aria-hidden>
            <div className="h-px flex-1 bg-hairline-mid" />
            <span className="font-display text-[13px] tracking-[0.06em] whitespace-nowrap text-sand">
              Viñedos desde 1945
            </span>
            <div className="h-px flex-1 bg-hairline-mid" />
          </div>
        </div>
      </div>

      <div className="relative order-1 h-[40vh] lg:order-2 lg:h-auto">
        <Image
          src="/products/imghome.jpg"
          alt="Viñedos de altura de Don Vega, con la cordillera de fondo"
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
        />
        {/* Funde el borde de la imagen con el panel de texto, en vez de un corte duro. */}
        <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-24 bg-gradient-to-r from-[#0e0d0c] to-transparent lg:block" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#0e0d0c] to-transparent lg:hidden" />
      </div>
    </section>
  );
}
