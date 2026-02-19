import { useState, useEffect } from 'react';

/**
 * Custom hook for session save/restore pattern
 * Shared between StudySession and EnglishExamSession
 * @param {string} storageKey - localStorage key for progress
 * @param {Array} items - The session items array (for bounds checking)
 * @param {Object} defaultResults - Default results structure
 * @returns {Object} { index, setIndex, results, setResults }
 */
const useSessionProgress = (storageKey, items, defaultResults) => {
    const [index, setIndex] = useState(0);
    const [results, setResults] = useState(defaultResults);
    const [restored, setRestored] = useState(false);

    // Restore on mount
    useEffect(() => {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed.index < items.length) {
                    setIndex(parsed.index);
                    setResults(parsed.results);
                    if (parsed.extra) {
                        // Return extra data for timer state etc.
                        setResults(prev => ({ ...prev, _extra: parsed.extra }));
                    }
                }
            } catch (e) {
                console.error(`Failed to restore ${storageKey} progress:`, e);
            }
        }
        setRestored(true);
    }, []);

    // Save on change
    useEffect(() => {
        if (!restored) return;
        if (index > 0 || results !== defaultResults) {
            localStorage.setItem(storageKey, JSON.stringify({
                index,
                results,
                timestamp: Date.now()
            }));
        }
    }, [index, results, restored, storageKey]);

    return { index, setIndex, results, setResults, restored };
};

export default useSessionProgress;
