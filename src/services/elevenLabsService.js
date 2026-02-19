// ElevenLabs Text-to-Speech Service

import { getElevenLabsKey } from './apiKeys';

// Default voice - "Rachel" (clear American English, good for exams)
const DEFAULT_VOICE_ID = '21m00Tcm4TlvDq8ikWAM';
const API_BASE = 'https://api.elevenlabs.io/v1';

// Simple in-memory cache for audio blobs (avoids re-generating same text)
const audioCache = new Map();
const MAX_CACHE_SIZE = 50;

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
      model_id: 'eleven_monolingual_v1',
      voice_settings: {
        stability: 0.75,
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

  // Cache the result
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
