// URL pública del sitio, para metadataBase, sitemap y robots.
// Prioridad: NEXT_PUBLIC_SITE_URL (dominio propio) > dominio de producción que expone
// Vercel automáticamente > localhost en desarrollo.
function resolveSiteUrl() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");

  const vercelProduction = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercelProduction) return `https://${vercelProduction}`;

  return "http://localhost:3000";
}

export const SITE_URL = resolveSiteUrl();
export const SITE_NAME = "Don Vega";
export const SITE_DESCRIPTION =
  "Don Vega es una bodega familiar de Tinogasta, Catamarca. Vinos de altura elaborados a 1.230 metros sobre el nivel del mar, con viñedos desde 1945.";

// Datos de contacto del footer. El teléfono se muestra recién cuando se completa.
export const CONTACT = {
  email: "hola@donvega.com.ar",
  instagram: "donvegabodega",
  phone: null as string | null,
};
