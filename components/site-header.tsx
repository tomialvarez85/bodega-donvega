import { User } from "lucide-react";
import Link from "next/link";

import { CartSheet } from "@/components/cart-sheet";
import { CartTrigger } from "@/components/cart-trigger";
import { LogoMark } from "@/components/logo-mark";
import { MobileNav } from "@/components/mobile-nav";

// "Nosotros" vive en el Home; "Contacto" tiene su propia página con la ubicación de la bodega.
const NAV_LINKS = [
  { label: "Catálogo", href: "/catalogo" },
  { label: "Selección especial", href: "/promociones" },
  { label: "Visitas y Catas", href: "/visitas" },
  { label: "Nosotros", href: "/#nosotros" },
  { label: "Contacto", href: "/contacto" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-ink">
      <div className="mx-auto flex h-[72px] max-w-[1200px] items-center justify-between gap-6 px-6 sm:px-8">
        <Link
          href="/"
          aria-label="Don Vega, página de inicio"
          className="flex items-center gap-3.5"
        >
          <LogoMark size={44} />
          <span>
            <span className="block font-display text-lg leading-none tracking-[0.14em] text-cream uppercase">
              Don Vega
            </span>
            <span className="mt-[3px] block text-[9px] leading-tight font-medium tracking-[0.12em] text-sand uppercase">
              Vino artesanal de altura
            </span>
          </span>
        </Link>

        <nav aria-label="Principal" className="hidden lg:block">
          <ul className="flex gap-7 xl:gap-10">
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="relative pb-0.5 text-xs font-medium tracking-[0.06em] text-cream uppercase transition-colors duration-200 after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-gold after:transition-[width] after:duration-300 hover:text-gold hover:after:w-full motion-reduce:transition-none motion-reduce:after:transition-none"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2 sm:gap-4">
          <CartTrigger />
          {/* Acceso del administrador: /admin manda al login si no hay sesión. */}
          <Link
            href="/admin"
            prefetch={false}
            aria-label="Acceso administrador"
            title="Acceso administrador"
            className="flex h-10 w-10 items-center justify-center text-cream transition-colors hover:text-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          >
            <User className="h-5 w-5" strokeWidth={1.5} />
          </Link>
          <MobileNav links={NAV_LINKS} />
        </div>
      </div>
      <CartSheet />
    </header>
  );
}
