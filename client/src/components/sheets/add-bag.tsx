"use client";

import React, { useEffect, useState } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { AddBagSheetProps, BagFormData } from '@/types/bag';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { useUser } from "@/context/user-context";
import { cn } from "@/lib/utils";
import { useFileValidator } from '@/hooks/useFileValidator';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Switch } from '../ui/switch';


const AddBagSheet: React.FC<AddBagSheetProps> = ({ isOpen, onClose, onSubmit, errorMessage, isAdding }) => {
  const { user } = useUser();
  const { validateFile, error: fileError, resetError } = useFileValidator(2); 
  const images = Array.from({ length: 8 }, (_, i) => `/backpack-${i + 1}.jpg`);

  const [formData, setFormData] = useState<BagFormData>({name: '', description: '', goal: '', imageUrl: images[0]});
  const [selectedImage, setSelectedImage] = useState<string | null>(images[0]);

  useEffect(() => {
    if (!isOpen) {
      resetError();
      setFormData({ name: '', description: '', goal: '', imageUrl: images[0] });
      setSelectedImage(images[0]); 
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, resetError]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (validateFile(file)) {
      setFormData({ ...formData, imageUrl: file });
    }
  };

  const handleSliderChange = (value: number[]) => {
    setFormData({ ...formData, goal: value[0].toString() }); 
  };

  const handleImageSelect = (image: string) => {
    setSelectedImage(image);
    setFormData({ ...formData, imageUrl: image });
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
          <SheetTitle>Create Bag</SheetTitle>
          <SheetDescription>
            Fill in the details below to create a new bag.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 mt-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Bag Name</Label>
            <Input
              id="name"
              name="name"
              onChange={handleChange}
              placeholder="Name"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Bag Description</Label>
            <Textarea
              id="description"
              name="description"
              className="resize-none"
              onChange={handleChange}
              placeholder="Description"
              />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="goal">Bag Weight Goal</Label>
            <Slider
              id="trip-slider"
              name="distance"
              onValueChange={handleSliderChange}
              max={100}
              min={0.5}
              step={0.5}
              className="w-full mb-2"/>
            <span className="text-sm text-gray-500 dark:text-white">
              {Number(formData.goal || 0.5).toLocaleString()} {user?.weightOption}
            </span>
          </div>

          <div className="flex flex-col">
                <Label htmlFor="community" className="mb-2">Share with Community</Label>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Make your bag visible in the Community Bags.
               </p>
                <Switch id="community" checked={formData?.exploreBags} onCheckedChange={handleSwitchChange}  />
              </div>

          <Label>Select / Upload Bag Image</Label>
          <div className='pl-10 pr-10'>
            <Carousel opts={{ align: "start" }} className="w-full max-w-sm">
              <CarouselContent>
                {images.map((image, index) => (
                  <CarouselItem key={index} className="md:basis-1/2">
                    <div
                      className={`p-1 border rounded-md cursor-pointer ${
                      selectedImage === image ? 'border-primary' : 'border-gray-300'}`}
                      onClick={() => handleImageSelect(image)}>
                      <img src={image} alt={`Backpack ${index + 1}`} className="w-full h-20 object-cover rounded-md"/>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className='dark:bg-dark-box dark:hover:bg-dark-nav'/>
              <CarouselNext className='dark:bg-dark-box dark:hover:bg-dark-nav' />
            </Carousel>
          </div>
          <div className="flex flex-col gap-2">
            <Input id="imageUrl" name="imageUrl" type="file" accept="image/*" onChange={handleFileChange}
              className={cn("border", fileError ? "border-red-500" : null)}/>
            {fileError && <p className="text-red-500 text-sm">{fileError}</p>}
          </div>
          <Button type="submit" disabled={!!fileError || isAdding} className="bg-primary text-white">
           {isAdding ? "Creating..." : "Create"}
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

export default AddBagSheet;
