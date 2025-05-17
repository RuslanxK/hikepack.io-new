import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { validatePassword } from "@/lib/validation"; // Import validation utility
import { FormData } from "../../../types/form";

interface StepProps {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
  setIsNextDisabled: (disabled: boolean) => void;
}

const StepPassword: React.FC<StepProps> = ({ formData, updateFormData, setIsNextDisabled }) => {
  const [passwordError, setPasswordError] = useState("");
  const [repeatPasswordError, setRepeatPasswordError] = useState("");

  // Handle password field changes
  const handlePasswordChange = (value: string) => {
    updateFormData({ password: value });
    const validationError = validatePassword(value);
    setPasswordError(validationError || "");

    // Check if repeat password matches when password changes
    if (formData.repeatPassword && formData.repeatPassword !== value) {
      setRepeatPasswordError("Passwords do not match.");
    } else {
      setRepeatPasswordError("");
    }
  };

  // Handle repeat password field changes
  const handleRepeatPasswordChange = (value: string) => {
    updateFormData({ repeatPassword: value });
    if (value !== formData.password) {
      setRepeatPasswordError("Passwords do not match.");
    } else {
      setRepeatPasswordError("");
    }
  };

  // Disable "Next" button if there are any validation errors
  useEffect(() => {
    const hasErrors = passwordError || repeatPasswordError || !formData.password || !formData.repeatPassword;
    setIsNextDisabled(!!hasErrors);
  }, [passwordError, repeatPasswordError, formData.password, formData.repeatPassword, setIsNextDisabled]);

  return (
    <div className="flex flex-col gap-4">
  {/* Password */}
  <div className="space-y-1">
    <Label className="dark:text-white">Password</Label>
    <Input
      type="password"
      value={formData.password}
      onChange={(e) => handlePasswordChange(e.target.value)}
      placeholder="Enter your password"
      className={`
        bg-light dark:bg-dark
        text-black dark:text-white
        placeholder:text-gray-400 dark:placeholder:text-gray-500
        ${passwordError 
          ? "border-red-500 focus:ring-red-500" 
          : "border-input dark:border-dark-box"}
      `}
    />
    {passwordError && (
      <p className="text-red-500 text-sm mt-1">{passwordError}</p>
    )}
  </div>

  {/* Repeat Password */}
  <div className="space-y-1">
    <Label className="dark:text-white">Repeat Password</Label>
    <Input
      type="password"
      value={formData.repeatPassword}
      onChange={(e) => handleRepeatPasswordChange(e.target.value)}
      placeholder="Repeat your password"
      className={`
        bg-light dark:bg-dark
        text-black dark:text-white
        placeholder:text-gray-400 dark:placeholder:text-gray-500
        ${repeatPasswordError 
          ? "border-red-500 focus:ring-red-500" 
          : "border-input dark:border-dark-box"}
      `}
    />
    {repeatPasswordError && (
      <p className="text-red-500 text-sm mt-1">{repeatPasswordError}</p>
    )}
  </div>
</div>
  );
};

export default StepPassword;
