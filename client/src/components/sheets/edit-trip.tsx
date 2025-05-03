"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { EditTripSheetProps, TripFormData } from '@/types/trip';
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
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { countries } from '@/lib/apiService';


const EditTripSheet: React.FC<EditTripSheetProps> = ({ isOpen, onClose, onSubmit, data, errorMessage, isUpdating }) => {
  const { user } = useUser();
  const { validateFile, error: fileError, resetError } = useFileValidator(2);

  const [date, setDate] = useState<DateRange | undefined>({
    from: data?.startDate ? new Date(data?.startDate) : new Date(),
    to: data?.endDate ? new Date(data?.endDate) : addDays(new Date(), 10),
  });

  const [formData, setFormData] = useState<TripFormData>({
    name: data?.name || '',
    country: data?.country || '',
    about: data?.about || '',
    startDate: data?.startDate ? new Date(data.startDate) : new Date(),
    endDate: data?.endDate ? new Date(data.endDate) : addDays(new Date(), 10),
    distance: data?.distance || '',
    imageUrl: data?.imageUrl || null,
  });

 useEffect(() => {
     if (!isOpen) {
       resetError(); 
     }
   }, [isOpen, resetError]);

  useEffect(() => {
    if (data) {
      setFormData({
        name: data.name || '',
        country: data.country || '',
        about: data.about || '',
        startDate: data.startDate ? new Date(data.startDate) : new Date(),
        endDate: data.endDate ? new Date(data.endDate) : addDays(new Date(), 10),
        distance: data.distance || '',
        imageUrl: data.imageUrl || null,
      });

      setDate({
        from: data.startDate ? new Date(data.startDate) : new Date(),
        to: data.endDate ? new Date(data.endDate) : addDays(new Date(), 10),
      });
    }
  }, [data]);


  const countryOptions = useMemo(() => (
      countries.map((country) => (
        <SelectItem key={country.flag} value={country.name}>
          {country.name}
        </SelectItem>
      ))
    ), []);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
    onSubmit({...formData,startDate: date?.from || new Date(), endDate: date?.to || addDays(new Date(), 10)});
 
  };



  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="overflow-y-auto"> 
        <SheetHeader>
          <SheetTitle>Edit Trip</SheetTitle>
          <SheetDescription>
            Update the details of your trip.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 mt-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Name"
              required
            />
          </div>

                    <div className="flex flex-col gap-2">
                      <Label htmlFor="name">Country</Label>
                      <Select
              value={formData.country}
              onValueChange={(value) => handleSelectChange("country", value)}
            >
              <SelectTrigger className="rounded-lg w-full bg-light">
                <SelectValue placeholder="Select Country" />
              </SelectTrigger>
              <SelectContent>
               {countryOptions}
              </SelectContent>
            </Select>
                    </div>


          <div className="flex flex-col gap-2">
            <Label htmlFor="about">Description</Label>
            <Textarea
              id="about"
              name="about"
              value={formData.about}
              className="resize-none"
              onChange={handleChange}
              placeholder="Description"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="distance">Distance</Label>
            <Slider
              id="distance"
              name="distance"
              value={[Number(formData.distance)]}
              onValueChange={handleSliderChange}
              max={500}
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
            <Label htmlFor="imageUrl">Change Image (Max size: 2MB)</Label>
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
          {isUpdating ? "Updating..." : "Update"}
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

export default EditTripSheet;
