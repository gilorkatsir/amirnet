// AI Answer Explanation Service
// Calls /api/explain serverless function to get a brief explanation

import { readingPassages } from '../data/reading_passages';

/**
 * Fetch an AI-generated explanation for a question
 * @param {Object} question - The question object
 * @param {number} selectedIndex - The 0-based index the user selected
 * @returns {Promise<string>} The explanation text
 */
export async function fetchExplanation(question, selectedIndex) {
  let passage = null;
  if (question.type === 'Reading Comprehension' && question.passage) {
    const passageData = readingPassages[question.passage];
    if (passageData) passage = passageData.content;
  }

  const response = await fetch('/api/explain', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      questionType: question.type,
      questionText: question.question,
      options: question.options,
      correctIndex: question.correctIndex,
      selectedIndex,
      passage,
    }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || `Explanation failed: ${response.status}`);
  }

  const data = await response.json();
  return data.explanation;
}
