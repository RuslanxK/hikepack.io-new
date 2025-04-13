import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { DeleteAlertProps } from '@/types/alert';

const DeleteAlert: React.FC<DeleteAlertProps> = ({isOpen, title = 'Confirm Deletion', description, onConfirm, onCancel, isDeleting }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <Alert variant="default" className="w-[90%] max-w-md p-6 bg-white dark:bg-dark-box rounded-lg shadow-lg">
        <AlertTitle className="text-lg font-bold">{title}</AlertTitle>
        <AlertDescription className="text-sm text-gray-600 dark:text-gray-300">
          {description}
        </AlertDescription>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="default" className='text-white' onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Confirm"}
          </Button>
        </div>
      </Alert>
    </div>
  );
};

export default DeleteAlert;
