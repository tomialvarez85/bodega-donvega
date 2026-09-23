import Image from "next/image";

type BodegaStripProps = {
  /** Cantidad de vinos activos del catálogo. */
  varietalCount: number;
};

export function BodegaStrip({ varietalCount }: BodegaStripProps) {
  const stats = [
    { value: "70+", label: "Años de historia" },
    { value: "1.230", label: "Metros sobre el mar" },
    ...(varietalCount > 0
      ? [{ value: String(varietalCount), label: "Varietales únicos" }]
      : []),
  ];

  return (
    <section
      id="nosotros"
      aria-labelledby="nosotros-title"
      className="scroll-mt-20 grid grid-cols-1 border-t border-hairline lg:grid-cols-2"
    >
      <div className="order-2 flex flex-col justify-center bg-ink px-6 py-16 sm:px-8 lg:order-2 lg:px-[clamp(48px,6vw,96px)] lg:py-24">
        <div className="mx-auto w-full max-w-[480px] lg:mx-0">
          <div className="mb-8 flex items-center justify-center gap-5 lg:justify-start">
            <div className="h-px w-7 bg-gold" />
            <p className="text-[11px] font-medium tracking-[0.14em] text-sand uppercase">
              Nuestra historia
            </p>
            <div className="h-px w-7 bg-gold" />
          </div>

          <h2
            id="nosotros-title"
            className="mb-7 text-center font-display text-[clamp(32px,4.5vw,52px)] leading-[1.12] font-light tracking-[-0.01em] text-cream lg:text-left"
          >
            Tres generaciones tejiendo{" "}
            <span className="italic text-gold">tierra y vino</span>
          </h2>

          <p className="mb-4 text-center text-sm leading-[1.75] text-line lg:text-left">
            Todo empezó en Tinogasta, Catamarca, cuando Don Vega plantó las
            primeras vides convencido de que este suelo guardaba algo que el
            mundo no había descubierto todavía. Hoy, más de 70 años después,
            seguimos cultivando con las mismas manos y el mismo respeto por
            la tierra.
          </p>
          <p className="mb-10 text-center text-sm leading-[1.75] text-line lg:text-left">
            Nuestros vinos son artesanales de verdad. Sin atajos, sin
            aditivos industriales. Solo la uva, el tiempo y el conocimiento
            que se hereda de generación en generación en la bodega familiar.
          </p>

          <div className="mb-8 h-px bg-hairline-mid" />
          <p className="mb-8 text-center font-display text-lg italic text-gold lg:text-left">
            — Familia Vega
          </p>
          <div className="mb-10 h-px bg-hairline-mid" />

          <dl className="flex flex-wrap justify-center gap-x-10 gap-y-6 lg:justify-start">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col-reverse">
                <dt className="mt-1.5 text-[11px] tracking-[0.06em] text-stone uppercase">
                  {stat.label}
                </dt>
                <dd className="font-display text-4xl leading-none font-light text-gold">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className="relative order-1 h-[40vh] lg:order-1 lg:h-auto">
        <Image
          src="/products/18.jpg"
          alt="Manos de la familia Vega cosechando uvas y sirviendo vino"
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
        />
        {/* Funde el borde de la imagen con el panel de texto, en vez de un corte duro. */}
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-24 bg-gradient-to-l from-[#0e0d0c] to-transparent lg:block" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#0e0d0c] to-transparent lg:hidden" />
      </div>
    </section>
  );
}
