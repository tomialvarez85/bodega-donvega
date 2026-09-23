import { Download, Search } from "lucide-react";
import type { Metadata } from "next";

import { NewsletterActiveCell } from "@/components/admin/inline/inline-cells";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { requireAdmin } from "@/lib/auth/session";
import { formatDateTime } from "@/lib/format";
import {
  getAdminNewsletterSubscribers,
  NEWSLETTER_SUBSCRIBERS_LIMIT,
} from "@/lib/newsletter-queries";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Newsletter" };

export default async function AdminNewsletterPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  await requireAdmin();

  const { q: rawQ } = await searchParams;
  const q = (Array.isArray(rawQ) ? rawQ[0] : rawQ)?.trim() || undefined;
  const rows = await getAdminNewsletterSubscribers(q);

  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-cream">Newsletter</h1>
          <p className="text-sm text-sand">
            {rows.length} {rows.length === 1 ? "suscriptor" : "suscriptores"}
            {q ? ` que coinciden con «${q}»` : ""}
            {rows.length === NEWSLETTER_SUBSCRIBERS_LIMIT
              ? ` (se muestran los ${NEWSLETTER_SUBSCRIBERS_LIMIT} más recientes; buscá para afinar)`
              : ""}
          </p>
        </div>
        <a
          href="/admin/newsletter/export"
          className={cn(buttonVariants(), "h-10 gap-2 px-4 text-sm font-medium")}
        >
          <Download aria-hidden />
          Exportar CSV
        </a>
      </div>

      <form role="search" className="flex flex-wrap items-center gap-2">
        <label htmlFor="q" className="sr-only">
          Buscar por email
        </label>
        <input
          id="q"
          name="q"
          type="search"
          defaultValue={q}
          placeholder="Buscar por email…"
          className="h-10 w-full max-w-xs border border-input bg-card px-3 text-base text-cream outline-none placeholder:text-stone focus-visible:border-gold focus-visible:ring-2 focus-visible:ring-gold/25 md:text-sm"
        />
        <Button
          type="submit"
          variant="outline"
          className="h-10 gap-2 border-input bg-card px-4"
        >
          <Search aria-hidden />
          Buscar
        </Button>
        {q && (
          <a
            href="/admin/newsletter"
            className="px-2 text-sm text-sand underline underline-offset-4 hover:text-cream"
          >
            Limpiar
          </a>
        )}
      </form>

      <p className="text-xs text-stone">
        El CSV exportado trae solo los suscriptores <strong>activos</strong>, con su email y
        fecha de suscripción — listo para importar en Mailchimp, Brevo o la herramienta que
        uses. No se envía ningún mail desde acá.
      </p>

      <div className="border border-input bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted">
              <TableHead>Email</TableHead>
              <TableHead className="hidden sm:table-cell">Suscripto el</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="py-12 text-center text-sand">
                  {q
                    ? "Ningún suscriptor coincide con la búsqueda."
                    : "Todavía no hay suscriptores. Aparecen acá apenas alguien se suma desde el sitio."}
                </TableCell>
              </TableRow>
            )}
            {rows.map((subscriber) => (
              <TableRow key={subscriber.id}>
                <TableCell className="font-medium whitespace-normal text-cream">
                  {subscriber.email}
                  {/* En pantallas chicas, la fecha va acá. */}
                  <span className="block text-xs font-normal text-stone tabular-nums sm:hidden">
                    {formatDateTime(subscriber.subscribedAt)}
                  </span>
                </TableCell>
                <TableCell className="hidden tabular-nums sm:table-cell">
                  {formatDateTime(subscriber.subscribedAt)}
                </TableCell>
                <TableCell>
                  <NewsletterActiveCell
                    id={subscriber.id}
                    email={subscriber.email}
                    active={subscriber.active}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
