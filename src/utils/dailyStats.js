/**
 * Daily Stats Tracking Utility
 * Stores and retrieves daily accuracy data for progress charts
 */

const DAILY_STATS_KEY = 'wm_daily_stats';

/**
 * Get today's date as a string key (YYYY-MM-DD)
 */
export const getTodayKey = () => {
    const now = new Date();
    return now.toISOString().split('T')[0];
};

/**
 * Get all stored daily stats
 */
export const getDailyStats = () => {
    try {
        const stored = localStorage.getItem(DAILY_STATS_KEY);
        return stored ? JSON.parse(stored) : {};
    } catch {
        return {};
    }
};

/**
 * Save daily stats
 */
export const saveDailyStats = (stats) => {
    try {
        localStorage.setItem(DAILY_STATS_KEY, JSON.stringify(stats));
    } catch (e) {
        console.warn('Failed to save daily stats:', e);
    }
};

/**
 * Record today's accuracy
 * @param {number} correct - Number of correct answers
 * @param {number} total - Total number of answers
 * @param {string} type - 'vocab' or 'english'
 */
export const recordDailyAccuracy = (correct, total, type = 'overall') => {
    const stats = getDailyStats();
    const today = getTodayKey();

    if (!stats[today]) {
        stats[today] = { vocab: { correct: 0, total: 0 }, english: { correct: 0, total: 0 } };
    }

    if (type === 'vocab' || type === 'overall') {
        stats[today].vocab.correct += correct;
        stats[today].vocab.total += total;
    }
    if (type === 'english' || type === 'overall') {
        stats[today].english.correct += correct;
        stats[today].english.total += total;
    }

    saveDailyStats(stats);
};

/**
 * Get last N days of accuracy data
 * @param {number} days - Number of days to retrieve
 * @returns {Array} Array of { date, accuracy, vocabAccuracy, englishAccuracy }
 */
export const getLastNDaysAccuracy = (days = 7) => {
    const stats = getDailyStats();
    const result = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const key = date.toISOString().split('T')[0];
        const dayData = stats[key];

        let accuracy = null;
        let vocabAccuracy = null;
        let englishAccuracy = null;

        if (dayData) {
            const totalCorrect = (dayData.vocab?.correct || 0) + (dayData.english?.correct || 0);
            const totalAttempts = (dayData.vocab?.total || 0) + (dayData.english?.total || 0);

            if (totalAttempts > 0) {
                accuracy = Math.round((totalCorrect / totalAttempts) * 100);
            }
            if (dayData.vocab?.total > 0) {
                vocabAccuracy = Math.round((dayData.vocab.correct / dayData.vocab.total) * 100);
            }
            if (dayData.english?.total > 0) {
                englishAccuracy = Math.round((dayData.english.correct / dayData.english.total) * 100);
            }
        }

        result.push({
            date: key,
            dayName: date.toLocaleDateString('he-IL', { weekday: 'short' }),
            accuracy,
            vocabAccuracy,
            englishAccuracy
        });
    }

    return result;
};

/**
 * Get weekly aggregates
 * @param {number} weeks - Number of weeks to retrieve
 * @returns {Array} Array of { weekStart, accuracy }
 */
export const getWeeklyAccuracy = (weeks = 4) => {
    const stats = getDailyStats();
    const result = [];
    const now = new Date();

    for (let w = weeks - 1; w >= 0; w--) {
        const weekStart = new Date(now);
        weekStart.setDate(weekStart.getDate() - (w * 7 + 6));

        let totalCorrect = 0;
        let totalAttempts = 0;

        for (let d = 0; d < 7; d++) {
            const date = new Date(weekStart);
            date.setDate(date.getDate() + d);
            const key = date.toISOString().split('T')[0];
            const dayData = stats[key];

            if (dayData) {
                totalCorrect += (dayData.vocab?.correct || 0) + (dayData.english?.correct || 0);
                totalAttempts += (dayData.vocab?.total || 0) + (dayData.english?.total || 0);
            }
        }

        result.push({
            weekLabel: `שבוע ${weeks - w}`,
            accuracy: totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : null
        });
    }

    return result;
};
