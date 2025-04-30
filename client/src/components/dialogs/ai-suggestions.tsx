import { useState, useEffect, useCallback } from "react";
import { X, Plus } from "lucide-react";
import { Category } from "@/types/category";
import { apiService } from "@/lib/apiService";
import { queryClient } from "@/lib/react-query-client";
import { getRandomMidLightColor } from "@/lib/colorUtils";
import Cookies from "js-cookie";
import { useUser } from "@/context/user-context";
import { Sparkles } from 'lucide-react';
import { Button } from "../ui/button";


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
  const [currentLoadingMessage, setCurrentLoadingMessage] = useState("Preparing the best options for your backpack...");
  const [userInput, setUserInput] = useState("");

  const { setUser } = useUser();

  const loadingMessages = [
    "Preparing the best options for your backpack...",
    "Calculating based on your trip country and dates...",
    "Optimizing gear by your bag's weight goal...",
    "Analyzing the perfect hiking setup for you...",
    "Finding the missing essentials you might need...",
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
    setLoading(true);
    setResponse([]);
    setErrorMessage(null);


    try {
      const res = await fetch(`${API_URL}/api/ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": Cookies.get("token") || ""},
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
        const storedUser = localStorage.getItem("user");
        if (storedUser && typeof data.newCoins === "number") {
          const parsedUser = JSON.parse(storedUser);
        
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

      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Error fetching AI suggestion.");
      }
    } finally {
      setLoading(false);
    }
  }, [API_URL, bagId, tripId, userInput, setUser]);


  if (!isOpen) return null;

  const handleModalClose = () => {
    setShowDropdownForItem(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-dark-box w-[90%] h-[90%] p-8 rounded-lg relative overflow-y-auto flex flex-col justify-between">
        <button
          onClick={handleModalClose}
          className="absolute top-4 right-4 text-gray-700 hover:text-black dark:text-gray-300 dark:hover:text-white"
        >
          <X size={24} />
        </button>

  <div className="">
  {!loading && (
  response.length === 0 ? (
    <div className="w-full mb-10">
    <div className="flex flex-col-reverse md:flex-row items-center gap-10 p-10 dark:from-dark dark:via-dark-box dark:to-dark-box">
      
      {/* Text Section */}
     { <div className="w-full md:w-1/2 flex flex-col items-start text-left space-y-5 p-10">
        <h3 className="text-3xl font-extrabold  leading-snug">
          Gear Up Smartly for Your Next Adventure
        </h3>
        <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed">
        Powered by advanced AI, our system evaluates your trip details, bag specifications, and personal preferences to generate a highly curated checklist — as if crafted by a professional hiker with decades of experience. It ensures you're fully equipped, from core necessities to specialized gear, leaving no critical item behind.
        </p>
        <Button
          onClick={handleSubmit}
          className="mt-4 px-8 py-3 bg-primary hover:bg-primary text-white  font-bold rounded-md hover:bg-primary/90"
        >
          GENERATE AI SUGGESTIONS NOW
          <Sparkles />
        </Button>
      </div>}
  
      {/* Image Section */}
      <div className="w-full md:w-1/2">
        <img
          src="/hiker.webp"
          alt="Hiker in the mountains"
          className="w-full object-cover shadow-lg rounded"
        />
      </div>
    </div>
  </div>
  ) : (
    <div className="flex flex-col sm:flex-row items-center gap-2 relative p-6 rounded-2xl bg-gradient-to-br from-purple-100 via-white to-purple-200 dark:from-dark dark:via-dark-box dark:to-dark-box shadow-2xl hover:shadow-purple-300 dark:hover:shadow-purple-800 transition-shadow duration-300 mb-5">
      <input
        type="text"
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        placeholder="Refine AI suggestions..."
        className="flex-grow w-full sm:w-fit p-3 border rounded-lg bg-gray-100 dark:bg-dark-input dark:text-white"
      />
      <button
        onClick={handleSubmit}
        disabled={!userInput.trim()}
        className={`px-6 py-3 w-full sm:w-fit flex items-center rounded-lg font-bold transition flex justify-center ${
          userInput.trim()
            ? "bg-purple-500 hover:bg-primary text-white"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }`}
      >
        Regenerate 2 <img src="/currency-icon.svg" alt="coin" className="w-5 h-5 mx-1 inline-block" />
      </button>
    </div>
  )
)}



  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  {loading ? (
  <div className="col-span-2 flex flex-col items-center justify-center p-6via-white dark:from-dark dark:via-dark-box dark:to-dark-box">
  <h3 className="text-3xl font-bold mb-8">Processing AI Suggestions...</h3>
  <div className="relative w-full pl-6 flex justify-center">

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
          <div className="absolute w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
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

          ) : errorMessage ? (
            <div className="col-span-2 text-center text-red-500 font-semibold">
              {errorMessage}
            </div>
          ) : response.length > 0 ? (
            response.map((category, index) => (
              <div
                key={index}
                className="relative p-6 rounded-2xl bg-gradient-to-br from-purple-100 via-white to-purple-200 dark:from-dark dark:via-dark-box dark:to-dark-box shadow-2xl hover:shadow-purple-300 dark:hover:shadow-purple-800 transition-shadow duration-300"
              >
                <div className="absolute top-4 right-4 flex items-center space-x-2">
  <button
    onClick={() => handleAddCategoryToBag(category.categoryName, category.items)}
    className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all duration-200"
  >
    <Plus size={20} />
  </button>
</div>

                <h3 className="text-xl font-bold mb-4 text-purple-700 dark:text-purple-400">
                  {category.categoryName}
                </h3>

                <ul className="list-none space-y-4 text-gray-800 dark:text-gray-300">
  {category.items.map((item, idx) => (
    <li
      key={idx}
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/80 dark:bg-dark-input px-4 sm:px-6 py-4 rounded-md hover:bg-purple-100 dark:hover:bg-purple-900 transition-colors"
    >
      <div className="flex flex-col gap-1">
        <span className="text-base font-bold">{item.name}</span>
        <span className="text-sm text-gray-600 dark:text-gray-400">{item.description}</span>
        <span className="text-xs mt-1 text-gray-500 dark:text-gray-500">
          Qty: {item.qty} · {item.weight}{item.weightOption} · Priority: {item.priority}
        </span>
      </div>

      <div className="relative flex-shrink-0">
        <button
          onClick={() => setShowDropdownForItem(prev => (prev === item.name ? null : item.name))}
          className="bg-purple-100 hover:bg-purple-300 text-purple-800 dark:bg-purple-700 dark:hover:bg-purple-600 dark:text-white p-2 rounded-full shadow-md transition"
        >
          <Plus size={20} />
        </button>

        {showDropdownForItem === item.name && (
          <div
            className="absolute right-0 mt-2 w-64 bg-white dark:bg-dark-box border rounded shadow-lg z-50 p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 px-2 mb-2">
              Choose a Category
            </h3>
            <div className="flex flex-col space-y-1 max-h-60 overflow-y-auto">
              {categories.map(cat => (
                <div
                  key={cat._id}
                  className="px-4 py-2 whitespace-nowrap hover:bg-purple-100 dark:hover:bg-purple-900 cursor-pointer rounded"
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
    </div>
  );
};
