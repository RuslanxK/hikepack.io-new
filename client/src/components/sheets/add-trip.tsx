"use client";

import React, { useEffect } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { AddTripSheetProps, TripFormData } from '@/types/trip';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { useUser } from "@/context/user-context";
import { addDays } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";
import { useFileValidator } from '@/hooks/useFileValidator';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"


const defaultDateRange = {
  from: new Date(2025, 0, 1),
  to: addDays(new Date(2025, 0, 1), 30),
};

const AddTripSheet: React.FC<AddTripSheetProps> = ({ isOpen, onClose, onSubmit, isLoading, isError }) => {
  const { user } = useUser();
  const { validateFile, error: fileError, resetError } = useFileValidator(2); 


  const [date, setDate] = React.useState<DateRange | undefined>(defaultDateRange);


   const [formData, setFormData] = React.useState<TripFormData>({
    name: '',
    about: '',
    startDate: defaultDateRange.from,
    endDate: defaultDateRange.to,
    distance: '',
    imageUrl: null,
  });

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: '',
        about: '',
        startDate: defaultDateRange.from,
        endDate: defaultDateRange.to,
        distance: '',
        imageUrl: null,
      });
      setDate(defaultDateRange); // Reset the date state
      resetError();
    }
  }, [isOpen, resetError]);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      startDate: date?.from || defaultDateRange.from,
      endDate: date?.to || defaultDateRange.to,
    }));
  }, [date]);

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
    setFormData({ ...formData, distance: value[0].toString() }); 
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData)
    
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Create Trip</SheetTitle>
          <SheetDescription>
            Fill in the details below to create a new trip.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 mt-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              onChange={handleChange}
              placeholder="Name"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="about"
              name="about"
              className="resize-none"
              onChange={handleChange}
              placeholder="Description"
              required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Distance</Label>
            <Slider
              id="trip-slider"
              name="distance"
              onValueChange={handleSliderChange}
              max={1000}
              min={1}
              step={1}
              className="w-full mb-2"
            />
            <span className="text-sm text-gray-500 dark:text-white">
              {Number(formData.distance || 1).toLocaleString()} {user?.distance}
            </span>
          </div>

             <div className="flex flex-col gap-2">
             <Label>Trip Duration (Start – End)</Label>
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                className='m-auto'
                numberOfMonths={1}/>
                </div>
           
          <div className="flex flex-col gap-2">
            <Label htmlFor="imageUrl">Upload Image (Max size: 2MB)</Label>
            <Input
              id="imageUrl"
              name="imageUrl"
              type="file"
              accept=".webp, .jpeg, .jpg, .png"
              onChange={handleFileChange}
              className={cn("border", fileError ? "border-red-500" : null)}/>
            {fileError && <p className="text-red-500 text-sm">{fileError}</p>}
          </div>
          <Button type="submit" disabled={!!fileError || isLoading} className="bg-primary text-white">
            {isLoading ? 'Creating...' : 'Create'}
          </Button>
        </form>

       { isError ? <Alert variant="destructive" className='mt-4'>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
      {isError}
      </AlertDescription>
      </Alert> : null }
        
      </SheetContent>
    </Sheet>
  );
};

export default AddTripSheet;
