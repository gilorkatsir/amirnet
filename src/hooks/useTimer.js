import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for countdown timer
 * Shared between EnglishExamSession.jsx and PomodoroTimer.jsx
 * @param {number} initialSeconds - Starting time in seconds
 * @param {Function} onComplete - Callback when timer reaches 0
 * @returns {Object} Timer state and controls
 */
const useTimer = (initialSeconds, onComplete) => {
    const [timeLeft, setTimeLeft] = useState(initialSeconds);
    const [isActive, setIsActive] = useState(false);
    const onCompleteRef = useRef(onComplete);

    // Keep callback ref current without causing re-renders
    useEffect(() => {
        onCompleteRef.current = onComplete;
    }, [onComplete]);

    useEffect(() => {
        if (!isActive || timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                const next = prev - 1;
                if (next <= 0) {
                    clearInterval(timer);
                    setIsActive(false);
                    onCompleteRef.current?.();
                    return 0;
                }
                return next;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isActive, timeLeft]);

    const start = useCallback(() => setIsActive(true), []);
    const pause = useCallback(() => setIsActive(false), []);
    const toggle = useCallback(() => setIsActive(prev => !prev), []);
    const reset = useCallback((newSeconds) => {
        setIsActive(false);
        setTimeLeft(newSeconds !== undefined ? newSeconds : initialSeconds);
    }, [initialSeconds]);

    const formatTime = useCallback((seconds) => {
        const s = seconds ?? timeLeft;
        const mins = Math.floor(s / 60);
        const secs = s % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }, [timeLeft]);

    return {
        timeLeft,
        setTimeLeft,
        isActive,
        start,
        pause,
        toggle,
        reset,
        formatTime
    };
};

export default useTimer;
