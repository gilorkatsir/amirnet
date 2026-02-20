import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';

const TierContext = createContext(null);

export const FREE_LIMITS = {
  vocabWords: 30,
  englishQuestions: 10,
  aiPracticePerDay: 1,
  vocalSections: 4,
};

const AI_USAGE_KEY = 'wm_ai_usage';

const getAiUsageToday = () => {
  try {
    const raw = localStorage.getItem(AI_USAGE_KEY);
    if (!raw) return 0;
    const { date, count } = JSON.parse(raw);
    if (date === new Date().toISOString().split('T')[0]) return count;
    return 0;
  } catch { return 0; }
};

export const TierProvider = ({ children }) => {
  const { isPremium, isTrial } = useAuth();

  const hasFullAccess = isPremium || isTrial;

  const canAccessWord = useCallback((wordId) => {
    return hasFullAccess || wordId <= FREE_LIMITS.vocabWords;
  }, [hasFullAccess]);

  const canAccessQuestion = useCallback((index) => {
    return hasFullAccess || index < FREE_LIMITS.englishQuestions;
  }, [hasFullAccess]);

  const canAccessVocalSection = useCallback((index) => {
    return hasFullAccess || index < FREE_LIMITS.vocalSections;
  }, [hasFullAccess]);

  const canUseAiPractice = useCallback(() => {
    return hasFullAccess || getAiUsageToday() < FREE_LIMITS.aiPracticePerDay;
  }, [hasFullAccess]);

  const recordAiUsage = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    const current = getAiUsageToday();
    localStorage.setItem(AI_USAGE_KEY, JSON.stringify({ date: today, count: current + 1 }));
  }, []);

  const aiUsageToday = useMemo(() => getAiUsageToday(), []);

  const value = {
    isPremium,
    isTrial,
    hasFullAccess,
    canAccessWord,
    canAccessQuestion,
    canAccessVocalSection,
    canUseAiPractice,
    recordAiUsage,
    aiUsageToday,
    FREE_LIMITS,
  };

  return <TierContext.Provider value={value}>{children}</TierContext.Provider>;
};

export const useTier = () => {
  const ctx = useContext(TierContext);
  if (!ctx) throw new Error('useTier must be used within TierProvider');
  return ctx;
};
