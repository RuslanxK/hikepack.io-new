import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation } from "@tanstack/react-query";
import { apiService } from "@/lib/apiService";
import { FormData } from "../../../types/form";
import { validateEmail, validateUsername } from "@/lib/validation";

interface StepProps {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
  setIsNextDisabled: (disabled: boolean) => void;
}

const StepAccount: React.FC<StepProps> = ({ formData, updateFormData, setIsNextDisabled }) => {
  const [emailError, setEmailError] = useState("");
  const [usernameError, setUsernameError] = useState("");

  const checkUsernameMutation = useMutation({
    mutationFn: (username: string) =>
      apiService.post<{ exists: boolean; message: string }, { username: string }>("/user/check-username", { username }),
    onSuccess: (data) => {
      if (data.exists) {
        setUsernameError(data.message); // Display backend message
        setIsNextDisabled(true);
      } else {
        setUsernameError("");
        validateForm();
      }
    },
    onError: (error) => {
      setUsernameError(error.message);
      setIsNextDisabled(true);
    },
  });
  
  const checkEmailMutation = useMutation({
    mutationFn: (email: string) =>
      apiService.post<{ exists: boolean; message: string }, { email: string }>("/user/check-email", { email }),
    onSuccess: (data) => {
      if (data.exists) {
        setEmailError(data.message); 
        setIsNextDisabled(true);
      } else {
        setEmailError("");
        validateForm();
      }
    },
    onError: (error) => {
      setEmailError(error.message);
      setIsNextDisabled(true);
    },
  });


  const handleEmailBlur = () => {
    const validationError = validateEmail(formData.email);
    if (validationError) {
      setEmailError(validationError);
      setIsNextDisabled(true);
    } else {
      checkEmailMutation.mutate(formData.email);
    }
  };


  const handleUsernameBlur = () => {
    const validationError = validateUsername(formData.username);
    if (validationError) {
      setUsernameError(validationError);
      setIsNextDisabled(true);
    } else {
      checkUsernameMutation.mutate(formData.username);
    }
  };

  
  const validateForm = React.useCallback(() => {
    const hasErrors = !!emailError || !!usernameError;
    const hasValidInputs = formData.email.trim().length > 0 && formData.username.trim().length > 0;
    setIsNextDisabled(hasErrors || !hasValidInputs);
  }, [emailError, usernameError, formData.email, formData.username, setIsNextDisabled]);

  useEffect(() => {
    validateForm();
  }, [validateForm]);

  
  return (
    <div className="flex flex-col gap-4">
  {/* Email */}
  <div className="space-y-1">
    <Label className="dark:text-white">Email</Label>
    <Input
      type="email"
      required
      value={formData.email}
      onChange={(e) => updateFormData({ email: e.target.value })}
      onBlur={handleEmailBlur}
      placeholder="Enter your email"
      className={`
        bg-light dark:bg-dark 
        text-black dark:text-white 
        placeholder:text-gray-400 dark:placeholder:text-gray-500 
        ${emailError ? "border-red-500 focus:ring-red-500" : "border-input dark:border-gray-600"}
      `}
    />
    {emailError && <p className="text-red-500 text-sm">{emailError}</p>}
  </div>

  {/* Username */}
  <div className="space-y-1">
    <Label className="dark:text-white">Username</Label>
    <Input
      type="text"
      required
      value={formData.username}
      onChange={(e) => updateFormData({ username: e.target.value })}
      onBlur={handleUsernameBlur}
      placeholder="Enter username"
      className={`
        bg-light dark:bg-dark 
        text-black dark:text-white 
        placeholder:text-gray-400 dark:placeholder:text-gray-500 
        ${usernameError ? "border-red-500 focus:ring-red-500" : "border-input dark:border-gray-600"}
      `}
    />
    {usernameError && <p className="text-red-500 text-sm">{usernameError}</p>}
  </div>
</div>
  );
};

export default StepAccount;
