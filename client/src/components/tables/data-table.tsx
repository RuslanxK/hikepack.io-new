
import React,{ useState, useCallback, useEffect} from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {Table,TableBody,TableHead,TableHeader,TableRow} from "@/components/ui/table";
import {Grip, ListPlus, Trash2 } from "lucide-react";
import { DataTableProps } from "@/types/category";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import DeleteAlert from "../ui/delete-alert";
import { apiService } from "@/lib/apiService";
import ItemRow from "./item-row";
import { CSS } from '@dnd-kit/utilities';
import { useToast } from "@/hooks/use-toast"
import { createItem } from "@/lib/api";
import { useIsSharedView } from "@/lib/isSharedView";
import { useSortable } from "@dnd-kit/sortable";


export const DataTable: React.FC<DataTableProps> = React.memo(({ data }) => {

  const queryClient = useQueryClient();
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [category, setCategory] = useState(data.name); 
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [addingItem, setAddingItem] = useState(false)
  const [items, setItems] = useState(() =>
    (data.items ?? []).slice().sort((a, b) => (a.order || 0) - (b.order || 0))
  );

  const { toast } = useToast()
  const isSharedView = useIsSharedView();


  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: data._id, disabled: isSharedView });
  const style = { transform: CSS.Translate.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  useEffect(() => {
    if (data.items) {
      setItems(data.items.slice().sort((a, b) => (a.order || 0) - (b.order || 0)));
    }
  }, [data.items]);
 
  const handleAddItem = () => {
    saveNewItem();
  };


  const { mutate: saveNewItem } = useMutation({

    mutationFn: async () => {
    setAddingItem(true)
    return await createItem({tripId: data.tripId, bagId: data.bagId, categoryId: data._id, name: "", description: "", qty: 1, weight: 0.1, weightUnit: "lb", priority: "Low", worn: false})},
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items", data.tripId, data.bagId, data._id] });
      queryClient.invalidateQueries({ queryKey: ["categories", data.bagId] });
      setAddingItem(false)
    },
    onError: (error) => {
      console.error("Failed to create item:", error);
      toast({
        title: "Error",
        variant: "destructive",
        description: error?.message,
      });

      setAddingItem(false)
    },
  });



  const { mutate: deleteCategory, isPending } = useMutation({
    mutationFn: async () => {
      await apiService.delete(`/categories/${data._id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error) => {
      console.error('Failed to delete category:', error);
      toast({
        title: "Error",
        variant: "destructive",
        description: error?.message,
      });
    },
  });

  const { mutate: deleteSelectedItems, isPending: deleteItemsPending } = useMutation({
    mutationFn: async () => {
      // Step 1: Delete selected items from the server
      await apiService.delete("/items", { data: { ids: selectedItems } });
  
      // Step 2: Filter remaining items
      const remainingItems = items.filter(
        (item) => item._id && !selectedItems.includes(item._id)
      );
  
      // Step 3: Recalculate order
      const reorderedItems = remainingItems.map((item, index) => ({
        ...item,
        order: index + 1,
      }));
  
      // Step 4: Update order in backend
      await Promise.all(
        reorderedItems.map((item) =>
          apiService.put(`/items/order/${item._id}`, { order: item.order })
        )
      );
  
      // Step 5: Update local state
      setItems(reorderedItems);
      setSelectedItems([]);
    },
    onSuccess: () => {
      // Invalidate cache so everything stays in sync
      queryClient.invalidateQueries({ queryKey: ["items", data.tripId, data.bagId, data._id] });
      queryClient.invalidateQueries({ queryKey: ["categories", data.bagId] });
    },
    onError: (error) => {
      console.error("Failed to delete items:", error);
      toast({
        title: "Error",
        variant: "destructive",
        description: error?.message,
      });
    },
  });
  

  const handleDeleteCategory = () => {
    setShowDeleteAlert(true);
  };

  const cancelDelete = useCallback(() => {
     setShowDeleteAlert(false);
  }, []);

    
    const handleSelectItem = useCallback((id: string, isSelected: boolean) => {
      setSelectedItems((prevSelectedItems) =>isSelected ? [...prevSelectedItems, id] : prevSelectedItems.filter((itemId) => itemId !== id));
    }, []);


   const { mutate: updateCategory } = useMutation({
    mutationFn: async (updatedCategory: { name: string }) => {
       await apiService.put(`/categories/${data._id}`, updatedCategory);
        },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["categories", data._id] });
        },
    onError: (error) => {
        console.error("Failed to update category:", error);
        toast({
          title: "Error",
          variant: "destructive",
          description: error?.message,
        });
        },
      });
  
      const handleCategoryBlur = () => {
        if ((category ?? "").trim() !== data.name) {
          updateCategory({ name: category ?? "" });
        }
      };


      const { mutate: updateItemOrder } = useMutation({
        mutationFn: async ({ id, order }: { id: string; order: number }) =>
          await apiService.put(`/items/order/${id}`, { order }),
        onError: (error) => {
          console.error("Failed to update order:", error);
          toast({
            title: "Error",
            variant: "destructive",
            description: error?.message,
          });
        },
      });

      const moveItem = useCallback((from: number, to: number) => {
        setItems((prevItems) => {
          const updated = [...prevItems];
          const [moved] = updated.splice(from, 1);
          updated.splice(to, 0, moved);
          updated.forEach((item, idx) => {
            if (item._id) {
              updateItemOrder({ id: item._id, order: idx + 1 }); 
            }
          });
      
          return updated;
        });
      }, [updateItemOrder]);
     


  return (
  <div className="bg-white dark:bg-dark-box rounded-lg mb-5 border-l-8 border-r border-t border-b" style={{ ...style, borderLeftColor: data.color }} ref={setNodeRef}>
  <div className="flex items-center gap-2 group pr-2 pl-2 pt-2" >
  {!isSharedView && (
   <Button variant="ghost" size="icon" className="mr-1" {...attributes} {...listeners}>
   <Grip size={18} className="cursor-move mr-1" />
   </Button>
  )}
  
   <Input type="text" value={category}  onChange={isSharedView ? undefined : (e) => setCategory(e.target.value)} onBlur={isSharedView ? undefined : handleCategoryBlur} placeholder="Example: Cooking Gear, First Aid, Clothing..." readOnly={isSharedView} className="w-full h-8 text-sm bg-white border-0 border-b dark:border-zinc-500 rounded-none focus:outline-none"/>
       
  {!isSharedView && (
   <Button variant="ghost" size="icon" onClick={handleDeleteCategory}>
   <Trash2 className="cursor-pointer" />
   </Button>
 )}

  </div>
      <div className={`${isSharedView ? "pb-5" : null}`}>
        <Table className="text-sm">
          <TableHeader>
            <TableRow>
              <TableHead className={ !isSharedView ? "w-12" : "w-10"}></TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-10">Qty</TableHead>
              <TableHead className="w-10">Weight</TableHead>
              <TableHead className="w-10">Unit</TableHead>
              <TableHead className="w-10">Priority</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
          
          {items?.map((item, index) => (
         <ItemRow key={item._id} item={item} index={index}  moveItem={moveItem} onSelect={handleSelectItem} />
          ))}
          </TableBody>
        </Table>
      </div>

       {!isSharedView && (
      <div className="flex gap-2 p-2">
        <Button variant="ghost" size="sm" onClick={handleAddItem} disabled={addingItem} >
          <ListPlus /> Add Item 
        </Button>
        {selectedItems.length > 0 && (
          <Button variant="ghost" size="sm" disabled={deleteItemsPending} onClick={() => deleteSelectedItems()} >
            <Trash2 /> Delete Selected
          </Button>
        )}
      </div>
       )}

      <DeleteAlert isOpen={showDeleteAlert} description={`Are you sure you want to delete the category? This action cannot be undone.`} onConfirm={deleteCategory} onCancel={cancelDelete} isDeleting={isPending} />
    </div>
  );
})
