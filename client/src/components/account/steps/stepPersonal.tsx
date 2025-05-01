import React from "react";
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


interface StepProps {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
}

const StepPersonal: React.FC<StepProps> = ({ formData, updateFormData }) => {

  return (
    <div className="flex flex-wrap gap-y-6 gap-x-4">
      <div className="w-full md:w-[47.9%] space-y-1">
        <Label>Country</Label>
        <Select
          onValueChange={(value) => updateFormData({ country: value })}
          value={formData.country || 'United States'}
        >
          <SelectTrigger className="rounded-lg bg-gray-100">
            <SelectValue placeholder="Select Country" />
          </SelectTrigger>
          <SelectContent>
          {countries.map((country) => (
         <SelectItem key={country.flag} value={country.name}>{country.name}</SelectItem>
         ))}
       </SelectContent>
        </Select>
      </div> 
      <div className="w-full md:w-[47.9%] space-y-1">
  <Label>Birthdate</Label>
  <Popover>
    <PopoverTrigger asChild>
      <button className="w-full flex items-center justify-between px-3 py-2 border rounded-lg bg-gray-100 text-left text-sm">
        {formData.birthdate
          ? format(new Date(formData.birthdate), "PPP")
          : "Select Birthdate"}
        <CalendarIcon className="ml-2 h-4 w-4" />
      </button>
    </PopoverTrigger>
    <PopoverContent align="start" className="w-auto p-0">
      <Calendar
        mode="single"
        selected={formData.birthdate ? new Date(formData.birthdate) : undefined}
        onSelect={(date) => {
          if (date) {
            // Adjust for timezone difference
            const adjustedDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
            updateFormData({ birthdate: adjustedDate.toISOString().split("T")[0] });
          }
        }}
        initialFocus
        disabled={(date) => isBefore(endOfToday(), date)} 
      />
    </PopoverContent>
  </Popover>
</div>

      <div className="w-full md:w-[47.9%] space-y-1">
        <Label>Gender</Label>
        <Select
          onValueChange={(value) => updateFormData({ gender: value })}
          value={formData.gender || ""}
        >
          <SelectTrigger className="rounded-lg bg-gray-100">
            <SelectValue placeholder="Select Gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="male">Male</SelectItem>
            <SelectItem value="female">Female</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="w-full md:w-[47.9%] space-y-1">
        <Label>Distance Unit</Label>
        <Select
          onValueChange={(value) => updateFormData({ distanceUnit: value })}
          value={formData.distanceUnit || ""}
        >
          <SelectTrigger className="rounded-lg bg-gray-100">
            <SelectValue placeholder="Select Distance Unit" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="km">Kilometers</SelectItem>
            <SelectItem value="miles">Miles</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="w-full md:w-[47.9%] space-y-1">
        <Label>Weight Unit</Label>
        <Select
          onValueChange={(value) => updateFormData({ weightUnit: value })}
          value={formData.weightUnit || ""}
        >
          <SelectTrigger className="rounded-lg bg-gray-100">
            <SelectValue placeholder="Select Weight Unit" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="kg">Kilograms</SelectItem>
            <SelectItem value="lb">Pounds</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="w-full md:w-[47.9%] space-y-1">
        <Label>Activity Level</Label>
        <Select
          onValueChange={(value) => updateFormData({ activityLevel: value })}
          value={formData.activityLevel || ""}
        >
          <SelectTrigger className="rounded-lg bg-gray-100">
            <SelectValue placeholder="Select Activity Level" />
          </SelectTrigger>
          <SelectContent>
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
