import { useState, useEffect, useCallback, Fragment } from "react";
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

export const AISuggestionsModal = ({
  isOpen,
  onClose,
  bagId,
  tripId,
  categories,
}: { 
  isOpen: boolean; 
  onClose: () => void;
  bagId?: string;
  tripId?: string;
  categories: Category[];
}) => {
  
  const API_URL = import.meta.env.VITE_REACT_APP_API;


  const [response, setResponse] = useState<{ categoryName: string; items: { name: string; qty: number; description: string; priority: string; weightOption: string; weight: number }[] }[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showDropdownForItem, setShowDropdownForItem] = useState<string | null>(null);
  const [currentLoadingMessage, setCurrentLoadingMessage] = useState("Preparing top gear for your trip");
  const [userInput, setUserInput] = useState("");
  const [showBuyCoins, setShowBuyCoins] = useState(false);

  const { setUser } = useUser();

  const loadingMessages = [
    "Preparing top gear for your trip",
    "Checking your trip details",
    "Analyzing your bag data",
    "Building your hiking setup",
    "Finding missing essentials",
  ];
  

  const itemNamesOnly = categories.flatMap(category =>
    category.items?.map(item => item.name) || []
  );


  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setCurrentLoadingMessage(prev => {
          const currentIndex = loadingMessages.indexOf(prev);
          const nextIndex = (currentIndex + 1) % loadingMessages.length;
          return loadingMessages[nextIndex];
        });
      }, 3500);
  
      return () => clearInterval(interval);
    }
  }, [loading]);

  
  const handleAddCategoryToBag = async (categoryName: string, items: { name: string; qty: number; description: string; priority: string; weightOption: string; weight: number }[]) => {
    try {
      const createdCategory = await apiService.post(`/categories`, {
        bagId,
        name: categoryName,
        color: getRandomMidLightColor(),
        tripId,
      });

      const categoryId = (createdCategory as { _id: string })._id;

      if (!categoryId) {
        throw new Error("New category ID not returned from server.");
      }

      await Promise.all(
        items.map(item =>
          apiService.post(`/items`, {
            tripId,
            bagId,
            categoryId,
            name: item.name,
            qty: item.qty || 1,
            description: item.description || "",
            weight: item.weight || 0.1,
            weightOption: item.weightOption || "g",
            priority: item.priority || "Low",
          })
        )
      );

      queryClient.invalidateQueries({ queryKey: ["categories", bagId] });

      setResponse(prev =>
        prev.filter(cat => cat.categoryName !== categoryName)
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddItemToCategory = async (item: { name: string; qty: number; description: string; priority: string; weightOption: string; weight: number }, categoryId: string) => {
    try {
      await apiService.post(`/items`, {
        tripId,
        bagId,
        categoryId,
        name: item.name,
        qty: item.qty || 1,
        description: item.description || "",
        weight: item.weight || 0.1,
        weightOption: item.weightOption || "g",
        priority: item.priority || "Low",
      });

      queryClient.invalidateQueries({ queryKey: ["categories", bagId] });

      setResponse(prev =>
        prev.map(cat => ({
          ...cat,
          items: cat.items.filter(aiItem => aiItem.name !== item.name),
        })).filter(cat => cat.items.length > 0)
      );

      setShowDropdownForItem(null);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = useCallback(async () => {
    const storedUser = localStorage.getItem("user");
    const parsedUser = storedUser ? JSON.parse(storedUser) : null;
  
    // 👉 Check for coin balance before proceeding
    if (parsedUser?.coins < 2) {
      setShowBuyCoins(true);
      return;
    }
  
    setLoading(true);
    setResponse([]);
    setErrorMessage(null);
  
    try {
      const res = await fetch(`${API_URL}/api/ai`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          "Authorization": Cookies.get("token") || ""
        },
        body: JSON.stringify({
          input: userInput,
          bagId,
          tripId,
          itemNamesOnly
        }),
      });
  
      const data = await res.json().catch(() => {
        throw new Error("Invalid server response");
      });
  
      if (!res.ok) throw new Error(data.error || "Something went wrong");
  
      if (Array.isArray(data.suggestion)) {
        setResponse(data.suggestion);
        if (parsedUser && typeof data.newCoins === "number") {
          const updatedUser = {
            ...parsedUser,
            coins: data.newCoins,
          };
          localStorage.setItem("user", JSON.stringify(updatedUser));
          setUser(updatedUser);
        }
      } else {
        setErrorMessage("Suggestion data format is invalid.");
      }
    } catch (error) {
      console.error(error);
      setErrorMessage(error instanceof Error ? error.message : "Error fetching AI suggestion.");
    } finally {
      setLoading(false);
      setUserInput("");
    }
  }, [API_URL, bagId, tripId, userInput, setUser]);
  


  if (!isOpen) return null;

  const handleModalClose = () => {
    setShowDropdownForItem(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-dark-box w-[1000px] max-h-[90vh] p-6 pt-10 rounded-lg relative overflow-y-auto">

        <button
          onClick={handleModalClose}
          className="absolute top-4 right-4 text-gray-700 hover:text-black dark:text-gray-300 dark:hover:text-white"
        >
          <X size={24} />
        </button>

        

  <div className="overflow-y-auto flex-1">
  {!loading && (
  response.length === 0 ? (
    <div className="flex flex-1 items-center justify-center ">
    <div className="flex flex-col-reverse md:flex-row items-center justify-center gap-10 rounded-lg w-full">
   { <div className="w-full flex flex-col items-start text-left space-y-5">
     
  <h3 className="text-2xl sm:text-3xl font-extrabold text-black dark:text-white flex items-center gap-2">
    Let our smart AI do the thinking for you!
  </h3>

 <ul className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-base">
  <li className="flex items-start gap-3 p-4 rounded-xl border border-primary/30 bg-light dark:bg-dark dark:border-white/10 transition-transform">
    <span className="text-2xl">🧠</span>
    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
      Based on your trip and gear details, we’ll instantly create a personalized packing list that feels like it was made by a pro hiker who’s done this a hundred times.
    </p>
  </li>

  <li className="flex items-start gap-3 p-4 rounded-xl border border-primary/30 bg-light dark:bg-dark dark:border-white/10 transition-transform">
    <span className="text-2xl">🎒</span>
    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
      From must-haves to smart extras, you’ll get everything you need — and nothing you don’t. Even if your bag is completely empty, our AI can build your entire gear setup from scratch.
    </p>
  </li>

  <li className="flex items-start gap-3 p-4 rounded-xl border border-primary/30 bg-light dark:bg-dark dark:border-white/10 transition-transform">
    <span className="text-2xl">⚖️</span>
    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
      It understands what’s missing, what to add, and how to make your backpack fully ready and well-balanced — all tailored to your adventure.
    </p>
  </li>

  <li className="flex items-start gap-3 p-4 rounded-xl border border-primary/30 bg-light dark:bg-dark dark:border-white/10 transition-transform">
    <span className="text-2xl">📝</span>
    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
      You can also add a custom note to guide the AI — whether it’s a specific style, climate, or gear preference, your input helps shape the perfect list.
    </p>
  </li>
</ul>
        <Button
          onClick={handleSubmit}
          disabled={loading}
          variant="default"
          className="w-full py-6 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 text-white shadow-lg hover:-translate-y-1 transition-all duration-300"
        >
          <span className="relative z-10 flex items-center gap-2">Generate <span className="flex items-center gap-1 text-xs text-gray-200">( 2 credits <img src="/currency-icon.svg" alt="coin" className="w-4 h-4" />)</span> <Send className="w-5 h-5" /></span>
          
        
        </Button>
      </div>}

    </div>
  </div>
  ) : (

    <Fragment>
  <div className="">
    <h2 className="text-xl sm:text-2xl font-bold mb-4 text-center sm:text-left">
    ✨ We've Picked the Best Gear for Your Adventure!
    </h2>
    <div className="flex flex-col sm:flex-row w-full gap-3 p-4 rounded-xl bg-primary/10 dark:bg-dark shadow-md mb-5">
      <input
        type="text"
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        placeholder="Refine AI suggestions..."
        className="w-full px-4 py-2 border border-primary/30 dark:border-gray-700 rounded-md bg-white dark:bg-dark text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
      />
      <Button
        onClick={handleSubmit}
        disabled={!userInput.trim()}
        className={`w-full sm:w-60 py-2 flex items-center justify-center gap-1 rounded-md font-semibold transition-all duration-200 focus:ring-2 focus:ring-primary/50 ${
          userInput.trim()
            ? "bg-primary text-white hover:bg-primary/90"
            : "dark:bg-gray-100 text-gray-200 dark:text-gray-600 cursor-not-allowed"
        }`}
      >
      <span className="relative z-10 flex items-center gap-1"> Send <span className="flex items-center gap-1 text-xs text-gray-200 dark:text-gray-600">( 2 coins <img src="/currency-icon.svg" alt="coin" className="w-5 h-5" />)</span> <Send className="w-5 h-5" /></span>

      </Button>
    </div>
  </div>
</Fragment>
  )
)}




  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  {loading ? (
 <div className="col-span-2 flex items-center justify-center">
  <div className="w-[900px] dark:bg-dark-box bg-white/70 rounded-xl flex flex-col-reverse md:flex-row items-center justify-between  p-2 relative overflow-hidden">

    {/* LEFT SIDE */}
    <div className="relative w-full md:w-1/2 flex flex-col justify-center items-center text-center md:items-start md:text-left z-10">
      <div className="w-20 h-20 mb-6 relative m-auto">
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-secondary blur-lg opacity-70 animate-ping" />
        <div className="relative z-10 w-full h-full rounded-full bg-gradient-to-r from-primary to-indigo-500 shadow-lg" />
      </div>

      <h3 className="text-2xl font-bold mb-4 m-auto text-black dark:text-white">
         Processing your request...
      </h3>

      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 text-center max-w-md m-auto">
      Our AI is analyzing your trip, gear preferences, and environment to deliver the most optimized setup for your adventure.
     </p>


      <div className="w-full max-w-sm px-4 py-3 border border-dashed border-primary/50 dark:border-gray-300 rounded-lg bg-white/20 dark:bg-light backdrop-blur-md shadow-md m-auto">
        <span className="text-sm text-primary dark:text-primary font-medium tracking-wide animate-typewriter whitespace-nowrap block overflow-hidden border-r-2 border-primary pr-1">
          {currentLoadingMessage}
        </span>
      </div>
    </div>

    {/* RIGHT SIDE */}
    <div className="md:w-1/2 w-full relative h-[320px] flex items-center justify-center z-0">
      {/* Main Image */}
      <img
        src="/process.webp"
        alt="AI Custom"
        className="w-[230px] rounded-xl shadow-lg absolute z-20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      />
      {/* Supporting Image 1 */}
      <img
        src="/suggestions-ai.webp"
        alt="Gear 1"
        className="w-[120px] rounded-lg shadow-md absolute top-6 left-10 rotate-[-8deg] z-30"
      />
      {/* Supporting Image 2 */}
      <img
        src="/back-walking.webp"
        alt="Gear 2"
        className="w-[100px] rounded-lg shadow-md absolute bottom-6 right-10 rotate-[10deg] z-30"
      />
    </div>
  </div>
</div>

          ) : errorMessage ? (
            <div className="col-span-2 text-center text-red-500 font-semibold">
              {errorMessage}
            </div>
          ) : response.length > 0 ? (
            response.map((category, index) => (
              <div
  key={index}
  className="relative p-6 rounded-xl bg-primary/10 dark:bg-dark shadow-lg border border-primary/20 dark:border-dark-box"
>
  <div className="absolute top-4 right-4 flex items-center space-x-2">
    <button
      onClick={() => handleAddCategoryToBag(category.categoryName, category.items)}
      className="bg-primary text-white p-2 rounded-full shadow hover:bg-primary/90 transition"
    >
      <Plus size={20} />
    </button>
  </div>

  <h3 className="text-lg font-bold mb-4 text-primary">
    {category.categoryName}
  </h3>

  <ul className="space-y-4">
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
          <button
            onClick={() => setShowDropdownForItem(prev => (prev === item.name ? null : item.name))}
            className="bg-primary/10 hover:bg-primary text-primary hover:text-white dark:bg-primary/20 dark:hover:bg-primary dark:text-white p-2 rounded-full shadow transition"
          >
            <Plus size={20} />
          </button>

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
            ))
          ) : null}
        </div>
         </div>

      </div>

      {showBuyCoins && (
  <BuyCoinsDialog
    isOpen={showBuyCoins}
    onPurchase={(coinsAmount) => {
      console.log(`User selected to buy ${coinsAmount} coins`);
      setShowBuyCoins(false);
      alert(`You purchased ${coinsAmount} coins!`);
    }}
    onClose={() => setShowBuyCoins(false)}
  />
)}

    </div>
  );
};
