import React, { Fragment, memo, useCallback, useState, useEffect} from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Image, Link, Copy, Shirt } from "lucide-react";
import { Item } from "@/types/item";
import TooltipButton from "../ui/tooltip-button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiService } from "@/lib/apiService";
import { useUser } from "@/context/user-context";
import LinkItem from "../dialogs/link-item";
import ImageItem from "../dialogs/image-item";
import { useToast } from "@/hooks/use-toast"
import { useIsSharedView } from "@/lib/isSharedView";
import { useRef } from "react";
import { useItemDnD } from "@/hooks/use-item-dnd";


interface ItemRowProps {
  item: Item;
  index: number;
  onSelect: (id: string, isSelected: boolean) => void;
  moveItem: (fromIndex: number, toIndex: number) => void;
}

const ItemRow: React.FC<ItemRowProps> = memo(({ item, index, onSelect, moveItem }) => {

  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);

  const queryClient = useQueryClient();
  const { user } = useUser();
  const { toast } = useToast()
  const isSharedView = useIsSharedView();

  let ref = useRef<HTMLTableRowElement>(null);
  let isDragging = false;

  if (!isSharedView) {
    const dnd = useItemDnD(index, moveItem);
    ref = dnd.ref;
    isDragging = dnd.isDragging;
  }


  const [formData, setFormData] = useState({
    _id: item._id || "",
    name: item.name || "",
    description: item.description || "",
    qty: item.qty || 1,
    weight: item.weight || 0.1,
    weightOption: item.weightOption || user?.weightOption || "oz",
    priority: item.priority || "Low",
    link: item.link || "",
    imageUrl: item.imageUrl || "",
    worn: item.worn || false
  });

  useEffect(() => {
    setFormData({
      _id: item._id || "",
      name: item.name || "",
      description: item.description || "",
      qty: item.qty || 1,
      weight: item.weight || 0.1,
      weightOption: item.weightOption || user?.weightOption || "oz",
      priority: item.priority || "Low",
      link: item.link || "",
      imageUrl: item.imageUrl || "",
      worn: item.worn || false
    });
  }, [item, user?.weightOption]); 



  const updateItemMutation = useMutation({
    mutationFn: (updatedData: Partial<Item>) => apiService.put(`/items/${item._id}`, updatedData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      queryClient.invalidateQueries({ queryKey: ["recentItems"] });
      queryClient.invalidateQueries({ queryKey: ["categories", item.bagId] });
    },
    onError: (error) => {
      console.error("Failed to update item:", error);
      toast({
        title: "Error",
        variant: "destructive",
        description: error?.message,
      });
    },
  });

  const updateWornMutation = useMutation({
    mutationFn: async (updatedWorn: boolean) => {
      return await apiService.put(`/items/${item._id}`, { worn: updatedWorn });
    },
    onSuccess: (_, updatedWorn) => {
      setFormData((prev) => ({ ...prev, worn: updatedWorn }));
      queryClient.invalidateQueries({ queryKey: ["items", item._id] });
      queryClient.invalidateQueries({ queryKey: ["categories", item.bagId] });
    },
    onError: (error) => {
      console.error("Failed to update worn status:", error);
      toast({
        title: "Error",
        variant: "destructive",
        description: error?.message,
      });
    },
  });


  const handleCheckboxChange = (checked: boolean) => {
    const isSelected = checked === true; 
    const itemId = item._id || "";
    onSelect(itemId, isSelected); 
  };

  
  const saveLink = (link: string) => {
  updateItemLinkMutation.mutate({link}); 
   }

   const updateWorn = () => {
    const newWornValue = !formData.worn; 
    updateWornMutation.mutate(newWornValue);
  };
  
  const saveImage = (file: File | null) => {
    if (file) {
      const formData = new FormData();
      formData.append("imageUrl", file);
      updateItemImageMutation.mutate(formData);
    }
  };

   const updateItemLinkMutation = useMutation({
    mutationFn: async ({ link }: { link: string }) => {
      return await apiService.put(`/items/${item._id}`, { link });
    },
    onSuccess: (_, variables) => {
      setFormData((prev) => ({ ...prev, link: variables.link })); 
      queryClient.invalidateQueries({ queryKey: ["items", item._id] });
      setIsLinkDialogOpen(false);
    },
    onError: (error) => {
      console.error("Failed to update the link:", error);
      toast({
        title: "Error",
        variant: "destructive",
        description: error?.message,
      });
    },
  });


  const updateItemImageMutation = useMutation<Item, Error, FormData>({
    mutationFn: (formData) => {
      return apiService.put(`/items/${item._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: (data) => {
      setFormData((prev) => ({...prev, imageUrl: data.imageUrl ?? ""}));
      queryClient.invalidateQueries({ queryKey: ["items", item._id] });
      setIsImageDialogOpen(false);
    },
    onError: (error) => {
      console.error("Failed to update the image:", error);
      toast({
        title: "Error",
        variant: "destructive",
        description: error?.message,
      });
    },
  });

  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };


  const handleChangeAndImmediateUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {

    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }))  
    updateItemMutation.mutate({ [name]: value });
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateItemMutation.mutate({ [name]: value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    updateItemMutation.mutate({ [name]: value });
  };

  const duplicateItemMutation = useMutation({
    mutationFn: (data: Partial<Item>) => apiService.post("/items", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      queryClient.invalidateQueries({ queryKey: ["categories", item.bagId] });
    },
    onError: (error) => {
      console.error("Failed to duplicate item:", error);
      toast({
        title: "Error",
        variant: "destructive",
        description: error?.message,
      });
    },
  });

  const handleDuplicate = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, createdAt, updatedAt, ...itemData } = item;
    const duplicateData = {
      ...itemData,
      imageUrl: formData.imageUrl, 
    };
    duplicateItemMutation.mutate(duplicateData);
  }, [item, formData.imageUrl, duplicateItemMutation]);


  
  const getPriorityClasses = (priority: string, isDarkTheme: boolean) => {
    if (isDarkTheme) {
      return priority === "Low"
        ? "bg-green-200 dark:bg-green-800 text-green-600 dark:text-green-300"
        : priority === "Medium"
        ? "bg-orange-200 dark:bg-orange-800 text-orange-600 dark:text-orange-300"
        : "bg-red-200 dark:bg-red-800 text-red-600 dark:text-red-300";
    } else {
      return priority === "Low"
        ? "bg-green-200 text-green-600"
        : priority === "Medium"
        ? "bg-orange-200 text-orange-600"
        : "bg-red-200 text-red-600";
    }
  };

  return (
    <Fragment>
    <TableRow key={item._id} className={`group relative hover:bg-gray-50 dark:hover:bg-dark w-full  ${
    isDragging ? "opacity-50 ring-2 ring-primary/50 scale-[0.98]" : ""}`}  ref={!isSharedView ? ref : undefined}>
      <TableCell className="pl-5 flex items-center">
        {!isSharedView ? <Checkbox onCheckedChange={handleCheckboxChange}  /> : null }
      </TableCell>

      <TableCell className="p-1">
        <Input
          type="text"
          name="name"
          value={formData.name}
          placeholder="Name"
          className="w-52 md:w-full h-8 text-xs bg-white rounded-none dark:bg-dark-item"
          onChange={isSharedView ? undefined : handleChange}
          onBlur={isSharedView ? undefined : handleBlur}
          readOnly={isSharedView}
        />
      </TableCell>

      <TableCell className="p-1">
        <Input
          type="text"
          name="description"
          value={formData.description}
          placeholder="Description"
          className="w-80 md:w-full h-8 text-xs bg-white rounded-none dark:bg-dark-item"
          onChange={isSharedView ? undefined : handleChange}
          onBlur={isSharedView ? undefined : handleBlur}
          readOnly={isSharedView}
        />
      </TableCell>

      <TableCell className="p-1">
        <Input
          type="number"
          name="qty"
          value={formData.qty}
          placeholder="Qty"
          min={1}
          className="w-14 h-8 text-xs bg-white rounded-none dark:bg-dark-item"
          onChange={isSharedView ? undefined : handleChangeAndImmediateUpdate}
          readOnly={isSharedView}
        />
      </TableCell>

      <TableCell className="p-1">
        <Input
          type="number"
          name="weight"
          value={formData.weight}
          step={0.1}
          placeholder="Weight"
          min={0.1}
          className="w-20 h-8 text-xs bg-white rounded-none dark:bg-dark-item"
          onChange={isSharedView ? undefined : handleChangeAndImmediateUpdate}
          readOnly={isSharedView}
        />
      </TableCell>

      <TableCell className="p-1">
        <Select
          value={formData.weightOption}
          onValueChange={isSharedView ? undefined : (value) => handleSelectChange("weightOption", value)}>
          <SelectTrigger className="w-16 h-8 dark:bg-dark-item dark:border-zinc-700">
            <SelectValue>{formData.weightOption}</SelectValue>
          </SelectTrigger>
          {!isSharedView && (
      <SelectContent>
        <SelectItem value="oz">oz</SelectItem>
        <SelectItem value="kg">kg</SelectItem>
        <SelectItem value="lb">lb</SelectItem>
        <SelectItem value="g">g</SelectItem>
      </SelectContent>
    )}
        </Select>
      </TableCell>

   <TableCell className="p-1">
  <Select
    value={formData.priority}
    onValueChange={isSharedView ? undefined : (value) => handleSelectChange("priority", value)}>
    <SelectTrigger className={`w-24 h-8 border ${getPriorityClasses(formData.priority, true)}`}>
    <SelectValue>{formData.priority}</SelectValue>
    </SelectTrigger>
    {!isSharedView && (
    <SelectContent>
      <SelectItem value="Low">Low</SelectItem>
      <SelectItem value="Medium">Medium</SelectItem>
      <SelectItem value="High">High</SelectItem>
    </SelectContent>
    )}
  </Select>
</TableCell>

<TableCell className="flex justify-center p-1">
  <TooltipButton
    icon={<Image size={14} className={`${formData.imageUrl ? "text-primary" : ""}`}/>}
    tooltipText={isSharedView ? "Item Image" : "Add an image"}
    onClick={() => setIsImageDialogOpen(true)}
  />
  <TooltipButton
    icon={<Shirt size={14} className={`${formData.worn ? "text-secondary" : ""}`} />}
    tooltipText={isSharedView ? "Worn/Unworn" : "Mark as Worn"}
    onClick={() => !isSharedView && updateWorn()}
  />
  {!isSharedView && (
    <TooltipButton
      icon={<Copy size={14} />}
      tooltipText="Duplicate"
      onClick={handleDuplicate}
    />
  )}
  <TooltipButton
    icon={<Link size={14} className={`${formData.link?.length > 0 ? "text-blue-500" : ""}`} />}
    tooltipText={isSharedView ? "Item Link" : "Add a link"}
    onClick={() => setIsLinkDialogOpen(true)}
  />
</TableCell>
    </TableRow>

    <LinkItem title={ isSharedView ? "Item Link" : "Add a Link"} description={isSharedView ? "View the link associated with this item." : "Provide a link for the selected item."} isOpen={isLinkDialogOpen} initialLink={formData.link} onClose={() => setIsLinkDialogOpen(false)} onSave={saveLink} loading={updateItemLinkMutation.isPending} />
    <ImageItem title={isSharedView ? "Item Image" : "Add an Image"} description={isSharedView ? "View the image associated with this item." : "Upload and display an image for this item."} isOpen={isImageDialogOpen} initialImage={formData.imageUrl} onClose={() => setIsImageDialogOpen(false)} onSave={saveImage} loading={updateItemImageMutation.isPending} />

  </Fragment>
  );
});

export default ItemRow;
