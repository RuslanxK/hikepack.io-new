import React, { Fragment, memo, useEffect, useState } from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Item } from "@/types/item";
import { Image, Link, Shirt, Copy } from "lucide-react";
import TooltipButton from "../ui/tooltip-button";
import LinkItem from "../dialogs/link-item";
import ImageItem from "../dialogs/image-item";

interface LocalItemRowProps {
  item: Item;
  onUpdate: (item: Item) => void;
  onDelete: (itemId: string) => void;
  onSelect: (id: string, isSelected: boolean) => void;
  onDuplicate: (item: Omit<Item, "_id">) => void; 

}


const LocalItemRow: React.FC<LocalItemRowProps> = memo(({ item, onUpdate, onDuplicate, onSelect }) => {
  const [formData, setFormData] = useState<Item>(item);
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);


const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });


  useEffect(() => {
    setFormData(item);
  }, [item]);

  const handleCheckboxChange = (checked: boolean) => {
    if (item._id) {
      onSelect(item._id, checked);
    }
  };


  const saveLink = (link: string) => {
    const updated = { ...formData, link };
    setFormData(updated);
    onUpdate(updated); 
    setIsLinkDialogOpen(false)
  };
  

  const saveImage = async (file: File | null) => {
  if (file) {
    const imageUrl = await fileToBase64(file); // base64 instead of blob
    const updated = { ...formData, imageUrl };
    setFormData(updated);
    onUpdate(updated); // update localStorage too
    setIsImageDialogOpen(false);
  }
};

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: name === 'qty' || name === 'weight' ? parseFloat(value) : value };
    setFormData(updated);
  };


  const handleQtyOrWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const parsed = parseFloat(value);
    const updated = { ...formData, [name]: parsed };
    setFormData(updated);
    onUpdate(updated); // instantly update
  };


  const handleBlur = () => {
    onUpdate(formData);
  };

  const handleSelectChange = (name: string, value: string) => {
    const updated = { ...formData, [name]: value };
    setFormData(updated);
    onUpdate(updated);
    
  };

  const toggleWorn = () => {
    const updated = { ...formData, worn: !formData.worn };
    setFormData(updated);
    onUpdate(updated);
    
  };

  const duplicateItem = () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, ...rest } = formData;
    onDuplicate(rest); 
  };

  const getPriorityClasses = (priority: string) => {
    return priority === "Low"
      ? "bg-green-200 dark:bg-green-800 text-green-600 dark:text-green-300"
      : priority === "Medium"
      ? "bg-orange-200 dark:bg-orange-800 text-orange-600 dark:text-orange-300"
      : "bg-red-200 dark:bg-red-800 text-red-600 dark:text-red-300";
  };

  return (
    <Fragment>
      <TableRow key={item._id} className="group relative hover:bg-gray-50 dark:hover:bg-dark w-full">
        <TableCell className="pl-5 flex items-center">
          <Checkbox className="md:absolute top-4" onCheckedChange={handleCheckboxChange} />
        </TableCell>

        <TableCell className="p-1">
          <Input
            type="text"
            name="name"
            value={formData.name}
            placeholder="Name"
            className="w-52 md:w-full h-8 text-xs bg-white rounded-none dark:bg-dark-item"
            onChange={handleChange}
            onBlur={handleBlur}
          />
        </TableCell>

        <TableCell className="p-1">
          <Input
            type="text"
            name="description"
            value={formData.description}
            placeholder="Description"
            className="w-80 md:w-full h-8 text-xs bg-white rounded-none dark:bg-dark-item"
            onChange={handleChange}
            onBlur={handleBlur}
          />
        </TableCell>

        <TableCell className="p-1">
          <Input
            type="number"
            name="qty"
            value={formData.qty}
            min={1}
            className="w-14 h-8 text-xs bg-white rounded-none dark:bg-dark-item"
            onChange={handleQtyOrWeightChange}
          />
        </TableCell>

        <TableCell className="p-1">
          <Input
            type="number"
            name="weight"
            step={0.1}
            value={formData.weight}
            className="w-20 h-8 text-xs bg-white rounded-none dark:bg-dark-item"
            onChange={handleQtyOrWeightChange}
          />
        </TableCell>

        <TableCell className="p-1">
          <Select value={formData.weightOption ?? 'lb'} onValueChange={(val) => handleSelectChange("weightOption", val)}>
            <SelectTrigger className="w-16 h-8 dark:bg-dark-item dark:border-zinc-700">
              <SelectValue>{formData.weightOption}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="oz">oz</SelectItem>
              <SelectItem value="kg">kg</SelectItem>
              <SelectItem value="lb">lb</SelectItem>
              <SelectItem value="g">g</SelectItem>
            </SelectContent>
          </Select>
        </TableCell>

        <TableCell className="p-1">
          <Select value={formData.priority} onValueChange={(val) => handleSelectChange("priority", val)}>
            <SelectTrigger className={`w-24 h-8 border ${getPriorityClasses(formData.priority)}`}>
              <SelectValue>{formData.priority}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Low">Low</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="High">High</SelectItem>
            </SelectContent>
          </Select>
        </TableCell>

        <TableCell className="flex justify-center p-1">
          <TooltipButton icon={<Image size={14} className={`${formData.imageUrl ? "text-primary" : ""}`}/> } tooltipText="Image" onClick={() => setIsImageDialogOpen(true)} />
          <TooltipButton icon={<Shirt size={14} className={`${formData.worn ? "text-secondary" : ""}`} />} tooltipText="Worn" onClick={toggleWorn} />
          <TooltipButton icon={<Copy size={14} />} tooltipText="Duplicate" onClick={duplicateItem} />
          <TooltipButton icon={<Link size={14} className={`${(formData.link || "").length > 0 ? "text-blue-500" : ""}`} />} tooltipText="Link" onClick={() => setIsLinkDialogOpen(true)} />
        </TableCell>
      </TableRow>


  <LinkItem
  title="Add a Link"
  description="Provide a link for the selected item."
  isOpen={isLinkDialogOpen}
  initialLink={formData.link || ""}
  onClose={() => setIsLinkDialogOpen(false)}
  onSave={saveLink}
  loading={false}
/>

<ImageItem
  title="Add an Image"
  description="Upload and display an image for this item."
  isOpen={isImageDialogOpen}
  initialImage={formData.imageUrl || ""}
  onClose={() => setIsImageDialogOpen(false)}
  onSave={saveImage}
  loading={false}
/>

    </Fragment>
  );
});

export default LocalItemRow;
