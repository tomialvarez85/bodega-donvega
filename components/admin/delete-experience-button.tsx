"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { deleteExperience } from "@/app/admin/(panel)/visitas/actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export function DeleteExperienceButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function confirmDelete() {
    startTransition(async () => {
      const result = await deleteExperience(id);
      if (result.ok) {
        toast.success("Paquete eliminado", { description: name });
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result.message);
        setOpen(false);
      }
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            aria-label={`Eliminar ${name}`}
            className="border-input bg-card text-red-300 hover:bg-red-500/10 hover:text-red-200"
          />
        }
      >
        <Trash2 aria-hidden />
        <span className="hidden lg:inline">Eliminar</span>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar «{name}»?</AlertDialogTitle>
          <AlertDialogDescription>
            Se borra el paquete y su imagen. No se puede deshacer. Si ya recibió
            solicitudes de reserva no se puede borrar: desactivalo para ocultarlo
            del sitio.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={confirmDelete}
            disabled={pending}
            className="bg-red-600 text-cream hover:bg-red-700"
          >
            {pending ? "Eliminando…" : "Sí, eliminar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
