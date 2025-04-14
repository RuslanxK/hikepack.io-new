import React, { useState, useEffect, useMemo } from 'react';
import { FaPlus } from 'react-icons/fa';
import ChartWithTable from '../tables/chart-table';
import { BagItem } from "../../types/bag";
import { Category } from '../../types/category';
import { Button } from "../ui/button";
import LocalDataTable from './local-data-table';
import LimitReachedPopup from "../dialogs/limit-reached-popup";
import { useNavigate } from 'react-router-dom';
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  useSensor,
  useSensors,
  MouseSensor,
  TouchSensor,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

const LOCAL_STORAGE_KEY = 'categoriesData';


const defaultBag: BagItem = {
  _id: 'bag-1',
  tripId: 'trip-1',
  name: 'Sample Bag',
  description: 'A sample hiking bag',
  likes: 0,
  exploreBags: false,
  goal: 'Sample Goal',
  passed: false,
  imageUrl: '/images/sample-bag.png',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const TryItNowSection: React.FC = () => {

  const [categories, setCategories] = useState<Category[]>([]);
  const [showCategoryLimitPopup, setShowCategoryLimitPopup] = useState(false);

  const navigate = useNavigate()

  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    const parsed: Category[] = stored ? JSON.parse(stored) : [];
    const sorted = parsed.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    setCategories(sorted);
  }, []);
  

  const [bag] = useState<BagItem>(defaultBag);

  const persistCategories = (updated: Category[]) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  };


  const sortedCategories = useMemo(() => {
    return [...categories].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [categories]);
  


  const mouseSensor = useSensor(MouseSensor, { activationConstraint: { distance: 10 } });
   const touchSensor = useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 5 } });
const sensors = useSensors(mouseSensor, touchSensor);

const handleDragEnd = (event: DragEndEvent) => {
  const { active, over } = event;

  if (active?.id && over?.id && active.id !== over.id) {
    const fromIndex = categories.findIndex(cat => cat._id === active.id);
    const toIndex = categories.findIndex(cat => cat._id === over.id);

    if (fromIndex !== -1 && toIndex !== -1) {
      const updated = [...categories];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);

      const reordered = updated.map((cat, index) => ({
        ...cat,
        order: index + 1,
      }));

      setCategories(reordered);
      persistCategories(reordered);
    }
  }
};

  const updateCategory = (updatedCat: Category) => {
    const updated = categories.map(cat => cat._id === updatedCat._id ? updatedCat : cat);
    setCategories(updated);
    persistCategories(updated);
  };

  const deleteCategory = (id: string) => {
    const updated = categories.filter(cat => cat._id !== id);
    setCategories(updated);
    persistCategories(updated);
  };

  const addCategory = () => {
    if (categories.length >= 2) {
      setShowCategoryLimitPopup(true);
      return;
    }
  
    const newCategory: Category = {
      _id: Date.now().toString(),
      name: `Category Example ${categories.length + 1}`,
      items: [],
      color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
      tripId: bag.tripId,
      bagId: bag._id,
      order: categories.length + 1,
      totalWeight: "0",
    };
    const updated = [...categories, newCategory];
    setCategories(updated);
    persistCategories(updated);
  };

  const redirect = (destination: string) => {
    setShowCategoryLimitPopup(false)
    navigate(destination)
  }
  

  return (
    <div className="w-full md:px-4 px-1 sm:px-6 py-12 max-w-6xl mx-auto">
    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-2">
      Try the Demo <span className="text-primary">Now</span>
    </h2>
    <p className="text-center text-gray-600 mb-6 text-sm sm:text-base">
      Adventure Awaits. Pack Smart. Hike Confidently.
    </p>

    <div className="flex flex-col gap-6">
      {/* Chart */}
      <div className="w-full flex justify-center">
        <ChartWithTable categories={categories} goal={"15"} />
      </div>

      {/* Add Category Button */}
      <Button
        onClick={addCategory}
        className="w-full py-6 mb-5 border border-2 border-dashed border-black dark:border-gray-400 dark:hover:border-white dark:bg-dark-box"
        variant="outline"
      >
        <FaPlus className="text-xl dark:text-white" />
      </Button>

      {/* Drag & Drop Categories */}
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd} sensors={sensors}>
        <SortableContext items={sortedCategories.map((cat) => cat._id)} strategy={verticalListSortingStrategy}>
          {sortedCategories.map((cat) => (
            <LocalDataTable
              key={cat._id}
              data={cat}
              onUpdateCategory={updateCategory}
              onDeleteCategory={deleteCategory}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>

    {/* Popup */}
    <LimitReachedPopup
      isOpen={showCategoryLimitPopup}
      onClose={() => setShowCategoryLimitPopup(false)}
      onLogin={() => redirect("/login")}
      onRegister={() => redirect("/register")}
    />
  </div>
  );
};

export default TryItNowSection;
