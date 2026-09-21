import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ExperienceForm } from "@/components/admin/experience-form";
import { requireAdmin } from "@/lib/auth/session";
import { getExperienceForEdit } from "@/lib/experiences";
import { isUuid } from "@/lib/validation/product";

export const metadata: Metadata = { title: "Editar paquete" };

export default async function EditarExperienciaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();

  const { id } = await params;
  if (!isUuid(id)) notFound();

  const experience = await getExperienceForEdit(id);
  if (!experience) notFound();

  return (
    <div className="max-w-3xl">
      <Link
        href="/admin/visitas"
        className="text-sm text-sand underline-offset-4 hover:text-cream hover:underline"
      >
        ← Volver a visitas
      </Link>
      <h1 className="mt-3 mb-6 text-2xl font-semibold text-cream">
        Editar paquete
      </h1>
      <ExperienceForm experience={experience} />
    </div>
  );
}
