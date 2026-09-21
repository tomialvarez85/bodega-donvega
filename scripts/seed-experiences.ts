import "dotenv/config";

import { db, sql } from "../lib/db";
import { experiences, type NewExperience } from "../lib/schema";

// Paquetes de visitas y catas de EJEMPLO. Todo el contenido (textos, duraciones, precios, cupos e
// imagen) es provisorio: reemplazalo desde el panel de admin (o editando este archivo y corriendo
// `npm run db:seed-experiences`) con los datos reales de la bodega.
//
// Inserta los que falten por slug; NO toca los que ya existen.

// Imagen provisoria: el logo. Se pisa al cargar la foto real de cada experiencia.
const placeholderImage = "/logo.png";

const seedExperiences: NewExperience[] = [
  {
    name: "Recorrido Básico",
    slug: "recorrido-basico",
    description:
      "Un paseo por el viñedo y la bodega para conocer cómo se elaboran nuestros vinos en Tinogasta, desde la cosecha hasta la guarda. Al final, una degustación de dos vinos de la línea DV.",
    durationMinutes: 60,
    price: "12000",
    priceUnit: "por persona",
    maxGroupSize: 15,
    imageUrl: placeholderImage,
    active: true,
  },
  {
    name: "Cata Premium",
    slug: "cata-premium",
    description:
      "Una cata guiada por el enólogo con cuatro vinos de la bodega, acompañada de una tabla de quesos y fiambres regionales. Recorrido por el viñedo incluido.",
    durationMinutes: 120,
    price: "28000",
    priceUnit: "por persona",
    maxGroupSize: 10,
    imageUrl: placeholderImage,
    active: true,
  },
  {
    name: "Experiencia Privada",
    slug: "experiencia-privada",
    description:
      "Visita y cata a medida para grupos, empresas o celebraciones. Armamos el recorrido, la selección de vinos y el almuerzo entre vos y nosotros.",
    durationMinutes: 180,
    price: "150000",
    priceUnit: "por grupo",
    maxGroupSize: 20,
    imageUrl: placeholderImage,
    active: true,
  },
];

async function main() {
  let inserted = 0;
  let skipped = 0;

  for (const experience of seedExperiences) {
    const rows = await db
      .insert(experiences)
      .values(experience)
      .onConflictDoNothing({ target: experiences.slug })
      .returning({ id: experiences.id });
    if (rows.length > 0) inserted++;
    else skipped++;
  }

  console.log(
    `Seed de experiencias OK: ${inserted} insertadas, ${skipped} ya existían (no se tocaron).`,
  );
}

main()
  .catch((error) => {
    console.error("Seed de experiencias falló:", error);
    process.exitCode = 1;
  })
  .finally(() => sql.end());
