// Constantes de visitas guiadas y catas sin imports de servidor (las usa también el cliente).

export const VISIT_REQUEST_STATUSES = [
  "pendiente",
  "confirmado",
  "cancelado",
] as const;
export type VisitRequestStatus = (typeof VISIT_REQUEST_STATUSES)[number];

export const PRICE_UNITS = ["por persona", "por grupo"] as const;
export type PriceUnit = (typeof PRICE_UNITS)[number];

// 45 => "45 min", 60 => "1 hora", 90 => "1 h 30 min", 120 => "2 horas"
export function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (rest === 0) return hours === 1 ? "1 hora" : `${hours} horas`;
  return `${hours} h ${rest} min`;
}
