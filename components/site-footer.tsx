import Link from "next/link";

import { FacebookIcon } from "@/components/facebook-icon";
import { GmailIcon } from "@/components/gmail-icon";
import { InstagramIcon } from "@/components/instagram-icon";
import { LogoMark } from "@/components/logo-mark";
import { TiktokIcon } from "@/components/tiktok-icon";
import { WhatsappIcon } from "@/components/whatsapp-icon";
import { CONTACT, facebookUrl, instagramUrl, tiktokUrl } from "@/lib/site";
import { businessWhatsappUrl } from "@/lib/whatsapp";

const FOOTER_LINKS = [
  { label: "Catálogo", href: "/catalogo" },
  { label: "Selección especial", href: "/promociones" },
  { label: "Visitas y Catas", href: "/visitas" },
  { label: "Nosotros", href: "/#nosotros" },
  { label: "Contacto", href: "/contacto" },
];

const columnTitle =
  "mb-5 text-[10px] font-semibold tracking-[0.12em] text-stone uppercase";
const footerLink =
  "inline-flex min-h-11 items-center text-[13px] text-line transition-colors duration-200 hover:text-gold motion-reduce:transition-none lg:min-h-0";

export function SiteFooter() {
  const whatsappUrl = businessWhatsappUrl(
    "Hola Don Vega, quería hacerles una consulta.",
  );

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
            <ul className="flex flex-col lg:gap-3">
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
            <div className="flex flex-col lg:gap-2.5">
              <a
                href={`mailto:${CONTACT.email}`}
                className={`${footerLink} inline-flex items-center gap-2.5`}
              >
                <GmailIcon />
                {CONTACT.email}
              </a>
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${footerLink} inline-flex items-center gap-2.5`}
                >
                  <WhatsappIcon />
                  {CONTACT.phone ?? "WhatsApp"}
                </a>
              )}
            </div>
          </div>

          <div>
            <p className={columnTitle}>Redes</p>
            <div className="flex flex-col lg:gap-2.5">
              <a
                href={instagramUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className={`${footerLink} inline-flex items-center gap-2.5`}
              >
                <InstagramIcon />
                @{CONTACT.instagram}
              </a>
              <a
                href={facebookUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className={`${footerLink} inline-flex items-center gap-2.5`}
              >
                <FacebookIcon />
                {CONTACT.facebook}
              </a>
              <a
                href={tiktokUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className={`${footerLink} inline-flex items-center gap-2.5`}
              >
                <TiktokIcon />
                @{CONTACT.tiktok}
              </a>
            </div>
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
