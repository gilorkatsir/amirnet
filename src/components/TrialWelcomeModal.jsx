import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MagicStar, ArrowLeft } from 'iconsax-react';
import { useAuth } from '../contexts/AuthContext';
import { C, RADIUS } from '../styles/theme';

const WELCOME_KEY = 'wm_trial_welcome_shown';

const TrialWelcomeModal = () => {
  const { isTrial, isLoggedIn } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isLoggedIn || !isTrial) return;
    const shown = localStorage.getItem(WELCOME_KEY);
    if (!shown) {
      setIsOpen(true);
    }
  }, [isLoggedIn, isTrial]);

  const handleClose = () => {
    localStorage.setItem(WELCOME_KEY, 'true');
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
              border: '1px solid rgba(139,92,246,0.25)',
              borderRadius: 24,
              padding: '36px 28px',
              maxWidth: 360,
              width: '100%',
              textAlign: 'center',
            }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 400, damping: 15 }}
              style={{
                width: 72, height: 72, borderRadius: RADIUS.full,
                background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(236,72,153,0.15))',
                margin: '0 auto 20px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <MagicStar size={32} color={C.purple} />
            </motion.div>

            <h2 style={{
              fontSize: 22, fontWeight: 700, color: C.text,
              margin: '0 0 10px',
            }}>
              ברוכים הבאים!
            </h2>

            <p style={{
              fontSize: 16, color: C.muted, margin: '0 0 8px',
              lineHeight: 1.6,
            }}>
              3 ימים של גישה מלאה
            </p>

            <p style={{
              fontSize: 13, color: C.dim, margin: '0 0 28px',
              lineHeight: 1.5,
            }}>
              כל המילים, כל השאלות, תרגול AI וחלקי הקשבה — הכל פתוח לך.
            </p>

            <button
              onClick={handleClose}
              style={{
                width: '100%',
                padding: '14px 24px',
                borderRadius: RADIUS.md,
                border: 'none',
                background: C.gradient,
                color: 'white',
                fontSize: 16,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <ArrowLeft size={18} color="white" />
              בואו נתחיל!
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TrialWelcomeModal;
