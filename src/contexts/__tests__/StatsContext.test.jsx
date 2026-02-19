import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { StatsProvider, useStatsContext } from '../StatsContext';

describe('StatsContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const wrapper = ({ children }) => <StatsProvider>{children}</StatsProvider>;

  it('provides initial empty stats', () => {
    const { result } = renderHook(() => useStatsContext(), { wrapper });
    expect(result.current.stats).toEqual({});
    expect(result.current.englishStats).toEqual({});
  });

  it('loads stats from localStorage', () => {
    localStorage.setItem('wm_stats', JSON.stringify({ w1: { correct: 3, incorrect: 1, level: 2 } }));
    const { result } = renderHook(() => useStatsContext(), { wrapper });
    expect(result.current.stats.w1.correct).toBe(3);
  });

  it('updates vocab progress correctly', () => {
    const { result } = renderHook(() => useStatsContext(), { wrapper });

    act(() => {
      result.current.updateWordProgress('word1', true);
    });

    expect(result.current.stats.word1.correct).toBe(1);
    expect(result.current.stats.word1.incorrect).toBe(0);
    expect(result.current.stats.word1.level).toBe(1);
  });

  it('increments incorrect on wrong answer', () => {
    const { result } = renderHook(() => useStatsContext(), { wrapper });

    act(() => {
      result.current.updateWordProgress('word1', false);
    });

    expect(result.current.stats.word1.correct).toBe(0);
    expect(result.current.stats.word1.incorrect).toBe(1);
    expect(result.current.stats.word1.level).toBe(0); // Can't go below 0
  });

  it('updates english progress correctly', () => {
    const { result } = renderHook(() => useStatsContext(), { wrapper });

    act(() => {
      result.current.updateEnglishProgress('q1', true);
    });

    expect(result.current.englishStats.q1.correct).toBe(1);
    expect(result.current.englishStats.q1.attempts).toBe(1);
  });

  it('resets vocab stats', () => {
    const { result } = renderHook(() => useStatsContext(), { wrapper });

    act(() => {
      result.current.updateWordProgress('word1', true);
    });
    expect(Object.keys(result.current.stats).length).toBe(1);

    act(() => {
      result.current.resetStats('vocab');
    });
    expect(result.current.stats).toEqual({});
  });

  it('resets english stats', () => {
    const { result } = renderHook(() => useStatsContext(), { wrapper });

    act(() => {
      result.current.updateEnglishProgress('q1', true);
    });
    expect(Object.keys(result.current.englishStats).length).toBe(1);

    act(() => {
      result.current.resetStats('english');
    });
    expect(result.current.englishStats).toEqual({});
  });

  it('resets all stats', () => {
    const { result } = renderHook(() => useStatsContext(), { wrapper });

    act(() => {
      result.current.updateWordProgress('word1', true);
      result.current.updateEnglishProgress('q1', true);
    });

    act(() => {
      result.current.resetStats('all');
    });
    expect(result.current.stats).toEqual({});
    expect(result.current.englishStats).toEqual({});
  });

  it('calculatePriority returns higher value for words with more errors', () => {
    const { result } = renderHook(() => useStatsContext(), { wrapper });

    act(() => {
      result.current.updateWordProgress('easy', true);
      result.current.updateWordProgress('easy', true);
      result.current.updateWordProgress('hard', false);
      result.current.updateWordProgress('hard', false);
    });

    const easyPriority = result.current.calculatePriority('easy');
    const hardPriority = result.current.calculatePriority('hard');
    expect(hardPriority).toBeGreaterThan(easyPriority);
  });

  it('provides totalWords and totalQuestions', () => {
    const { result } = renderHook(() => useStatsContext(), { wrapper });
    expect(result.current.totalWords).toBeGreaterThan(0);
    expect(result.current.totalQuestions).toBeGreaterThan(0);
  });
});
