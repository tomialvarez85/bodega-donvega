import "dotenv/config";

import { inArray, sql as dsql } from "drizzle-orm";

import { db, sql } from "../lib/db";
import { products, type NewProduct } from "../lib/schema";

// Los 5 vinos reales de la bodega (fichas técnicas oficiales).
//
// Uso:
//   npm run db:seed                       inserta los que falten; NO toca los que ya existen
//   npm run db:seed -- --update           además refresca ficha técnica, cata y premios de los
//                                         existentes (nunca pisa precio, stock, estado ni descripción)
//   npm run db:seed -- --clean-demo       además borra los 10 vinos de fantasía de la primera versión

// Datos comunes a toda la producción de la bodega.
const common = {
  origin: "Tinogasta, Catamarca",
  enologist: "Victor Vega",
  altitudeMasl: 1230,
  vineyardSince: 1945,
  irrigation: "Por surco, agua de vertiente canalizada",
  conduction: "Parral antiguo denominado majuelo",
  soil: "Franco arenoso",
  // Placeholders: los valores reales se cargan después desde el panel de admin.
  price: "0",
  stock: 20,
  active: true,
} satisfies Partial<NewProduct>;

const seedProducts: NewProduct[] = [
  {
    ...common,
    name: "Malbec Reserva",
    slug: "malbec-reserva",
    line: "DV",
    varietal: "Malbec",
    vintage: 2025,
    category: "Tinto",
    alcoholPercentage: "13.6",
    aging: "6 meses en roble francés",
    bottlesProduced: 10000,
    isNewRelease: false,
    imageUrl: "/products/malbec-reserva.png",
    tastingSight: "Rojo profundo e intenso, con elegantes matices violáceos",
    tastingNose:
      "Expresión aromática definida, donde la madera se integra con sutileza aportando notas de vainilla y chocolate, en armonía con la fruta roja y negra del varietal, destacándose guinda, frutilla y mora",
    tastingPalate:
      "Entrada equilibrada y sedosa, con un paso aterciopelado que prolonga los aromas y deja una sensación persistente",
    awards: [
      {
        points: 94,
        award: "Racimo de Oro",
        contest: "Concurso Latinoamericano de Vinos Artesanales 2024",
      },
      { points: 94, award: null, contest: "VinoSub30 Argentina 2024" },
    ],
  },
  {
    ...common,
    name: "Cabernet Franc",
    slug: "cabernet-franc",
    line: "DV",
    varietal: "Cabernet Franc",
    vintage: 2025,
    category: "Tinto",
    alcoholPercentage: "13.5",
    aging: "Sin crianza en madera",
    bottlesProduced: 10000,
    isNewRelease: true,
    imageUrl: "/products/cabernet-franc.png",
    tastingSight:
      "Rojo rubí intenso, con matices violáceos, alta densidad y estructura",
    tastingNose:
      "Aromas intensos, complejos y salvajes. Frutos rojos y notas herbales",
    tastingPalate:
      "Entrada suave y sedosa, con taninos finos, buena acidez que marca frescura y un final largo que perdura",
    awards: [],
  },
  {
    ...common,
    name: "Malbec Joven",
    slug: "malbec-joven",
    line: "DV",
    varietal: "Malbec",
    vintage: 2025,
    category: "Tinto",
    alcoholPercentage: "13.8",
    aging: "Sin crianza en madera",
    bottlesProduced: 10000,
    isNewRelease: false,
    imageUrl: "/products/malbec-joven.png",
    tastingSight: "Rojo rubí intenso y brillante, de gran vivacidad",
    tastingNose:
      "Perfil aromático expresivo y fresco, dominado por frutos rojos, con especial presencia de frutilla, acompañado por delicadas notas especiadas que aportan complejidad",
    tastingPalate:
      "Entrada suave y equilibrada, de paso amable y muy agradable, donde se confirman los aromas frutales en el retrogusto",
    awards: [
      {
        points: 93,
        award: "Racimo de Plata",
        contest: "Concurso Latinoamericano de Vinos Artesanales 2024",
      },
    ],
  },
  {
    ...common,
    name: "ADN Cabernet Sauvignon",
    slug: "adn-cabernet-sauvignon",
    line: "ADN",
    varietal: "Cabernet Sauvignon",
    vintage: 2025,
    category: "Tinto",
    alcoholPercentage: "13.5",
    aging: "Sin crianza en madera",
    bottlesProduced: 5000,
    isNewRelease: false,
    imageUrl: "/products/adn-cabernet-sauvignon.png",
    tastingSight: "Rojo rubí intenso con reflejos violáceos",
    tastingNose:
      "Fruta negra definida (mora, arándano), con elegantes notas herbáceas de pimiento rojo asado y sutiles especias",
    tastingPalate:
      "Taninos firmes y maduros, buen volumen y estructura. Equilibrado, con final largo y persistente",
    awards: [
      {
        points: 92,
        award: "Racimo de Oro",
        contest: "Concurso Latinoamericano de Vinos Artesanales 2024",
      },
    ],
  },
  {
    ...common,
    name: "ADN Bonarda",
    slug: "adn-bonarda",
    line: "ADN",
    varietal: "Bonarda",
    vintage: 2025,
    category: "Tinto",
    alcoholPercentage: "13.8",
    aging: "6 meses en roble francés",
    bottlesProduced: 5000,
    isNewRelease: false,
    imageUrl: "/products/adn-bonarda.png",
    tastingSight: "Color violáceo intenso y profundo, de gran brillo",
    tastingNose:
      "Aromas definidos de frutos rojos, destacándose frutilla y mora. La crianza en madera aporta elegantes notas especiadas, vainilla y chocolate amargo, logrando un conjunto complejo y equilibrado",
    tastingPalate:
      "Entrada amable, de textura suave, con buen volumen. En el retrogusto se reafirman los aromas frutales y especiados percibidos en nariz",
    awards: [
      {
        points: 91,
        award: "Racimo de Oro",
        contest: "Concurso Latinoamericano de Vinos Artesanales 2024",
      },
    ],
  },
];

// Vinos de fantasía de la primera versión del seed (ya no forman parte del catálogo).
const DEMO_SLUGS = [
  "don-vega-clasico-malbec",
  "don-vega-clasico-cabernet-sauvignon",
  "don-vega-reserva-malbec",
  "don-vega-reserva-cabernet-franc",
  "don-vega-gran-reserva-blend",
  "don-vega-clasico-torrontes",
  "don-vega-reserva-chardonnay",
  "don-vega-clasico-rose-de-malbec",
  "don-vega-brut-nature",
  "don-vega-gran-reserva-malbec-2017",
];

// Campos que el dueño edita desde el panel: `--update` nunca los pisa.
const PRESERVED_FIELDS = ["price", "stock", "active", "description", "imageUrl"];

async function main() {
  const flags = new Set(process.argv.slice(2));
  const update = flags.has("--update");

  if (flags.has("--clean-demo")) {
    const removed = await db
      .delete(products)
      .where(inArray(products.slug, DEMO_SLUGS))
      .returning({ slug: products.slug });
    console.log(`Vinos de fantasía eliminados: ${removed.length}.`);
  }

  let inserted = 0;
  let updated = 0;
  let skipped = 0;

  for (const product of seedProducts) {
    if (update) {
      // Refresca ficha técnica, cata y premios; el resto queda como esté.
      const content = Object.fromEntries(
        Object.entries(product).filter(([key]) => !PRESERVED_FIELDS.includes(key)),
      );
      const [row] = await db
        .insert(products)
        .values(product)
        .onConflictDoUpdate({ target: products.slug, set: content })
        .returning({ inserted: dsql<boolean>`(xmax = 0)` });
      if (row.inserted) inserted++;
      else updated++;
    } else {
      const rows = await db
        .insert(products)
        .values(product)
        .onConflictDoNothing({ target: products.slug })
        .returning({ id: products.id });
      if (rows.length > 0) inserted++;
      else skipped++;
    }
  }

  console.log(
    `Seed OK: ${inserted} insertados, ${updated} actualizados, ${skipped} ya existían (no se tocaron).`,
  );
}

main()
  .catch((error) => {
    console.error("Seed falló:", error);
    process.exitCode = 1;
  })
  .finally(() => sql.end());
