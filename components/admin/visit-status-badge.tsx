import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { VISIT_STATUS_LABELS, type VisitRequestStatus } from "@/lib/visits";

const STYLES: Record<VisitRequestStatus, string> = {
  pendiente: "bg-amber-500/15 text-amber-300",
  confirmado: "bg-green-500/15 text-green-300",
  cancelado: "bg-hairline text-sand",
};

export function VisitStatusBadge({
  status,
  className,
}: {
  status: VisitRequestStatus;
  className?: string;
}) {
  return (
    <Badge className={cn(STYLES[status], className)}>
      {VISIT_STATUS_LABELS[status]}
    </Badge>
  );
}
