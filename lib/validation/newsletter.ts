import { z } from "zod";

// Sin imports de servidor: la usan el formulario (cliente) y la Server Action.
export const newsletterSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Ingresá tu email")
    .max(160, "El email es demasiado largo")
    .pipe(z.email("Ingresá un email válido")),
});

export type NewsletterInput = z.output<typeof newsletterSchema>;
