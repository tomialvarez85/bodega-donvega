import type { Metadata } from "next";
import { LogOut } from "lucide-react";

import { AdminNav } from "@/components/admin-nav";
import { Toaster } from "@/components/ui/sonner";
import { requireAdmin } from "@/lib/auth/session";

import { logout } from "../login/actions";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s — Admin Don Vega" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-ink font-sans text-cream md:flex-row">
      <aside className="flex flex-col gap-4 border-b border-input bg-card p-4 md:w-56 md:shrink-0 md:gap-8 md:border-r md:border-b-0 md:p-5">
        <div className="flex items-center justify-between md:block">
          <p className="text-sm font-semibold text-cream">Don Vega</p>
          <p className="text-xs text-stone">Panel de administración</p>
        </div>

        <AdminNav />

        <form action={logout} className="md:mt-auto">
          <button
            type="submit"
            className="flex w-full items-center gap-2.5 px-3 py-2 text-sm font-medium text-sand transition-colors hover:bg-muted hover:text-cream focus-visible:ring-2 focus-visible:ring-gold/40 focus-visible:outline-none"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.75} />
            Cerrar sesión
          </button>
        </form>
      </aside>

      <div className="min-w-0 flex-1 p-4 md:p-8">{children}</div>
      <Toaster />
    </div>
  );
}
