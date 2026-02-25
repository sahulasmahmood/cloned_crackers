"use client";

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
import { Power } from "lucide-react";

interface DeleteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  supplierName: string;
  currentStatus: string;
  isDeleting?: boolean;
}

export default function DeleteModal({
  open,
  onOpenChange,
  onConfirm,
  supplierName,
  currentStatus,
  isDeleting = false,
}: DeleteModalProps) {
  const isActive = currentStatus === "active";
  const action = isActive ? "deactivate" : "activate";
  const actionTitle = isActive ? "Deactivate" : "Activate";

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className={`flex size-10 items-center justify-center rounded-full ${isActive ? 'bg-destructive/10' : 'bg-green-500/10'}`}>
              <Power className={`size-5 ${isActive ? 'text-destructive' : 'text-green-600'}`} />
            </div>
            <AlertDialogTitle>{actionTitle} Supplier</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-left">
            Are you sure you want to {action} <span className="font-semibold text-foreground">{supplierName}</span>? 
            {isActive 
              ? " This will mark the supplier as inactive and they won't be available for new purchase orders."
              : " This will mark the supplier as active and make them available for new purchase orders."
            }
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isDeleting}
            className={isActive 
              ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
              : "bg-green-600 text-white hover:bg-green-700"
            }
          >
            {isDeleting ? `${actionTitle.slice(0, -1)}ing...` : `${actionTitle} Supplier`}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
