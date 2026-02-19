import React, { createContext, useContext, useState, useCallback } from 'react';
import { sanitizeString, safeLocalStorageGet, safeLocalStorageSet } from '../utils/security';

const UserWordsContext = createContext(null);

export const UserWordsProvider = ({ children }) => {
  const [userWords, setUserWords] = useState(() => {
    return safeLocalStorageGet('wm_user_words') || [];
  });

  const saveWord = useCallback((word) => {
    if (!word || !word.trim()) return;
    const sanitized = sanitizeString(word.trim());
    if (!sanitized) return;

    setUserWords(prev => {
      if (prev.some(w => w.text.toLowerCase() === sanitized.toLowerCase())) {
        return prev;
      }
      const newWord = {
        id: Date.now(),
        text: sanitized,
        date: Date.now(),
        translation: ''
      };
      const newList = [newWord, ...prev];
      safeLocalStorageSet('wm_user_words', newList);
      return newList;
    });
  }, []);

  const deleteWord = useCallback((wordId) => {
    setUserWords(prev => {
      const newList = prev.filter(w => w.id !== wordId);
      safeLocalStorageSet('wm_user_words', newList);
      return newList;
    });
  }, []);

  const updateWord = useCallback((wordId, updates) => {
    setUserWords(prev => {
      const newList = prev.map(w =>
        w.id === wordId ? { ...w, ...updates } : w
      );
      safeLocalStorageSet('wm_user_words', newList);
      return newList;
    });
  }, []);

  const value = {
    userWords,
    saveWord,
    deleteWord,
    updateWord,
    setUserWords,
  };

  return <UserWordsContext.Provider value={value}>{children}</UserWordsContext.Provider>;
};

export const useUserWords = () => {
  const ctx = useContext(UserWordsContext);
  if (!ctx) throw new Error('useUserWords must be used within UserWordsProvider');
  return ctx;
};
