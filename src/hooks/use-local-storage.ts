
"use client";

import { useState, useEffect, useCallback } from 'react';

function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  // Use a state to track if we're on the client and the value has been loaded
  const [isLoaded, setIsLoaded] = useState(false);
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        // Merge stored data with initial data to ensure all keys are present
        const parsedItem = JSON.parse(item);
        setStoredValue(current => ({ ...initialValue, ...parsedItem }));
      } else {
        // If no item in localStorage, use the initialValue as is
        setStoredValue(initialValue);
      }
    } catch (error) {
      console.warn(`Error reading localStorage key “${key}”:`, error);
      setStoredValue(initialValue);
    } finally {
      // Signal that we've finished loading from localStorage
      setIsLoaded(true);
    }
  }, [key]); // Removed initialValue from dependencies to avoid re-running on every render

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key “${key}”:`, error);
    }
  };

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key) {
        if (e.newValue) {
          try {
            const parsedItem = JSON.parse(e.newValue);
             setStoredValue(current => ({ ...initialValue, ...parsedItem }));
          } catch (error) {
              console.warn(`Error parsing storage change for key "${key}":`, error);
          }
        } else {
           setStoredValue(initialValue);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [key, initialValue]);

  // Return initialValue until the value is loaded from localStorage on the client
  return [isLoaded ? storedValue : initialValue, setValue];
}

export default useLocalStorage;
