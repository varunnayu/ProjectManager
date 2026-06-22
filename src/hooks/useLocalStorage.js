import { useState, useEffect } from "react";

/**
 * useLocalStorage — persist state in localStorage with JSON serialization.
 *
 * @template T
 * @param {string} key          - localStorage key
 * @param {T}      initialValue - fallback value if key doesn't exist
 * @returns {[T, (value: T | ((prev: T) => T)) => void]}
 *
 * @example
 * const [theme, setTheme] = useLocalStorage("theme", "dark");
 */
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (err) {
      console.error(`useLocalStorage [${key}]:`, err);
    }
  };

  return [storedValue, setValue];
}
