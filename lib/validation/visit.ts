import { z } from "zod";

// Validación de la solicitud de visita: la usan el formulario (react-hook-form) y la Server Action.

const text = (required: string, tooLong: string, max: number) =>
  z.string().trim().min(1, required).max(max, tooLong);

export const MAX_GROUP_SIZE_LIMIT = 200;

export const visitRequestSchema = z.object({
  experienceId: z
    .string()
    .min(1, "Elegí un paquete")
    .pipe(z.uuid("Elegí un paquete")),
  fullName: text("El nombre es obligatorio", "El nombre es demasiado largo", 120).refine(
    (value) => value.length >= 3,
    "Ingresá tu nombre completo",
  ),
  // Puede ser un turista del exterior: solo pedimos que parezca un teléfono (8 a 15 dígitos).
  phone: z
    .string()
    .trim()
    .min(1, "El teléfono es obligatorio")
    .max(40, "El teléfono es demasiado largo")
    .refine((value) => {
      const digits = value.replace(/\D/g, "").length;
      return digits >= 8 && digits <= 15;
    }, "Ingresá un teléfono válido, con código de área"),
  email: z
    .string()
    .trim()
    .min(1, "El email es obligatorio")
    .max(160, "El email es demasiado largo")
    .pipe(z.email("Ingresá un email válido")),
  // Texto libre: no hay agenda calendarizada, la bodega coordina a mano.
  preferredDate: text(
    "La fecha preferida es obligatoria",
    "La fecha preferida es demasiado larga",
    160,
  ).refine(
    (value) => value.length >= 3,
    "Contanos qué fecha te viene bien",
  ),
  groupSize: z
    .number({ error: "Ingresá la cantidad de personas" })
    .int("Ingresá un número entero")
    .min(1, "Tiene que ser al menos 1 persona")
    .max(MAX_GROUP_SIZE_LIMIT, "Para grupos tan grandes escribinos por WhatsApp"),
  comments: z.string().trim().max(1000, "Máximo 1000 caracteres"),
  // Honeypot: un humano no lo ve ni lo completa.
  website: z.string().max(0).optional(),
});

export type VisitRequestValues = z.input<typeof visitRequestSchema>;
export type VisitRequestData = z.output<typeof visitRequestSchema>;

export const groupSizeExceededMessage = (max: number) =>
  `Este paquete admite hasta ${max} ${max === 1 ? "persona" : "personas"}. Para grupos más grandes escribinos por WhatsApp.`;
