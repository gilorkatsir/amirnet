// API key management - stored in localStorage for this client-side app
// Note: OpenRouter key is now managed server-side (Vercel env var)

const KEYS = {
  elevenlabs: 'wm_elevenlabs_key'
};

export const getElevenLabsKey = () => localStorage.getItem(KEYS.elevenlabs) || '';
export const setElevenLabsKey = (key) => localStorage.setItem(KEYS.elevenlabs, key);

export const hasElevenLabsKey = () => !!getElevenLabsKey();
