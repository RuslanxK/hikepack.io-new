import React, { useState, memo } from "react";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Grip, ListPlus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import LocalItemRow from "./local-item-row";
import { Category } from "@/types/category";
import { Item } from "@/types/item";
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import LimitReachedPopup from "../dialogs/limit-reached-popup";
import { useNavigate } from "react-router-dom";

interface LocalDataTableProps {
  data: Category;
  onUpdateCategory: (updated: Category) => void;
  onDeleteCategory: (id: string) => void;
}

const LocalDataTable: React.FC<LocalDataTableProps> = ({ data, onUpdateCategory, onDeleteCategory }) => {
  const [categoryName, setCategoryName] = useState(data.name);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showLimitPopup, setShowLimitPopup] = useState(false);

  const navigate = useNavigate()

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: data._id });

  
const style = {
  transform: CSS.Translate.toString(transform),
  transition,
  opacity: isDragging ? 0.5 : 1,
  willChange: 'transform',
};

  const handleBlur = () => {
    if (categoryName?.trim() !== data.name) {
      onUpdateCategory({ ...data, name: categoryName });
    }
  };

  const handleAddItem = () => {
    if ((data.items?.length || 0) >= 3) {
      setShowLimitPopup(true);
      return;
    }
  
    const newItem: Item = {
      _id: Date.now().toString(),
      name: "Item example",
      description: "",
      qty: 1,
      weight: 0.1,
      weightOption: "lb",
      priority: "Low",
      worn: false,
      bagId: data.bagId,
      categoryId: data._id,
    };
  
    const updated = { ...data, items: [...(data.items || []), newItem] };
    onUpdateCategory(updated);
  };

  const handleUpdateItem = (updatedItem: Item) => {
    const updatedItems = data.items?.map(i => (i._id === updatedItem._id ? updatedItem : i)) || [];
    onUpdateCategory({ ...data, items: updatedItems });
  };

  const handleDeleteItem = (itemId: string) => {
    const updatedItems = data.items?.filter(i => i._id !== itemId) || [];
    onUpdateCategory({ ...data, items: updatedItems });
    setSelectedItems(prev => prev.filter(id => id !== itemId));
  };

  const handleSelectItem = (id: string, isSelected: boolean) => {
    setSelectedItems(prev => isSelected ? [...prev, id] : prev.filter(i => i !== id));
  };

  const deleteSelectedItems = () => {
    const updatedItems = (data.items || []).filter(
      (i) => i._id && !selectedItems.includes(i._id)
    );
    onUpdateCategory({ ...data, items: updatedItems });
    setSelectedItems([]);
  };

  const handleDuplicateItem = (item: Omit<Item, "_id">) => {
    const duplicated: Item = {
      ...JSON.parse(JSON.stringify(item)), 
      _id: Date.now().toString(),         
    };
  
    const updated = {
      ...data,
      items: [...(data.items || []), duplicated],
    };
  
    onUpdateCategory(updated);
  };

  const redirect = (destination: string) => {
    setShowLimitPopup(false)
    navigate(destination)
  }

  
  return (
    <div className="dark:bg-dark-box rounded-lg  border-l-8 bg-white"  style={{ ...style, borderLeftColor: data.color }}  ref={setNodeRef}>
      <div className="flex items-center gap-2 group pr-2 pl-2 pt-2">
      <Button variant="ghost" size="icon" {...attributes} {...listeners}>
  <Grip size={18} className="cursor-move" />
</Button>
        <Input
          type="text"
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
          onBlur={handleBlur}
          placeholder="Enter category"
          className="w-full h-8 text-sm bg-white border-0 border-b border-gray-300 rounded-none focus:outline-none"
        />
        <Button variant="ghost" size="icon" onClick={() => onDeleteCategory(data._id)}>
          <Trash2 className="cursor-pointer" />
        </Button>
      </div>

      <Table className="text-sm">
        <TableHeader>
          <TableRow>
            <TableHead className="w-12" />
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
          {data.items?.map((item) => (
            <LocalItemRow
              key={item._id}
              item={item}
              onUpdate={handleUpdateItem}
              onSelect={handleSelectItem}
              onDelete={handleDeleteItem}
              onDuplicate={handleDuplicateItem}
            
            />
          ))}
        </TableBody>
      </Table>

      <div className="flex gap-2 p-2">
        <Button variant="ghost" size="sm" onClick={handleAddItem}>
          <ListPlus /> Add Item
        </Button>
        {selectedItems.length > 0 && (
          <Button variant="ghost" size="sm" onClick={deleteSelectedItems}>
            <Trash2 /> Delete Selected
          </Button>
        )}
      </div>
      <LimitReachedPopup isOpen={showLimitPopup} onClose={() => setShowLimitPopup(false)} onLogin={() => redirect('/login')} onRegister={() => redirect('/register')}/>
    </div>
  );
};

export default memo(LocalDataTable);
