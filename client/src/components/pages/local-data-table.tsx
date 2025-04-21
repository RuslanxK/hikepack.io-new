import React, { useState, memo } from "react";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Grip, ListPlus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import LocalItemRow from "./local-item-row";
import { Category } from "@/types/category";
import { Item } from "@/types/item";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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

  const localStorageKey = `category-items-${data._id}`;
  const [items, setItems] = useState<Item[]>(() => {
    const saved = localStorage.getItem(localStorageKey);
    if (saved) return JSON.parse(saved);
    const sorted = [...(data.items || [])].map((item, index) => ({
      ...item,
      order: item.order ?? index,
    }));
    return sorted.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  });

  const navigate = useNavigate();

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: data._id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    willChange: "transform",
  };

  const saveItems = (updated: Item[]) => {
    const reordered = updated.map((item, index) => ({ ...item, order: index }));
    setItems(reordered);
    localStorage.setItem(localStorageKey, JSON.stringify(reordered));
    onUpdateCategory({ ...data, items: reordered });
  };

  const handleBlur = () => {
    if (categoryName?.trim() !== data.name) {
      onUpdateCategory({ ...data, name: categoryName });
    }
  };

  const handleAddItem = () => {
    if (items.length >= 3) {
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
      categoryId: data._id,
      order: items.length,
    };

    saveItems([...items, newItem]);
  };

  const handleDeleteItem = (itemId: string) => {
    const updated = items.filter((item) => item._id !== itemId);
    setSelectedItems((prev) => prev.filter((id) => id !== itemId));
    saveItems(updated);
  };

  const handleUpdateItem = (updatedItem: Item) => {
    const updated = items.map((item) =>
      item._id === updatedItem._id ? { ...item, ...updatedItem } : item
    );
    saveItems(updated);
  };

  const handleDuplicateItem = (item: Omit<Item, "_id">) => {
    if (items.length >= 3) {
      setShowLimitPopup(true);
      return;
    }

    const duplicated: Item = {
      ...item,
      _id: Date.now().toString(),
      order: items.length,
    };

    saveItems([...items, duplicated]);
  };

  const handleSelectItem = (id: string, isSelected: boolean) => {
    setSelectedItems((prev) =>
      isSelected ? [...prev, id] : prev.filter((i) => i !== id)
    );
  };

  const deleteSelectedItems = () => {
    const updated = items.filter((item) => item._id && !selectedItems.includes(item._id));
    setSelectedItems([]);
    saveItems(updated);
  };
  

  const moveItem = (fromIndex: number, toIndex: number) => {
    const updated = [...items];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    saveItems(updated);
  };

  const redirect = (destination: string) => {
    setShowLimitPopup(false);
    navigate(destination);
  };

  return (
    <div
      className="dark:bg-dark-box rounded-lg border-l-8 bg-white"
      style={{ ...style, borderLeftColor: data.color }}
      ref={setNodeRef}
    >
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
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDeleteCategory(data._id)}
        >
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
          {items.map((item, index) => (
            <LocalItemRow
              key={item._id}
              item={item}
              index={index}
              onUpdate={handleUpdateItem}
              onSelect={handleSelectItem}
              onDelete={handleDeleteItem}
              onDuplicate={handleDuplicateItem}
              moveItem={moveItem}
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

      <LimitReachedPopup
        isOpen={showLimitPopup}
        onClose={() => setShowLimitPopup(false)}
        onLogin={() => redirect("/login")}
        onRegister={() => redirect("/register")}
      />
    </div>
  );
};

export default memo(LocalDataTable);
