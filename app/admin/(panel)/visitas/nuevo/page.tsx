import type { Metadata } from "next";
import Link from "next/link";

import { ExperienceForm } from "@/components/admin/experience-form";
import { requireAdmin } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Nuevo paquete" };

export default async function NuevaExperienciaPage() {
  await requireAdmin();

  return (
    <div className="max-w-3xl">
      <Link
        href="/admin/visitas"
        className="text-sm text-sand underline-offset-4 hover:text-cream hover:underline"
      >
        ← Volver a visitas
      </Link>
      <h1 className="mt-3 mb-6 text-2xl font-semibold text-cream">
        Nuevo paquete
      </h1>
      <ExperienceForm />
    </div>
  );
}
