import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { storage, STORAGE_KEYS } from '../services/storage';
import { UserProfile } from '../types';

interface UserContextValue {
  user: UserProfile | null;
  isLoading: boolean;
  isRegistered: boolean;
  setUser: (user: UserProfile) => Promise<void>;
  updateUser: (updates: Partial<UserProfile>) => Promise<void>;
  logout: () => Promise<void>;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUserState] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const profile = await storage.get<UserProfile>(STORAGE_KEYS.USER_PROFILE);
      const registered = await storage.get<boolean>(STORAGE_KEYS.USER_REGISTERED);
      setUserState(profile);
      setIsRegistered(registered || false);
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setUser = async (newUser: UserProfile) => {
    await storage.set(STORAGE_KEYS.USER_PROFILE, newUser);
    await storage.set(STORAGE_KEYS.USER_REGISTERED, true);
    setUserState(newUser);
    setIsRegistered(true);
  };

  const updateUser = async (updates: Partial<UserProfile>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      await storage.set(STORAGE_KEYS.USER_PROFILE, updatedUser);
      setUserState(updatedUser);
    }
  };

  const logout = async () => {
    await storage.remove(STORAGE_KEYS.USER_PROFILE);
    await storage.remove(STORAGE_KEYS.USER_REGISTERED);
    setUserState(null);
    setIsRegistered(false);
  };

  return (
    <UserContext.Provider
      value={{
        user,
        isLoading,
        isRegistered,
        setUser,
        updateUser,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextValue => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
};

export default UserContext;
