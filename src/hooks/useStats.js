import { useMemo } from 'react';

/**
 * Custom hook that computes common stats metrics from a stats object
 * Deduplicates identical calculations in Home.jsx, WelcomeScreen.jsx, Stats.jsx
 * @param {Object} stats - Stats object { [id]: { correct, incorrect, level?, ... } }
 * @param {number} total - Total items count
 * @returns {Object} Computed stats
 */
const useStats = (stats, total) => {
    return useMemo(() => {
        const learnedCount = Object.keys(stats).length;
        const masteredCount = Object.values(stats).filter(s => s.level >= 4).length;
        const totalCorrect = Object.values(stats).reduce((acc, s) => acc + (s.correct || 0), 0);
        const totalIncorrect = Object.values(stats).reduce((acc, s) => acc + (s.incorrect || 0), 0);
        const totalAttempts = totalCorrect + totalIncorrect;
        const accuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;
        const progressPercent = total > 0 ? Math.round((learnedCount / total) * 100) : 0;
        const failedCount = Object.values(stats).filter(s => s.incorrect > s.correct).length;

        return {
            learnedCount,
            masteredCount,
            totalCorrect,
            totalIncorrect,
            totalAttempts,
            accuracy,
            progressPercent,
            failedCount
        };
    }, [stats, total]);
};

export default useStats;
