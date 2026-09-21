import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductForm } from "@/components/admin/product-form";
import { requireAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { products } from "@/lib/schema";
import { isUuid } from "@/lib/validation/product";

export const metadata: Metadata = { title: "Editar producto" };

export default async function EditarProductoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();

  const { id } = await params;
  if (!isUuid(id)) notFound();

  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.id, id))
    .limit(1);
  if (!product) notFound();

  return (
    <div className="max-w-3xl">
      <Link
        href="/admin/productos"
        className="text-sm text-sand underline-offset-4 hover:text-cream hover:underline"
      >
        ← Volver a productos
      </Link>
      <h1 className="mt-3 mb-6 text-2xl font-semibold text-cream">
        Editar producto
      </h1>
      <ProductForm product={product} />
    </div>
  );
}
