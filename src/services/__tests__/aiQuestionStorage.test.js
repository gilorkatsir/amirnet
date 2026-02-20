import { describe, it, expect, beforeEach } from 'vitest';
import {
  getSavedQuestionSets,
  saveQuestionSet,
  deleteQuestionSet,
  updateQuestionSetResults,
} from '../aiQuestionStorage';

const STORAGE_KEY = 'wm_ai_saved_questions';

const mockQuestions = [
  { id: 'ai_1', question: 'Test Q1', options: ['a', 'b', 'c', 'd'], correctIndex: 1 },
  { id: 'ai_2', question: 'Test Q2', options: ['a', 'b', 'c', 'd'], correctIndex: 2 },
];

describe('getSavedQuestionSets', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns empty array when no data', () => {
    expect(getSavedQuestionSets()).toEqual([]);
  });

  it('returns empty array for invalid JSON', () => {
    localStorage.setItem(STORAGE_KEY, 'not-json');
    expect(getSavedQuestionSets()).toEqual([]);
  });

  it('returns empty array for non-array JSON', () => {
    localStorage.setItem(STORAGE_KEY, '{"foo": "bar"}');
    expect(getSavedQuestionSets()).toEqual([]);
  });
});

describe('saveQuestionSet', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('saves a question set and returns it', () => {
    const result = saveQuestionSet(mockQuestions, {
      sourceWords: ['hello', 'world'],
      difficulty: 'hard',
    });

    expect(result.id).toMatch(/^qs_/);
    expect(result.questions).toEqual(mockQuestions);
    expect(result.sourceWords).toEqual(['hello', 'world']);
    expect(result.difficulty).toBe('hard');
    expect(result.count).toBe(2);
    expect(result.results).toBeNull();
    expect(result.createdAt).toBeTruthy();
  });

  it('defaults difficulty to medium', () => {
    const result = saveQuestionSet(mockQuestions);
    expect(result.difficulty).toBe('medium');
  });

  it('stores set in localStorage', () => {
    saveQuestionSet(mockQuestions);
    const sets = getSavedQuestionSets();
    expect(sets).toHaveLength(1);
    expect(sets[0].questions).toEqual(mockQuestions);
  });

  it('newest set appears first', () => {
    saveQuestionSet([mockQuestions[0]], { sourceWords: ['first'] });
    saveQuestionSet([mockQuestions[1]], { sourceWords: ['second'] });
    const sets = getSavedQuestionSets();
    expect(sets[0].sourceWords).toEqual(['second']);
    expect(sets[1].sourceWords).toEqual(['first']);
  });

  it('caps at 20 sets, pruning oldest', () => {
    for (let i = 0; i < 25; i++) {
      saveQuestionSet(mockQuestions, { sourceWords: [`word_${i}`] });
    }
    const sets = getSavedQuestionSets();
    expect(sets).toHaveLength(20);
    // Most recent should be word_24
    expect(sets[0].sourceWords).toEqual(['word_24']);
  });
});

describe('deleteQuestionSet', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('deletes an existing set', () => {
    const saved = saveQuestionSet(mockQuestions);
    expect(deleteQuestionSet(saved.id)).toBe(true);
    expect(getSavedQuestionSets()).toHaveLength(0);
  });

  it('returns false for non-existent ID', () => {
    saveQuestionSet(mockQuestions);
    expect(deleteQuestionSet('nonexistent')).toBe(false);
    expect(getSavedQuestionSets()).toHaveLength(1);
  });
});

describe('updateQuestionSetResults', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('updates results for existing set', () => {
    const saved = saveQuestionSet(mockQuestions);
    const result = updateQuestionSetResults(saved.id, {
      correct: 8,
      incorrect: 2,
    });

    expect(result).toBe(true);
    const sets = getSavedQuestionSets();
    expect(sets[0].results).not.toBeNull();
    expect(sets[0].results.correct).toBe(8);
    expect(sets[0].results.incorrect).toBe(2);
    expect(sets[0].results.total).toBe(10);
    expect(sets[0].results.completedAt).toBeTruthy();
  });

  it('returns false for non-existent ID', () => {
    expect(updateQuestionSetResults('nonexistent', { correct: 1, incorrect: 0 })).toBe(false);
  });

  it('uses provided total if given', () => {
    const saved = saveQuestionSet(mockQuestions);
    updateQuestionSetResults(saved.id, {
      correct: 5,
      incorrect: 3,
      total: 10,
    });
    const sets = getSavedQuestionSets();
    expect(sets[0].results.total).toBe(10);
  });
});
