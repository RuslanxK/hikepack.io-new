import React from "react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

interface ReusableAlertProps {
  title: string;
  description: string;
  onConfirm: () => void;
  triggerButton?: React.ReactNode;
  confirmButtonText?: string;
  cancelButtonText?: string;
}

const ReusableAlert: React.FC<ReusableAlertProps> = ({
  title,
  description,
  onConfirm,
  triggerButton,
  confirmButtonText = "Continue",
  cancelButtonText = "Cancel",
}) => {
  return (
    <AlertDialog>
      {triggerButton && <AlertDialogTrigger asChild>{triggerButton}</AlertDialogTrigger>}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelButtonText}</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="text-white bg-primary hover:bg-primary-dark hover:bg-green-900 hover:bg-emerald-600">{confirmButtonText}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ReusableAlert;
