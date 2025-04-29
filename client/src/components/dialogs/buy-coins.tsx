import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BuyCoinsSection } from "../buy-coins-section"; 

interface BuyCoinsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchase: (coinsAmount: number) => void;
}

const BuyCoinsDialog: React.FC<BuyCoinsDialogProps> = ({
  isOpen,
  onClose,
  onPurchase,
}) => {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-4 md:p-6 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-purple-700">
            Get More Coins
          </DialogTitle>
          <DialogDescription className="text-center text-gray-500 mt-1">
            Best deals just for you!
          </DialogDescription>
        </DialogHeader>

        <BuyCoinsSection onPurchase={onPurchase} />

        <Button
          type="button"
          variant="ghost"
          onClick={onClose}
          className="w-full text-gray-500 hover:text-black dark:text-gray-300 dark:hover:text-white mt-4"
        >
          Cancel
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default BuyCoinsDialog;
