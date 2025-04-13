// components/LimitReachedPopup.tsx
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface LimitReachedPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
  onRegister: () => void;
}

const LimitReachedPopup: React.FC<LimitReachedPopupProps> = ({
  isOpen,
  onClose,
  onLogin,
  onRegister,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Limit Reached</DialogTitle>
          <DialogDescription>
          To continue using this feature for free, please log in or create an account.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onLogin}>Login</Button>
          <Button onClick={onRegister} className="text-white">Register</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LimitReachedPopup;
