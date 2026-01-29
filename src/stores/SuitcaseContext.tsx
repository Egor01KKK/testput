import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { storage, STORAGE_KEYS } from '../services/storage';
import { Tour } from '../types';

interface SuitcaseContextValue {
  items: Tour[];
  isLoading: boolean;
  addToSuitcase: (tour: Tour) => Promise<void>;
  removeFromSuitcase: (tourId: string) => Promise<void>;
  isInSuitcase: (tourId: string) => boolean;
  toggleSuitcase: (tour: Tour) => Promise<void>;
}

const SuitcaseContext = createContext<SuitcaseContextValue | undefined>(undefined);

interface SuitcaseProviderProps {
  children: ReactNode;
}

export const SuitcaseProvider: React.FC<SuitcaseProviderProps> = ({ children }) => {
  const [items, setItems] = useState<Tour[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSuitcase();
  }, []);

  const loadSuitcase = async () => {
    try {
      const savedItems = await storage.get<Tour[]>(STORAGE_KEYS.SUITCASE);
      if (savedItems) {
        setItems(savedItems);
      }
    } catch (error) {
      console.error('Error loading suitcase:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSuitcase = async (newItems: Tour[]) => {
    await storage.set(STORAGE_KEYS.SUITCASE, newItems);
  };

  const addToSuitcase = async (tour: Tour) => {
    if (!items.find((item) => item.id === tour.id)) {
      const newItems = [...items, tour];
      setItems(newItems);
      await saveSuitcase(newItems);
    }
  };

  const removeFromSuitcase = async (tourId: string) => {
    const newItems = items.filter((item) => item.id !== tourId);
    setItems(newItems);
    await saveSuitcase(newItems);
  };

  const isInSuitcase = (tourId: string): boolean => {
    return items.some((item) => item.id === tourId);
  };

  const toggleSuitcase = async (tour: Tour) => {
    if (isInSuitcase(tour.id)) {
      await removeFromSuitcase(tour.id);
    } else {
      await addToSuitcase(tour);
    }
  };

  return (
    <SuitcaseContext.Provider
      value={{
        items,
        isLoading,
        addToSuitcase,
        removeFromSuitcase,
        isInSuitcase,
        toggleSuitcase,
      }}
    >
      {children}
    </SuitcaseContext.Provider>
  );
};

export const useSuitcase = (): SuitcaseContextValue => {
  const context = useContext(SuitcaseContext);
  if (!context) {
    throw new Error('useSuitcase must be used within SuitcaseProvider');
  }
  return context;
};

export default SuitcaseContext;
