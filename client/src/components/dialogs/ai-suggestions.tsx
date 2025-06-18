import { useState, useEffect, useCallback } from "react";
import { X, Plus } from "lucide-react";
import { Category } from "@/types/category";
import { apiService } from "@/lib/apiService";
import { queryClient } from "@/lib/react-query-client";
import { getRandomMidLightColor } from "@/lib/colorUtils";
import Cookies from "js-cookie";
import { useUser } from "@/context/user-context";
import { Button } from "../ui/button";
import { Send } from 'lucide-react';
import BuyCoinsDialog from "./buy-coins";
import { loadingMessages, loadingCustomMessages } from "@/lib/apiService";
import { Textarea } from "../ui/textarea";
import { Item } from "@/types/item";

interface UnifiedSuggestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  bagId?: string;
  tripId?: string;
  categories: Category[];
  mode: "ai" | "custom";
}

interface AIResponseCategory {
  categoryName: string;
  items: Item[];
}

const UnifiedSuggestionsModal: React.FC<UnifiedSuggestionsModalProps> = ({ isOpen, onClose, bagId, tripId, categories, mode }) => {
  const API_URL = import.meta.env.VITE_REACT_APP_API;
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentMessage, setCurrentMessage] = useState(mode === "ai" ? loadingMessages[0] : loadingCustomMessages[0]);
const [response, setResponse] = useState<AIResponseCategory[] | string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showBuyCoins, setShowBuyCoins] = useState(false);
  const [showDropdownForItem, setShowDropdownForItem] = useState<string | null>(null);
  const { setUser } = useUser();

  const itemNamesOnly = categories.flatMap(category => category.items?.map(item => item.name) || []);

  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setCurrentMessage(prev => {
          const messages = mode === "ai" ? loadingMessages : loadingCustomMessages;
          const index = messages.indexOf(prev);
          return messages[(index + 1) % messages.length];
        });
      }, 3500);
      return () => clearInterval(interval);
    }
  }, [loading, mode]);



  const handleSubmit = useCallback(async () => {
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
      const endpoint = mode === "ai" ? "/api/ai" : "/api/custom";
      const body = mode === "ai" ? { input: userInput, bagId, tripId, itemNamesOnly } : { input: userInput };

      const res = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: Cookies.get("token") || "",
        },
        body: JSON.stringify(body),
      });

      setUserInput("")

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");

      setResponse(data.suggestion || data.response);
      if (typeof data.newCoins === "number") {
        const updatedUser = { ...parsedUser, coins: data.newCoins };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
      
    } catch (error) {
  if (error instanceof Error) {
    setErrorMessage(error.message);
  } else {
    setErrorMessage("Something went wrong.");
  }
} finally {
  setLoading(false);
}
  }, [API_URL, bagId, tripId, userInput, itemNamesOnly, setUser, mode]);

  

  const handleAddCategoryToBag = async (categoryName: string, items: Item[]) => {
    try {
      const createdCategory: Category = await apiService.post(`/categories`, {
        bagId,
        name: categoryName,
        color: getRandomMidLightColor(),
        tripId,
      });
      const categoryId = createdCategory._id;
      await Promise.all(items.map(item => apiService.post(`/items`, { ...item, bagId, tripId, categoryId })));
      queryClient.invalidateQueries({ queryKey: ["categories", bagId] });
     setResponse((prev) => {
  if (!Array.isArray(prev)) return prev;
  return prev.filter((cat) => cat.categoryName !== categoryName);
});

    } catch (e) { console.error(e); }
  };



  const handleAddItemToCategory = async (item: Item, categoryId: string) => {
    try {
      await apiService.post(`/items`, { ...item, bagId, tripId, categoryId });
      queryClient.invalidateQueries({ queryKey: ["categories", bagId] });
      setResponse((prev) => {
  if (!Array.isArray(prev)) return prev;
  return prev
    .map((cat) => ({
      ...cat,
      items: cat.items.filter((i) => i.name !== item.name),
    }))
    .filter((cat) => cat.items.length > 0);
});
      setShowDropdownForItem(null);
    } catch (e) { console.error(e); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-dark-box w-[1000px] max-h-[90vh] p-6 pt-10 rounded-lg relative overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-700 hover:text-black dark:text-white">
          <X size={24} />
        </button>

       {!loading && !response && (
  <div className="relative space-y-6 p-8 rounded-2xl bg-white dark:bg-dark-box shadow-xl border border-primary/20 dark:border-white/10 overflow-hidden">
    {/* Soft background icon */}
    <div className="absolute top-4 right-4 opacity-10 text-primary text-7xl pointer-events-none select-none">
      {mode === 'ai' ? '🤖' : '✍️'}
    </div>

    <h3 className="text-3xl sm:text-4xl font-extrabold text-primary flex items-center gap-3">
      {mode === 'ai' ? 'Let AI do the heavy lifting!' : 'Write your custom request'}
    </h3>

    {mode === 'ai' ? (
      <div className="grid sm:grid-cols-2 gap-4 text-gray-700 dark:text-gray-300 text-base leading-relaxed">
        <div className="bg-gradient-to-br from-primary/10 to-transparent p-5 rounded-xl shadow-md border border-primary/10">
          <h4 className="font-semibold mb-2">🎯 Targeted Planning</h4>
          <p>
            We’ll instantly create a <span className="text-primary font-semibold">personalized packing list</span> based on your trip details — like a pro hiker crafted it.
          </p>
        </div>

        <div className="bg-gradient-to-br from-primary/10 to-transparent p-5 rounded-xl shadow-md border border-primary/10">
          <h4 className="font-semibold mb-2">📦 Gear from Scratch</h4>
          <p>
            Even if your bag is empty, our AI can <span className="italic">build your setup</span> with essential and smart items you actually need.
          </p>
        </div>

        <div className="bg-gradient-to-br from-primary/10 to-transparent p-5 rounded-xl shadow-md border border-primary/10">
          <h4 className="font-semibold mb-2">🧩 Smart Adjustments</h4>
          <p>
            Our AI understands what’s missing, balances your load, and tailors it to <span className="underline underline-offset-2">your adventure</span>.
          </p>
        </div>

        <div className="bg-gradient-to-br from-primary/10 to-transparent p-5 rounded-xl shadow-md border border-primary/10">
          <h4 className="font-semibold mb-2">📝 Your Input Matters</h4>
          <p>
            Add a note to guide the AI — climate, preferences, or style — and <span className="text-primary font-medium">shape the ideal list</span>.
          </p>
        </div>
      </div>
    ) : (
      <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed tracking-wide bg-secondary/10 dark:bg-white/5 p-4 rounded-md border-l-4 border-secondary">
        Tell our AI exactly what you’re looking for — the more details you provide, the smarter the results.
      </p>
    )}

    {mode === 'custom' && (
      <Textarea
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        placeholder="Example: I’m going on a rainy 3-day hike in Iceland and need ultralight gear."
        rows={5}
        className="w-full p-4 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-dark-input text-sm dark:text-white shadow-sm"
      />
    )}

    <Button
      onClick={handleSubmit}
      disabled={mode === 'custom' && !userInput.trim()}
      className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 text-white rounded-xl shadow-xl hover:-translate-y-1 transition-transform duration-300"
    >
      <span className="flex items-center justify-center gap-2">
        Generate
        <span className="flex items-center gap-1 text-xs text-white/70">
          (2 credits <img src="/currency-icon.svg" alt="coin" className="w-4 h-4" />)
        </span>
        <Send className="w-5 h-5" />
      </span>
    </Button>
  </div>
)}

         {!loading && response && (
          <div className="mb-8 space-y-4">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-black dark:text-white">
              🔁 Generate More Suggestions
            </h3>
            <Textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Refine or add new details for your next suggestion..."
              className="w-full p-4 rounded border border-gray-300 dark:border-dark bg-light dark:bg-dark text-sm dark:text-white resize-none"
            />
            <Button
              onClick={handleSubmit}
              disabled={!userInput}
              className="w-full py-6 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 text-white shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <span className="relative z-10 flex items-center gap-2">Generate Again <span className="flex items-center gap-1 text-xs text-gray-200">( 2 credits <img src="/currency-icon.svg" alt="coin" className="w-4 h-4" />)</span> <Send className="w-5 h-5" /></span>
            </Button>
          </div>
        )}


 {loading && (
  <div className="w-full max-w-5xl mx-auto p-8 dark:to-dark-input relative overflow-hidden">
    <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
      <div className="relative w-24 h-24 flex-shrink-0">
        <div className="absolute inset-0 rounded-full border-4 border-green-400 opacity-20 animate-ping-slow z-0" />
        <div className="relative z-10 w-full h-full rounded-full bg-gradient-to-br from-green-500 to-lime-500 shadow-2xl border-4 border-white/30 animate-spin-slow" />
        <div className="absolute inset-1 flex items-center justify-center text-white text-2xl font-bold z-20">
          AI
        </div>
      </div>
      <div className="flex-1 space-y-6 dark:text-gray-100">
        <h3 key={currentMessage} className="text-xl sm:text-3xl text-primary dark:text-light sm:text-4xl font-extrabold overflow-hidden whitespace-nowrap border-r-2 border-green-600 w-[20ch] sm:w-[30ch] md:w-[40ch] animate-typewriter">{currentMessage}</h3>
        <div className="flex items-start gap-3 justify-center md:justify-start text-sm leading-relaxed  max-w-md mx-auto">
          <p>
            Our AI is navigating trail maps, analyzing terrain and weather, and optimizing your backpack configuration. The ultimate hiking setup is almost ready. 🏔️
          </p>
        </div>
      </div>
    </div>
  </div>
)}


{Array.isArray(response) && response.length > 0 && (
  <h2 className="text-2xl sm:text-3xl font-bold mb-4">
    ✨ Suggested Packing List
  </h2>
)}
  

        {Array.isArray(response) && response.length > 0 && response.map((category, index) => (
          <div key={index} className="mt-6 relative p-6 rounded-xl bg-primary/10 dark:bg-dark shadow-lg border border-primary/20 dark:border-dark-box">
            <div className="absolute top-4 right-4 flex items-center space-x-2">
              <button onClick={() => handleAddCategoryToBag(category.categoryName, category.items)} className="bg-primary text-white p-2 rounded-full shadow hover:bg-primary/90 transition">
                <Plus size={20} />
              </button>
            </div>
            <h3 className="text-lg font-bold mb-4 text-primary">{category.categoryName}</h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              {category.items.map((item, idx) => (
                <li
                  key={idx}
                  className="flex flex-row sm:flex-row items-center justify-between gap-4 p-4 bg-white dark:bg-dark-input rounded-md shadow hover:shadow-primary/30 transition dark:bg-dark-box"
                >
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-gray-800 dark:text-white">{item.name}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{item.description}</span>
                    <span className="text-xs text-gray-400 dark:text-gray-400">
                      Qty: {item.qty} · {item.weight}{item.weightOption} · Priority: {item.priority}
                    </span>
                  </div>
                  <div className="relative">
                   {categories.length > 0 && (
  <button
    onClick={() => setShowDropdownForItem(prev => (prev === item.name ? null : item.name))}
    className="bg-primary/10 hover:bg-primary text-primary hover:text-white dark:bg-primary/20 dark:hover:bg-primary dark:text-white p-2 rounded-full shadow transition"
  >
    <Plus size={20} />
  </button>
)}
                    {showDropdownForItem === item.name && (
                      <div
                        className="absolute right-0 mt-2 w-64 bg-white dark:bg-dark-box border rounded shadow-lg z-50 p-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 px-2 mb-2">
                          Choose a Category
                        </h3>
                        <div className="flex flex-col space-y-1 max-h-60 overflow-y-auto">
                          {categories.map(cat => (
                            <div
                              key={cat._id}
                              className="px-4 py-2 hover:bg-primary/10 dark:hover:bg-primary/20 cursor-pointer rounded"
                              onClick={() => handleAddItemToCategory(item, cat._id)}
                            >
                              {cat.name?.trim()
                                ? (cat.name.length > 20 ? cat.name.slice(0, 20) + "..." : cat.name)
                                : "Unnamed Category"}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}


        {response && typeof response === 'string' && (
          <div className="mt-6">
            <h2 className="text-xl font-bold text-primary mb-4">AI Response:</h2>
            
            <div className="p-6 bg-primary/10 dark:bg-dark-input rounded-lg whitespace-pre-wrap text-gray-800 dark:text-white">{response}</div>
          </div>
        )}

        {errorMessage && (
          <div className="mt-6 text-center text-red-500 font-semibold">{errorMessage}</div>
        )}
      </div>

      {showBuyCoins && (
        <BuyCoinsDialog isOpen={showBuyCoins} onClose={() => setShowBuyCoins(false)} onPurchase={(amount) => { alert(`Purchased ${amount} coins`); setShowBuyCoins(false); }} />
      )}
    </div>
  );
};

export default UnifiedSuggestionsModal;
