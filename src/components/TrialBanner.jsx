import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { C, RADIUS } from '../styles/theme';

const TrialBanner = () => {
  const { isTrial, trialEndsAt } = useAuth();
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    if (!isTrial || !trialEndsAt) return;

    const update = () => {
      const now = new Date();
      const diff = trialEndsAt.getTime() - now.getTime();
      if (diff <= 0) {
        setTimeLeft(null);
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setTimeLeft({ days, hours, minutes, totalMs: diff });
    };

    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [isTrial, trialEndsAt]);

  if (!isTrial || !timeLeft) return null;

  const isUrgent = timeLeft.totalMs < 6 * 60 * 60 * 1000;

  const bgGradient = isUrgent
    ? 'linear-gradient(135deg, rgba(251,146,60,0.10), rgba(239,68,68,0.10))'
    : 'linear-gradient(135deg, rgba(139,92,246,0.10), rgba(236,72,153,0.10))';

  const borderColor = isUrgent
    ? 'rgba(251,146,60,0.25)'
    : 'rgba(139,92,246,0.20)';

  const iconColor = isUrgent ? C.orange : C.purple;

  const timeText = timeLeft.days > 0
    ? `${timeLeft.days} ימים / ${timeLeft.hours} שעות`
    : `${timeLeft.hours} שעות / ${timeLeft.minutes} דקות`;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        background: bgGradient,
        border: `1px solid ${borderColor}`,
        borderRadius: RADIUS.lg,
        padding: '12px 16px',
        margin: '0 16px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}
    >
      {isUrgent ? (
        <Zap size={20} color={iconColor} />
      ) : (
        <Clock size={20} color={iconColor} />
      )}
      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: 14,
          fontWeight: 600,
          color: C.text,
          marginBottom: 2,
        }}>
          נותרו {timeText} של גישה מלאה
        </div>
        <div style={{
          fontSize: 12,
          color: C.muted,
        }}>
          שדרג עכשיו ב-₪29.90/חודש
        </div>
      </div>
    </motion.div>
  );
};

export default TrialBanner;
