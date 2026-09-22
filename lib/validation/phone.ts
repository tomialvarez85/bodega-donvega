import { z } from "zod";

// Teléfono en cualquier formato razonable: con o sin espacios, guiones, paréntesis, "+" o "15"
// de más. No se ata a un país (puede ser un cliente extranjero) ni a que sea WhatsApp: solo se
// pide que, al sacarle todo lo que no es dígito, "parezca" un teléfono. Lo usan el checkout y el
// formulario de reserva de visitas.
export const phoneSchema = z
  .string()
  .trim()
  .min(1, "El teléfono es obligatorio")
  .max(40, "El teléfono es demasiado largo")
  .refine((value) => {
    const digits = value.replace(/\D/g, "").length;
    return digits >= 8 && digits <= 15;
  }, "Ingresá un teléfono válido, con código de área");
