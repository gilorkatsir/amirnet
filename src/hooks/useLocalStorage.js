import { useState, useCallback } from 'react';

/**
 * Custom hook for localStorage-backed state
 * @param {string} key - localStorage key
 * @param {*} defaultValue - Default value if key doesn't exist
 * @returns {[*, Function]} - [value, setValue]
 */
const useLocalStorage = (key, defaultValue) => {
    const [value, setValue] = useState(() => {
        try {
            const stored = localStorage.getItem(key);
            return stored !== null ? JSON.parse(stored) : defaultValue;
        } catch {
            return defaultValue;
        }
    });

    const setStoredValue = useCallback((newValue) => {
        setValue(prev => {
            const resolved = typeof newValue === 'function' ? newValue(prev) : newValue;
            try {
                localStorage.setItem(key, JSON.stringify(resolved));
            } catch (e) {
                console.warn(`Failed to save to localStorage key "${key}":`, e);
            }
            return resolved;
        });
    }, [key]);

    return [value, setStoredValue];
};

export default useLocalStorage;
