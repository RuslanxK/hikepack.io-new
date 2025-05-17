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
import { Calendar as CalendarIcon, X } from "lucide-react";
import { format, isBefore, endOfToday } from "date-fns";
import { countries } from "@/lib/apiService";
import { FormData } from "../../types/form";
import { Button } from "../ui/button";

interface PersonalInfoFormProps {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
  onUpdate: () => void;
  onClose: () => void;
  isUpdating: boolean;
}

const PersonalInfoDialog: React.FC<PersonalInfoFormProps> = ({
  onUpdate,
  onClose,
  formData,
  isUpdating,
  updateFormData,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="relative w-full max-w-xl bg-white dark:bg-dark-box p-6 rounded-xl shadow-xl overflow-y-auto max-h-[90vh]">
        {/* X Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-black dark:hover:text-white transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-semibold mb-2">Personal Information</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Please fill in your personal details to proceed.
        </p>

        <div className="flex flex-wrap gap-y-6 gap-x-4">
          {/* Country */}
          <div className="w-full md:w-[47.9%] space-y-1">
            <Label>Country</Label>
            <Select
              onValueChange={(value) => updateFormData({ country: value })}
              value={formData.country || "United States"}
            >
              <SelectTrigger className="rounded-lg bg-gray-100">
                <SelectValue placeholder="Select Country" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country.flag} value={country.name}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Birthdate */}
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
        const adjustedDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
        updateFormData({
          birthdate: adjustedDate.toISOString().split("T")[0],
        });
      }
    }}
    initialFocus
    disabled={(date) => isBefore(endOfToday(), date)}
  />
</PopoverContent>
            </Popover>
          </div>

          {/* Gender */}
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

          {/* Distance Unit */}
          <div className="w-full md:w-[47.9%] space-y-1">
            <Label>Distance Unit</Label>
            <Select
              onValueChange={(value) => updateFormData({ distance: value })}
              value={formData.distance || ""}
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

          {/* Weight Unit */}
          <div className="w-full md:w-[47.9%] space-y-1">
            <Label>Weight Unit</Label>
            <Select
              onValueChange={(value) => updateFormData({ weightOption: value })}
              value={formData.weightOption || ""}
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

          {/* Activity Level */}
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

          {/* Submit */}
          <div className="w-full flex justify-end">
           <Button onClick={onUpdate} className="text-white" disabled={isUpdating}>
            {isUpdating ? "Updating..." : "Update"}
           </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoDialog;
