import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { storage, STORAGE_KEYS } from '../services/storage';

interface FavoritesContextValue {
  favorites: Set<string>;
  isLoading: boolean;
  addFavorite: (id: string) => Promise<void>;
  removeFavorite: (id: string) => Promise<void>;
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined);

interface FavoritesProviderProps {
  children: ReactNode;
}

export const FavoritesProvider: React.FC<FavoritesProviderProps> = ({ children }) => {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const savedFavorites = await storage.get<string[]>(STORAGE_KEYS.FAVORITES);
      if (savedFavorites) {
        setFavorites(new Set(savedFavorites));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveFavorites = async (newFavorites: Set<string>) => {
    await storage.set(STORAGE_KEYS.FAVORITES, [...newFavorites]);
  };

  const addFavorite = async (id: string) => {
    const newFavorites = new Set(favorites);
    newFavorites.add(id);
    setFavorites(newFavorites);
    await saveFavorites(newFavorites);
  };

  const removeFavorite = async (id: string) => {
    const newFavorites = new Set(favorites);
    newFavorites.delete(id);
    setFavorites(newFavorites);
    await saveFavorites(newFavorites);
  };

  const isFavorite = (id: string): boolean => {
    return favorites.has(id);
  };

  const toggleFavorite = async (id: string) => {
    if (favorites.has(id)) {
      await removeFavorite(id);
    } else {
      await addFavorite(id);
    }
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        isLoading,
        addFavorite,
        removeFavorite,
        isFavorite,
        toggleFavorite,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = (): FavoritesContextValue => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within FavoritesProvider');
  }
  return context;
};

export default FavoritesContext;
