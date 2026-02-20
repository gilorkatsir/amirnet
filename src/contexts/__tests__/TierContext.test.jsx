import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { TierProvider, useTier, FREE_LIMITS } from '../TierContext';
import { AuthProvider } from '../AuthContext';

// Mock supabase to avoid real connections
vi.mock('../../services/supabase', () => ({
  supabase: null,
}));

describe('TierContext — Free User', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const wrapper = ({ children }) => (
    <AuthProvider>
      <TierProvider>{children}</TierProvider>
    </AuthProvider>
  );

  it('allows access to word ID 30', () => {
    const { result } = renderHook(() => useTier(), { wrapper });
    expect(result.current.canAccessWord(30)).toBe(true);
  });

  it('blocks access to word ID 31', () => {
    const { result } = renderHook(() => useTier(), { wrapper });
    expect(result.current.canAccessWord(31)).toBe(false);
  });

  it('allows access to word ID 1', () => {
    const { result } = renderHook(() => useTier(), { wrapper });
    expect(result.current.canAccessWord(1)).toBe(true);
  });

  it('allows access to question index 9', () => {
    const { result } = renderHook(() => useTier(), { wrapper });
    expect(result.current.canAccessQuestion(9)).toBe(true);
  });

  it('blocks access to question index 10', () => {
    const { result } = renderHook(() => useTier(), { wrapper });
    expect(result.current.canAccessQuestion(10)).toBe(false);
  });

  it('allows access to vocal section index 3', () => {
    const { result } = renderHook(() => useTier(), { wrapper });
    expect(result.current.canAccessVocalSection(3)).toBe(true);
  });

  it('blocks access to vocal section index 4', () => {
    const { result } = renderHook(() => useTier(), { wrapper });
    expect(result.current.canAccessVocalSection(4)).toBe(false);
  });

  it('allows first AI usage of the day', () => {
    const { result } = renderHook(() => useTier(), { wrapper });
    expect(result.current.canUseAiPractice()).toBe(true);
  });

  it('blocks second AI usage of the day', () => {
    const { result } = renderHook(() => useTier(), { wrapper });

    act(() => {
      result.current.recordAiUsage();
    });

    expect(result.current.canUseAiPractice()).toBe(false);
  });

  it('resets AI usage on a new day', () => {
    // Simulate usage from yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    localStorage.setItem('wm_ai_usage', JSON.stringify({
      date: yesterday.toISOString().split('T')[0],
      count: 1,
    }));

    const { result } = renderHook(() => useTier(), { wrapper });
    expect(result.current.canUseAiPractice()).toBe(true);
  });

  it('exposes FREE_LIMITS constants', () => {
    const { result } = renderHook(() => useTier(), { wrapper });
    expect(result.current.FREE_LIMITS.vocabWords).toBe(30);
    expect(result.current.FREE_LIMITS.englishQuestions).toBe(10);
    expect(result.current.FREE_LIMITS.aiPracticePerDay).toBe(1);
    expect(result.current.FREE_LIMITS.vocalSections).toBe(4);
  });
});

describe('TierContext — Premium User', () => {
  beforeEach(() => {
    localStorage.clear();
    // Simulate premium cache
    localStorage.setItem('wm_premium_cache', JSON.stringify(true));
  });

  const wrapper = ({ children }) => (
    <AuthProvider>
      <TierProvider>{children}</TierProvider>
    </AuthProvider>
  );

  it('allows access to word ID 500', () => {
    const { result } = renderHook(() => useTier(), { wrapper });
    expect(result.current.canAccessWord(500)).toBe(true);
  });

  it('allows access to question index 100', () => {
    const { result } = renderHook(() => useTier(), { wrapper });
    expect(result.current.canAccessQuestion(100)).toBe(true);
  });

  it('allows access to vocal section index 10', () => {
    const { result } = renderHook(() => useTier(), { wrapper });
    expect(result.current.canAccessVocalSection(10)).toBe(true);
  });

  it('allows unlimited AI usage', () => {
    const { result } = renderHook(() => useTier(), { wrapper });

    act(() => {
      result.current.recordAiUsage();
      result.current.recordAiUsage();
      result.current.recordAiUsage();
    });

    expect(result.current.canUseAiPractice()).toBe(true);
  });
});
