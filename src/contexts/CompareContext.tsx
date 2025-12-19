import { ClothingItem } from '@/types/clothing';
import { createContext, useContext, useState, ReactNode } from 'react';

export interface SavedOutfit {
  id: string;
  name: string;
  items: ClothingItem[];
  bodyImageUrl?: string;
  resultImageUrl?: string;
  createdAt: Date;
}

interface CompareContextType {
  outfitsToCompare: SavedOutfit[];
  addToCompare: (outfit: SavedOutfit) => void;
  removeFromCompare: (outfitId: string) => void;
  clearCompare: () => void;
  isInCompare: (outfitId: string) => boolean;
}

// Default values for when context is not available
const defaultContextValue: CompareContextType = {
  outfitsToCompare: [],
  addToCompare: () => {},
  removeFromCompare: () => {},
  clearCompare: () => {},
  isInCompare: () => false,
};

const CompareContext = createContext<CompareContextType>(defaultContextValue);

export const CompareProvider = ({ children }: { children: ReactNode }) => {
  const [outfitsToCompare, setOutfitsToCompare] = useState<SavedOutfit[]>([]);

  const addToCompare = (outfit: SavedOutfit) => {
    if (outfitsToCompare.length >= 4) {
      return; // Max 4 outfits to compare
    }
    if (!outfitsToCompare.find(o => o.id === outfit.id)) {
      setOutfitsToCompare(prev => [...prev, outfit]);
    }
  };

  const removeFromCompare = (outfitId: string) => {
    setOutfitsToCompare(prev => prev.filter(o => o.id !== outfitId));
  };

  const clearCompare = () => {
    setOutfitsToCompare([]);
  };

  const isInCompare = (outfitId: string) => {
    return outfitsToCompare.some(o => o.id === outfitId);
  };

  return (
    <CompareContext.Provider value={{
      outfitsToCompare,
      addToCompare,
      removeFromCompare,
      clearCompare,
      isInCompare,
    }}>
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => {
  return useContext(CompareContext);
};
