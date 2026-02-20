import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../services/supabase';

const AuthContext = createContext(null);

const TRIAL_DURATION_MS = 3 * 24 * 60 * 60 * 1000; // 3 days

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('wm_premium_cache')) || false;
    } catch { return false; }
  });

  const [trialStartedAt, setTrialStartedAt] = useState(() => {
    return localStorage.getItem('wm_trial_started_at') || null;
  });
  const [trialUsed, setTrialUsed] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('wm_trial_used')) || false;
    } catch { return false; }
  });

  const trialEndsAt = useMemo(() => {
    if (!trialStartedAt) return null;
    return new Date(new Date(trialStartedAt).getTime() + TRIAL_DURATION_MS);
  }, [trialStartedAt]);

  const isTrial = useMemo(() => {
    if (isPremium || !trialStartedAt || trialUsed) return false;
    return trialEndsAt && new Date() < trialEndsAt;
  }, [isPremium, trialStartedAt, trialUsed, trialEndsAt]);

  const isTrialExpired = useMemo(() => {
    if (isPremium || !trialStartedAt) return false;
    return trialEndsAt && new Date() >= trialEndsAt;
  }, [isPremium, trialStartedAt, trialEndsAt]);

  const ensureProfile = useCallback(async (u) => {
    if (!supabase || !u) return;
    try {
      const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', u.id)
        .single();

      if (!data) {
        const now = new Date().toISOString();
        await supabase.from('profiles').insert({
          id: u.id,
          email: u.email,
          trial_started_at: now,
        });
        setTrialStartedAt(now);
        setTrialUsed(false);
        localStorage.setItem('wm_trial_started_at', now);
        localStorage.setItem('wm_trial_used', JSON.stringify(false));
      }
    } catch {
      // Profile might already exist — ignore
    }
  }, []);

  const checkPremiumStatus = useCallback(async (userId) => {
    if (!supabase) return false;
    try {
      const { data } = await supabase
        .from('profiles')
        .select('is_premium, premium_until, trial_started_at, trial_used')
        .eq('id', userId)
        .single();

      if (!data) return false;
      const premium = data.is_premium && (!data.premium_until || new Date(data.premium_until) > new Date());
      setIsPremium(premium);
      localStorage.setItem('wm_premium_cache', JSON.stringify(premium));

      if (data.trial_started_at) {
        setTrialStartedAt(data.trial_started_at);
        localStorage.setItem('wm_trial_started_at', data.trial_started_at);
      }
      if (data.trial_used !== undefined) {
        setTrialUsed(!!data.trial_used);
        localStorage.setItem('wm_trial_used', JSON.stringify(!!data.trial_used));
      }

      return premium;
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        ensureProfile(s.user);
        checkPremiumStatus(s.user.id);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        ensureProfile(s.user);
        checkPremiumStatus(s.user.id);
      } else {
        setIsPremium(false);
        localStorage.removeItem('wm_premium_cache');
        setTrialStartedAt(null);
        setTrialUsed(false);
        localStorage.removeItem('wm_trial_started_at');
        localStorage.removeItem('wm_trial_used');
      }
    });

    return () => subscription.unsubscribe();
  }, [ensureProfile, checkPremiumStatus]);

  const signInWithGoogle = useCallback(async () => {
    if (!supabase) return;
    return supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
  }, []);

  const signInWithEmail = useCallback(async (email, password) => {
    if (!supabase) return;
    return supabase.auth.signInWithPassword({ email, password });
  }, []);

  const signUpWithEmail = useCallback(async (email, password) => {
    if (!supabase) return;
    return supabase.auth.signUp({ email, password });
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setIsPremium(false);
    localStorage.removeItem('wm_premium_cache');
    setTrialStartedAt(null);
    setTrialUsed(false);
    localStorage.removeItem('wm_trial_started_at');
    localStorage.removeItem('wm_trial_used');
  }, []);

  const value = {
    user,
    session,
    loading,
    isPremium,
    isTrial,
    isTrialExpired,
    trialEndsAt,
    trialStartedAt,
    trialUsed,
    isLoggedIn: !!user,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
