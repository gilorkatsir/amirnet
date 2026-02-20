/**
 * Smart Selection Utility for WordMaster
 *
 * Provides variety-aware item selection that tracks recently shown items
 * and uses weighted randomness to avoid repetition across sessions.
 *
 * Uses localStorage (via safeLocalStorageGet/Set) for history persistence.
 */

import { safeLocalStorageGet, safeLocalStorageSet } from './security';

const STORAGE_KEY = 'wm_recent_items';
const MAX_HISTORY_ENTRIES = 500; // Cap per type to keep storage lean

/**
 * Get the full history map from localStorage.
 * Structure: { vocab: { [id]: timestamp }, english: { [id]: timestamp } }
 * @returns {object}
 */
const getHistory = () => {
  return safeLocalStorageGet(STORAGE_KEY, { vocab: {}, english: {} });
};

/**
 * Save the history map to localStorage.
 * @param {object} history
 */
const saveHistory = (history) => {
  safeLocalStorageSet(STORAGE_KEY, history);
};

/**
 * Prune old entries from a type bucket so it never exceeds MAX_HISTORY_ENTRIES.
 * Removes the oldest entries first.
 * @param {object} bucket - { [id]: timestamp }
 * @returns {object} Pruned bucket
 */
const pruneBucket = (bucket) => {
  const entries = Object.entries(bucket);
  if (entries.length <= MAX_HISTORY_ENTRIES) return bucket;

  // Sort oldest first, keep only the newest MAX_HISTORY_ENTRIES
  entries.sort((a, b) => a[1] - b[1]);
  const keep = entries.slice(entries.length - MAX_HISTORY_ENTRIES);
  return Object.fromEntries(keep);
};

/**
 * Calculate a freshness score for an item (0 = just shown, 1 = completely fresh).
 *
 * @param {string|number} itemId - The item's unique identifier
 * @param {string} type - 'vocab' or 'english'
 * @param {number} [decayHours=24] - Hours until an item is considered fully fresh again
 * @returns {number} Freshness score between 0 and 1
 */
export const getItemFreshness = (itemId, type = 'vocab', decayHours = 24) => {
  const history = getHistory();
  const bucket = history[type] || {};
  const lastShown = bucket[itemId];

  if (!lastShown) return 1; // Never shown — completely fresh

  const hoursSince = (Date.now() - lastShown) / (1000 * 60 * 60);
  // Linear decay from 0 to 1 over decayHours
  return Math.min(1, hoursSince / decayHours);
};

/**
 * Record that specific items were shown to the user.
 *
 * @param {Array<string|number>} itemIds - IDs of items that were shown
 * @param {string} type - 'vocab' or 'english'
 */
export const recordShownItems = (itemIds, type = 'vocab') => {
  const history = getHistory();
  if (!history[type]) history[type] = {};

  const now = Date.now();
  itemIds.forEach(id => {
    history[type][id] = now;
  });

  // Prune to prevent unbounded growth
  history[type] = pruneBucket(history[type]);
  saveHistory(history);
};

/**
 * Select items with variety-aware weighted randomness.
 *
 * Items shown recently get lower selection weight, naturally pushing
 * the selection toward fresher items without completely excluding
 * recently-seen ones.
 *
 * @param {Array} items - Full pool of candidate items
 * @param {number} count - How many items to select
 * @param {object} [options={}] - Configuration options
 * @param {string} [options.type='vocab'] - Item type for history tracking ('vocab' or 'english')
 * @param {string} [options.idField='id'] - Which field on items holds the unique ID
 * @param {number} [options.decayHours=24] - Hours until freshness fully resets
 * @param {number} [options.minWeight=0.1] - Minimum weight (prevents zero-probability)
 * @param {string|null} [options.diversifyBy=null] - Field name to spread selection across (e.g. 'category', 'type')
 * @param {boolean} [options.record=true] - Whether to auto-record selected items
 * @returns {Array} Selected items (up to `count`)
 */
export const selectWithVariety = (items, count, options = {}) => {
  const {
    type = 'vocab',
    idField = 'id',
    decayHours = 24,
    minWeight = 0.1,
    diversifyBy = null,
    record = true,
  } = options;

  if (!items || items.length === 0) return [];
  if (count >= items.length) {
    // Need all items — just shuffle with weighted bias
    const result = weightedShuffle(items, type, idField, decayHours, minWeight);
    if (record) {
      recordShownItems(result.map(item => item[idField]), type);
    }
    return result;
  }

  let selected;

  if (diversifyBy) {
    selected = diversifiedSelect(items, count, type, idField, decayHours, minWeight, diversifyBy);
  } else {
    selected = weightedSelect(items, count, type, idField, decayHours, minWeight);
  }

  if (record) {
    recordShownItems(selected.map(item => item[idField]), type);
  }

  return selected;
};

/**
 * Weighted selection: pick `count` items where recently-shown items
 * have lower probability of being chosen.
 */
const weightedSelect = (items, count, type, idField, decayHours, minWeight) => {
  // Calculate weights for all items
  const weighted = items.map(item => {
    const freshness = getItemFreshness(item[idField], type, decayHours);
    // Weight ranges from minWeight (just shown) to 1.0 (fully fresh)
    const weight = minWeight + (1 - minWeight) * freshness;
    return { item, weight };
  });

  const selected = [];
  const usedIds = new Set();

  for (let i = 0; i < count && weighted.length > 0; i++) {
    // Filter out already-selected items
    const available = weighted.filter(w => !usedIds.has(w.item[idField]));
    if (available.length === 0) break;

    const totalWeight = available.reduce((sum, w) => sum + w.weight, 0);
    let random = Math.random() * totalWeight;

    let picked = available[available.length - 1]; // fallback
    for (const entry of available) {
      random -= entry.weight;
      if (random <= 0) {
        picked = entry;
        break;
      }
    }

    selected.push(picked.item);
    usedIds.add(picked.item[idField]);
  }

  return selected;
};

/**
 * Diversified selection: spread picks across categories/types, then
 * apply weighted randomness within each group.
 */
const diversifiedSelect = (items, count, type, idField, decayHours, minWeight, diversifyBy) => {
  // Group items by the diversify field
  const groups = {};
  items.forEach(item => {
    const key = item[diversifyBy] || '_other';
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  });

  const groupKeys = Object.keys(groups);
  if (groupKeys.length <= 1) {
    // Only one group — fall back to regular weighted select
    return weightedSelect(items, count, type, idField, decayHours, minWeight);
  }

  // Round-robin allocation: give each group a fair share
  const perGroup = Math.max(1, Math.floor(count / groupKeys.length));
  const remainder = count - (perGroup * groupKeys.length);

  // Shuffle group order for variety
  const shuffledKeys = [...groupKeys].sort(() => Math.random() - 0.5);

  const selected = [];
  const extraSlots = []; // groups that could contribute more

  for (let i = 0; i < shuffledKeys.length; i++) {
    const key = shuffledKeys[i];
    const groupItems = groups[key];
    const allocation = perGroup + (i < remainder ? 1 : 0);
    const picks = weightedSelect(groupItems, allocation, type, idField, decayHours, minWeight);
    selected.push(...picks);
    if (picks.length < allocation) {
      // This group was exhausted — remember remaining slots
    } else if (groupItems.length > allocation) {
      extraSlots.push(key);
    }
  }

  // If we're short (some groups too small), fill from remaining items
  if (selected.length < count) {
    const selectedIds = new Set(selected.map(s => s[idField]));
    const remaining = items.filter(item => !selectedIds.has(item[idField]));
    const extra = weightedSelect(remaining, count - selected.length, type, idField, decayHours, minWeight);
    selected.push(...extra);
  }

  // Final shuffle so items aren't grouped by category in the output
  return selected.sort(() => Math.random() - 0.5);
};

/**
 * Shuffle all items with a bias toward fresher items appearing earlier.
 * Used when count >= items.length (we need all items but in a smart order).
 */
const weightedShuffle = (items, type, idField, decayHours, minWeight) => {
  const weighted = items.map(item => {
    const freshness = getItemFreshness(item[idField], type, decayHours);
    const weight = minWeight + (1 - minWeight) * freshness;
    // Add randomized weight for shuffling (higher weight = earlier position)
    return { item, sortKey: weight * (0.5 + Math.random()) };
  });

  weighted.sort((a, b) => b.sortKey - a.sortKey);
  return weighted.map(w => w.item);
};

/**
 * Clear the selection history (useful for settings/reset).
 * @param {string|null} type - 'vocab', 'english', or null to clear all
 */
export const clearSelectionHistory = (type = null) => {
  if (type === null) {
    saveHistory({ vocab: {}, english: {} });
  } else {
    const history = getHistory();
    history[type] = {};
    saveHistory(history);
  }
};
