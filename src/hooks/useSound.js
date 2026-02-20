import { useCallback, useEffect, useRef } from 'react';
import {
    playCorrect,
    playIncorrect,
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
    playTimerComplete,
    resumeAudioContext,
    isSoundEnabled,
    setSoundEnabled,
} from '../utils/sounds';

/**
 * React hook for sound effects.
 * Handles AudioContext resume on first user gesture (required for mobile).
 * Returns memoized sound functions.
 */
const useSound = () => {
    const resumedRef = useRef(false);

    // Resume AudioContext on first user interaction (tap, click, keydown)
    useEffect(() => {
        if (resumedRef.current) return;

        const handleUserGesture = () => {
            if (!resumedRef.current) {
                resumeAudioContext();
                resumedRef.current = true;
            }
            // Clean up after first interaction
            document.removeEventListener('click', handleUserGesture);
            document.removeEventListener('touchstart', handleUserGesture);
            document.removeEventListener('keydown', handleUserGesture);
        };

        document.addEventListener('click', handleUserGesture, { once: true });
        document.addEventListener('touchstart', handleUserGesture, { once: true });
        document.addEventListener('keydown', handleUserGesture, { once: true });

        return () => {
            document.removeEventListener('click', handleUserGesture);
            document.removeEventListener('touchstart', handleUserGesture);
            document.removeEventListener('keydown', handleUserGesture);
        };
    }, []);

    return {
        playCorrect: useCallback(playCorrect, []),
        playIncorrect: useCallback(playIncorrect, []),
        playClick: useCallback(playClick, []),
        playFlip: useCallback(playFlip, []),
        playLevelUp: useCallback(playLevelUp, []),
        playBadge: useCallback(playBadge, []),
        playStreak: useCallback(playStreak, []),
        playComplete: useCallback(playComplete, []),
        playStart: useCallback(playStart, []),
        playBreak: useCallback(playBreak, []),
        playTransition: useCallback(playTransition, []),
        playSuccess: useCallback(playSuccess, []),
        playTimerComplete: useCallback(playTimerComplete, []),
        isSoundEnabled,
        setSoundEnabled,
    };
};

export default useSound;
