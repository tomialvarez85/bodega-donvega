type BodegaStripProps = {
  /** Cantidad de varietales del catálogo activo. */
  varietalCount: number;
};

export function BodegaStrip({ varietalCount }: BodegaStripProps) {
  const stats = [
    { value: "1945", label: "Año del primer viñedo" },
    { value: "1.230", label: "Metros sobre el nivel del mar" },
    ...(varietalCount > 0
      ? [{ value: String(varietalCount), label: "Variedades de alta expresión" }]
      : []),
    { value: "100%", label: "Elaboración artesanal" },
  ];

  return (
    <section
      id="nosotros"
      aria-labelledby="nosotros-title"
      className="scroll-mt-20 border-t border-hairline bg-ink"
    >
      <div className="mx-auto max-w-[1200px] px-6 py-[clamp(56px,7vw,96px)] sm:px-8">
        <div className="mb-[72px] grid grid-cols-[repeat(auto-fit,minmax(min(100%,380px),1fr))] items-center gap-16">
          <div>
            <div className="mb-7 h-px w-8 bg-gold" />
            <h2
              id="nosotros-title"
              className="mb-7 font-display text-[clamp(28px,4vw,48px)] leading-[1.12] font-light tracking-[-0.01em] text-cream"
            >
              Del suelo árido de Catamarca al cristal de tu copa.
            </h2>
            <p className="mb-4 text-sm leading-[1.75] text-line">
              Don Vega nació de la obstinación de una familia que decidió
              plantar vid en uno de los terroirs más extremos de Argentina. A
              1.230 metros sobre el nivel del mar, en el Valle de Tinogasta, el
              sol del desierto, las noches frías y los vientos de la Puna
              imprimen en cada uva un carácter singular.
            </p>
            <p className="text-sm leading-[1.75] text-line">
              Desde 1945 trabajamos la tierra con el mismo respeto: sin
              atajos, con paciencia generacional. Nuestros vinos no buscan
              premios. Buscan durar en la memoria.
            </p>
          </div>

          <div className="min-[890px]:border-l min-[890px]:border-charcoal min-[890px]:pl-12">
            <dl className="grid grid-cols-2 gap-x-8 gap-y-10">
              {stats.map((stat) => (
                <div key={stat.label} className="flex flex-col-reverse">
                  <dt className="mt-1.5 text-[11px] leading-snug tracking-[0.02em] text-stone">
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

        <div className="h-px bg-charcoal" />
      </div>
    </section>
  );
}
