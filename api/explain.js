// Vercel Serverless Function: AI Answer Explanation
// Generates a short explanation for why the correct answer is right
// Uses same model fallback chain as generate.js

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

const MODELS = [
  { id: 'meta-llama/llama-3.3-70b-instruct:free', supportsSystem: true },
  { id: 'google/gemma-3-27b-it:free', supportsSystem: false },
  { id: 'mistralai/mistral-small-3.1-24b-instruct:free', supportsSystem: true },
  { id: 'qwen/qwen3-4b:free', supportsSystem: true },
  { id: 'google/gemma-3-12b-it:free', supportsSystem: false },
];

const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 20; // Higher limit since explanations are lightweight

function isRateLimited(ip) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(ip, { windowStart: now, count: 1 });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT_MAX;
}

setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap) {
    if (now - entry.windowStart > RATE_LIMIT_WINDOW_MS * 2) {
      rateLimitMap.delete(ip);
    }
  }
}, RATE_LIMIT_WINDOW_MS * 2);

const SYSTEM_PROMPT = `You explain English exam answers to Israeli students preparing for the psychometric test.

Given a question, the correct answer, and optionally the student's wrong answer, write a SHORT explanation (2-3 sentences max).

Rules:
- Explain WHY the correct answer is right
- If the student chose wrong, briefly note why their choice doesn't work
- Use simple, clear English
- For Sentence Completion: explain the meaning/usage of the correct word
- For Restatement: explain how the correct option preserves the original meaning
- For Reading Comprehension: point to the relevant part of the passage
- Output ONLY the explanation text, no JSON, no formatting`;

function corsHeaders(origin) {
  const allowedOrigins = ['http://localhost:5173', 'http://localhost:4173'];
  const isAllowed =
    allowedOrigins.includes(origin) ||
    (origin && /^https:\/\/.*\.vercel\.app$/.test(origin));
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : allowedOrigins[0],
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

async function tryModel(model, apiKey, userPrompt) {
  const messages = model.supportsSystem
    ? [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ]
    : [
        { role: 'user', content: SYSTEM_PROMPT + '\n\n' + userPrompt },
      ];

  const response = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: model.id,
      messages,
      temperature: 0.3,
      max_tokens: 300,
    }),
  });

  if (!response.ok) {
    const status = response.status;
    if (status === 401) return { retriable: false, status };
    return { retriable: true, status, model: model.id };
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) return { retriable: true, error: 'Empty response', model: model.id };

  return { success: true, text, model: model.id };
}

export default async function handler(req, res) {
  const origin = req.headers.origin || '';
  const headers = corsHeaders(origin);
  for (const [key, value] of Object.entries(headers)) {
    res.setHeader(key, value);
  }

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const clientIp =
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.socket?.remoteAddress ||
    'unknown';

  if (isRateLimited(clientIp)) {
    return res.status(429).json({ error: 'Rate limit exceeded. Try again shortly.' });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'AI service not configured.' });
  }

  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }

  const { questionType, questionText, options, correctIndex, selectedIndex, passage } = body || {};

  if (!questionText || !Array.isArray(options) || correctIndex == null) {
    return res.status(400).json({ error: 'Missing required fields: questionText, options, correctIndex' });
  }

  const correctAnswer = options[correctIndex - 1];
  const selectedAnswer = selectedIndex != null ? options[selectedIndex] : null;
  const wasCorrect = selectedIndex === (correctIndex - 1);

  let userPrompt = `Question type: ${questionType || 'Unknown'}\n`;
  if (passage) userPrompt += `Passage context: ${passage.substring(0, 500)}\n`;
  userPrompt += `Question: ${questionText}\n`;
  userPrompt += `Options: ${options.map((o, i) => `${['A','B','C','D'][i]}) ${o}`).join(', ')}\n`;
  userPrompt += `Correct answer: ${correctAnswer}\n`;
  if (!wasCorrect && selectedAnswer) {
    userPrompt += `Student chose: ${selectedAnswer} (wrong)\n`;
  }
  userPrompt += `\nExplain briefly why "${correctAnswer}" is correct.`;

  const errors = [];
  for (const model of MODELS) {
    try {
      const result = await tryModel(model, apiKey, userPrompt);
      if (result.success) {
        return res.status(200).json({ explanation: result.text });
      }
      if (!result.retriable) {
        return res.status(502).json({ error: 'AI authentication error.' });
      }
      errors.push(`${model.id}: ${result.status || result.error}`);
    } catch (err) {
      errors.push(`${model.id}: ${err.message}`);
    }
  }

  console.error('All explanation models failed:', errors.join('; '));
  return res.status(502).json({ error: 'AI models busy. Try again shortly.' });
}
