// English Questions Data Module
// Combines questions from all AMIRNET exam sources

import questionsDb1 from './english_questions_database.json';
import questionsDb2 from './english_questions_part2.json';
import questionsDb3 from './english_questions_part3.json';
import { selectWithVariety, getItemFreshness } from '../utils/smartSelection';

// Combine all questions from all files
export const ENGLISH_QUESTIONS = [
    ...questionsDb1.questions,
    ...questionsDb2.questions,
    ...questionsDb3.questions
];

// Metadata
export const ENGLISH_QUESTIONS_METADATA = {
    totalQuestions: ENGLISH_QUESTIONS.length,
    exams: ['Spring 2024', 'Summer 2024', 'Fall 2024', 'Winter 2024', 'Summer 2025', 'Fall 2025'],
    questionTypes: ['Sentence Completion', 'Restatement', 'Reading Comprehension'],
    questionsPerSection: 22,
    breakdown: {
        sentenceCompletion: { perSection: 8, total: ENGLISH_QUESTIONS.filter(q => q.type === 'Sentence Completion').length },
        restatement: { perSection: 4, total: ENGLISH_QUESTIONS.filter(q => q.type === 'Restatement').length },
        readingComprehension: { perSection: 10, total: ENGLISH_QUESTIONS.filter(q => q.type === 'Reading Comprehension').length }
    }
};

// Utility Functions

/**
 * Get questions filtered by type
 * @param {string} type - 'Sentence Completion', 'Restatement', or 'Reading Comprehension'
 * @returns {Array} Filtered questions
 */
export const getQuestionsByType = (type) => {
    return ENGLISH_QUESTIONS.filter(q => q.type === type);
};

/**
 * Get questions filtered by exam
 * @param {string} exam - e.g., 'Spring 2024', 'Summer 2024'
 * @returns {Array} Filtered questions
 */
export const getQuestionsByExam = (exam) => {
    return ENGLISH_QUESTIONS.filter(q => q.exam === exam);
};

/**
 * Get questions for a specific exam section
 * @param {string} exam - e.g., 'Spring 2024'
 * @param {number} section - 1 or 2
 * @returns {Array} Questions for that section
 */
export const getQuestionsBySection = (exam, section) => {
    return ENGLISH_QUESTIONS.filter(q => q.exam === exam && q.section === section);
};

/**
 * Get random questions with optional type filter, using smart variety selection.
 * For Reading Comprehension: keeps passage questions together and in original order.
 * @param {number} count - Number of questions to return
 * @param {string|null} type - Optional type filter
 * @returns {Array} Variety-aware selection of questions
 */
export const getRandomQuestions = (count, type = null) => {
    let pool = type ? getQuestionsByType(type) : [...ENGLISH_QUESTIONS];

    // Separate by type
    const nonRC = pool.filter(q => q.type !== 'Reading Comprehension');
    const rc = pool.filter(q => q.type === 'Reading Comprehension');

    // Smart select non-RC questions with variety
    const selectedNonRC = selectWithVariety(nonRC, Math.min(count, nonRC.length), {
        type: 'english', diversifyBy: 'type', record: false,
    });

    // Group RC by passage
    const rcByPassage = {};
    rc.forEach(q => {
        const key = q.passage || 'no-passage';
        if (!rcByPassage[key]) rcByPassage[key] = [];
        rcByPassage[key].push(q);
    });

    // Sort passage groups by freshness (fresher passages first)
    const passageKeys = Object.keys(rcByPassage).sort((a, b) => {
        const aFresh = rcByPassage[a].reduce((sum, q) => sum + getItemFreshness(q.id, 'english'), 0) / rcByPassage[a].length;
        const bFresh = rcByPassage[b].reduce((sum, q) => sum + getItemFreshness(q.id, 'english'), 0) / rcByPassage[b].length;
        // Add randomness to prevent strict ordering
        return (bFresh + Math.random() * 0.3) - (aFresh + Math.random() * 0.3);
    });
    const shuffledRC = passageKeys.flatMap(key => rcByPassage[key]);

    // Combine: non-RC first, then RC groups
    const combined = [...selectedNonRC, ...shuffledRC];

    return combined.slice(0, Math.min(count, combined.length));
};

/**
 * Generate a full exam section (22 questions)
 * Structure: 8 SC + 4 Restatement + 10 RC
 * Reading comprehension passages stay grouped and in order.
 * Uses smart variety selection to avoid repeating the same questions.
 * @param {string|null} exam - Optional: use questions from specific exam, or mix from all
 * @returns {Array} 22 questions in exam order
 */
export const generateExamSection = (exam = null) => {
    let pool = exam ? getQuestionsByExam(exam) : [...ENGLISH_QUESTIONS];

    // Get questions by type — use smart selection for SC and Restatement
    const scPool = pool.filter(q => q.type === 'Sentence Completion');
    const rstPool = pool.filter(q => q.type === 'Restatement');
    const rc = pool.filter(q => q.type === 'Reading Comprehension');

    const sc = selectWithVariety(scPool, Math.min(8, scPool.length), {
        type: 'english', record: false,
    });
    const rst = selectWithVariety(rstPool, Math.min(4, rstPool.length), {
        type: 'english', record: false,
    });

    // Group RC by passage - keep questions within each passage in original order
    const rcByPassage = {};
    rc.forEach(q => {
        const key = q.passage || 'no-passage';
        if (!rcByPassage[key]) rcByPassage[key] = [];
        rcByPassage[key].push(q);
    });

    // Sort passage groups by freshness (prefer passages not seen recently)
    const passageKeys = Object.keys(rcByPassage).sort((a, b) => {
        const aFresh = rcByPassage[a].reduce((sum, q) => sum + getItemFreshness(q.id, 'english'), 0) / rcByPassage[a].length;
        const bFresh = rcByPassage[b].reduce((sum, q) => sum + getItemFreshness(q.id, 'english'), 0) / rcByPassage[b].length;
        return (bFresh + Math.random() * 0.3) - (aFresh + Math.random() * 0.3);
    });

    // Take RC questions from freshness-sorted passage groups until we have 10
    let rcQuestions = [];
    for (const key of passageKeys) {
        if (rcQuestions.length >= 10) break;
        rcQuestions = [...rcQuestions, ...rcByPassage[key]];
    }
    rcQuestions = rcQuestions.slice(0, 10);

    // Build exam section: 8 SC + 4 Restatement + 10 RC
    const examSection = [
        ...sc,
        ...rst,
        ...rcQuestions
    ];

    return examSection;
};

/**
 * Get question type display name in Hebrew
 * @param {string} type - Question type in English
 * @returns {string} Hebrew display name
 */
export const getTypeHebrewName = (type) => {
    const names = {
        'Sentence Completion': 'השלמת משפטים',
        'Restatement': 'ניסוח מחדש',
        'Reading Comprehension': 'הבנת הנקרא'
    };
    return names[type] || type;
};

/**
 * Get question type icon
 * @param {string} type - Question type
 * @returns {string} Material icon name
 */
export const getTypeIcon = (type) => {
    const icons = {
        'Sentence Completion': 'edit_note',
        'Restatement': 'swap_horiz',
        'Reading Comprehension': 'menu_book'
    };
    return icons[type] || 'quiz';
};
