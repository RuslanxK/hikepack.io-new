// utils/isSharedView.ts
import { useLocation } from "react-router-dom";

export const useIsSharedView = (): boolean => {
  const location = useLocation();
  return location.pathname.includes("/share/");
};
