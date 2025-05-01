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
          tripId
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
      <div className="bg-white dark:bg-dark-box w-[1000px] max-h-[90vh] sm:max-h-[600px] lg:max-h-[650px] h-fit p-8 rounded-lg relative overflow-y-auto flex flex-col">

        <button
          onClick={handleModalClose}
          className="absolute top-4 right-4 text-gray-700 hover:text-black dark:text-gray-300 dark:hover:text-white"
        >
          <X size={24} />
        </button>

        

  <div className="overflow-y-auto flex-1">
  {!loading && (
  response.length === 0 ? (
    <div className="flex flex-1 items-center justify-center h-full">
    <div className="flex flex-col-reverse md:flex-row items-center justify-center bg-primary/10 gap-10 p-4 sm:p-10 rounded-lg max-w-5xl w-full">
   { <div className="w-full md:w-1/2 flex flex-col items-start text-left space-y-5 max-w-[500px]">
     <h3 className="text-3xl font-extrabold text-black dark:text-white relative z-10 flex items-center gap-2">
          Gear Up Smartly for Your Next Adventure
        </h3>
        <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed">
        Powered by advanced AI, our system evaluates your trip details, bag specifications, and personal preferences to generate a highly curated checklist — as if crafted by a professional hiker with decades of experience. It ensures you're fully equipped, from core necessities to specialized gear, leaving no critical item behind.
        </p>
        <Button
          onClick={handleSubmit}
          variant="default"
          className="relative font-extrabold w-full py-6 mb-5 border-4 shadow-2xl overflow-hidden transition-all duration-500 before:absolute before:inset-0 before:blur-lg before:opacity-50 before:transition-all before:duration-500
         text-white bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 border-purple-300 hover:-translate-y-1 before:bg-gradient-to-r before:from-purple-400 before:via-pink-400 before:to-indigo-400"
        >
          <span className="relative z-10 flex items-center gap-2">GENERATE AI SUGGESTIONS NOW </span>
          <span className="font-normal text-xs flex items-center">costs (2 <img src="/currency-icon.svg" alt="credits" className="w-4 h-4 rounded-full mr-1 ml-1" />)</span> 
        </Button>
      </div>}
  
        <div className="w-full md:w-1/2 max-w-[500px]">
        <img
          src="/hiker.webp"
          alt="Hiker in the mountains"
          className="w-full object-cover shadow-lg rounded-lg"
        />
      </div>
    </div>
  </div>
  ) : (

    <Fragment>
  <div className="">
    <h2 className="text-xl sm:text-2xl font-bold text-primary mb-4 text-center sm:text-left">
    We Found Gear Suggestions Just for You!
    </h2>
    <div className="flex flex-col sm:flex-row w-full gap-3 p-4 rounded-xl bg-primary/10 dark:bg-dark-box shadow-md mb-5">
      <input
        type="text"
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        placeholder="Refine AI suggestions..."
        className="w-full px-4 py-2 border border-primary/30 dark:border-gray-700 rounded-md bg-white dark:bg-dark-input text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
      />
      <Button
        onClick={handleSubmit}
        disabled={!userInput.trim()}
        className={`w-full sm:w-auto px-3 py-2 flex items-center justify-center gap-1 rounded-md font-semibold transition-all duration-200 focus:ring-2 focus:ring-primary/50 ${
          userInput.trim()
            ? "bg-primary text-white hover:bg-primary/90"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }`}
      >
       <Send className="w-4 h-4" />
      </Button>
    </div>
  </div>
</Fragment>
  )
)}




  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  {loading ? (
 <div className="col-span-2 flex items-center justify-center h-fit">
  <div className="w-[900px] h-fit bg-primary/5 dark:bg-dark-box rounded-xl flex flex-col md:flex-row items-center justify-center gap-10 p-10">

  <div className="w-full md:w-1/2 max-w-[500px]">
        <img
          src="/hiker-organize.webp"
          alt="Hiker in the mountains"
          className="w-full object-cover shadow-lg rounded-lg"
        />
      </div>

  <div className="w-full md:w-1/2 max-w-[400px] flex flex-col justify-center">
  <h3 className="text-2xl text-primary font-bold mb-8 text-center md:text-left">Processing...</h3>

    <ul className="space-y-6">
      
  {loadingMessages.map((msg, index) => (
    <li key={index} className="relative flex items-center gap-3">
      <div className="relative flex items-center justify-center w-5 h-5">
        <div
          className={`w-4 h-4 rounded-full shrink-0 z-10 ${
            currentLoadingMessage === msg
              ? 'bg-primary'
              : 'bg-gray-300 dark:bg-gray-600'
          }`}
        />
        {currentLoadingMessage === msg && (
          <div className="absolute w-6 h-6 border-2 border-primary/60 border-t-transparent rounded-full animate-spin" />
        )}
      </div>
      <span
        className={`text-md transition-opacity duration-300 ${
          currentLoadingMessage === msg
            ? 'text-gray-800 dark:text-gray-100'
            : 'text-gray-400 dark:text-gray-500'
        }`}
      >
        {msg}
      </span>
    </li>
  ))}
</ul>

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
  className="relative p-6 rounded-xl bg-primary/10 dark:bg-dark-box shadow-lg border border-primary/20 dark:border-primary/40"
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
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white dark:bg-dark-input rounded-md shadow hover:shadow-primary/30 transition"
      >
        <div className="flex flex-col gap-1">
          <span className="font-semibold text-gray-800 dark:text-white">{item.name}</span>
          <span className="text-sm text-gray-500 dark:text-gray-400">{item.description}</span>
          <span className="text-xs text-gray-400 dark:text-gray-500">
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
