import { requireAdmin } from "@/lib/auth/session";
import { getActiveNewsletterSubscribersForExport } from "@/lib/newsletter-queries";

// GET /admin/newsletter/export: descarga un .csv con los suscriptores activos (email y fecha de
// suscripción), listo para importar en Mailchimp, Brevo o cualquier otra herramienta. No manda
// ningún mail: es solo la exportación de la lista.

// Una celda de CSV va entre comillas si tiene coma, comillas o un salto de línea; las comillas
// internas se duplican (regla estándar de RFC 4180).
function csvCell(value: string) {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export async function GET() {
  await requireAdmin();

  const subscribers = await getActiveNewsletterSubscribersForExport();

  const rows = [
    ["email", "fecha_de_suscripcion"],
    ...subscribers.map((s) => [
      s.email,
      s.subscribedAt.toISOString().slice(0, 10),
    ]),
  ];
  const csv = rows.map((row) => row.map(csvCell).join(",")).join("\r\n");

  // BOM UTF-8: para que Excel detecte bien los acentos si alguien lo abre ahí antes de subirlo.
  const body = "﻿" + csv;
  const filename = `don-vega-newsletter-${new Date().toISOString().slice(0, 10)}.csv`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
