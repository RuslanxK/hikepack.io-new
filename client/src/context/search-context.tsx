import { createContext, useContext, useState, ReactNode } from "react";

interface SearchContextType {
  tripSearchTerm: string;
  setTripSearchTerm: (term: string) => void;
  bagSearchTerm: string;
  setBagSearchTerm: (term: string) => void;
  userSearchTerm: string; // New user search term
  setUserSearchTerm: (term: string) => void; // Setter for user search term
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider = ({ children }: { children: ReactNode }) => {
  const [tripSearchTerm, setTripSearchTerm] = useState<string>("");
  const [bagSearchTerm, setBagSearchTerm] = useState<string>("");
  const [userSearchTerm, setUserSearchTerm] = useState<string>(""); // New state for user search

  return (
    <SearchContext.Provider
      value={{
        tripSearchTerm,
        setTripSearchTerm,
        bagSearchTerm,
        setBagSearchTerm,
        userSearchTerm, // Provide the new state
        setUserSearchTerm, // Provide the new setter
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return context;
};
