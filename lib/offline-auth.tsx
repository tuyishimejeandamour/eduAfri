"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { addItem, getItem, getAllItems, updateItem, initDB } from "./indexeddb";

// Define the store name for offline users
const STORE_NAME = 'offline_users';

export type OfflineUser = {
  id: string;
  email: string;
  username?: string;
  password: string; // In a real app, this should be hashed
  createdAt: Date;
  lastLoginAt?: Date;
};

interface OfflineAuthContextProps {
  offlineUser: OfflineUser | null;
  offlineSignIn: (email: string, password: string) => Promise<boolean>;
  offlineSignUp: (email: string, password: string, username?: string) => Promise<boolean>;
  offlineSignOut: () => Promise<void>;
  isOfflineAuthenticated: boolean;
}

const OfflineAuthContext = createContext<OfflineAuthContextProps>({
  offlineUser: null,
  offlineSignIn: async () => false,
  offlineSignUp: async () => false,
  offlineSignOut: async () => {},
  isOfflineAuthenticated: false,
});

export function OfflineAuthProvider({ children }: { children: React.ReactNode }) {
  const [offlineUser, setOfflineUser] = useState<OfflineUser | null>(null);
  const [isOfflineAuthenticated, setIsOfflineAuthenticated] = useState(false);
  const isBrowser = typeof window !== 'undefined';

  // Check for existing offline session on mount
  useEffect(() => {
    if (!isBrowser) return;

    const checkOfflineSession = async () => {
      try {
        // Check for saved user in localStorage (simpler than IndexedDB for session)
        const savedUser = localStorage.getItem('offlineUser');
        if (savedUser) {
          const user = JSON.parse(savedUser);
          // Validate the user exists in IndexedDB
          const storedUser = await getItem<OfflineUser>(STORE_NAME, user.id);
          if (storedUser) {
            setOfflineUser(storedUser);
            setIsOfflineAuthenticated(true);
          } else {
            // Clear invalid session
            localStorage.removeItem('offlineUser');
          }
        }
      } catch (error) {
        console.error('Error checking offline session:', error);
        localStorage.removeItem('offlineUser');
      }
    };

    // Initialize the database first, then check session
    initDB().then(() => checkOfflineSession());
  }, [isBrowser]);

  const offlineSignIn = async (email: string, password: string): Promise<boolean> => {
    if (!isBrowser) return false;

    try {
      // Get all users and find the one with matching email
      const users = await getAllItems<OfflineUser>(STORE_NAME);
      const user = users.find(user => user.email.toLowerCase() === email.toLowerCase());

      if (!user) {
        return false; // User not found
      }

      if (user.password !== password) {
        return false; // Incorrect password
      }

      // Update last login time
      user.lastLoginAt = new Date();
      await updateItem(STORE_NAME, user);

      // Set user in state and store in localStorage
      setOfflineUser(user);
      setIsOfflineAuthenticated(true);
      localStorage.setItem('offlineUser', JSON.stringify(user));

      return true;
    } catch (error) {
      console.error('Error signing in offline:', error);
      return false;
    }
  };

  const offlineSignUp = async (
    email: string, 
    password: string, 
    username?: string
  ): Promise<boolean> => {
    if (!isBrowser) return false;

    try {
      // Get all users and check if email exists
      const users = await getAllItems<OfflineUser>(STORE_NAME);
      const userExists = users.some(user => user.email.toLowerCase() === email.toLowerCase());

      if (userExists) {
        return false; // User already exists
      }

      // Create a new user
      const newUser: OfflineUser = {
        id: `offline-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        email,
        username: username || email.split('@')[0],
        password, // In a real app, this should be hashed
        createdAt: new Date(),
        lastLoginAt: new Date(),
      };

      // Save to IndexedDB
      await addItem(STORE_NAME, newUser);

      // Set user in state and store in localStorage
      setOfflineUser(newUser);
      setIsOfflineAuthenticated(true);
      localStorage.setItem('offlineUser', JSON.stringify(newUser));

      return true;
    } catch (error) {
      console.error('Error signing up offline:', error);
      return false;
    }
  };

  const offlineSignOut = async (): Promise<void> => {
    if (!isBrowser) return;

    // Clear user from state and localStorage
    setOfflineUser(null);
    setIsOfflineAuthenticated(false);
    localStorage.removeItem('offlineUser');
  };

  const contextValue: OfflineAuthContextProps = {
    offlineUser,
    offlineSignIn,
    offlineSignUp,
    offlineSignOut,
    isOfflineAuthenticated,
  };

  return (
    <OfflineAuthContext.Provider value={contextValue}>
      {children}
    </OfflineAuthContext.Provider>
  );
}

export function useOfflineAuth() {
  return useContext(OfflineAuthContext);
}