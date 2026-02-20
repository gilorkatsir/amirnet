/**
 * Sound Effects Utility
 * Uses Web Audio API to generate synthesized sounds without external files
 */

let audioContext = null;

const SOUND_ENABLED_KEY = 'wm_sound_enabled';

/**
 * Check if sound is enabled
 */
export const isSoundEnabled = () => {
    try {
        const stored = localStorage.getItem(SOUND_ENABLED_KEY);
        return stored === null ? true : stored === 'true';
    } catch {
        return true;
    }
};

/**
 * Set sound enabled/disabled
 */
export const setSoundEnabled = (enabled) => {
    try {
        localStorage.setItem(SOUND_ENABLED_KEY, String(enabled));
    } catch (e) {
        console.warn('Failed to save sound preference:', e);
    }
};

const getAudioContext = () => {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContext;
};

/**
 * Play a synthesized tone
 * @param {number} frequency - Hz
 * @param {number} duration - seconds
 * @param {string} type - 'sine', 'square', 'triangle', 'sawtooth'
 * @param {number} volume - 0 to 1
 */
const playTone = (frequency, duration, type = 'sine', volume = 0.3) => {
    if (!isSoundEnabled()) return;
    try {
        const ctx = getAudioContext();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

        // Fade out to avoid clicks
        gainNode.gain.setValueAtTime(volume, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + duration);
    } catch (e) {
        console.warn('Audio playback failed:', e);
    }
};

/**
 * Sound: Correct Answer
 * Pleasant ascending chime
 */
export const playCorrect = () => {
    playTone(523.25, 0.1, 'sine', 0.25); // C5
    setTimeout(() => playTone(659.25, 0.1, 'sine', 0.25), 100); // E5
    setTimeout(() => playTone(783.99, 0.15, 'sine', 0.3), 200); // G5
};

/**
 * Sound: Incorrect Answer
 * Low buzz
 */
export const playIncorrect = () => {
    playTone(200, 0.15, 'square', 0.15);
    setTimeout(() => playTone(180, 0.2, 'square', 0.1), 150);
};

/**
 * Sound: Timer Complete
 * Bell-like chime sequence
 */
export const playTimerComplete = () => {
    const bellFreq = 880; // A5
    playTone(bellFreq, 0.3, 'sine', 0.4);
    setTimeout(() => playTone(bellFreq, 0.3, 'sine', 0.3), 400);
    setTimeout(() => playTone(bellFreq, 0.5, 'sine', 0.35), 800);
};

/**
 * Sound: Click/Tap
 * Subtle click
 */
export const playClick = () => {
    playTone(800, 0.05, 'triangle', 0.1);
};

/**
 * Sound: Session Start
 * Quick ascending tone
 */
export const playStart = () => {
    playTone(440, 0.08, 'sine', 0.2); // A4
    setTimeout(() => playTone(554.37, 0.08, 'sine', 0.2), 80); // C#5
    setTimeout(() => playTone(659.25, 0.1, 'sine', 0.25), 160); // E5
};

/**
 * Sound: Break Time
 * Relaxing descending tone
 */
export const playBreak = () => {
    playTone(659.25, 0.15, 'sine', 0.2); // E5
    setTimeout(() => playTone(523.25, 0.15, 'sine', 0.2), 150); // C5
    setTimeout(() => playTone(392, 0.2, 'sine', 0.25), 300); // G4
};

/**
 * Sound: Card Flip
 * Quick click/pop sound, 30ms
 */
export const playFlip = () => {
    if (!isSoundEnabled()) return;
    try {
        const ctx = getAudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1200, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.03);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.03);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.04);
    } catch (e) {
        console.warn('Audio playback failed:', e);
    }
};

/**
 * Sound: Level Up
 * Ascending arpeggio (C4 -> E4 -> G4 -> C5), 400ms, triumphant
 */
export const playLevelUp = () => {
    if (!isSoundEnabled()) return;
    try {
        const ctx = getAudioContext();
        const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
        notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, ctx.currentTime);
            const startTime = ctx.currentTime + i * 0.1;
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(0.2, startTime + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.35);
            osc.start(startTime);
            osc.stop(startTime + 0.4);
        });
    } catch (e) {
        console.warn('Audio playback failed:', e);
    }
};

/**
 * Sound: Badge Earned
 * Sparkle/shimmer sound — high frequency with gentle warble, 300ms
 */
export const playBadge = () => {
    if (!isSoundEnabled()) return;
    try {
        const ctx = getAudioContext();
        // Shimmer: two detuned high sine waves create a gentle beating
        const freqs = [1568, 1760]; // G6, A6
        freqs.forEach((freq) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, ctx.currentTime);
            osc.frequency.linearRampToValueAtTime(freq * 1.02, ctx.currentTime + 0.15);
            osc.frequency.linearRampToValueAtTime(freq, ctx.currentTime + 0.3);
            gain.gain.setValueAtTime(0, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.03);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.35);
        });
        // Add a soft triangle sparkle layer
        const sparkle = ctx.createOscillator();
        const sparkleGain = ctx.createGain();
        sparkle.connect(sparkleGain);
        sparkleGain.connect(ctx.destination);
        sparkle.type = 'triangle';
        sparkle.frequency.setValueAtTime(2093, ctx.currentTime); // C7
        sparkle.frequency.exponentialRampToValueAtTime(1318, ctx.currentTime + 0.3); // E6
        sparkleGain.gain.setValueAtTime(0.06, ctx.currentTime);
        sparkleGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        sparkle.start(ctx.currentTime);
        sparkle.stop(ctx.currentTime + 0.35);
    } catch (e) {
        console.warn('Audio playback failed:', e);
    }
};

/**
 * Sound: Streak
 * Warm rising tone, 200ms
 */
export const playStreak = () => {
    if (!isSoundEnabled()) return;
    try {
        const ctx = getAudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(392, ctx.currentTime); // G4
        osc.frequency.exponentialRampToValueAtTime(587.33, ctx.currentTime + 0.2); // D5
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.25);
    } catch (e) {
        console.warn('Audio playback failed:', e);
    }
};

/**
 * Sound: Session Complete
 * Completion fanfare — major chord resolve (C major triad + octave), 300ms
 */
export const playComplete = () => {
    if (!isSoundEnabled()) return;
    try {
        const ctx = getAudioContext();
        // Play a warm C major chord that resolves
        const chordNotes = [
            { freq: 261.63, delay: 0 },      // C4
            { freq: 329.63, delay: 0.02 },    // E4
            { freq: 392.00, delay: 0.04 },    // G4
            { freq: 523.25, delay: 0.06 },    // C5
        ];
        chordNotes.forEach(({ freq, delay }) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
            gain.gain.setValueAtTime(0, ctx.currentTime + delay);
            gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + delay + 0.03);
            gain.gain.setValueAtTime(0.15, ctx.currentTime + delay + 0.12);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + 0.3);
            osc.start(ctx.currentTime + delay);
            osc.stop(ctx.currentTime + delay + 0.35);
        });
    } catch (e) {
        console.warn('Audio playback failed:', e);
    }
};

/**
 * Sound: Page Transition
 * Quick whoosh effect
 */
export const playTransition = () => {
    if (!isSoundEnabled()) return;
    try {
        const ctx = getAudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.1);
    } catch (e) {
        console.warn('Audio playback failed:', e);
    }
};

/**
 * Sound: Session Success
 * Richer chord for high scores and session completion
 */
export const playSuccess = () => {
    if (!isSoundEnabled()) return;
    try {
        const ctx = getAudioContext();
        const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
        freqs.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, ctx.currentTime);
            gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.08);
            gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + i * 0.08 + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.08 + 0.5);
            osc.start(ctx.currentTime + i * 0.08);
            osc.stop(ctx.currentTime + i * 0.08 + 0.5);
        });
    } catch (e) {
        console.warn('Audio playback failed:', e);
    }
};

/**
 * Resume AudioContext after user gesture (required for mobile browsers)
 */
export const resumeAudioContext = () => {
    try {
        const ctx = getAudioContext();
        if (ctx.state === 'suspended') {
            ctx.resume();
        }
    } catch (e) {
        // Silently ignore — context will be created on next sound
    }
};

export default {
    playCorrect,
    playIncorrect,
    playTimerComplete,
    playClick,
    playFlip,
    playLevelUp,
    playBadge,
    playStreak,
    playComplete,
    playStart,
    playBreak,
    playTransition,
    playSuccess,
    isSoundEnabled,
    setSoundEnabled,
    resumeAudioContext,
};
