/**
 * SM-2-like Spaced Repetition Service for WordMaster / AmirNet
 *
 * Each item tracked:
 *   { easeFactor, interval, repetitions, nextReviewDate, lastReviewDate, totalReviews, correctReviews }
 *
 * Grade scale (self-rated):
 *   1 = "Blackout" — no memory at all
 *   2 = "Wrong" — wrong answer, but recognized after seeing it
 *   3 = "Hard" — correct but required significant effort
 *   4 = "Good" — correct with some hesitation
 *   5 = "Easy" — instant recall
 *
 * Storage key: wm_sr_data (JSON in localStorage)
 */

import { safeLocalStorageGet, safeLocalStorageSet } from '../utils/security';

const STORAGE_KEY = 'wm_sr_data';

// Default values for a new item
const DEFAULT_ITEM = {
    easeFactor: 2.5,
    interval: 0, // days
    repetitions: 0,
    nextReviewDate: null, // ISO string — null means "never reviewed, due now"
    lastReviewDate: null,
    totalReviews: 0,
    correctReviews: 0,
};

/**
 * Load all SR data from localStorage
 * @returns {Object} Map of wordId -> SR data
 */
export const loadSRData = () => {
    return safeLocalStorageGet(STORAGE_KEY, {});
};

/**
 * Save all SR data to localStorage
 * @param {Object} data - Map of wordId -> SR data
 */
export const saveSRData = (data) => {
    safeLocalStorageSet(STORAGE_KEY, data);
};

/**
 * Get SR data for a single item, returning defaults if none exists
 * @param {Object} allData - All SR data
 * @param {number|string} itemId - Word ID
 * @returns {Object} SR data for this item
 */
export const getItemData = (allData, itemId) => {
    return allData[itemId] || { ...DEFAULT_ITEM };
};

/**
 * Core SM-2 algorithm: update an item's SR data based on a grade (1-5)
 *
 * @param {Object} itemData - Current SR data for the item
 * @param {number} grade - User self-rating 1-5
 * @returns {Object} Updated SR data
 */
export const processReview = (itemData, grade) => {
    const now = new Date();
    const data = { ...itemData };

    // Clamp grade
    const g = Math.max(1, Math.min(5, grade));

    // SM-2 quality mapped from our 1-5 to SM-2's 0-5 scale
    // 1->0, 2->1, 3->3, 4->4, 5->5
    const qualityMap = { 1: 0, 2: 1, 3: 3, 4: 4, 5: 5 };
    const quality = qualityMap[g];

    // Update counters
    data.totalReviews += 1;
    if (g >= 3) {
        data.correctReviews += 1;
    }

    if (quality < 3) {
        // Failed — reset repetitions, short interval
        data.repetitions = 0;
        data.interval = 0.0069; // ~10 minutes in days (immediate re-review in session)
    } else {
        // Successful recall
        if (data.repetitions === 0) {
            data.interval = 1;
        } else if (data.repetitions === 1) {
            data.interval = 3;
        } else {
            data.interval = Math.round(data.interval * data.easeFactor);
        }
        data.repetitions += 1;
    }

    // Update ease factor (SM-2 formula)
    const ef = data.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    data.easeFactor = Math.max(1.3, Math.round(ef * 100) / 100);

    // Set next review date
    const nextDate = new Date(now);
    nextDate.setDate(nextDate.getDate() + Math.max(1, Math.round(data.interval)));
    // If the interval is less than 1 day (failed), set to 10 minutes from now
    if (data.interval < 1) {
        nextDate.setTime(now.getTime() + 10 * 60 * 1000);
    }
    data.nextReviewDate = nextDate.toISOString();
    data.lastReviewDate = now.toISOString();

    return data;
};

/**
 * Get items due for review, sorted by priority
 *
 * Priority:
 *   1. Items never reviewed (nextReviewDate === null) — highest
 *   2. Items overdue (nextReviewDate < now) — sorted by how overdue
 *   3. Items due today
 *
 * @param {Array} allItems - Array of vocab items (with .id)
 * @param {Object} srData - All SR data from localStorage
 * @param {number} limit - Max items to return (0 = all)
 * @returns {Array} Sorted array of items due for review
 */
export const getNextReviewItems = (allItems, srData, limit = 0) => {
    const now = new Date();

    const dueItems = allItems.filter(item => {
        const data = srData[item.id];
        if (!data || !data.nextReviewDate) return true; // Never reviewed = due
        return new Date(data.nextReviewDate) <= now;
    });

    // Sort: never-reviewed first, then most overdue
    dueItems.sort((a, b) => {
        const aData = srData[a.id];
        const bData = srData[b.id];

        // Never reviewed items first
        const aReviewed = aData && aData.nextReviewDate;
        const bReviewed = bData && bData.nextReviewDate;

        if (!aReviewed && bReviewed) return -1;
        if (aReviewed && !bReviewed) return 1;
        if (!aReviewed && !bReviewed) return 0;

        // Both have dates — most overdue first
        return new Date(aData.nextReviewDate) - new Date(bData.nextReviewDate);
    });

    if (limit > 0) {
        return dueItems.slice(0, limit);
    }
    return dueItems;
};

/**
 * Count items currently due for review
 * @param {Array} allItems - Array of vocab items
 * @param {Object} srData - SR data
 * @returns {number} Count of due items
 */
export const getDueCount = (allItems, srData) => {
    const now = new Date();
    return allItems.filter(item => {
        const data = srData[item.id];
        if (!data || !data.nextReviewDate) return true;
        return new Date(data.nextReviewDate) <= now;
    }).length;
};

/**
 * Get retention statistics
 * @param {Object} srData - All SR data
 * @returns {Object} { totalReviewed, avgEaseFactor, retentionRate, totalReviews }
 */
export const getRetentionStats = (srData) => {
    const entries = Object.values(srData);
    if (entries.length === 0) {
        return { totalReviewed: 0, avgEaseFactor: 2.5, retentionRate: 0, totalReviews: 0 };
    }

    const totalReviewed = entries.length;
    const avgEaseFactor = Math.round(
        (entries.reduce((sum, e) => sum + e.easeFactor, 0) / entries.length) * 100
    ) / 100;
    const totalReviewsSum = entries.reduce((sum, e) => sum + (e.totalReviews || 0), 0);
    const totalCorrectSum = entries.reduce((sum, e) => sum + (e.correctReviews || 0), 0);
    const retentionRate = totalReviewsSum > 0
        ? Math.round((totalCorrectSum / totalReviewsSum) * 100)
        : 0;

    return {
        totalReviewed,
        avgEaseFactor,
        retentionRate,
        totalReviews: totalReviewsSum,
    };
};
