import type { VisitRequest } from "./schema";

// Mensaje que el cliente le manda por WhatsApp a la bodega con el resumen de su solicitud.
export function buildVisitWhatsappMessage(
  request: Pick<
    VisitRequest,
    "customerName" | "preferredDate" | "groupSize" | "comments"
  >,
  experienceName: string,
) {
  return [
    `Hola Don Vega, soy ${request.customerName}. Quiero reservar una visita:`,
    "",
    `• Paquete: ${experienceName}`,
    `• Fecha preferida: ${request.preferredDate}`,
    `• Personas: ${request.groupSize}`,
    ...(request.comments ? [`• Comentarios: ${request.comments}`] : []),
    "",
    "Quedo atento/a para coordinar fecha y horario. ¡Gracias!",
  ].join("\n");
}
