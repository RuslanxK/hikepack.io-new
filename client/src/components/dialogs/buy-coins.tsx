import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const coinSound = new Audio("/coin.mp3");

interface BuyCreditsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchase: (creditsAmount: number) => void;
}

const packages = [
  { credits: 4, oldPrice: "$4.99", newPrice: "$2.99", color: "bg-orange-50" },
  { credits: 10, oldPrice: "$7.99", newPrice: "$4.99", color: "bg-sky-50" },
  { credits: 30, oldPrice: "$14.99", newPrice: "$9.99", color: "bg-purple-50", recommended: true },
  { credits: 60, oldPrice: "$29.99", newPrice: "$17.99", color: "bg-green-50" },
  { credits: 100, oldPrice: "$49.99", newPrice: "$29.99", color: "bg-yellow-50", recommended: true },
];

const BuyCreditsDialog: React.FC<BuyCreditsDialogProps> = ({ isOpen, onClose, onPurchase }) => {
  const [step, setStep] = useState(1);
  const [userCredits, setUserCredits] = useState(0);
  const [selectedPackage, setSelectedPackage] = useState<{ credits: number; newPrice: string } | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [form, setForm] = useState({
    fullName: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
    idNumber: "",
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUserCredits(parsed.coins || 0);
      } catch {
        setUserCredits(0);
      }
    }

    if (!isOpen) {
      setStep(1);
      setSelectedPackage(null);
      setForm({ fullName: "", cardNumber: "", expiry: "", cvv: "", idNumber: "" });
      setErrors({});
    }
  }, [isOpen]);

  const handlePackageSelect = (pkg: { credits: number; newPrice: string }) => {
    setSelectedPackage(pkg);
    setStep(2);
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!form.fullName.trim()) newErrors.fullName = "Full name is required.";
    if (!/^\d{16}$/.test(form.cardNumber)) newErrors.cardNumber = "Card number must be 16 digits.";
    if (!/^\d{2}\/\d{2}$/.test(form.expiry)) newErrors.expiry = "Expiry must be in MM/YY format.";
    if (!/^\d{3}$/.test(form.cvv)) newErrors.cvv = "CVV must be 3 digits.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePay = async () => {
    if (!validateForm()) return;
    try {
      await coinSound.play();
      onPurchase(selectedPackage!.credits);
      onClose();
    } catch (err) {
      console.error("Payment failed", err);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-6 w-[90vw] sm:max-w-xl max-h-[calc(100vh-2rem)] overflow-y-auto rounded-2xl shadow-2xl border-2 border-yellow-300 bg-white dark:bg-dark-box">
        <DialogHeader>
          <DialogTitle className="text-center text-3xl font-extrabold text-primary">
            {step === 1 ? "Buy More Credits" : "Secure Checkout"}
          </DialogTitle>
          <DialogDescription className="text-center text-base text-gray-600 dark:text-gray-300">
            {step === 1
              ? "Select a credit bundle that fits your needs."
              : "Fill in your card details to complete the purchase."}
          </DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <>
            <div className="text-center text-lg font-medium text-gray-700 dark:text-gray-300 mb-6">
              Current Balance: <span className="text-primary font-bold text-xl">{userCredits} Credits</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {packages.map((pkg) => (
                <div
                  key={pkg.credits}
                  className={`relative rounded-xl p-5 ${pkg.color} shadow hover:shadow-lg transition-all cursor-pointer border border-primary/30 hover:border-primary`}
                  onClick={() => handlePackageSelect({ credits: pkg.credits, newPrice: pkg.newPrice })}
                >
                  {pkg.recommended && (
                    <div className="absolute top-0 right-0 bg-pink-500 text-white text-xs font-bold py-1 px-2 rounded-tr-xl rounded-bl-xl">
                      Most Popular
                    </div>
                  )}
                  <div className="flex items-center gap-4">
                    <img src="/currency-icon.svg" alt="credit" className="w-12 h-12" />
                    <div>
                      <p className="text-xl font-bold text-gray-800 mt-2">{pkg.credits} Credits</p>
                      <p className="text-lg text-green-700 font-semibold">
                        {pkg.newPrice} <span className="line-through text-gray-400 text-sm">{pkg.oldPrice}</span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {step === 2 && selectedPackage && (
          <div className="space-y-6">
            <div className="text-center">
              <img src="/credit-card.png" alt="card" className="mx-auto w-16 h-16 mb-2" />
              <span className="text-green-700 font-medium text-sm bg-green-100 px-3 py-1 rounded-full inline-block">
                🔒 Secure Payment with PayPlus
              </span>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-5">
              <div className="text-center space-y-1">
                <p className="text-base text-gray-700 dark:text-gray-300">You’re purchasing</p>
                <p className="text-3xl font-extrabold text-primary">{selectedPackage.credits} Credits</p>
                <p className="text-base text-gray-600 dark:text-gray-400">
                  Total: <span className="font-bold text-green-600">{selectedPackage.newPrice} USD</span>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Input
                    placeholder="Full Name"
                    required
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  />
                  {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                </div>
                <div>
                  <Input
                    placeholder="Card Number"
                    required
                    maxLength={16}
                    value={form.cardNumber}
                    onChange={(e) => setForm({ ...form, cardNumber: e.target.value })}
                  />
                  {errors.cardNumber && <p className="text-red-500 text-xs mt-1">{errors.cardNumber}</p>}
                </div>
                 <div>
                  <Input
                    placeholder="MM/YY"
                    required
                    maxLength={5}
                    value={form.expiry}
                    onChange={(e) => {
                      let value = e.target.value.replace(/[^\d]/g, "");
                      if (value.length >= 3) {
                        value = value.slice(0, 2) + "/" + value.slice(2, 4);
                      }
                      setForm({ ...form, expiry: value });
                    }}
                  />
                  {errors.expiry && <p className="text-red-500 text-xs mt-1">{errors.expiry}</p>}
                </div>
                <div>
                  <Input
                    placeholder="CVV"
                    required
                    maxLength={3}
                    value={form.cvv}
                    onChange={(e) => setForm({ ...form, cvv: e.target.value })}
                  />
                  {errors.cvv && <p className="text-red-500 text-xs mt-1">{errors.cvv}</p>}
                </div>
                <div className="col-span-2">
                  <Input
                    placeholder="National ID (optional)"
                    value={form.idNumber}
                    onChange={(e) => setForm({ ...form, idNumber: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-between items-center">
                <img src="/credit-cards.png" alt="cards" className="w-32 opacity-80" />
                <span className="text-xs text-gray-400">Powered by PayPlus</span>
              </div>

              <Button
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-lg py-3 font-bold rounded-xl shadow-md"
                onClick={handlePay}
              >
                Pay {selectedPackage.newPrice} & Get {selectedPackage.credits} Credits
              </Button>

              <Button
                variant="ghost"
                className="w-full text-gray-500 hover:text-primary text-sm"
                onClick={() => setStep(1)}
              >
                ← Back to Packages
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BuyCreditsDialog;
