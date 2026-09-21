import { Badge } from "@/components/ui/badge";
import { STATUS_LABELS, type OrderStatus } from "@/lib/orders";
import { cn } from "@/lib/utils";

const STYLES: Record<OrderStatus, string> = {
  pendiente: "bg-amber-500/15 text-amber-300",
  confirmado: "bg-blue-500/15 text-blue-300",
  entregado: "bg-green-500/15 text-green-300",
  cancelado: "bg-hairline text-sand",
};

export function OrderStatusBadge({
  status,
  className,
}: {
  status: OrderStatus;
  className?: string;
}) {
  return <Badge className={cn(STYLES[status], className)}>{STATUS_LABELS[status]}</Badge>;
}
