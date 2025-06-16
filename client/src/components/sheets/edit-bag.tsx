import React, { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { EditBagSheetProps, BagFormData } from "@/types/bag";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { useUser } from "@/context/user-context";
import { useFileValidator } from "@/hooks/useFileValidator";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Switch } from "../ui/switch";

const EditBagSheet: React.FC<EditBagSheetProps> = ({ isOpen, onClose, onSubmit, data, errorMessage, isUpdating}) => {
  const { validateFile, error: fileError, resetError } = useFileValidator(2);
  const { user } = useUser();

  const [formData, setFormData] = useState<BagFormData>({
    tripId: data?.tripId || "",
    name: data?.name || "",
    description: data?.description || "",
    goal: data?.goal || "0",
    imageUrl: data?.imageUrl || null,
    exploreBags: data?.exploreBags || false
  });

  useEffect(() => {
    if (data) {
      setFormData({
        tripId: data.tripId || "",
        name: data.name || "",
        description: data.description || "",
        goal: data.goal || "0",
        imageUrl: data.imageUrl || null,
        exploreBags: data.exploreBags || false
      });
    }
  }, [data]);

  useEffect(() => {
    if (!isOpen) {
      resetError();
    }
  }, [isOpen, resetError]);

  const handleSliderChange = (value: number[]) => {
    setFormData((prev) => ({ ...prev, goal: value[0].toString() }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (validateFile(file)) {
      setFormData((prev) => ({ ...prev, imageUrl: file }));
    }
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, exploreBags: checked }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit Bag</SheetTitle>
          <SheetDescription>
            Update the details of your bag.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 mt-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Bag Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Example: Ultralight Weekend Pack"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Bag Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              className="resize-none"
              onChange={handleChange}
              placeholder="Example: Gear setup for a 3-day lightweight hiking trip"
             
            />
          </div>
        
   <div className="flex flex-col gap-2">
            <Label htmlFor="goal">Bag Weight Goal</Label>
            <Slider
              id="goal"
              name="goal"
              value={[Number(formData.goal)]}
              onValueChange={handleSliderChange}
              max={100}
              min={0.5}
              step={0.5}
              className="w-full"
            />
            <span className="text-sm text-gray-500 dark:text-white">
            {formData.goal} {user?.weightOption}
            </span>
          </div>

          <div className="flex flex-col">
                <Label htmlFor="community" className="mb-2">Share with Community</Label>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Make your bag visible in the Community Bags.
               </p>
                <Switch id="community" checked={formData?.exploreBags} onCheckedChange={handleSwitchChange}  />
              </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="imageUrl">Change Bag Image</Label>
            <Input
              id="imageUrl"
              name="imageUrl"
              type="file"
              accept=".webp, .jpeg, .jpg, .png"
              onChange={handleFileChange}
              className={cn("border", fileError ? "border-red-500" : null)}
            />
            {fileError && <p className="text-red-500 text-sm">{fileError}</p>}
          </div>

          <Button type="submit" disabled={!!fileError || isUpdating} className="bg-primary text-white">
            { isUpdating ? "Updating..." : "Update"}
          </Button>
        </form>
        { errorMessage ? <Alert variant="destructive" className='mt-4'>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
      {errorMessage}
      </AlertDescription>
      </Alert> : null }
      </SheetContent>
    </Sheet>
  );
};

export default EditBagSheet;
