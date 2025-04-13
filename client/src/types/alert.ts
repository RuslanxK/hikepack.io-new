export interface DeleteAlertProps {
    isOpen: boolean;
    title?: string;
    description: string;
    onConfirm: () => void;
    onCancel: () => void;
    isDeleting: boolean;
  }