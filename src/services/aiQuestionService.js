// AI-Powered Question Generation Service
// Calls server-side proxy at /api/generate (Vercel serverless function)
// API key stays server-side — no client configuration needed

import { VOCABULARY } from '../data/vocabulary';

/**
 * Generate AI-powered practice questions from a word list
 * @param {Array<{english: string, hebrew: string}>} words - Target vocabulary words to test
 * @param {number} count - Number of questions to generate
 * @returns {Promise<Array>} Generated questions in app format
 */
export async function generateQuestions(words, count = 10) {
  const targetWords = words.slice(0, count).map(w => w.english);

  // Build distractor pool from full vocabulary, excluding target words
  const targetSet = new Set(targetWords.map(w => w.toLowerCase()));
  const distractorPool = VOCABULARY
    .map(w => w.english)
    .filter(w => !targetSet.has(w.toLowerCase()))
    .sort(() => Math.random() - 0.5)
    .slice(0, 60);

  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      targetWords,
      distractorPool,
      count: Math.min(count, words.length),
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    if (response.status === 429) {
      throw new Error(errorData.error || 'חריגה ממגבלת בקשות. נסה שוב בעוד רגע.');
    }
    throw new Error(errorData.error || `שגיאת שירות AI: ${response.status}`);
  }

  const data = await response.json();

  if (!data.questions || !Array.isArray(data.questions)) {
    throw new Error('תשובה לא תקינה מהשרת');
  }

  return data.questions;
}
