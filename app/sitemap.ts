import { eq } from "drizzle-orm";
import type { MetadataRoute } from "next";

import { db } from "@/lib/db";
import { products } from "@/lib/schema";
import { SITE_URL } from "@/lib/site";

// Se arma en cada request: así el build no depende de la base de datos y los productos
// nuevos aparecen sin redeploy.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/catalogo`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/promociones`, changeFrequency: "weekly", priority: 0.8 },
  ];

  try {
    const rows = await db
      .select({ slug: products.slug, createdAt: products.createdAt })
      .from(products)
      .where(eq(products.active, true));

    return [
      ...staticRoutes,
      ...rows.map((product) => ({
        url: `${SITE_URL}/productos/${product.slug}`,
        lastModified: product.createdAt,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
    ];
  } catch (error) {
    // Si la base no responde, servimos al menos las páginas fijas.
    console.error("[sitemap] no se pudieron leer los productos", error);
    return staticRoutes;
  }
}
