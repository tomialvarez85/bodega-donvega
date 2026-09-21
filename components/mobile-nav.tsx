"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

type MobileNavProps = {
  links: { label: string; href: string }[];
};

// Menú del header para pantallas < lg, donde la navegación horizontal está oculta.
export function MobileNav({ links }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Abrir menú"
        aria-expanded={open}
        className="flex h-10 w-10 items-center justify-center text-cream transition-colors hover:text-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold lg:hidden"
      >
        <Menu className="h-5 w-5" strokeWidth={1.5} />
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          showCloseButton={false}
          className="gap-0 border-gold/40 bg-ink p-0 shadow-none data-[side=right]:w-full data-[side=right]:sm:max-w-xs"
        >
          <SheetHeader className="flex-row items-center justify-between border-b border-gold/40 px-6 py-5">
            <div>
              <SheetTitle className="font-display text-3xl leading-none text-cream">
                Menú
              </SheetTitle>
              <SheetDescription className="sr-only">
                Navegación principal del sitio.
              </SheetDescription>
            </div>
            <SheetClose
              aria-label="Cerrar menú"
              className="flex h-10 w-10 items-center justify-center text-cream transition-colors hover:text-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              <X className="h-5 w-5" strokeWidth={1.5} />
            </SheetClose>
          </SheetHeader>

          <nav aria-label="Principal" className="px-6">
            <ul>
              {links.map((link) => (
                <li key={link.label} className="border-b border-hairline">
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="block py-5 text-sm font-medium tracking-[0.06em] text-cream uppercase transition-colors hover:text-gold"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
}
