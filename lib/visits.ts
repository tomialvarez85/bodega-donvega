// Constantes de visitas guiadas y catas sin imports de servidor (las usa también el cliente).

export const VISIT_REQUEST_STATUSES = [
  "pendiente",
  "confirmado",
  "cancelado",
] as const;
export type VisitRequestStatus = (typeof VISIT_REQUEST_STATUSES)[number];

export const PRICE_UNITS = ["por persona", "por grupo"] as const;
export type PriceUnit = (typeof PRICE_UNITS)[number];

export const VISIT_STATUS_LABELS: Record<VisitRequestStatus, string> = {
  pendiente: "Pendiente",
  confirmado: "Confirmado",
  cancelado: "Cancelado",
};

export const isVisitRequestStatus = (
  value: unknown,
): value is VisitRequestStatus =>
  typeof value === "string" &&
  (VISIT_REQUEST_STATUSES as readonly string[]).includes(value);

// 45 => "45 min", 60 => "1 hora", 90 => "1 h 30 min", 120 => "2 horas"
export function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (rest === 0) return hours === 1 ? "1 hora" : `${hours} horas`;
  return `${hours} h ${rest} min`;
}

// pendiente → confirmado → cancelado; cancelado es final (igual que los pedidos).
export const NEXT_VISIT_STATUSES: Record<
  VisitRequestStatus,
  readonly VisitRequestStatus[]
> = {
  pendiente: ["confirmado", "cancelado"],
  confirmado: ["cancelado"],
  cancelado: [],
};

export const canTransitionVisit = (
  from: VisitRequestStatus,
  to: VisitRequestStatus,
) => NEXT_VISIT_STATUSES[from].includes(to);
