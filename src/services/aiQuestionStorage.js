// AI Question Storage Service
// Persists AI-generated question sets to localStorage
// Capped at 20 sets — oldest auto-pruned on save

const STORAGE_KEY = 'wm_ai_saved_questions';
const MAX_SETS = 20;

/**
 * Get all saved question sets
 * @returns {Array} Array of saved question set objects
 */
export function getSavedQuestionSets() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Save a question set with metadata
 * @param {Array} questions - The AI-generated questions
 * @param {Object} metadata - { sourceWords, difficulty, count }
 * @returns {Object} The saved question set object
 */
export function saveQuestionSet(questions, metadata = {}) {
  const sets = getSavedQuestionSets();

  const newSet = {
    id: `qs_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    questions,
    createdAt: new Date().toISOString(),
    sourceWords: metadata.sourceWords || [],
    difficulty: metadata.difficulty || 'medium',
    count: questions.length,
    results: null,
  };

  sets.unshift(newSet);

  // Cap at MAX_SETS — prune oldest
  while (sets.length > MAX_SETS) {
    sets.pop();
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(sets));
  return newSet;
}

/**
 * Delete a saved question set by ID
 * @param {string} id - The question set ID to delete
 * @returns {boolean} Whether the deletion succeeded
 */
export function deleteQuestionSet(id) {
  const sets = getSavedQuestionSets();
  const filtered = sets.filter(s => s.id !== id);
  if (filtered.length === sets.length) return false;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return true;
}

/**
 * Update results for a saved question set
 * @param {string} id - The question set ID
 * @param {Object} results - { correct, incorrect, total }
 * @returns {boolean} Whether the update succeeded
 */
export function updateQuestionSetResults(id, results) {
  const sets = getSavedQuestionSets();
  const set = sets.find(s => s.id === id);
  if (!set) return false;
  set.results = {
    correct: results.correct,
    incorrect: results.incorrect,
    total: results.total || (results.correct + results.incorrect),
    completedAt: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sets));
  return true;
}
