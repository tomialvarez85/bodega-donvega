import { AgeGate } from "@/components/age-gate";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AgeGate>
      <a
        href="#contenido"
        className="absolute top-2 left-4 z-[100] -translate-y-16 bg-ink px-4 py-2 text-xs text-cream transition-transform focus:translate-y-0"
      >
        Ir al contenido
      </a>
      <SiteHeader />
      <main id="contenido" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </AgeGate>
  );
}
