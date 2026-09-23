import { WhatsappIcon } from "@/components/whatsapp-icon";
import { businessWhatsappUrl } from "@/lib/whatsapp";

// Botón flotante fijo, visible en todo el sitio público. No se muestra si no hay
// NEXT_PUBLIC_WHATSAPP_NUMBER configurado (mismo criterio que el resto del sitio).
export function WhatsappFloat() {
  const whatsappUrl = businessWhatsappUrl(
    "Hola Don Vega, quería hacerles una consulta.",
  );
  if (!whatsappUrl) return null;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribir por WhatsApp (se abre en una pestaña nueva)"
      className="fixed right-5 bottom-5 z-50 flex h-14 w-14 items-center justify-center border border-hairline-mid bg-wine text-cream transition-[background-color,transform] duration-150 hover:-translate-y-px hover:bg-[#501320] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:right-8 sm:bottom-8"
    >
      <WhatsappIcon size={28} />
    </a>
  );
}
