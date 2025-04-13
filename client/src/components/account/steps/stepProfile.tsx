import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { FormData } from "../../../types/form";

interface StepProps {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
}

const StepProfile: React.FC<StepProps> = ({ formData, updateFormData }) => {
  const defaultPlaceholder = "/default-profile-placeholder.png";
  const [preview, setPreview] = useState<string | null>(
    formData.imageUrl ? URL.createObjectURL(formData.imageUrl) : defaultPlaceholder
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(defaultPlaceholder);
    }
    updateFormData({ imageUrl: file });
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <img
        src={preview || defaultPlaceholder}
        alt="Profile Preview"
        className="w-24 h-24 rounded-full object-cover mb-4"
      />
      <Input type="file" onChange={handleFileChange} />
    </div>
  );
};

export default StepProfile;
