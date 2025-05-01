import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
  const [userCoins, setUserCoins] = useState(0);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUserCoins(parsed.coins || 0);
      } catch {
        setUserCoins(0);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="p-4 sm:p-6 w-[90vw] sm:w-auto sm:max-w-2xl lg:max-w-4xl max-h-[calc(100vh-2rem)] overflow-y-auto rounded-xl shadow-xl border-2 border-yellow-200 bg-white dark:bg-dark-box"
      >
        <DialogHeader>
          <DialogTitle className="text-center text-2xl sm:text-3xl font-extrabold text-primary">
            Buy More Coins ✨
          </DialogTitle>
          <DialogDescription className="text-center text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-1 sm:mt-2">
            Choose the best deal for your journey.
          </DialogDescription>
        </DialogHeader>

        <div className="text-center mt-4 text-md font-medium text-gray-700 dark:text-gray-300">
          Your current balance:{" "}
          <span className="text-primary font-bold">{userCoins} Coins</span>
        </div>

        <div className="mt-6">
          <BuyCoinsSection onPurchase={onPurchase} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BuyCoinsDialog;
