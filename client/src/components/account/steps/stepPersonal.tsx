import React, { useState} from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon } from "lucide-react";
import { FormData } from "../../../types/form";
import { format } from "date-fns";
import { isBefore, endOfToday } from "date-fns";
import { countries } from "@/lib/apiService";
import { Button } from "@/components/ui/button";


interface StepProps {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
}

const StepPersonal: React.FC<StepProps> = ({ formData, updateFormData }) => {


const [open, setOpen] = useState(false);
  

  return (
   <div className="flex flex-wrap gap-y-6 gap-x-4">
  {/* Country */}
  <div className="w-full md:w-[47.9%] space-y-1">
    <Label className="dark:text-white">Country</Label>
    <Select
      onValueChange={(value) => updateFormData({ country: value })}
      value={formData.country || 'United States'}
    >
      <SelectTrigger className="rounded-lg bg-gray-100 dark:bg-dark dark:text-white dark:border-dark-box">
        <SelectValue placeholder="Select Country" />
      </SelectTrigger>
      <SelectContent className="dark:bg-dark-box dark:text-white">
        {countries.map((country) => (
          <SelectItem key={country.flag} value={country.name}>
            {country.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>

    <div className="w-full md:w-[47.9%] space-y-1">
  <Label htmlFor="birthdate">Birthdate</Label>
  <Popover open={open} onOpenChange={setOpen}>
    <PopoverTrigger asChild>
      <Button
        variant="outline"
        id="birthdate"
        className="w-full justify-between font-normal text-left bg-gray-100"
      >
        {formData.birthdate
          ? format(new Date(formData.birthdate), "PPP")
          : "Select Birthdate"}
        <CalendarIcon className="ml-2 h-4 w-4" />
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-auto overflow-hidden p-0" align="start">
      <Calendar
        mode="single"
        captionLayout="dropdown"
        selected={formData.birthdate ? new Date(formData.birthdate) : undefined}
        onSelect={(date) => {
  if (date && isBefore(date, new Date())) {
    const adjustedDate = new Date(
      date.getTime() - date.getTimezoneOffset() * 60000
    );
    updateFormData({
      birthdate: adjustedDate.toISOString().split("T")[0],
    });
    setOpen(false);
  }
}}
        disabled={(date) => isBefore(endOfToday(), date)}
        initialFocus
      />
    </PopoverContent>
  </Popover>
</div>

  {/* Gender */}
  <div className="w-full md:w-[47.9%] space-y-1">
    <Label className="dark:text-white">Gender</Label>
    <Select
      onValueChange={(value) => updateFormData({ gender: value })}
      value={formData.gender || ""}
    >
      <SelectTrigger className="rounded-lg bg-gray-100 dark:bg-dark dark:text-white dark:border-dark-box">
        <SelectValue placeholder="Select Gender" />
      </SelectTrigger>
      <SelectContent className="dark:bg-dark-box dark:text-white">
        <SelectItem value="male">Male</SelectItem>
        <SelectItem value="female">Female</SelectItem>
        <SelectItem value="other">Other</SelectItem>
      </SelectContent>
    </Select>
  </div>

  {/* Distance Unit */}
  <div className="w-full md:w-[47.9%] space-y-1">
    <Label className="dark:text-white">Distance Unit</Label>
    <Select
      onValueChange={(value) => updateFormData({ distance: value })}
      value={formData.distance || ""}
    >
      <SelectTrigger className="rounded-lg bg-gray-100 dark:bg-dark dark:text-white dark:border-dark-box">
        <SelectValue placeholder="Select Distance Unit" />
      </SelectTrigger>
      <SelectContent className="dark:bg-dark-box dark:text-white">
        <SelectItem value="km">Kilometers</SelectItem>
        <SelectItem value="miles">Miles</SelectItem>
      </SelectContent>
    </Select>
  </div>

  {/* Weight Unit */}
  <div className="w-full md:w-[47.9%] space-y-1">
    <Label className="dark:text-white">Weight Unit</Label>
    <Select
      onValueChange={(value) => updateFormData({ weightOption: value })}
      value={formData.weightOption || ""}
    >
      <SelectTrigger className="rounded-lg bg-gray-100 dark:bg-dark dark:text-white dark:border-dark-box">
        <SelectValue placeholder="Select Weight Unit" />
      </SelectTrigger>
      <SelectContent className="dark:bg-dark-box dark:text-white">
        <SelectItem value="kg">Kilograms</SelectItem>
        <SelectItem value="lb">Pounds</SelectItem>
      </SelectContent>
    </Select>
  </div>

  {/* Activity Level */}
  <div className="w-full md:w-[47.9%] space-y-1">
    <Label className="dark:text-white">Activity Level</Label>
    <Select
      onValueChange={(value) => updateFormData({ activityLevel: value })}
      value={formData.activityLevel || ""}
    >
      <SelectTrigger className="rounded-lg bg-gray-100 dark:bg-dark dark:text-white dark:border-dark-box">
        <SelectValue placeholder="Select Activity Level" />
      </SelectTrigger>
      <SelectContent className="dark:bg-dark-box dark:text-white">
        <SelectItem value="beginner">Beginner</SelectItem>
        <SelectItem value="intermediate">Intermediate</SelectItem>
        <SelectItem value="advanced">Advanced</SelectItem>
      </SelectContent>
    </Select>
  </div>
</div>
  );
};

export default StepPersonal;
