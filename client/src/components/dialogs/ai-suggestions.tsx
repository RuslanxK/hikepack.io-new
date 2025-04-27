import { useState, useEffect, useCallback } from "react";
import { X, Plus } from "lucide-react";
import { Category } from "@/types/category";
import { apiService } from "@/lib/apiService";
import { queryClient } from "@/lib/react-query-client";
import { getRandomMidLightColor } from "@/lib/colorUtils";

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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: "Suggest missing or needed hiking gear items and categories based on current bag.",
          bagId,
        }),
      });

      const data = await res.json().catch(() => {
        throw new Error("Invalid server response");
      });

      if (!res.ok) throw new Error(data.error || "Something went wrong");

      if (Array.isArray(data.suggestion)) {
        setResponse(data.suggestion);
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
  }, [API_URL, bagId]);

  useEffect(() => {
    if (isOpen) {
      handleSubmit();
    }
  }, [isOpen, handleSubmit]);

  if (!isOpen) return null;

  const handleModalClose = () => {
    setShowDropdownForItem(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-dark-box w-[90%] h-[90%] p-8 rounded-lg relative overflow-y-auto">
        <button
          onClick={handleModalClose}
          className="absolute top-4 right-4 text-gray-700 hover:text-black dark:text-gray-300 dark:hover:text-white"
        >
          <X size={24} />
        </button>

        <h2 className="text-3xl font-extrabold mb-8 text-center text-purple-700 dark:text-purple-400">
          Add AI Suggestions
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center col-span-2">
              <div className="w-12 h-12 border-4 border-purple-400 border-dashed rounded-full animate-spin mb-4"></div>
              <p className="text-purple-500">Fetching AI suggestions...</p>
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
                    className="text-purple-500 hover:text-purple-700 transition"
                  >
                    <Plus />
                  </button>
                </div>

                <h3 className="text-xl font-bold mb-4 text-purple-700 dark:text-purple-400">
                  {category.categoryName}
                </h3>

                <ul className="list-none space-y-4 text-gray-800 dark:text-gray-300">
                  {category.items.map((item, idx) => (
                    <li
                      key={idx}
                      className="flex items-start justify-between bg-white/80 dark:bg-dark-input px-6 py-4 rounded-md hover:bg-purple-100 dark:hover:bg-purple-900 transition-colors"
                    >
                      <div className="flex flex-col gap-1">
                        <span className="text-lg font-bold">{item.name}</span>
                        <span className="text-base text-gray-600 dark:text-gray-400">{item.description}</span>
                        <span className="text-sm mt-1 text-gray-500 dark:text-gray-500">
                          Qty: {item.qty} · {item.weight}{item.weightOption} · Priority: {item.priority}
                        </span>
                      </div>

                      <div className="relative">
                        <button
                          onClick={() => setShowDropdownForItem(prev => (prev === item.name ? null : item.name))}
                          className="text-purple-400 hover:text-purple-700 transition"
                        >
                          <Plus size={20} />
                        </button>

                        {showDropdownForItem === item.name && (
                          <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-dark-box border rounded shadow-lg z-50 p-2" onClick={(e) => e.stopPropagation()}>
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
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center m-auto">
              Your AI suggestions will be displayed here.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
