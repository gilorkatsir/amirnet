import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Rocket } from 'lucide-react';
import { C, MOTION } from '../styles/theme';
import { useStatsContext } from '../contexts/StatsContext';
import useDerivedStats from '../hooks/useStats';
import ShaderBackground from '../components/ShaderBackground';

const WelcomeScreen = () => {
    const [, navigate] = useLocation();
    const { stats, englishStats, totalWords, totalQuestions } = useStatsContext();
    const { learnedCount, totalAttempts, accuracy } = useDerivedStats(stats, totalWords);
    const englishAnswered = Object.keys(englishStats).length;
    const progress = Math.round(((learnedCount / totalWords) + (englishAnswered / totalQuestions)) / 2 * 100);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) return 'בוקר טוב';
        if (hour >= 12 && hour < 17) return 'צהריים טובים';
        if (hour >= 17 && hour < 21) return 'ערב טוב';
        return 'לילה טוב';
    };

    const getLastLogin = () => {
        try {
            const last = localStorage.getItem('wm_last_login');
            if (last) {
                const diffDays = Math.floor((Date.now() - parseInt(last)) / 86400000);
                if (diffDays === 0) return 'היום';
                if (diffDays === 1) return 'אתמול';
                return `לפני ${diffDays} ימים`;
            }
            return 'פעם ראשונה!';
        } catch { return 'פעם ראשונה!'; }
    };

    useEffect(() => {
        localStorage.setItem('wm_last_login', Date.now().toString());
        localStorage.setItem('wm_last_visit_time', Date.now().toString());
    }, []);

    return (
        <div style={{
            minHeight: '100vh', background: C.bg,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: 24, position: 'relative', overflow: 'hidden'
        }}>
            <ShaderBackground opacity={0.25} />

            {/* Wordmark */}
            <motion.div
                variants={MOTION.scaleIn}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.7, type: 'spring', bounce: 0.3 }}
                style={{ textAlign: 'center', marginBottom: 40 }}
            >
                <h1 style={{
                    fontSize: 42, fontWeight: 800, margin: 0, letterSpacing: -1,
                    ...C.gradientText,
                }}>
                    AMIRNET
                </h1>
                <p style={{ fontSize: 14, color: C.muted, marginTop: 6, fontWeight: 500 }}>
                    הכנה לאנגלית פסיכומטרית
                </p>
            </motion.div>

            {/* Greeting */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25 }}
                style={{ textAlign: 'center', marginBottom: 32 }}
            >
                <h2 style={{ fontSize: 24, fontWeight: 600, margin: 0, color: C.text }}>
                    {getGreeting()}!
                </h2>
                <p style={{ fontSize: 14, color: C.muted, marginTop: 8 }}>
                    כניסה אחרונה: {getLastLogin()}
                </p>
            </motion.div>

            {/* Stats row — text only, no cards */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                style={{
                    display: 'flex', gap: 32, justifyContent: 'center',
                    width: '100%', maxWidth: 360, marginBottom: 36
                }}
            >
                {[
                    { value: `${progress}%`, label: 'התקדמות', color: C.text },
                    { value: `${accuracy}%`, label: 'דיוק', color: accuracy >= 70 ? C.green : C.orange },
                    { value: learnedCount, label: 'מילים', color: C.purple },
                ].map((s, i) => (
                    <div key={i} style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</div>
                        <p style={{ fontSize: 11, color: C.muted, margin: '4px 0 0', letterSpacing: 0.3 }}>{s.label}</p>
                    </div>
                ))}
            </motion.div>

            {/* Improvement hint */}
            {totalAttempts > 0 && (
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.55 }}
                    style={{
                        fontSize: 14, color: C.green, fontWeight: 500,
                        marginBottom: 28, textAlign: 'center'
                    }}
                >
                    המשך כך! התקדמת יפה
                </motion.p>
            )}

            {/* CTA — pill shape */}
            <motion.button
                variants={MOTION.fadeUp}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.5, delay: 0.6 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                    localStorage.setItem('wm_last_visit_time', Date.now().toString());
                    navigate('/');
                }}
                style={{
                    width: '100%', maxWidth: 340, padding: '18px 40px',
                    borderRadius: 9999, border: 'none', background: C.gradient,
                    color: 'white', fontSize: 18, fontWeight: 700, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    boxShadow: '0 8px 32px rgba(139,92,246,0.35)',
                }}
            >
                <Rocket size={22} />
                בוא נתחיל ללמוד!
            </motion.button>
        </div>
    );
};

export default WelcomeScreen;
