import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getTodayKey,
  getDailyStats,
  saveDailyStats,
  recordDailyAccuracy,
  calculateStreak,
  getLastNDaysAccuracy,
  cleanOldStats
} from '../dailyStats';

const DAILY_STATS_KEY = 'wm_daily_stats';

describe('getTodayKey', () => {
  it('returns YYYY-MM-DD format', () => {
    const key = getTodayKey();
    expect(key).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('getDailyStats / saveDailyStats', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns empty object when no data', () => {
    expect(getDailyStats()).toEqual({});
  });

  it('round-trips data through save/get', () => {
    const data = { '2024-01-01': { vocab: { correct: 5, total: 10 }, english: { correct: 3, total: 5 } } };
    saveDailyStats(data);
    expect(getDailyStats()).toEqual(data);
  });
});

describe('recordDailyAccuracy', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('creates todays entry if missing', () => {
    recordDailyAccuracy(5, 10, 'vocab');
    const stats = getDailyStats();
    const today = getTodayKey();
    expect(stats[today].vocab.correct).toBe(5);
    expect(stats[today].vocab.total).toBe(10);
  });

  it('accumulates across multiple calls', () => {
    recordDailyAccuracy(3, 5, 'vocab');
    recordDailyAccuracy(2, 3, 'vocab');
    const stats = getDailyStats();
    const today = getTodayKey();
    expect(stats[today].vocab.correct).toBe(5);
    expect(stats[today].vocab.total).toBe(8);
  });

  it('tracks english separately', () => {
    recordDailyAccuracy(4, 6, 'english');
    const stats = getDailyStats();
    const today = getTodayKey();
    expect(stats[today].english.correct).toBe(4);
    expect(stats[today].english.total).toBe(6);
    expect(stats[today].vocab.correct).toBe(0);
  });
});

describe('calculateStreak', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns 0 when no data', () => {
    expect(calculateStreak()).toBe(0);
  });

  it('returns 1 for activity only today', () => {
    recordDailyAccuracy(5, 10, 'vocab');
    expect(calculateStreak()).toBe(1);
  });

  it('counts consecutive days', () => {
    const today = new Date();
    const stats = {};
    for (let i = 0; i < 3; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const key = date.toISOString().split('T')[0];
      stats[key] = { vocab: { correct: 1, total: 2 }, english: { correct: 0, total: 0 } };
    }
    saveDailyStats(stats);
    expect(calculateStreak()).toBe(3);
  });

  it('breaks on gap days', () => {
    const today = new Date();
    const stats = {};
    // Today and yesterday
    for (let i = 0; i < 2; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      stats[date.toISOString().split('T')[0]] = { vocab: { correct: 1, total: 2 }, english: { correct: 0, total: 0 } };
    }
    // Skip a day, then 3 days ago
    const threeDaysAgo = new Date(today);
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    stats[threeDaysAgo.toISOString().split('T')[0]] = { vocab: { correct: 1, total: 2 }, english: { correct: 0, total: 0 } };
    saveDailyStats(stats);
    expect(calculateStreak()).toBe(2);
  });
});

describe('getLastNDaysAccuracy', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns correct number of entries', () => {
    const result = getLastNDaysAccuracy(7);
    expect(result).toHaveLength(7);
  });

  it('returns null accuracy for days without data', () => {
    const result = getLastNDaysAccuracy(3);
    result.forEach(day => {
      expect(day.accuracy).toBeNull();
    });
  });

  it('calculates accuracy correctly', () => {
    recordDailyAccuracy(7, 10, 'vocab');
    const result = getLastNDaysAccuracy(1);
    expect(result[0].accuracy).toBe(70);
    expect(result[0].vocabAccuracy).toBe(70);
  });
});

describe('cleanOldStats', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('removes entries older than retention period', () => {
    const stats = {};
    // Add entry from 100 days ago
    const old = new Date();
    old.setDate(old.getDate() - 100);
    stats[old.toISOString().split('T')[0]] = { vocab: { correct: 1, total: 2 }, english: { correct: 0, total: 0 } };
    // Add today
    stats[getTodayKey()] = { vocab: { correct: 1, total: 2 }, english: { correct: 0, total: 0 } };
    saveDailyStats(stats);

    cleanOldStats(90);

    const result = getDailyStats();
    expect(Object.keys(result)).toHaveLength(1);
    expect(result[getTodayKey()]).toBeDefined();
  });

  it('keeps entries within retention period', () => {
    const stats = {};
    stats[getTodayKey()] = { vocab: { correct: 1, total: 2 }, english: { correct: 0, total: 0 } };
    saveDailyStats(stats);

    cleanOldStats(90);
    expect(Object.keys(getDailyStats())).toHaveLength(1);
  });
});
