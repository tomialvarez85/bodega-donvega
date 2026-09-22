"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { deleteCombo } from "@/app/admin/(panel)/combos/actions";
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

export function DeleteComboButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function confirmDelete() {
    startTransition(async () => {
      const result = await deleteCombo(id);
      if (result.ok) {
        toast.success("Combo eliminado", { description: name });
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result.message);
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
            className="border-input bg-card text-red-300 hover:bg-red-500/10 hover:text-red-200 h-10 w-10 px-0 xl:h-7 xl:w-auto xl:px-2.5"
          />
        }
      >
        <Trash2 aria-hidden />
        <span className="hidden xl:inline">Eliminar</span>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar «{name}»?</AlertDialogTitle>
          <AlertDialogDescription>
            Se borra el combo y su imagen. Los vinos que incluye no se tocan.
            No se puede deshacer. Si solo querés ocultarlo de Promociones,
            editalo y marcalo como inactivo.
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
