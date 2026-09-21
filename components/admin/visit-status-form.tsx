"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { updateVisitRequestStatus } from "@/app/admin/(panel)/reservas/actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  NEXT_VISIT_STATUSES,
  VISIT_STATUS_LABELS,
  type VisitRequestStatus,
} from "@/lib/visits";

export function VisitStatusForm({
  requestId,
  customerName,
  status,
}: {
  requestId: string;
  customerName: string;
  status: VisitRequestStatus;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const options = NEXT_VISIT_STATUSES[status];
  const [target, setTarget] = useState<VisitRequestStatus | "">(options[0] ?? "");
  const [confirmCancel, setConfirmCancel] = useState(false);

  if (options.length === 0) {
    return (
      <p className="text-sm text-sand">
        La solicitud está cancelada y no admite más cambios de estado.
      </p>
    );
  }

  function apply(next: VisitRequestStatus) {
    startTransition(async () => {
      const result = await updateVisitRequestStatus(requestId, next);
      if (result.ok) {
        toast.success(
          `Solicitud de ${customerName}: ${VISIT_STATUS_LABELS[result.status]}`,
        );
        setConfirmCancel(false);
        // El estado nuevo llega por props; reiniciamos la selección para el próximo paso.
        setTarget(NEXT_VISIT_STATUSES[result.status][0] ?? "");
        router.refresh();
      } else {
        toast.error(result.message);
        setConfirmCancel(false);
      }
    });
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!target) return;
    if (target === "cancelado") setConfirmCancel(true);
    else apply(target);
  }

  return (
    <>
      <form onSubmit={onSubmit} className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="next-status" className="text-sm font-medium text-cream">
            Cambiar estado a
          </label>
          <select
            id="next-status"
            value={target}
            onChange={(event) => setTarget(event.target.value as VisitRequestStatus)}
            className="h-10 min-w-48 border border-input bg-card px-3 text-sm text-cream outline-none focus-visible:border-gold focus-visible:ring-2 focus-visible:ring-gold/25"
          >
            {options.map((option) => (
              <option key={option} value={option}>
                {VISIT_STATUS_LABELS[option]}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={pending || !target}
          className="h-10 bg-cream px-5 text-sm font-medium text-ink transition-colors hover:bg-cream/90 focus-visible:ring-2 focus-visible:ring-gold/40 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-60"
        >
          {pending ? "Actualizando…" : "Actualizar estado"}
        </button>
      </form>

      <AlertDialog open={confirmCancel} onOpenChange={setConfirmCancel}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              ¿Cancelar la solicitud de {customerName}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Una solicitud cancelada no se puede volver a abrir. Esto no le avisa
              al cliente: escribile por WhatsApp si corresponde.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Volver</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => apply("cancelado")}
              disabled={pending}
              className="bg-red-600 text-cream hover:bg-red-700"
            >
              {pending ? "Cancelando…" : "Sí, cancelar solicitud"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
