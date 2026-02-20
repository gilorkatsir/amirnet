import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from './AuthContext';
import { safeLocalStorageGet, safeLocalStorageSet } from '../utils/security';

const GamificationContext = createContext(null);

// Level formula: XP_for_level(n) = 100 * n * (1 + 0.1 * n)
const xpForLevel = (n) => Math.floor(100 * n * (1 + 0.1 * n));

// Cumulative XP needed to reach level n
const cumulativeXpForLevel = (n) => {
  let total = 0;
  for (let i = 1; i <= n; i++) {
    total += xpForLevel(i);
  }
  return total;
};

// Determine level from total XP
const levelFromXp = (totalXp) => {
  let level = 0;
  let cumulative = 0;
  while (true) {
    const next = xpForLevel(level + 1);
    if (cumulative + next > totalXp) break;
    cumulative += next;
    level++;
    if (level >= 30) break;
  }
  return level;
};

const LEVEL_TITLES = [
  { min: 1, max: 3, title: 'מתחיל' },
  { min: 4, max: 7, title: 'לומד' },
  { min: 8, max: 12, title: 'מתקדם' },
  { min: 13, max: 18, title: 'מומחה' },
  { min: 19, max: 25, title: 'אלוף' },
  { min: 26, max: 30, title: 'אגדה' },
];

const getLevelTitle = (level) => {
  if (level <= 0) return LEVEL_TITLES[0].title;
  const entry = LEVEL_TITLES.find(t => level >= t.min && level <= t.max);
  return entry ? entry.title : LEVEL_TITLES[LEVEL_TITLES.length - 1].title;
};

const DEFAULT_BADGES = [];

const BADGE_DEFINITIONS = [
  { id: 'first_session', name: 'צעד ראשון', desc: 'סיים תרגול ראשון', check: (stats) => stats.totalSessions >= 1 },
  { id: 'streak_3', name: 'רצף 3 ימים', desc: 'תרגל 3 ימים רצופים', check: (stats) => stats.currentStreak >= 3 },
  { id: 'streak_7', name: 'רצף שבועי', desc: 'תרגל 7 ימים רצופים', check: (stats) => stats.currentStreak >= 7 },
  { id: 'streak_30', name: 'רצף חודשי', desc: 'תרגל 30 ימים רצופים', check: (stats) => stats.currentStreak >= 30 },
  { id: 'xp_500', name: '500 XP', desc: 'צבור 500 נקודות ניסיון', check: (stats) => stats.totalXp >= 500 },
  { id: 'xp_2000', name: '2000 XP', desc: 'צבור 2000 נקודות ניסיון', check: (stats) => stats.totalXp >= 2000 },
  { id: 'level_5', name: 'רמה 5', desc: 'הגע לרמה 5', check: (stats) => stats.level >= 5 },
  { id: 'level_10', name: 'רמה 10', desc: 'הגע לרמה 10', check: (stats) => stats.level >= 10 },
  { id: 'level_20', name: 'רמה 20', desc: 'הגע לרמה 20', check: (stats) => stats.level >= 20 },
];

const LS_XP_KEY = 'wm_xp';
const LS_STREAK_KEY = 'wm_streak';
const LS_BADGES_KEY = 'wm_badges';

export const GamificationProvider = ({ children }) => {
  const { user } = useAuth();

  const [totalXp, setTotalXp] = useState(() => {
    const saved = safeLocalStorageGet(LS_XP_KEY, { total: 0, session: 0, totalSessions: 0 });
    return saved.total || 0;
  });
  const [sessionXp, setSessionXp] = useState(0);
  const [totalSessions, setTotalSessions] = useState(() => {
    const saved = safeLocalStorageGet(LS_XP_KEY, { total: 0, session: 0, totalSessions: 0 });
    return saved.totalSessions || 0;
  });

  const [streak, setStreak] = useState(() => {
    return safeLocalStorageGet(LS_STREAK_KEY, {
      current: 0,
      longest: 0,
      lastActivityDate: null,
    });
  });

  const [badges, setBadges] = useState(() => {
    return safeLocalStorageGet(LS_BADGES_KEY, DEFAULT_BADGES);
  });

  const [levelUpEvent, setLevelUpEvent] = useState(null);
  const [newBadgeEvent, setNewBadgeEvent] = useState(null);
  const dirtyRef = useRef(false);

  const level = levelFromXp(totalXp);
  const levelTitle = getLevelTitle(level);
  const currentLevelXp = cumulativeXpForLevel(level);
  const nextLevelXp = cumulativeXpForLevel(level + 1);
  const xpInCurrentLevel = totalXp - currentLevelXp;
  const xpNeededForNextLevel = nextLevelXp - currentLevelXp;
  const levelProgress = xpNeededForNextLevel > 0 ? xpInCurrentLevel / xpNeededForNextLevel : 1;

  useEffect(() => {
    safeLocalStorageSet(LS_XP_KEY, { total: totalXp, session: sessionXp, totalSessions });
  }, [totalXp, sessionXp, totalSessions]);

  useEffect(() => {
    safeLocalStorageSet(LS_STREAK_KEY, streak);
  }, [streak]);

  useEffect(() => {
    safeLocalStorageSet(LS_BADGES_KEY, badges);
  }, [badges]);

  const checkBadges = useCallback((stats) => {
    const currentIds = new Set(badges.map(b => b.id));
    const newBadges = [];

    for (const def of BADGE_DEFINITIONS) {
      if (!currentIds.has(def.id) && def.check(stats)) {
        newBadges.push({ id: def.id, name: def.name, desc: def.desc, earnedAt: new Date().toISOString() });
      }
    }

    if (newBadges.length > 0) {
      setBadges(prev => [...prev, ...newBadges]);
      setNewBadgeEvent(newBadges[0]);
    }

    return newBadges;
  }, [badges]);

  const addXP = useCallback((amount) => {
    const prevLevel = levelFromXp(totalXp);
    const newTotal = totalXp + amount;
    const newLevel = levelFromXp(newTotal);

    setTotalXp(newTotal);
    setSessionXp(prev => prev + amount);
    dirtyRef.current = true;

    if (newLevel > prevLevel) {
      setLevelUpEvent({ from: prevLevel, to: newLevel, title: getLevelTitle(newLevel) });
    }

    checkBadges({
      totalXp: newTotal,
      level: newLevel,
      currentStreak: streak.current,
      totalSessions,
    });
  }, [totalXp, streak.current, totalSessions, checkBadges]);

  const recordActivity = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];

    setStreak(prev => {
      if (prev.lastActivityDate === today) return prev;

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      let newCurrent;
      if (prev.lastActivityDate === yesterdayStr) {
        newCurrent = prev.current + 1;
      } else if (!prev.lastActivityDate) {
        newCurrent = 1;
      } else {
        newCurrent = 1;
      }

      const newLongest = Math.max(prev.longest, newCurrent);

      checkBadges({
        totalXp,
        level: levelFromXp(totalXp),
        currentStreak: newCurrent,
        totalSessions: totalSessions + 1,
      });

      return {
        current: newCurrent,
        longest: newLongest,
        lastActivityDate: today,
      };
    });

    setTotalSessions(prev => prev + 1);
    dirtyRef.current = true;
  }, [totalXp, totalSessions, checkBadges]);

  const dismissLevelUp = useCallback(() => setLevelUpEvent(null), []);
  const dismissNewBadge = useCallback(() => setNewBadgeEvent(null), []);

  const syncToSupabase = useCallback(async () => {
    if (!supabase || !user || !dirtyRef.current) return;
    dirtyRef.current = false;

    try {
      await supabase.from('profiles').update({
        gamification_xp: totalXp,
        gamification_streak: streak,
        gamification_badges: badges,
      }).eq('id', user.id);
    } catch {
      dirtyRef.current = true;
    }
  }, [user, totalXp, streak, badges]);

  useEffect(() => {
    const interval = setInterval(syncToSupabase, 30000);

    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        syncToSupabase();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [syncToSupabase]);

  const value = {
    totalXp,
    sessionXp,
    level,
    levelTitle,
    levelProgress,
    xpInCurrentLevel,
    xpNeededForNextLevel,
    addXP,
    currentStreak: streak.current,
    longestStreak: streak.longest,
    lastActivityDate: streak.lastActivityDate,
    recordActivity,
    badges,
    checkBadges,
    levelUpEvent,
    dismissLevelUp,
    newBadgeEvent,
    dismissNewBadge,
    totalSessions,
    xpForLevel,
    getLevelTitle,
    LEVEL_TITLES,
    BADGE_DEFINITIONS,
  };

  return <GamificationContext.Provider value={value}>{children}</GamificationContext.Provider>;
};

export const useGamification = () => {
  const ctx = useContext(GamificationContext);
  if (!ctx) throw new Error('useGamification must be used within GamificationProvider');
  return ctx;
};
