import { ClothingItem } from '@/types/clothing';

export interface SavedOutfit {
  id: string;
  name: string;
  items: ClothingItem[];
  bodyImageUrl?: string;
  resultImageUrl?: string;
  createdAt: Date;
}

// Context for managing outfits to compare
import { createContext, useContext, useState, ReactNode } from 'react';

interface CompareContextType {
  outfitsToCompare: SavedOutfit[];
  addToCompare: (outfit: SavedOutfit) => void;
  removeFromCompare: (outfitId: string) => void;
  clearCompare: () => void;
  isInCompare: (outfitId: string) => boolean;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

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
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error('useCompare must be used within CompareProvider');
  }
  return context;
};
