import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Book1 } from 'iconsax-react';
import { useAuth } from '../contexts/AuthContext';
import { C, RADIUS } from '../styles/theme';
import { safeLocalStorageGet } from '../utils/security';

const EXPIRED_SHOWN_KEY = 'wm_trial_expired_shown';

const TrialExpiredModal = () => {
  const { isLoggedIn, isTrialExpired, trialStartedAt, isPremium } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [trialStats, setTrialStats] = useState({ wordsStudied: 0, questionsAnswered: 0 });

  useEffect(() => {
    if (!isLoggedIn || !isTrialExpired || isPremium) return;
    const shown = localStorage.getItem(EXPIRED_SHOWN_KEY);
    if (shown === trialStartedAt) return;

    const vocabStats = safeLocalStorageGet('wm_stats', {});
    const englishStats = safeLocalStorageGet('wm_english_stats', {});
    const wordsStudied = Object.keys(vocabStats).length;
    const questionsAnswered = Object.values(englishStats).reduce((sum, s) => sum + (s.attempts || 0), 0);

    setTrialStats({ wordsStudied, questionsAnswered });
    setIsOpen(true);
  }, [isLoggedIn, isTrialExpired, isPremium, trialStartedAt]);

  const handleUpgrade = () => {
    localStorage.setItem(EXPIRED_SHOWN_KEY, trialStartedAt);
    setIsOpen(false);
  };

  const handleContinueFree = () => {
    localStorage.setItem(EXPIRED_SHOWN_KEY, trialStartedAt);
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.85)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1100, backdropFilter: 'blur(12px)', padding: 20,
          }}
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            style={{
              background: 'rgba(20,20,30,0.98)',
              border: '1px solid rgba(139,92,246,0.20)',
              borderRadius: 24,
              padding: '32px 24px',
              maxWidth: 360,
              width: '100%',
              textAlign: 'center',
            }}
          >
            <div style={{
              width: 64, height: 64, borderRadius: RADIUS.full,
              background: 'rgba(251,146,60,0.12)',
              margin: '0 auto 20px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Crown size={28} color={C.orange} />
            </div>

            <h2 style={{
              fontSize: 20, fontWeight: 700, color: C.text,
              margin: '0 0 8px',
            }}>
              תקופת הניסיון הסתיימה
            </h2>

            <p style={{
              fontSize: 14, color: C.muted, margin: '0 0 20px',
              lineHeight: 1.5,
            }}>
              הנה מה שהספקת להשיג ב-3 ימים:
            </p>

            <div style={{
              display: 'flex', gap: 12, justifyContent: 'center',
              marginBottom: 24,
            }}>
              <div style={{
                background: 'rgba(139,92,246,0.08)',
                border: '1px solid rgba(139,92,246,0.15)',
                borderRadius: RADIUS.md,
                padding: '12px 16px',
                flex: 1,
              }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: C.purple }}>
                  {trialStats.wordsStudied}
                </div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
                  מילים נלמדו
                </div>
              </div>
              <div style={{
                background: 'rgba(236,72,153,0.08)',
                border: '1px solid rgba(236,72,153,0.15)',
                borderRadius: RADIUS.md,
                padding: '12px 16px',
                flex: 1,
              }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: C.pink }}>
                  {trialStats.questionsAnswered}
                </div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
                  שאלות נענו
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                onClick={handleUpgrade}
                style={{
                  width: '100%',
                  padding: '14px 24px',
                  borderRadius: RADIUS.md,
                  border: 'none',
                  background: C.gradient,
                  color: 'white',
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <Crown size={18} />
                שדרג לפרימיום
              </button>

              <button
                onClick={handleContinueFree}
                style={{
                  width: '100%',
                  padding: '12px 24px',
                  borderRadius: RADIUS.md,
                  border: `1px solid ${C.border}`,
                  background: 'transparent',
                  color: C.muted,
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <Book1 size={16} />
                המשך בחינם
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TrialExpiredModal;
