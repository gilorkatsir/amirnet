import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('wm_premium_cache')) || false;
    } catch { return false; }
  });

  const ensureProfile = useCallback(async (u) => {
    if (!supabase || !u) return;
    try {
      const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', u.id)
        .single();

      if (!data) {
        await supabase.from('profiles').insert({
          id: u.id,
          email: u.email,
        });
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
        .select('is_premium, premium_until')
        .eq('id', userId)
        .single();

      if (!data) return false;
      const premium = data.is_premium && (!data.premium_until || new Date(data.premium_until) > new Date());
      setIsPremium(premium);
      localStorage.setItem('wm_premium_cache', JSON.stringify(premium));
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

    // getSession detects tokens in URL hash (implicit flow) and hydrates session
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
  }, []);

  const value = {
    user,
    session,
    loading,
    isPremium,
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
