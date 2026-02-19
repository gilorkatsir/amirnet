/**
 * Security Utilities for WordMaster
 * This file contains security-related helper functions
 */

/**
 * Sanitize string input to prevent XSS attacks
 * @param {string} str - Input string
 * @returns {string} Sanitized string
 */
export const sanitizeString = (str) => {
    if (typeof str !== 'string') return '';
    // Strip HTML tags and control chars; React handles escaping in JSX
    return str.replace(/<[^>]*>/g, '').replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '').slice(0, 200);
};

/**
 * Safely parse JSON from localStorage with error handling
 * @param {string} key - localStorage key
 * @param {*} defaultValue - Default value if parsing fails
 * @returns {*} Parsed value or default
 */
export const safeLocalStorageGet = (key, defaultValue = null) => {
    try {
        const item = localStorage.getItem(key);
        if (item === null) return defaultValue;
        return JSON.parse(item);
    } catch (e) {
        console.warn(`Failed to parse localStorage key "${key}":`, e);
        return defaultValue;
    }
};

/**
 * Safely set JSON in localStorage with error handling
 * @param {string} key - localStorage key
 * @param {*} value - Value to store
 * @returns {boolean} Success status
 */
export const safeLocalStorageSet = (key, value) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (e) {
        console.warn(`Failed to set localStorage key "${key}":`, e);
        return false;
    }
};

/**
 * Validate that a value is a safe number within bounds
 * @param {*} value - Value to validate
 * @param {number} min - Minimum allowed value
 * @param {number} max - Maximum allowed value
 * @param {number} defaultValue - Default if validation fails
 * @returns {number} Validated number
 */
export const validateNumber = (value, min, max, defaultValue) => {
    const num = Number(value);
    if (isNaN(num) || num < min || num > max) {
        return defaultValue;
    }
    return num;
};

/**
 * Security headers configuration for production
 * These should be set on the server level (e.g., nginx, Netlify, Vercel)
 */
export const SECURITY_HEADERS = {
    'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline'",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: blob:",
        "connect-src 'self'",
        "frame-ancestors 'none'"
    ].join('; '),
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
};

/**
 * Check if user data is well-formed (basic validation)
 * @param {object} stats - Stats object to validate
 * @returns {boolean} Whether stats are valid
 */
export const validateStatsStructure = (stats) => {
    if (!stats || typeof stats !== 'object') return false;
    for (const key of Object.keys(stats)) {
        const entry = stats[key];
        if (typeof entry !== 'object') return false;
        if (typeof entry.correct !== 'number' || typeof entry.incorrect !== 'number') {
            return false;
        }
    }
    return true;
};

// Security notice for developers
console.info(
    '%c🛡️ WordMaster Security Info',
    'color: #22c55e; font-weight: bold; font-size: 14px;',
    '\n• All data stored locally (localStorage)',
    '\n• No external API connections',
    '\n• No user tracking or analytics',
    '\n• No personal data collection'
);
