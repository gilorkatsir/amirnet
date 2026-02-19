// API key management - stored in localStorage for this client-side app

const KEYS = {
  elevenlabs: 'wm_elevenlabs_key',
  ai: 'wm_ai_api_key',
  aiProvider: 'wm_ai_provider'
};

export const getElevenLabsKey = () => localStorage.getItem(KEYS.elevenlabs) || '';
export const setElevenLabsKey = (key) => localStorage.setItem(KEYS.elevenlabs, key);

export const getAiKey = () => localStorage.getItem(KEYS.ai) || '';
export const setAiKey = (key) => localStorage.setItem(KEYS.ai, key);

// 'openai' or 'anthropic'
export const getAiProvider = () => localStorage.getItem(KEYS.aiProvider) || 'openai';
export const setAiProvider = (provider) => localStorage.setItem(KEYS.aiProvider, provider);

export const hasElevenLabsKey = () => !!getElevenLabsKey();
export const hasAiKey = () => !!getAiKey();
