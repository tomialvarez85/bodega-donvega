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

// --- Ubicación y atención al público ---------------------------------------------------------
// Todo lo que sigue se muestra en /contacto y en /visitas. Editá los valores acá.
export const LOCATION = {
  // TODO: reemplazar por la dirección real que pase el dueño de la bodega
  // (ej. "Ruta Provincial 46 km 3, Tinogasta, Catamarca").
  address: "DIRECCIÓN_PENDIENTE, Tinogasta, Catamarca",

  // Una línea por franja. Se muestran tal cual.
  hours: ["Lunes a sábado de 9 a 18 hs"],

  // Indicaciones prácticas de acceso, un párrafo por elemento: caminos de tierra, distancia desde
  // la ciudad, dónde estacionar, etc. Si queda vacío, no se muestra la sección.
  directions: [
    "Próximamente vamos a publicar acá las indicaciones de acceso a la bodega.",
  ] as string[],
};

// Lo que se le pasa a Google Maps. Mientras la dirección sea el placeholder se usa solo la
// localidad, para que el mapa y la ruta funcionen igual (apuntan a Tinogasta).
function mapQuery(address: string) {
  const pending = /PENDIENTE/i.test(address);
  const cleaned = pending
    ? address.split(",").slice(1).join(",").trim()
    : address.trim();
  return cleaned || "Tinogasta, Catamarca, Argentina";
}

// Mapa embebido sin API key.
export const mapEmbedUrl = (address: string) =>
  `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery(address))}&z=15&output=embed`;

// Ruta ya armada hacia la bodega (abre Google Maps con el destino cargado).
export const directionsUrl = (address: string) =>
  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(mapQuery(address))}`;

export const instagramUrl = () => `https://instagram.com/${CONTACT.instagram}`;
