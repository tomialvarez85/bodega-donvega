import { count, eq } from "drizzle-orm";
import Link from "next/link";

import { requireAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { products } from "@/lib/schema";

export default async function AdminDashboardPage() {
  await requireAdmin();

  const [activeProducts] = await db
    .select({ value: count() })
    .from(products)
    .where(eq(products.active, true));

  const metrics = [
    {
      label: "Productos activos",
      value: activeProducts.value,
      href: "/admin/productos",
      cta: "Ver productos",
    },
  ];

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold text-cream">Resumen</h1>

      <dl className="mt-6 grid gap-4 sm:grid-cols-2">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="flex flex-col gap-3 border border-input bg-card p-5"
          >
            <dt className="text-sm text-sand">{metric.label}</dt>
            <dd className="text-4xl font-semibold text-cream tabular-nums">
              {metric.value}
            </dd>
            <Link
              href={metric.href}
              className="inline-block py-2 text-sm font-medium text-gold underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-gold/40 focus-visible:outline-none"
            >
              {metric.cta}
            </Link>
          </div>
        ))}
      </dl>
    </div>
  );
}
