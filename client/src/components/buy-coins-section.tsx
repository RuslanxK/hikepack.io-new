import React from "react";

const packages = [
  { coins: 4, oldPrice: "$4.99", newPrice: "$2.99", color: "bg-orange-100" },
  { coins: 10, oldPrice: "$7.99", newPrice: "$4.99", color: "bg-blue-100" },
  { coins: 30, oldPrice: "$14.99", newPrice: "$9.99", color: "bg-purple-100", recommended: true },
  { coins: 60, oldPrice: "$29.99", newPrice: "$17.99", color: "bg-green-100" },
  { coins: 100, oldPrice: "$49.99", newPrice: "$29.99", color: "bg-yellow-100", recommended: true },
];

interface BuyCoinsSectionProps {
  onPurchase: (coinsAmount: number) => void;
}

export const BuyCoinsSection: React.FC<BuyCoinsSectionProps> = ({ onPurchase }) => {
  return (
    <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {packages.map((pkg) => (
        <div
          key={pkg.coins}
          className={`relative rounded-xl p-6 ${pkg.color} shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 cursor-pointer border border-primary/20`}
          onClick={() => onPurchase(pkg.coins)}
        >
          {pkg.recommended && (
            <div className="absolute top-0 right-0 bg-pink-500 text-white text-[10px] font-bold py-1 px-2 rounded-tr-xl rounded-bl-xl">
              Best Deal
            </div>
          )}
          <div className="flex items-center gap-4">
            <img src="/currency-icon.svg" alt="coin" className="w-12 h-12" />
            <div className="flex flex-col">
              <div className="text-xl font-extrabold text-gray-800">{pkg.coins} Coins</div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-gray-500 line-through text-sm">{pkg.oldPrice}</span>
                <span className="text-green-700 font-bold">{pkg.newPrice}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
