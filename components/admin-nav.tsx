"use client";

import {
  Boxes,
  Compass,
  LayoutDashboard,
  Package,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const ITEMS = [
  { label: "Resumen", href: "/admin", icon: LayoutDashboard, exact: true },
  { label: "Productos", href: "/admin/productos", icon: Package },
  { label: "Combos", href: "/admin/combos", icon: Boxes },
  { label: "Visitas", href: "/admin/visitas", icon: Compass },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Administración" className="flex flex-wrap gap-1 md:flex-col">
      {ITEMS.map(({ label, href, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-2.5 px-3 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-gold/40 focus-visible:outline-none",
              active
                ? "bg-cream text-ink"
                : "text-sand hover:bg-muted hover:text-cream",
            )}
          >
            <Icon className="h-4 w-4" strokeWidth={1.75} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
