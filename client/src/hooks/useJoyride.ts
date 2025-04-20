// hooks/useJoyride.ts
import { useState, useEffect } from 'react';

export const useJoyride = (key: string) => {
  const [isJoyrideRun, setIsJoyrideRun] = useState(false);

  useEffect(() => {
    const hasSeenGuide = localStorage.getItem(`joyride-${key}`);
    if (!hasSeenGuide) {
      setIsJoyrideRun(true);
      localStorage.setItem(`joyride-${key}`, 'true');
    }
  }, [key]);

  return isJoyrideRun;
};
