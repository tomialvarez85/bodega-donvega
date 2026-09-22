"use server";

import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import {
  isForeignKeyViolation,
  isUniqueViolation,
} from "@/lib/admin-server";
import { requireAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { deleteImageQuietly, uploadImage } from "@/lib/storage";
import { experiences, visitRequests } from "@/lib/schema";
import {
  parseExperienceFormData,
  type ExperienceFieldErrors,
} from "@/lib/validation/experience";
import {
  isUuid,
  validateImageFile,
} from "@/lib/validation/product";

// Server Actions públicas como las de productos y combos: cada una re-verifica la sesión.

export type SaveExperienceResult =
  | { ok: true }
  | { ok: false; message?: string; fieldErrors?: ExperienceFieldErrors };

export type DeleteExperienceResult = { ok: true } | { ok: false; message: string };

const SLUG_TAKEN = "Ya existe un paquete con ese slug";

function revalidatePublic() {
  revalidatePath("/admin/visitas");
  revalidatePath("/visitas");
  revalidatePath("/visitas/reservar");
}

export async function saveExperience(
  id: string | null,
  formData: FormData,
): Promise<SaveExperienceResult> {
  await requireAdmin();

  if (id !== null && !isUuid(id)) {
    return { ok: false, message: "Paquete inválido." };
  }

  const existing = id
    ? (await db.select().from(experiences).where(eq(experiences.id, id)).limit(1))[0]
    : undefined;
  if (id && !existing) {
    return { ok: false, message: "Este paquete ya no existe." };
  }

  const parsed = parseExperienceFormData(formData);
  const fieldErrors: ExperienceFieldErrors = parsed.ok ? {} : parsed.errors;

  const file = formData.get("image");
  const newImage = file instanceof File && file.size > 0 ? file : null;
  if (newImage) {
    const imageError = validateImageFile(newImage);
    if (imageError) fieldErrors.image = imageError;
  } else if (!existing) {
    fieldErrors.image = "Subí una imagen del paquete";
  }

  if (!parsed.ok) return { ok: false, fieldErrors };
  const data = parsed.data;

  // Chequeo previo del slug para no subir una imagen que quedaría huérfana.
  const [slugTaken] = await db
    .select({ id: experiences.id })
    .from(experiences)
    .where(
      and(eq(experiences.slug, data.slug), id ? ne(experiences.id, id) : undefined),
    )
    .limit(1);
  if (slugTaken) fieldErrors.slug = SLUG_TAKEN;

  if (Object.keys(fieldErrors).length > 0) return { ok: false, fieldErrors };

  let imageUrl = existing?.imageUrl ?? "";
  let uploadedUrl: string | null = null;

  if (newImage) {
    const upload = await uploadImage("experiencias", data.slug, newImage);
    if (!upload.ok) return { ok: false, message: upload.message };
    uploadedUrl = imageUrl = upload.url;
  }

  try {
    if (existing) {
      await db
        .update(experiences)
        .set({ ...data, imageUrl })
        .where(eq(experiences.id, existing.id));
    } else {
      await db.insert(experiences).values({ ...data, imageUrl });
    }
  } catch (error) {
    if (uploadedUrl) await deleteImageQuietly(uploadedUrl);
    if (isUniqueViolation(error)) {
      return { ok: false, fieldErrors: { slug: SLUG_TAKEN } };
    }
    console.error("[admin] falló el guardado del paquete", error);
    return { ok: false, message: "No se pudo guardar el paquete." };
  }

  // Imagen reemplazada: la anterior ya no se usa.
  if (uploadedUrl && existing) await deleteImageQuietly(existing.imageUrl);

  revalidatePublic();
  return { ok: true };
}

export async function deleteExperience(id: string): Promise<DeleteExperienceResult> {
  await requireAdmin();

  if (!isUuid(id)) return { ok: false, message: "Paquete inválido." };

  try {
    const [deleted] = await db
      .delete(experiences)
      .where(eq(experiences.id, id))
      .returning({ imageUrl: experiences.imageUrl });
    if (!deleted) return { ok: false, message: "Este paquete ya no existe." };

    await deleteImageQuietly(deleted.imageUrl);
  } catch (error) {
    // Un paquete con solicitudes no se borra (ON DELETE RESTRICT): se conserva el historial.
    if (isForeignKeyViolation(error)) {
      const requests = await db.$count(
        visitRequests,
        eq(visitRequests.experienceId, id),
      );
      return {
        ok: false,
        message: `Este paquete tiene ${requests} ${requests === 1 ? "solicitud" : "solicitudes"} de reserva y no se puede borrar. Desactivalo para ocultarlo del sitio.`,
      };
    }
    console.error("[admin] falló el borrado del paquete", error);
    return { ok: false, message: "No se pudo eliminar el paquete." };
  }

  revalidatePublic();
  return { ok: true };
}
