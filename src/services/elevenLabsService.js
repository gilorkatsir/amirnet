// ElevenLabs Text-to-Speech Service
// Uses Turbo v2 model (half-price: 0.5 credits/char = 60K chars on $5 Starter plan)

import { getElevenLabsKey } from './apiKeys';

// Diverse voices for vocal exam sections — different accents and genders
// Static audio uses Edge TTS (free). API fallback uses ElevenLabs (paid).
export const VOICES = {
  daniel:    { id: 'onwK4e9ZLuTAKqWW03F9', edge: 'en-GB-RyanNeural',     label: 'Daniel',    accent: 'British',       gender: 'male' },
  rachel:    { id: '21m00Tcm4TlvDq8ikWAM', edge: 'en-US-JennyNeural',    label: 'Rachel',    accent: 'American',      gender: 'female' },
  charlie:   { id: 'IKne3meq5aSn9XLyUdCD', edge: 'en-AU-WilliamMultilingualNeural', label: 'Charlie', accent: 'Australian', gender: 'male' },
  fin:       { id: 'D38z5RcWu1voky8WS1ja', edge: 'en-IE-ConnorNeural',   label: 'Fin',       accent: 'Irish',         gender: 'male' },
  charlotte: { id: 'XB0fDUnXU5powFXDhCwa', edge: 'en-GB-SoniaNeural',    label: 'Charlotte', accent: 'British',       gender: 'female' },
  george:    { id: 'JBFqnCBsd6RMkjVDRZzb', edge: 'en-GB-ThomasNeural',   label: 'George',    accent: 'British',       gender: 'male' },
  aria:      { id: '9BWtsMINqrJLrRacOk9x', edge: 'en-US-AriaNeural',     label: 'Aria',      accent: 'American',      gender: 'female' },
  callum:    { id: 'N2lVS1w4EtoT3dr4eOWO', edge: 'en-US-AndrewNeural',   label: 'Callum',    accent: 'American',      gender: 'male' },
  lily:      { id: 'pFZP5JQG7iQjIQuC4Bku', edge: 'en-GB-LibbyNeural',    label: 'Lily',      accent: 'British',       gender: 'female' },
  drew:      { id: '29vD33N1CtxCmqQRPOHJ', edge: 'en-US-GuyNeural',      label: 'Drew',      accent: 'American',      gender: 'male' },
};

const DEFAULT_VOICE_ID = VOICES.daniel.id;
// Turbo v2 - English only, half-price credits, ~250ms latency
const DEFAULT_MODEL = 'eleven_turbo_v2';
const API_BASE = 'https://api.elevenlabs.io/v1';

// In-memory cache for audio blobs (avoids re-generating same text)
const audioCache = new Map();
const MAX_CACHE_SIZE = 100;

/**
 * Convert text to speech using ElevenLabs API
 * @param {string} text - Text to convert to speech
 * @param {string} voiceId - ElevenLabs voice ID (optional)
 * @returns {Promise<Blob>} Audio blob (mp3)
 */
export async function textToSpeech(text, voiceId = DEFAULT_VOICE_ID) {
  const apiKey = getElevenLabsKey();
  if (!apiKey) throw new Error('ElevenLabs API key not set');

  // Check cache
  const cacheKey = `${voiceId}:${text}`;
  if (audioCache.has(cacheKey)) {
    return audioCache.get(cacheKey);
  }

  const response = await fetch(`${API_BASE}/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      text,
      model_id: DEFAULT_MODEL,
      voice_settings: {
        stability: 0.8,        // Higher = more consistent/clear pronunciation
        similarity_boost: 0.75
      }
    })
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    if (response.status === 401) throw new Error('Invalid ElevenLabs API key');
    if (response.status === 429) throw new Error('Rate limit exceeded. Wait a moment.');
    throw new Error(`TTS failed: ${response.status} ${errText}`);
  }

  const blob = await response.blob();

  // Cache the result (LRU eviction)
  if (audioCache.size >= MAX_CACHE_SIZE) {
    const firstKey = audioCache.keys().next().value;
    audioCache.delete(firstKey);
  }
  audioCache.set(cacheKey, blob);

  return blob;
}

/**
 * Play text as speech
 * @param {string} text - Text to speak
 * @returns {Promise<HTMLAudioElement>} The audio element (can be used to stop playback)
 */
export async function speakText(text) {
  const blob = await textToSpeech(text);
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);

  audio.addEventListener('ended', () => URL.revokeObjectURL(url));
  audio.addEventListener('error', () => URL.revokeObjectURL(url));

  await audio.play();
  return audio;
}

/**
 * Build the full text to read for a question
 */
export function getQuestionReadText(question) {
  let text = question.question;
  // For sentence completion, replace blank with "blank"
  text = text.replace(/____+/g, 'blank');
  return text;
}
