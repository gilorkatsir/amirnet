// Vercel Serverless Function: AI Question Generation Proxy
// Keeps OpenRouter API key server-side — clients send words + distractor pool
// Uses model fallback chain for reliability when free models are rate-limited

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Fallback chain: try each model in order until one succeeds
const MODELS = [
  { id: 'meta-llama/llama-3.3-70b-instruct:free', supportsSystem: true, supportsJsonFormat: true },
  { id: 'google/gemma-3-27b-it:free', supportsSystem: false, supportsJsonFormat: false },
  { id: 'mistralai/mistral-small-3.1-24b-instruct:free', supportsSystem: true, supportsJsonFormat: true },
  { id: 'stepfun/step-3.5-flash:free', supportsSystem: true, supportsJsonFormat: false },
  { id: 'nvidia/nemotron-nano-9b-v2:free', supportsSystem: true, supportsJsonFormat: false },
  { id: 'qwen/qwen3-4b:free', supportsSystem: true, supportsJsonFormat: false },
  { id: 'google/gemma-3-12b-it:free', supportsSystem: false, supportsJsonFormat: false },
];

// Simple in-memory rate limiting (per serverless instance)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 10;

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

const DIFFICULTY_LEVELS = {
  easy: 'B1-B2 (intermediate). Use simple, everyday sentence structures.',
  medium: 'B2-C1 (upper-intermediate to advanced). Use moderately complex academic-style sentences.',
  hard: 'C1-C2 (advanced to proficiency). Use complex, nuanced academic and literary sentences.',
};

function buildSystemPrompt(difficulty) {
  const level = DIFFICULTY_LEVELS[difficulty] || DIFFICULTY_LEVELS.medium;
  return `You are an English exam question generator for Israeli students preparing for the psychometric English exam.

Given target vocabulary words AND a distractor pool, generate Sentence Completion and Restatement questions.

QUESTION TYPES:

1. Sentence Completion: A sentence with a blank (____) where one of 4 options fits.
   - Correct answer = the target word.
   - 3 wrong options MUST come from the distractor pool. Never invent words.

2. Restatement: A statement using the target word, with 4 rephrased options (only one correct).

Rules:
1. Each question tests ONE target word
2. ~60% Sentence Completion, ~40% Restatement
3. Exactly 4 options per question
4. English level: ${level}
5. Output valid JSON only — no markdown, no code fences, no explanation

Output format:
{
  "questions": [
    {
      "word": "target word",
      "question": "Sentence with ____ or full statement.",
      "options": ["option1", "option2", "option3", "option4"],
      "correctIndex": 2,
      "type": "Sentence Completion"
    }
  ]
}

correctIndex is 1-based (1 = first option, 2 = second, etc.)
Randomize correct answer position.`;
}

function buildUserPrompt(targetWords, distractorPool, count) {
  return `Generate ${count} questions (mix of Sentence Completion and Restatement) for these target vocabulary words: ${targetWords.join(', ')}

For Sentence Completion questions, select the 3 wrong options ONLY from this distractor pool:
${distractorPool.join(', ')}`;
}

function parseAIResponse(text) {
  // Strip markdown code fences if present
  const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '');
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('AI response did not contain valid JSON');

  const parsed = JSON.parse(jsonMatch[0]);
  if (!parsed.questions || !Array.isArray(parsed.questions)) {
    throw new Error('Invalid response format: missing questions array');
  }
  for (const q of parsed.questions) {
    if (!q.question || !q.options || q.options.length !== 4 || q.correctIndex == null) {
      throw new Error('Invalid question format in AI response');
    }
    // Normalize correctIndex: some models use 0-based, we need 1-based
    // If correctIndex is 0, it's 0-based → convert to 1-based
    if (q.correctIndex === 0) {
      q.correctIndex = 1;
    }
    // Clamp to valid range
    if (q.correctIndex < 1 || q.correctIndex > 4) {
      q.correctIndex = 1;
    }
  }
  return parsed;
}

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

async function tryModel(model, apiKey, userPrompt, systemPrompt) {
  const messages = model.supportsSystem
    ? [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ]
    : [
        { role: 'user', content: systemPrompt + '\n\n' + userPrompt },
      ];

  const requestBody = {
    model: model.id,
    messages,
    temperature: 0.5,
    max_tokens: 3000,
  };

  if (model.supportsJsonFormat) {
    requestBody.response_format = { type: 'json_object' };
  }

  const response = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const status = response.status;
    if (status === 429 || status === 402 || status === 503) {
      // Retriable — try next model
      return { retriable: true, status, model: model.id };
    }
    if (status === 401) {
      return { retriable: false, status, error: 'Authentication error' };
    }
    return { retriable: true, status, model: model.id };
  }

  const data = await response.json();
  const responseText = data.choices?.[0]?.message?.content;

  if (!responseText) {
    return { retriable: true, status: 200, error: 'Empty response', model: model.id };
  }

  const parsed = parseAIResponse(responseText);
  return { success: true, parsed, model: model.id };
}

export default async function handler(req, res) {
  const origin = req.headers.origin || '';
  const headers = corsHeaders(origin);
  for (const [key, value] of Object.entries(headers)) {
    res.setHeader(key, value);
  }

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed. Use POST.' });

  const clientIp =
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.socket?.remoteAddress ||
    'unknown';

  if (isRateLimited(clientIp)) {
    return res.status(429).json({
      error: 'חריגה ממגבלת בקשות. נסה שוב בעוד רגע.',
      errorEn: 'Rate limit exceeded. Try again in a minute.',
    });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'שירות AI לא מוגדר בשרת.',
      errorEn: 'AI service not configured on server.',
    });
  }

  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }

  const { targetWords, distractorPool, count, difficulty } = body || {};
  if (!Array.isArray(targetWords) || targetWords.length === 0) {
    return res.status(400).json({ error: 'targetWords must be a non-empty array of strings' });
  }
  if (!Array.isArray(distractorPool) || distractorPool.length === 0) {
    return res.status(400).json({ error: 'distractorPool must be a non-empty array of strings' });
  }
  if (!count || typeof count !== 'number' || count < 1 || count > 20) {
    return res.status(400).json({ error: 'count must be a number between 1 and 20' });
  }

  const systemPrompt = buildSystemPrompt(difficulty || 'medium');
  const userPrompt = buildUserPrompt(targetWords, distractorPool, count);

  // Try each model in the fallback chain
  const errors = [];
  for (const model of MODELS) {
    try {
      const result = await tryModel(model, apiKey, userPrompt, systemPrompt);

      if (result.success) {
        const questions = result.parsed.questions.map((q, i) => ({
          id: `ai_${Date.now()}_${i}`,
          type: q.type || 'Sentence Completion',
          question: q.question,
          options: q.options,
          correctAnswer: q.options[q.correctIndex - 1],
          correctIndex: q.correctIndex,
          exam: 'AI Generated',
          section: 1,
          questionNumber: i + 1,
          sourceWord: q.word,
        }));

        return res.status(200).json({ questions, model: result.model });
      }

      if (!result.retriable) {
        // Auth error — don't try more models
        return res.status(502).json({
          error: 'שגיאת הזדהות מול שירות AI.',
          errorEn: 'AI service authentication error.',
        });
      }

      errors.push(`${model.id}: ${result.status}`);
      console.log(`Model ${model.id} failed (${result.status}), trying next...`);
    } catch (err) {
      errors.push(`${model.id}: ${err.message}`);
      console.log(`Model ${model.id} error: ${err.message}, trying next...`);
    }
  }

  // All models failed
  console.error('All models failed:', errors.join('; '));
  return res.status(502).json({
    error: 'כל המודלים תפוסים כרגע. נסה שוב בעוד רגע.',
    errorEn: 'All AI models are currently busy. Please try again shortly.',
  });
}
