import { describe, it, expect, beforeEach } from 'vitest';
import { isSoundEnabled, setSoundEnabled } from '../sounds';

const SOUND_ENABLED_KEY = 'wm_sound_enabled';

describe('Sound toggle', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('defaults to enabled when no setting stored', () => {
    expect(isSoundEnabled()).toBe(true);
  });

  it('returns true when set to true', () => {
    setSoundEnabled(true);
    expect(isSoundEnabled()).toBe(true);
  });

  it('returns false when set to false', () => {
    setSoundEnabled(false);
    expect(isSoundEnabled()).toBe(false);
  });

  it('persists to localStorage', () => {
    setSoundEnabled(false);
    expect(localStorage.getItem(SOUND_ENABLED_KEY)).toBe('false');
  });
});
