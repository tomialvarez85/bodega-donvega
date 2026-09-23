"use client";

import { useEffect, useState } from "react";

import { LogoMark } from "@/components/logo-mark";
import { isAgeVerified, setAgeVerified } from "@/lib/age-gate";
import { useHydrated } from "@/lib/use-hydrated";

const solidButton =
  "inline-flex min-h-11 items-center justify-center border border-cream bg-cream px-8 py-[13px] text-center text-xs font-medium tracking-[0.07em] text-ink uppercase transition-[background-color,color,border-color,transform] duration-150 hover:-translate-y-px hover:bg-transparent hover:text-cream active:translate-y-0 motion-reduce:transition-none motion-reduce:hover:translate-y-0";
const ghostButton =
  "inline-flex min-h-11 items-center justify-center border border-cream/70 bg-transparent px-8 py-[13px] text-center text-xs font-medium tracking-[0.07em] text-cream uppercase transition-[background-color,color,border-color,transform] duration-150 hover:-translate-y-px hover:border-gold hover:text-gold active:translate-y-0 motion-reduce:transition-none motion-reduce:hover:translate-y-0";

type Status = "checking" | "verified" | "asking" | "blocked";

// Puerta de edad: tapa TODO el sitio (header, main, footer) hasta confirmar +18.
// `children` queda siempre en el árbol (nunca se omite) para que el HTML servido a
// crawlers/SEO tenga el contenido real; el overlay es una capa visual encima.
export function AgeGate({ children }: { children: React.ReactNode }) {
  const hydrated = useHydrated();
  const [blocked, setBlocked] = useState(false);
  // Se pisa apenas se confirma "Sí", así no depende de releer sessionStorage en el
  // mismo render (evita otra pasada de setState dentro de un efecto).
  const [justVerified, setJustVerified] = useState(false);

  const status: Status = !hydrated
    ? "checking"
    : blocked
      ? "blocked"
      : justVerified || isAgeVerified()
        ? "verified"
        : "asking";

  useEffect(() => {
    const blocking = status !== "verified";
    document.body.style.overflow = blocking ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [status]);

  const handleYes = () => {
    setAgeVerified();
    setJustVerified(true);
  };

  const overlayVisible = status !== "verified";

  return (
    <>
      <div className="contents" inert={overlayVisible ? true : undefined}>
        {children}
      </div>

      {overlayVisible && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Verificación de edad"
          className="fixed inset-0 z-[999] flex flex-col items-center justify-center gap-8 bg-ink px-6 text-center"
        >
          <LogoMark size={56} />

          {status === "blocked" ? (
            <div className="flex flex-col items-center gap-6">
              <h1 className="max-w-sm font-display text-2xl leading-snug text-cream sm:text-3xl">
                Este sitio es exclusivo para mayores de 18 años.
              </h1>
              <p className="max-w-sm text-sm leading-relaxed text-stone">
                No podemos mostrarte este contenido. Volvé cuando seas mayor
                de edad.
              </p>
              <a href="https://www.google.com" className={ghostButton}>
                Salir del sitio
              </a>
            </div>
          ) : status === "asking" ? (
            <div className="flex flex-col items-center gap-7">
              <h1 className="font-display text-2xl leading-snug text-cream sm:text-3xl">
                ¿Sos mayor de 18 años?
              </h1>
              <p className="max-w-sm text-sm leading-relaxed text-stone">
                Este sitio pertenece a una bodega. Para ingresar tenés que
                confirmar que sos mayor de edad.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <button type="button" className={solidButton} onClick={handleYes}>
                  Sí, soy mayor de 18
                </button>
                <button
                  type="button"
                  className={ghostButton}
                  onClick={() => setBlocked(true)}
                >
                  No
                </button>
              </div>
              <p className="text-[11px] text-stone">
                Consumo responsable. Prohibida la venta a menores.
              </p>
            </div>
          ) : null}
        </div>
      )}
    </>
  );
}
