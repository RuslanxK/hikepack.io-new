import { useState, useCallback } from "react";

interface FileValidator {
  validateFile: (file: File | null) => boolean;
  error: string | null;
  resetError: () => void;
}

export const useFileValidator = (maxSizeMB: number = 2): FileValidator => {
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File | null): boolean => {
    if (!file) {
      setError(null);
      return true; 
    }

    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      setError(`File size exceeds the limit of ${maxSizeMB} MB.`);
      return false;
    }

    setError(null);
    return true;
  };

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  return { validateFile, error, resetError };
};
