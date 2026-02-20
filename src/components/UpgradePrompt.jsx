import React from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, LogIn, Crown, X } from 'lucide-react';
import { C, RADIUS } from '../styles/theme';
import { useAuth } from '../contexts/AuthContext';

const LIMIT_MESSAGES = {
  vocab: {
    title: 'הגעת למגבלת המילים',
    desc: 'בגרסה החינמית ניתן לתרגל עד 30 מילים. שדרג כדי לגשת לכל 500+ המילים.',
  },
  questions: {
    title: 'הגעת למגבלת השאלות',
    desc: 'בגרסה החינמית ניתן לתרגל עד 10 שאלות. שדרג כדי לגשת לכל 220+ השאלות.',
  },
  ai: {
    title: 'ניסיון ה-AI היומי נוצל',
    desc: 'בגרסה החינמית ניתן להשתמש בתרגול AI פעם אחת ביום. שדרג לשימוש ללא הגבלה.',
  },
  vocal: {
    title: 'הגעת למגבלת ההקשבה',
    desc: 'בגרסה החינמית ניתן לגשת ל-4 חלקי הקשבה. שדרג כדי לגשת לכל החלקים.',
  },
};

const UpgradePrompt = ({ isOpen, onClose, limitType = 'vocab' }) => {
  const [, navigate] = useLocation();
  const { isLoggedIn } = useAuth();
  const msg = LIMIT_MESSAGES[limitType] || LIMIT_MESSAGES.vocab;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, backdropFilter: 'blur(8px)', padding: 20,
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'rgba(20,20,30,0.98)',
              border: `1px solid rgba(139,92,246,0.2)`,
              borderRadius: 20, padding: 28, maxWidth: 340, width: '100%',
              textAlign: 'center', position: 'relative',
            }}
          >
            <button
              onClick={onClose}
              style={{
                position: 'absolute', top: 12, left: 12,
                width: 32, height: 32, borderRadius: RADIUS.full,
                background: 'rgba(255,255,255,0.06)', border: 'none',
                color: C.muted, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <X size={16} />
            </button>

            <div style={{
              width: 56, height: 56, borderRadius: RADIUS.full,
              background: 'rgba(139,92,246,0.12)', margin: '0 auto 16px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Lock size={24} color={C.purple} />
            </div>

            <h3 style={{ fontSize: 18, fontWeight: 700, color: C.text, margin: '0 0 8px' }}>
              {msg.title}
            </h3>
            <p style={{ fontSize: 14, color: C.muted, margin: '0 0 24px', lineHeight: 1.6 }}>
              {msg.desc}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {!isLoggedIn && (
                <button
                  onClick={() => { onClose(); navigate('/login'); }}
                  style={{
                    padding: '12px 20px', borderRadius: 12, border: `1px solid ${C.purple}`,
                    background: 'transparent', color: C.purple, fontSize: 15, fontWeight: 600,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  }}
                >
                  <LogIn size={18} />
                  צור חשבון חינם
                </button>
              )}

              <button
                onClick={onClose}
                style={{
                  padding: '12px 20px', borderRadius: 12, border: 'none',
                  background: C.gradient, color: 'white', fontSize: 15, fontWeight: 600,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  opacity: 0.5, pointerEvents: 'none',
                }}
              >
                <Crown size={18} />
                שדרג לפרימיום (בקרוב)
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UpgradePrompt;
