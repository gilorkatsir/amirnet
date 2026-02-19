// AI-Powered Question Generation Service
// Default: OpenRouter (FREE via Gemini 2.5 Flash) — supports CORS from browser

import { getAiKey, getAiProvider } from './apiKeys';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';

const SYSTEM_PROMPT = `You are an English exam question generator for Israeli students preparing for the AMIRNET psychometric English exam.

Given a list of English vocabulary words, generate a MIX of Sentence Completion and Restatement questions in the exact format used in real AMIRNET exams.

QUESTION TYPES:

1. Sentence Completion: A sentence with a blank (____) where one of 4 word options fits.
   Example: "The brown pelican catches fish below the ____ of the water."
   Options: ["vision", "surface", "index", "ordeal"]

2. Restatement: A statement is given, and 4 options rephrase it — only one is correct.
   The question field contains the original statement. Options are 4 rephrased versions.
   Example question: "Despite the heavy rain, the event proceeded as planned."
   Options: ["The rain caused the event to be canceled.", "The event took place even though it rained heavily.", "The event was moved indoors due to rain.", "Heavy rain delayed the start of the event."]

Rules:
1. Each question must test ONE word from the provided list (use it in the sentence or test understanding of it)
2. Generate roughly 60% Sentence Completion and 40% Restatement questions
3. Sentences should provide clear context clues for the correct answer
4. Provide exactly 4 options per question
5. Distractors should be plausible but clearly wrong in context
6. Questions should be at B2-C1 English level (academic register)
7. Output valid JSON only — no markdown, no explanation

Output format:
{
  "questions": [
    {
      "word": "the target word",
      "question": "Sentence with ____ for SC, or full statement for Restatement.",
      "options": ["option1", "option2", "option3", "option4"],
      "correctIndex": 2,
      "type": "Sentence Completion"
    },
    {
      "word": "another word",
      "question": "Original statement using the word.",
      "options": ["rephrase1", "rephrase2", "rephrase3", "rephrase4"],
      "correctIndex": 3,
      "type": "Restatement"
    }
  ]
}

correctIndex is 1-based (1 = first option, 2 = second, etc.)
Randomize the position of the correct answer across questions.`;

/**
 * Generate AI-powered practice questions from a word list
 * @param {Array<{english: string, hebrew: string}>} words - Vocabulary words to practice
 * @param {number} count - Number of questions to generate
 * @returns {Promise<Array>} Generated questions in app format
 */
export async function generateQuestions(words, count = 10) {
  const apiKey = getAiKey();
  const provider = getAiProvider();

  if (!apiKey) throw new Error('AI API key not set. Go to Settings > AI Connections.');

  const wordList = words.slice(0, count).map(w => w.english).join(', ');
  const userPrompt = `Generate ${Math.min(count, words.length)} questions (mix of Sentence Completion and Restatement) for these vocabulary words: ${wordList}`;

  let responseText;

  if (provider === 'anthropic') {
    responseText = await callAnthropic(apiKey, userPrompt);
  } else if (provider === 'openai') {
    responseText = await callOpenAI(apiKey, userPrompt);
  } else {
    // Default: OpenRouter (free)
    responseText = await callOpenRouter(apiKey, userPrompt);
  }

  const parsed = parseAIResponse(responseText);

  return parsed.questions.map((q, i) => ({
    id: `ai_${Date.now()}_${i}`,
    type: q.type || 'Sentence Completion',
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

async function callOpenRouter(apiKey, userPrompt) {
  const response = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'meta-llama/llama-3.3-70b-instruct:free',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 3000
    })
  });

  if (!response.ok) {
    if (response.status === 401) throw new Error('Invalid OpenRouter API key');
    if (response.status === 429) throw new Error('Rate limit exceeded. Wait a moment.');
    throw new Error(`OpenRouter API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
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
      max_tokens: 3000
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
      max_tokens: 3000,
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
  // Extract JSON from response (AI might wrap it in markdown code blocks)
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('AI response did not contain valid JSON');

  try {
    const parsed = JSON.parse(jsonMatch[0]);
    if (!parsed.questions || !Array.isArray(parsed.questions)) {
      throw new Error('Invalid response format');
    }
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
