import type { Metadata } from "next";
import Link from "next/link";

import { ProductForm } from "@/components/admin/product-form";
import { requireAdmin } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Nuevo producto" };

export default async function NuevoProductoPage() {
  await requireAdmin();

  return (
    <div className="max-w-3xl">
      <Link
        href="/admin/productos"
        className="text-sm text-sand underline-offset-4 hover:text-cream hover:underline"
      >
        ← Volver a productos
      </Link>
      <h1 className="mt-3 mb-6 text-2xl font-semibold text-cream">
        Nuevo producto
      </h1>
      <ProductForm />
    </div>
  );
}
