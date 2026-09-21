import type { Metadata } from "next";
import Link from "next/link";

import { ComboForm } from "@/components/admin/combo-form";
import { requireAdmin } from "@/lib/auth/session";
import { getComboProductOptions } from "@/lib/combos";

export const metadata: Metadata = { title: "Nuevo combo" };

export default async function NuevoComboPage() {
  await requireAdmin();
  const products = await getComboProductOptions();

  return (
    <div className="max-w-3xl">
      <Link
        href="/admin/combos"
        className="text-sm text-sand underline-offset-4 hover:text-cream hover:underline"
      >
        ← Volver a combos
      </Link>
      <h1 className="mt-3 mb-6 text-2xl font-semibold text-cream">
        Nuevo combo
      </h1>
      <ComboForm products={products} />
    </div>
  );
}
