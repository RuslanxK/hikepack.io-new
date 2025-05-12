import React, {useEffect, Fragment, useState, useCallback} from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiService } from "@/lib/apiService";
import { BagFormData } from "@/types/bag";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Edit, Plus, Share2 } from 'lucide-react';
import ChartWithTable from "../tables/chart-table";
import { DataTable } from "../tables/data-table";
import { Category } from "@/types/category";
import { getRandomMidLightColor } from "../../lib/colorUtils";
import { useToast } from "@/hooks/use-toast"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { DndContext, closestCenter, DragEndEvent, useSensors, MouseSensor, TouchSensor, useSensor } from "@dnd-kit/core";
import EditBagSheet from "../sheets/edit-bag";
import LoadingPage from "../loader";
import { fetchBagById, createCategory, fetchCategoriesByBagId } from "@/lib/api";
import { useIsSharedView } from "@/lib/isSharedView";
import { useJoyride } from '../../hooks/useJoyride';
import JoyrideWrapper from '../guide/JoyrideWrapper';
import { getSteps } from '../guide/steps';
import { bagStepsConfig } from '../guide/stepsConfig';
import { Sparkles } from 'lucide-react';
import { AISuggestionsModal } from "../dialogs/ai-suggestions";




const BagDetails: React.FC = () => {
  
  const queryClient = useQueryClient();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate()
  const isSharedView = useIsSharedView();

  const [categories, setCategories] = useState<Category[]>([]);
  const [isSheetEditOpen, setIsSheetEditOpen] = useState(false);
  const [editBagError, setEditBagError] = useState<string | null>(null)
  const [isSettingCategories, setIsSettingCategories] = useState(true);
  const [isAISuggestionsOpen, setIsAISuggestionsOpen] = useState(false);
  const [addingCategory, setAddingCategory] = useState(false)

  const { toast } = useToast()
  const mouseSensor = useSensor(MouseSensor, { activationConstraint: { distance: 10 } });
  const touchSensor = useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 5 } });
  const sensors = useSensors(mouseSensor, touchSensor);
  const isJoyrideRun = useJoyride('step-3');

  const { data: bag, isLoading, isError, error} = useQuery({ queryKey: ["bag", id, isSharedView],
    queryFn: () => fetchBagById(id!, !isSharedView),
    enabled: !!id,
  });

  const { data: fetchedCategories = [], isLoading: isCategoriesLoading } =
  useQuery({
    queryKey: ["categories", id, isSharedView],
    queryFn: () => fetchCategoriesByBagId(id!, !isSharedView),
    enabled: !!id,
  });

  
  useEffect(() => {
    const setData = async () => {
      setIsSettingCategories(true); 
      if (!isCategoriesLoading && fetchedCategories) {
        const sortedCategories = fetchedCategories.slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        setCategories(sortedCategories); 
        setIsSettingCategories(false); 
      }
    };
  
    setData();
  }, [fetchedCategories, isCategoriesLoading]);


  useEffect(() => {
    if (id) {
      localStorage.setItem("bagId", id);
    }
  }, [id]);
  

  const handleNavigateBack = () => {
    navigate(-1);
  };

  useEffect(() => {
    if (isError) {
      console.error(error);
      navigate("/error");
    }
    
  }, [isError, navigate, error])


  const handleEdit = () => {
    setIsSheetEditOpen(true)
  };


   const handleCloseEditTripSheet = useCallback(() => {
      setIsSheetEditOpen(false);
      setEditBagError(null)
    }, []);


  const { mutate: addCategory } = useMutation({

    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories", bag?._id] });
      setAddingCategory(false)
    },
    onError: (error) => {
      console.error("Failed to add category:", error);
      toast({
        title: "Error",
        variant: "destructive",
        description: error?.message,
      });

      setAddingCategory(false)
    },
  });

  const handleAddCategory = () => {
    setAddingCategory(true)
    addCategory({
      tripId: bag?.tripId,
      bagId: bag?._id,
      name: "",
      color: getRandomMidLightColor(),
    });
  };

  const moveCategory = async (fromIndex: number, toIndex: number) => {
    try {
      const updatedCategories = [...categories];
      const [movedCategory] = updatedCategories.splice(fromIndex, 1);
      updatedCategories.splice(toIndex, 0, movedCategory);
  
      const reorderedCategories = updatedCategories.map((category, index) => ({
        ...category,
        order: index + 1,
      }));
  
      setCategories(reorderedCategories);
      await Promise.all(
        reorderedCategories.map((category) =>
          apiService.put(`/categories/${category._id}`, { order: category.order })
        )
      );
  
    } catch (error) {
      console.error("Failed to move category:", error);
    }
  };
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
  
    if (active && over && active.id !== over.id) {
      const fromIndex = categories.findIndex(
        (category) => category._id === active.id
      );
      const toIndex = categories.findIndex(
        (category) => category._id === over.id
      );
  
      if (fromIndex !== -1 && toIndex !== -1) {
        moveCategory(fromIndex, toIndex);
      }
    }
  };

  const editBagMutation = useMutation({
    mutationFn: (data: FormData) =>
      apiService.put(`/bags/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bag', id] });
      setIsSheetEditOpen(false);
      setEditBagError(null)
    },
    onError: (error) => {
      console.error('Failed to edit bag:', error);
      setEditBagError(error?.message)
    },
  });


  const isUpdating = editBagMutation.status === "pending"

  const handleEditBagSubmit = useCallback(
    (data: BagFormData) => {
      if (!id) {
        console.error('Bag ID is undefined');
        return;
      }
      const updatedFormData = new FormData();
      updatedFormData.append('name', data.name);
      updatedFormData.append('description', data.description);
      updatedFormData.append('exploreBags', data.exploreBags ? 'true' : 'false');
  
      if(data.goal) {
        updatedFormData.append('goal', data.goal);
      }
  
      if(data.imageUrl instanceof File) {
        updatedFormData.append('imageUrl', data.imageUrl);
      }
  
      editBagMutation.mutate(updatedFormData);
    },
    [id, editBagMutation]
  );

  if (isLoading || isCategoriesLoading || isSettingCategories) {
    return <LoadingPage />;
  }

  return (

  <div className="container mx-auto">
  <div className="bg-white dark:bg-dark-box p-5 rounded-lg flex justify-between items-center">
  <div className="flex items-center gap-2 w-8/12">
  {!isSharedView && (
   <Button variant="ghost" size="icon" onClick={handleNavigateBack} className="bg-gray-100 hover:bg-gray-200 dark:hover:bg-dark-nav dark:bg-dark">
    <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
   </Button>
        )}
   <h1
  className="text-lg font-semibold flex items-center gap-2 ml-2"
  title={bag?.name}
>
  {(bag?.name ?? "").length > 25 ? (bag?.name ?? "").slice(0, 25) + "..." : bag?.name}
</h1>

</div>
<div className="flex h-5 items-center space-x-4 text-sm">

  

{!isSharedView && (
          <Fragment>
            <Button
              variant="ghost"
              onClick={() => window.open(`${import.meta.env.VITE_REACT_APP_CLIENT}/share/${bag?._id}`, "_blank")}
              size="icon"
              className="bg-gray-100 hover:bg-gray-200 dark:hover:bg-dark-nav dark:bg-dark">
              <Share2 className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="bg-gray-100 hover:bg-gray-200 dark:hover:bg-dark-nav dark:bg-dark"
              onClick={handleEdit}
            >
              <Edit className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </Button>
          </Fragment>
        )}
    </div>
    </div>
    <div className="p-5 bg-white rounded-lg mt-5 mb-5 dark:bg-dark-box">
    <p className="text-gray-600 dark:text-gray-400">
   {bag?.description}</p>
    </div>
    <div className="bg-white dark:bg-dark-box rounded-lg mb-5">
    <ChartWithTable categories={categories} goal={bag?.goal} />
    </div>
    {!isSharedView && (
      <Button
        onClick={handleAddCategory}
        disabled={addingCategory}
        className="w-full py-6 mb-5 border border-2 border-dashed border-black dark:border-gray-400 dark:hover:border-white dark:bg-dark-box add-category-button"
        variant="outline">
        <Plus className="text-xl dark:text-white"/>
      </Button>
    )}

{!isSharedView && (
  <Button
    onClick={() => setIsAISuggestionsOpen(true)}
    className="relative font-extrabold w-full py-6 mb-5 border-4 shadow-2xl overflow-hidden transition-all duration-500 before:absolute before:inset-0 before:blur-lg before:opacity-50 before:transition-all before:duration-500
      text-white bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 border-purple-300 hover:-translate-y-1 before:bg-gradient-to-r before:from-purple-400 before:via-pink-400 before:to-indigo-400"
    variant="default"
  >
    <span className="relative z-10 flex items-center gap-2">
      GET AI SUGGESTIONS <Sparkles className="w-10 h-10" />
    </span>
  </Button>
)}

  <Fragment>
     <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd} sensors={sensors} id="builder-dnd">
      <SortableContext items={categories.map((category) => category._id)} strategy={verticalListSortingStrategy}>
        {categories.map((category) => (
          <DataTable key={category._id} data={category}  />
        ))}
      </SortableContext>
    </DndContext>

  <EditBagSheet isOpen={isSheetEditOpen} onClose={handleCloseEditTripSheet} data={bag} onSubmit={handleEditBagSubmit} errorMessage={editBagError || ""} isUpdating={isUpdating} />

  {isJoyrideRun && <JoyrideWrapper steps={getSteps(bagStepsConfig)} run={true} />}

  <AISuggestionsModal 
  isOpen={isAISuggestionsOpen} 
  onClose={() => setIsAISuggestionsOpen(false)}
  bagId={bag?._id}
  tripId={bag?.tripId}
  categories={categories}
/>


</Fragment>

   
</div>

  );
};

export default BagDetails;
