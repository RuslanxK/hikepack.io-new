import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "../ui/button";
import Cookies from "js-cookie";
import { Send } from "lucide-react";
import BuyCoinsDialog from "./buy-coins";
import { Textarea } from "../ui/textarea";

interface CustomRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  bagId?: string;
  tripId?: string;
}

const loadingMessages = [
  "Understanding your custom request...",
  "Checking for related gear...",
  "Analyzing hiking context...",
  "Looking up best-fit gear...",
  "Creating something awesome...",
];

const CustomRequestModal: React.FC<CustomRequestModalProps> = ({
  isOpen,
  onClose,
  bagId,
  tripId,
}) => {
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentMessage, setCurrentMessage] = useState(loadingMessages[0]);
  const [response, setResponse] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showBuyCoins, setShowBuyCoins] = useState(false);

  const API_URL = import.meta.env.VITE_REACT_APP_API;

  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setCurrentMessage((prev) => {
          const index = loadingMessages.indexOf(prev);
          return loadingMessages[(index + 1) % loadingMessages.length];
        });
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [loading]);

  const handleSubmit = async () => {
    const storedUser = localStorage.getItem("user");
    const parsedUser = storedUser ? JSON.parse(storedUser) : null;

    if (parsedUser?.coins < 2) {
      setShowBuyCoins(true);
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setResponse(null);

    try {
      const res = await fetch(`${API_URL}/api/custom`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: Cookies.get("token") || "",
        },
        body: JSON.stringify({
          input: userInput,
          bagId,
          tripId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");

      setResponse(data.response || "No response received.");
      if (typeof data.newCoins === "number") {
        const updatedUser = { ...parsedUser, coins: data.newCoins };
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-dark-box w-[1000px] max-h-[90vh] p-8 rounded-lg relative overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-700 dark:text-white"
        >
          <X size={24} />
        </button>

        {!loading && !response && (
          <div className="flex flex-col md:flex-row items-center gap-10">
           <div className="space-y-5 w-full">
  <h3 className="text-2xl sm:text-3xl font-extrabold text-black dark:text-white">
   ✍️ Write Your Own Request
  </h3>
  <p className="text-gray-600 dark:text-gray-300">
   Got something specific in mind? Tell our AI exactly what you’re looking for — the more details you provide, the smarter and more tailored your suggestions will be.
  </p>
  <Textarea
    value={userInput}
    onChange={(e) => setUserInput(e.target.value)}
    placeholder="Example: I’m going on a rainy 3-day hike in Iceland and need ultralight gear."
    rows={5}
    className="w-full p-4 rounded border border-gray-300 dark:border-dark bg-light dark:bg-dark text-sm dark:text-white resize-none"
  />
  <Button
    onClick={handleSubmit}
    disabled={!userInput.trim()}
    className="w-full py-6 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 text-white shadow-lg hover:-translate-y-1 transition-all duration-300"
  >
   <span className="relative z-10 flex items-center gap-2">Generate <span className="flex items-center gap-1 text-xs text-gray-200">( 2 credits <img src="/currency-icon.svg" alt="coin" className="w-4 h-4" />)</span> <Send className="w-5 h-5" /></span>
  </Button>
</div>
           
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-10">
            <img
              src="/hiker-organize.webp"
              alt="Processing"
              className="w-[300px] rounded-lg mb-6"
            />
            <h3 className="text-xl font-semibold text-primary mb-4">
              {currentMessage}
            </h3>
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        )}

        {!loading && response && (
          <div className="mt-6">
            <h2 className="text-xl font-bold text-primary mb-4">
              AI Response:
            </h2>
            <div className="p-6 bg-primary/10 dark:bg-dark-input rounded-lg whitespace-pre-wrap text-gray-800 dark:text-white">
              {response}
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="mt-6 text-center text-red-500 font-semibold">
            {errorMessage}
          </div>
        )}
      </div>

      {showBuyCoins && (
        <BuyCoinsDialog
          isOpen={showBuyCoins}
          onClose={() => setShowBuyCoins(false)}
          onPurchase={(amount) => {
            alert(`Purchased ${amount} coins`);
            setShowBuyCoins(false);
          }}
        />
      )}
    </div>
  );
};

export default CustomRequestModal;
