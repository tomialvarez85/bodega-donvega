import { formatDecimal, formatInteger } from "@/lib/format";
import type { Award, Product } from "@/lib/schema";

// Secciones de la ficha de un vino, con la jerarquía del diseño de referencia:
// eyebrow dorado + título en Cormorant + contenido en serif de cuerpo (Libre Baskerville).
// Server Components: solo tipografía.

const sectionShell =
  "mx-auto max-w-[1200px] px-[clamp(20px,5vw,80px)] py-[72px]";

export function GoldRule() {
  return (
    <div
      aria-hidden
      className="mx-auto max-w-[1200px] px-[clamp(20px,5vw,80px)]"
    >
      <div className="h-px bg-[linear-gradient(to_right,transparent,var(--color-gold),var(--color-gold),transparent)] opacity-70" />
    </div>
  );
}

function SectionHead({
  id,
  eyebrow,
  title,
}: {
  id: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <>
      <span
        aria-hidden
        className="mb-2.5 block text-[10px] tracking-[0.28em] text-gold uppercase"
      >
        {eyebrow}
      </span>
      <h2
        id={id}
        className="mb-12 font-display text-[clamp(28px,4vw,40px)] leading-[1.1] font-semibold tracking-[-0.01em] text-cream"
      >
        {title}
      </h2>
    </>
  );
}

/* ── Notas de cata ─────────────────────────────────────────────── */

const iconProps = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  className: "shrink-0",
};

const IconEye = () => (
  <svg {...iconProps}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const IconNose = () => (
  <svg {...iconProps}>
    <path d="M12 2C8 2 6 5 6 8c0 4 2 6 2 9a2 2 0 0 0 4 0 2 2 0 0 0 4 0c0-3 2-5 2-9 0-3-2-6-6-6z" />
  </svg>
);
const IconMouth = () => (
  <svg {...iconProps}>
    <path d="M8 12h8" />
    <path d="M8 12C8 15.3 9.8 17 12 17s4-1.7 4-5" />
    <circle cx="12" cy="8" r="6" strokeDasharray="2 2" />
  </svg>
);

export function TastingNotes({
  product,
}: {
  product: Pick<Product, "tastingSight" | "tastingNose" | "tastingPalate">;
}) {
  const notes = [
    { label: "Vista", text: product.tastingSight, Icon: IconEye },
    { label: "Nariz", text: product.tastingNose, Icon: IconNose },
    { label: "Boca", text: product.tastingPalate, Icon: IconMouth },
  ].filter((note) => note.text);

  if (notes.length === 0) return null;

  return (
    <section aria-labelledby="notas-de-cata" className={sectionShell}>
      <SectionHead id="notas-de-cata" eyebrow="Degustación" title="Notas de cata" />

      <div className="grid border-t border-hairline-mid sm:grid-cols-3">
        {notes.map(({ label, text, Icon }) => (
          <div
            key={label}
            className="border-hairline-mid py-7 max-sm:border-b max-sm:last:border-b-0 sm:border-r sm:px-8 sm:py-9 sm:first:pl-0 sm:last:border-r-0 sm:last:pr-0"
          >
            <div className="mb-3.5 flex items-center gap-2.5 text-[10px] tracking-[0.24em] text-gold uppercase">
              <Icon />
              {label}
              <span aria-hidden className="h-px flex-1 bg-hairline-mid" />
            </div>
            <p className="font-serif-body text-[14.5px] leading-[1.82] text-sand italic">
              {text}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── Ficha técnica ─────────────────────────────────────────────── */

type Fact = { label: string; value: string; strong?: boolean };

export function TechnicalSheet({
  product,
}: {
  product: Pick<
    Product,
    | "enologist"
    | "origin"
    | "altitudeMasl"
    | "vineyardSince"
    | "irrigation"
    | "conduction"
    | "soil"
    | "alcoholPercentage"
    | "aging"
    | "bottlesProduced"
  >;
}) {
  const facts = (
    [
      { label: "Enólogo", value: product.enologist, strong: true },
      { label: "Origen", value: product.origin },
      {
        label: "Altitud",
        value:
          product.altitudeMasl != null
            ? `${formatInteger(product.altitudeMasl)} m s.n.m.`
            : null,
      },
      {
        label: "Viñedo desde",
        value:
          product.vineyardSince != null ? String(product.vineyardSince) : null,
      },
      { label: "Riego", value: product.irrigation },
      { label: "Conducción", value: product.conduction },
      { label: "Suelo", value: product.soil },
      {
        label: "Alcohol",
        value:
          product.alcoholPercentage != null
            ? `${formatDecimal(product.alcoholPercentage)}% vol.`
            : null,
      },
      { label: "Crianza", value: product.aging },
      {
        label: "Botellas producidas",
        value:
          product.bottlesProduced != null
            ? formatInteger(product.bottlesProduced)
            : null,
      },
    ] as { label: string; value: string | null; strong?: boolean }[]
  ).filter((fact): fact is Fact => Boolean(fact.value));

  if (facts.length === 0) return null;

  // Dos tablas lado a lado, como en el diseño.
  const half = Math.ceil(facts.length / 2);
  const columns = [facts.slice(0, half), facts.slice(half)].filter(
    (column) => column.length > 0,
  );

  return (
    <section aria-labelledby="ficha-tecnica" className={sectionShell}>
      <SectionHead
        id="ficha-tecnica"
        eyebrow="Elaboración & Terroir"
        title="Ficha técnica"
      />

      <div className="grid gap-x-16 sm:grid-cols-2">
        {columns.map((rows, index) => (
          <table
            key={index}
            aria-label={`Ficha técnica, parte ${index + 1}`}
            className="w-full border-collapse"
          >
            <tbody>
              {rows.map((fact) => (
                <tr
                  key={fact.label}
                  className="border-b border-hairline-mid first:border-t"
                >
                  <th
                    scope="row"
                    className="w-[42%] py-[13px] pr-4 text-left align-top text-[10px] font-normal tracking-[0.16em] text-stone uppercase"
                  >
                    {fact.label}
                  </th>
                  <td className="py-[13px] align-top font-serif-body text-sm leading-[1.6] text-cream">
                    {fact.strong ? (
                      <strong className="font-display text-base font-bold">
                        {fact.value}
                      </strong>
                    ) : (
                      fact.value
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ))}
      </div>
    </section>
  );
}

/* ── Premios ───────────────────────────────────────────────────── */

export function AwardsBand({
  awards,
  wineName,
  vintage,
}: {
  awards: Award[];
  wineName: string;
  vintage: number | null;
}) {
  if (awards.length === 0) return null;

  const subject = `${wineName}${vintage ? ` ${vintage}` : ""}`;

  return (
    <section
      aria-label="Reconocimientos"
      className="border-y border-hairline-mid bg-white/[0.03]"
    >
      <div className="divide-y divide-hairline-mid">
        {awards.map((award, index) => (
          <div
            key={`${award.contest}-${index}`}
            className="mx-auto grid max-w-[1200px] items-center gap-8 px-[clamp(20px,5vw,80px)] py-16 sm:grid-cols-[auto_1fr] sm:gap-16"
          >
            <div
              role="img"
              aria-label={`${award.points} puntos`}
              className="relative mx-auto flex h-[140px] w-[140px] shrink-0 flex-col items-center justify-center rounded-full border-2 border-gold sm:mx-0"
            >
              <span aria-hidden className="absolute inset-1.5 rounded-full border border-gold/60" />
              <span aria-hidden className="relative font-display text-[44px] leading-none font-bold text-cream tabular-nums">
                {award.points}
              </span>
              <span aria-hidden className="relative mt-0.5 text-[9px] tracking-[0.22em] text-gold uppercase">
                puntos
              </span>
            </div>

            <div>
              <p className="mb-2.5 text-[10px] tracking-[0.26em] text-gold uppercase">
                Reconocimiento
              </p>
              <h2 className="mb-3 font-display text-[clamp(28px,4vw,42px)] leading-[1.08] font-bold text-cream">
                {award.award ?? "Puntaje"}
              </h2>
              <p className="max-w-[520px] font-serif-body text-sm leading-[1.8] text-sand italic">
                {subject} obtuvo {award.points} puntos
                {award.award ? ` y la distinción ${award.award}` : ""} en{" "}
                {award.contest}.
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
