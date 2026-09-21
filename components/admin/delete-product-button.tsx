"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { deleteProduct } from "@/app/admin/(panel)/productos/actions";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export function DeleteProductButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function confirmDelete() {
    startTransition(async () => {
      const result = await deleteProduct(id);
      if (result.ok) {
        toast.success("Producto eliminado", { description: name });
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
            Se borra el producto y su imagen. No se puede deshacer. Si solo
            querés sacarlo del catálogo, editalo y marcalo como inactivo.
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
