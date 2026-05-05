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
} from "@/components/ui/alert-dialog"
import { useState } from "react"

interface ConfirmProps {
  trigger: React.ReactNode;
  title?: string;
  description?: string;
  onConfirm: () => void;
}

export function ConfirmDialog({
  trigger,
  title = "Tem certeza?",
  description = "Essa ação não poderá ser desfeita.",
  onConfirm,
}: ConfirmProps) {
  const [open, setOpen] = useState(false)

  const handleConfirm = () => {
    setOpen(false)
    onConfirm()
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {trigger}
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setOpen(false)}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>
            Confirmar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
