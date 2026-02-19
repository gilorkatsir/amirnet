import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { VOCABULARY } from '../data/vocabulary';
import { ENGLISH_QUESTIONS } from '../data/englishQuestions';
import { safeLocalStorageGet, safeLocalStorageSet } from '../utils/security';

const StatsContext = createContext(null);

const statsReducer = (state, action) => {
  switch (action.type) {
    case 'SET_VOCAB':
      return { ...state, vocabStats: action.payload };
    case 'SET_ENGLISH':
      return { ...state, englishStats: action.payload };
    case 'UPDATE_VOCAB': {
      const { wordId, isCorrect } = action.payload;
      const current = state.vocabStats[wordId] || { correct: 0, incorrect: 0, level: 0 };
      return {
        ...state,
        vocabStats: {
          ...state.vocabStats,
          [wordId]: {
            correct: current.correct + (isCorrect ? 1 : 0),
            incorrect: current.incorrect + (isCorrect ? 0 : 1),
            level: isCorrect ? Math.min(current.level + 1, 5) : Math.max(current.level - 1, 0),
            lastSeen: new Date().toISOString()
          }
        }
      };
    }
    case 'UPDATE_ENGLISH': {
      const { questionId, isCorrect } = action.payload;
      const current = state.englishStats[questionId] || { correct: 0, incorrect: 0, attempts: 0 };
      return {
        ...state,
        englishStats: {
          ...state.englishStats,
          [questionId]: {
            correct: current.correct + (isCorrect ? 1 : 0),
            incorrect: current.incorrect + (isCorrect ? 0 : 1),
            attempts: current.attempts + 1,
            lastSeen: new Date().toISOString()
          }
        }
      };
    }
    case 'RESET': {
      const { resetType } = action.payload;
      return {
        vocabStats: (resetType === 'vocab' || resetType === 'all') ? {} : state.vocabStats,
        englishStats: (resetType === 'english' || resetType === 'all') ? {} : state.englishStats,
      };
    }
    default:
      return state;
  }
};

export const StatsProvider = ({ children }) => {
  const [state, dispatch] = useReducer(statsReducer, null, () => ({
    vocabStats: safeLocalStorageGet('wm_stats') || {},
    englishStats: safeLocalStorageGet('wm_english_stats') || {}
  }));

  // Persist vocab stats on change
  useEffect(() => {
    safeLocalStorageSet('wm_stats', state.vocabStats);
  }, [state.vocabStats]);

  // Persist english stats on change
  useEffect(() => {
    safeLocalStorageSet('wm_english_stats', state.englishStats);
  }, [state.englishStats]);

  const updateWordProgress = useCallback((wordId, isCorrect) => {
    dispatch({ type: 'UPDATE_VOCAB', payload: { wordId, isCorrect } });
  }, []);

  const updateEnglishProgress = useCallback((questionId, isCorrect) => {
    dispatch({ type: 'UPDATE_ENGLISH', payload: { questionId, isCorrect } });
  }, []);

  const resetStats = useCallback((type) => {
    dispatch({ type: 'RESET', payload: { resetType: type } });
    if (type === 'vocab' || type === 'all') {
      localStorage.removeItem('wm_vocab_progress');
    }
    if (type === 'english' || type === 'all') {
      localStorage.removeItem('wm_english_progress');
    }
    if (type === 'all') {
      localStorage.removeItem('wm_active_session');
    }
  }, []);

  const calculatePriority = useCallback((wordId) => {
    const s = state.vocabStats[wordId] || { correct: 0, incorrect: 0, level: 0 };
    return (s.incorrect * 3) - s.correct - (s.level * 2);
  }, [state.vocabStats]);

  const value = {
    stats: state.vocabStats,
    englishStats: state.englishStats,
    totalWords: VOCABULARY.length,
    totalQuestions: ENGLISH_QUESTIONS.length,
    updateWordProgress,
    updateEnglishProgress,
    resetStats,
    calculatePriority,
    setStats: (s) => dispatch({ type: 'SET_VOCAB', payload: s }),
    setEnglishStats: (es) => dispatch({ type: 'SET_ENGLISH', payload: es }),
  };

  return <StatsContext.Provider value={value}>{children}</StatsContext.Provider>;
};

export const useStatsContext = () => {
  const ctx = useContext(StatsContext);
  if (!ctx) throw new Error('useStatsContext must be used within StatsProvider');
  return ctx;
};
