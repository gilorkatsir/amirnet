// AI-Powered Question Generation Service

import { getAiKey, getAiProvider } from './apiKeys';

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';

const SYSTEM_PROMPT = `You are an English exam question generator for Israeli students preparing for the Amir/Amirnet psychometric English exam.

Given a list of English vocabulary words, generate Sentence Completion questions in the exact format used in real psychometric exams.

Rules:
1. Each question must test ONE word from the provided list
2. The sentence should provide clear context clues for the correct answer
3. Provide exactly 4 options (including the correct word)
4. Distractors should be plausible but clearly wrong in context
5. Questions should be at B2-C1 English level
6. Output valid JSON only, no markdown

Output format:
{
  "questions": [
    {
      "word": "the target word",
      "question": "Sentence with ____ where the word goes.",
      "options": ["wrong1", "correct", "wrong2", "wrong3"],
      "correctIndex": 2,
      "type": "Sentence Completion"
    }
  ]
}

correctIndex is 1-based (1 = first option, 2 = second, etc.)`;

/**
 * Generate AI-powered practice questions from a word list
 * @param {Array<{english: string, hebrew: string}>} words - Vocabulary words to practice
 * @param {number} count - Number of questions to generate
 * @returns {Promise<Array>} Generated questions in app format
 */
export async function generateQuestions(words, count = 10) {
  const apiKey = getAiKey();
  const provider = getAiProvider();

  if (!apiKey) throw new Error('AI API key not set');

  const wordList = words.slice(0, count).map(w => w.english).join(', ');
  const userPrompt = `Generate ${Math.min(count, words.length)} Sentence Completion questions for these vocabulary words: ${wordList}`;

  let responseText;

  if (provider === 'anthropic') {
    responseText = await callAnthropic(apiKey, userPrompt);
  } else {
    responseText = await callOpenAI(apiKey, userPrompt);
  }

  // Parse the JSON response
  const parsed = parseAIResponse(responseText);

  // Convert to app question format with generated IDs
  return parsed.questions.map((q, i) => ({
    id: `ai_${Date.now()}_${i}`,
    type: 'Sentence Completion',
    question: q.question,
    options: q.options,
    correctAnswer: q.options[q.correctIndex - 1],
    correctIndex: q.correctIndex,
    exam: 'AI Generated',
    section: 1,
    questionNumber: i + 1,
    sourceWord: q.word
  }));
}

async function callOpenAI(apiKey, userPrompt) {
  const response = await fetch(OPENAI_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 2000
    })
  });

  if (!response.ok) {
    if (response.status === 401) throw new Error('Invalid OpenAI API key');
    if (response.status === 429) throw new Error('Rate limit exceeded. Wait a moment.');
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function callAnthropic(apiKey, userPrompt) {
  const response = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages: [
        { role: 'user', content: userPrompt }
      ]
    })
  });

  if (!response.ok) {
    if (response.status === 401) throw new Error('Invalid Anthropic API key');
    if (response.status === 429) throw new Error('Rate limit exceeded. Wait a moment.');
    throw new Error(`Anthropic API error: ${response.status}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

function parseAIResponse(text) {
  // Try to extract JSON from the response (AI might wrap it in markdown)
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('AI response did not contain valid JSON');

  try {
    const parsed = JSON.parse(jsonMatch[0]);
    if (!parsed.questions || !Array.isArray(parsed.questions)) {
      throw new Error('Invalid response format');
    }
    // Validate each question
    for (const q of parsed.questions) {
      if (!q.question || !q.options || q.options.length !== 4 || !q.correctIndex) {
        throw new Error('Invalid question format in AI response');
      }
    }
    return parsed;
  } catch (e) {
    if (e.message.includes('Invalid')) throw e;
    throw new Error('Failed to parse AI response as JSON');
  }
}
