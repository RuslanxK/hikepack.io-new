import { useState} from "react";
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { ListRestart, ChevronRight, ChevronLeft } from "lucide-react";
import { apiService } from "@/lib/apiService";
import { Item } from "@/types/item";
import { Category } from "@/types/category";
import { useQuery } from "@tanstack/react-query";
import { fetchCategoriesByBagId } from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useQueryClient } from "@tanstack/react-query";

export function RecentItemsBar() {
  const [isOpen, setIsOpen] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const queryClient = useQueryClient();
  const bagId = localStorage.getItem("bagId");


  const { data: items = [], isLoading } = useQuery<Item[]>({
    queryKey: ["recentItems"],
    queryFn: async () => {
      const response = await apiService.get<Item[]>("/items/all/by-user");
      return response;
    },
  });


  const handleOpenModal = async (item: Item) => {
    if (!item._id || !bagId) return;
  
    setSelectedItem(item);
    setSelectedCategories([]);
    setModalOpen(true);
  
    try {
      const fetchedCategories = await fetchCategoriesByBagId(bagId, true);
      setCategories(fetchedCategories);
    } catch (err) {
      console.error("Failed to fetch categories", err);
    }
  };

  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };


  const handleAddToCategories = async () => {
    if (!selectedItem || selectedCategories.length === 0) return;
  
    setIsSaving(true);
    try {

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _id, worn, link, imageUrl, ...rest } = selectedItem;
      const baseItem = { ...rest, worn, link, ...(imageUrl ? { imageUrl } : {}), };
  
      await Promise.all(
        selectedCategories.map((categoryId) => {
          const newItem = { ...baseItem, categoryId };
          return apiService.post("/items", newItem);
        })
      );
  
      queryClient.invalidateQueries({ queryKey: ["categories", bagId] });
      setModalOpen(false);
    } catch (err) {
      console.error("Failed to add item to categories", err);
    } finally {
      setIsSaving(false);
    }
  };
  

  return (
    <div className={`fixed top-0 right-0 z-40 h-screen md:h-auto md:relative ${isOpen ? "w-72" : "w-5"} border-l border-gray-200 dark:border-dark-box bg-primary dark:bg-dark`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-20 sm:top-auto sm:right-auto z-10 w-5 h-8 bg-secondary dark:bg-secondary dark:border-dark-box rounded-r-md flex items-center justify-center"
      >
        {isOpen ? <ChevronRight className="w-4 h-4 text-white" /> : <ChevronLeft className="w-4 h-4 text-white" />}
      </button>

      {isOpen && (
        <SidebarContent className="h-full flex flex-col fixed">
          <SidebarGroup className="pl-6">
            <SidebarGroupLabel className="text-white">Recent Items</SidebarGroupLabel>
            <SidebarGroupContent className="overflow-y-hidden flex-1 hide-scrollbar">
              <SidebarMenu>
                {isLoading ? (
                  <p className="text-white text-sm px-3">Loading...</p>
                ) : items.length === 0 ? (
                  <p className="text-white text-sm px-3">No items found.</p>
                ) : (
                  items.map((item) => (
                    <SidebarMenuItem
                      key={item._id}
                      className="flex items-center justify-between pr-2"
                      onClick={() => handleOpenModal(item)}
                    >
                      <SidebarMenuButton className="hover:bg-transparent active:bg-transparent hover:text-white active:text-white focus:outline-none" asChild>
                        <a href="#" className="flex items-center gap-2 text-white">
                          <ListRestart className="w-6 h-6" />
                          <span className="max-w-[80px] overflow-hidden text-ellipsis whitespace-nowrap">
                            {item.name.length > 9 ? item.name.slice(0, 9) + "..." : item.name}
                          </span>
                        </a>
                      </SidebarMenuButton>

                    </SidebarMenuItem>
                  ))
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      )}

      {/* Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
      <DialogContent className="max-w-lg rounded-xl bg-white dark:bg-dark p-6 shadow-xl border border-gray-200 dark:border-gray-700">
  <DialogHeader>
    <DialogTitle className="text-lg font-bold text-gray-800 dark:text-white">
      Add "{selectedItem?.name}" to Categories
    </DialogTitle>
    <DialogDescription className="text-sm text-gray-500 dark:text-gray-400">
    {categories.length === 0 ? "No categories found. Please create a category first." : "Choose one or more categories below to assign the item." }
    </DialogDescription>
  </DialogHeader>

  <div className="space-y-2 max-h-[250px] overflow-y-auto mt-4">
  {(
    categories.map((category) => (
      <label
        key={category._id}
        className="flex items-center justify-between px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-dark-nav"
      >
        <span className="text-sm text-gray-700 dark:text-gray-200">
          {category.name ? category.name : "Unnamed Category"}
        </span>
        <Checkbox
          checked={selectedCategories.includes(category._id)}
          onCheckedChange={() => toggleCategory(category._id)}
        />
      </label>
    ))
  )}
</div>

  <div className="flex justify-end gap-2 mt-6">
    <Button
      variant="ghost"
      onClick={() => setModalOpen(false)}
      className="text-gray-600 dark:text-gray-300">
      Cancel
    </Button>
    <Button
      onClick={handleAddToCategories}
      disabled={isSaving || selectedCategories.length === 0}
      className="bg-primary text-white hover:bg-gray-900"
    >
      {isSaving ? "Saving..." : "Add"}
    </Button>
  </div>
</DialogContent>
      </Dialog>
    </div>
  );
}
