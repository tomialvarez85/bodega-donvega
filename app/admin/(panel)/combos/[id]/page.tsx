import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ComboForm } from "@/components/admin/combo-form";
import { requireAdmin } from "@/lib/auth/session";
import { getComboForEdit, getComboProductOptions } from "@/lib/combos";
import { isUuid } from "@/lib/validation/product";

export const metadata: Metadata = { title: "Editar combo" };

export default async function EditarComboPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();

  const { id } = await params;
  if (!isUuid(id)) notFound();

  const [data, products] = await Promise.all([
    getComboForEdit(id),
    getComboProductOptions(),
  ]);
  if (!data) notFound();

  return (
    <div className="max-w-3xl">
      <Link
        href="/admin/combos"
        className="text-sm text-sand underline-offset-4 hover:text-cream hover:underline"
      >
        ← Volver a combos
      </Link>
      <h1 className="mt-3 mb-6 text-2xl font-semibold text-cream">
        Editar combo
      </h1>
      <ComboForm
        combo={data.combo}
        initialItems={data.items}
        products={products}
      />
    </div>
  );
}
