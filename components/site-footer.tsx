import Link from "next/link";

import { LogoMark } from "@/components/logo-mark";
import { CONTACT } from "@/lib/site";

// lucide-react v1 ya no incluye íconos de marcas.
function InstagramIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

const FOOTER_LINKS = [
  { label: "Catálogo", href: "/catalogo" },
  { label: "Selección especial", href: "/promociones" },
  { label: "Nosotros", href: "/#nosotros" },
  { label: "Contacto", href: "#contacto" },
];

const columnTitle =
  "mb-5 text-[10px] font-semibold tracking-[0.12em] text-stone uppercase";
const footerLink =
  "text-[13px] text-line transition-colors duration-200 hover:text-gold motion-reduce:transition-none";

export function SiteFooter() {
  return (
    <footer id="contacto" className="scroll-mt-20 border-t border-hairline bg-ink">
      <div className="mx-auto max-w-[1200px] px-6 pt-12 pb-10 sm:px-8">
        <div className="mb-12 grid grid-cols-[repeat(auto-fit,minmax(min(100%,200px),1fr))] gap-10">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <LogoMark size={36} />
              <span>
                <span className="block font-display text-sm tracking-[0.14em] text-cream uppercase">
                  Don Vega
                </span>
                <span className="mt-0.5 block text-[9px] tracking-[0.1em] text-stone uppercase">
                  Vino artesanal de altura
                </span>
              </span>
            </div>
            <p className="text-xs leading-relaxed text-stone">
              Tinogasta, Catamarca,
              <br />
              Argentina.
            </p>
          </div>

          <nav aria-label="Pie de página">
            <p className={columnTitle}>Navegación</p>
            <ul className="flex flex-col gap-3">
              {FOOTER_LINKS.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className={footerLink}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className={columnTitle}>Contacto</p>
            <div className="flex flex-col gap-2.5">
              <a href={`mailto:${CONTACT.email}`} className={footerLink}>
                {CONTACT.email}
              </a>
              {CONTACT.phone && (
                <span className="text-[13px] text-stone">{CONTACT.phone}</span>
              )}
            </div>
          </div>

          <div>
            <p className={columnTitle}>Redes</p>
            <a
              href={`https://instagram.com/${CONTACT.instagram}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`${footerLink} inline-flex items-center gap-2.5`}
            >
              <InstagramIcon />
              @{CONTACT.instagram}
            </a>
          </div>
        </div>

        <div className="mb-6 h-px bg-[#1e1c1a]" />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-[11px] text-stone">
            © {new Date().getFullYear()} Don Vega. Todos los derechos
            reservados.
          </p>
          <p className="text-[11px] text-stone">
            Consumo responsable. Prohibida la venta a menores.
          </p>
        </div>
      </div>
    </footer>
  );
}
