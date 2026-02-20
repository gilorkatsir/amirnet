import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import {
    Book1, Teacher, Headphone, Chart, Setting2,
    Play, Flash, Layer, Edit2, ArrowLeft2,
    Home2, Login
} from 'iconsax-react';
import { C, GLASS, RADIUS, SURFACE, MOTION, HEADING } from '../styles/theme';
import { calculateStreak } from '../utils/dailyStats';
import { useStatsContext } from '../contexts/StatsContext';
import { useAuth } from '../contexts/AuthContext';
import useDerivedStats from '../hooks/useStats';

const Home = ({ onStart }) => {
    const [, navigate] = useLocation();
    const { stats, englishStats, totalWords, totalQuestions } = useStatsContext();
    const { user, isLoggedIn } = useAuth();
    const streak = useMemo(() => calculateStreak(), []);
    const { learnedCount, accuracy } = useDerivedStats(stats, totalWords);
    const englishAnswered = Object.keys(englishStats).length;

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) return 'בוקר טוב';
        if (hour >= 12 && hour < 17) return 'צהריים טובים';
        if (hour >= 17 && hour < 21) return 'ערב טוב';
        return 'לילה טוב';
    };

    // Smart start: pick weakest area
    const smartStart = useMemo(() => {
        const vocabPct = totalWords > 0 ? learnedCount / totalWords : 0;
        const engPct = totalQuestions > 0 ? englishAnswered / totalQuestions : 0;
        if (vocabPct <= engPct) return { label: 'אוצר מילים', action: () => onStart('flash', 10) };
        return { label: 'שאלות אנגלית', action: () => navigate('/english-select') };
    }, [learnedCount, totalWords, englishAnswered, totalQuestions, onStart, navigate]);

    const overallProgress = Math.round(((learnedCount / (totalWords || 1)) + (englishAnswered / (totalQuestions || 1))) / 2 * 100);

    return (
        <div style={{ paddingBottom: 100 }}>
            {/* Header — clean, just wordmark + settings */}
            <header style={{
                position: 'sticky', top: 0, zIndex: 10, ...GLASS.header,
                padding: '20px 20px 14px'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <p style={{ ...HEADING.label, margin: 0 }}>AMIRNET</p>
                        <h1 style={{ ...HEADING.section, margin: '2px 0 0', color: C.text }}>
                            {getGreeting()}!
                        </h1>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {!isLoggedIn && (
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={() => navigate('/login')}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 5,
                                    padding: '6px 12px', borderRadius: 9999,
                                    background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)',
                                    color: C.purple, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                                }}
                            >
                                <Login size={14} />
                                התחבר
                            </motion.button>
                        )}
                        {isLoggedIn && (
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={() => navigate('/settings')}
                                style={{
                                    width: 34, height: 34, borderRadius: '50%',
                                    background: C.gradient, border: 'none',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 14, fontWeight: 700, color: 'white', cursor: 'pointer',
                                }}
                            >
                                {(user?.email?.[0] || '?').toUpperCase()}
                            </motion.button>
                        )}
                        <motion.button
                            whileTap={{ rotate: -10, scale: 0.9 }}
                            onClick={() => navigate('/settings')}
                            style={{
                                width: 40, height: 40, borderRadius: RADIUS.full,
                                background: 'transparent', border: 'none',
                                color: C.muted, cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}
                        >
                            <Setting2 size={20} />
                        </motion.button>
                    </div>
                </div>
            </header>

            <main style={{ padding: '20px 20px', display: 'flex', flexDirection: 'column', gap: 24 }}>
                {/* Hero — progress ring + streak */}
                <motion.section
                    variants={MOTION.scaleIn}
                    initial="hidden"
                    animate="visible"
                    transition={{ duration: 0.5, type: 'spring', bounce: 0.2 }}
                    style={{
                        ...SURFACE.hero, padding: 24,
                        display: 'flex', alignItems: 'center', gap: 20
                    }}
                >
                    <ProgressRing value={overallProgress / 100} />
                    <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: C.text }}>
                            {overallProgress}% התקדמות כללית
                        </p>
                        <p style={{ margin: '4px 0 0', fontSize: 13, color: C.muted }}>
                            {learnedCount} מילים · דיוק {accuracy}%
                        </p>
                        {streak > 0 && (
                            <div style={{
                                display: 'inline-flex', alignItems: 'center', gap: 4,
                                marginTop: 8, padding: '3px 10px', borderRadius: 9999,
                                background: 'rgba(251,146,60,0.1)', border: '1px solid rgba(251,146,60,0.15)'
                            }}>
                                <Flash size={13} color={C.orange} />
                                <span style={{ fontSize: 12, fontWeight: 600, color: C.orange }}>
                                    {streak} {streak === 1 ? 'יום' : 'ימים'} ברצף
                                </span>
                            </div>
                        )}
                    </div>
                </motion.section>

                {/* Smart Start CTA */}
                <motion.button
                    variants={MOTION.fadeUp}
                    initial="hidden"
                    animate="visible"
                    transition={{ duration: 0.4, delay: 0.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={smartStart.action}
                    style={{
                        position: 'relative', borderRadius: 20, overflow: 'hidden',
                        border: 'none', cursor: 'pointer', width: '100%', textAlign: 'right',
                        padding: 0, background: 'transparent',
                        boxShadow: '0 8px 32px rgba(139,92,246,0.2)'
                    }}
                >
                    <div style={{ position: 'absolute', inset: 0, background: C.gradientSubtle }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.02)' }} />
                    <div style={{ position: 'absolute', top: 0, width: '100%', height: 1, background: C.gradient, opacity: 0.4 }} />
                    <div style={{ position: 'relative', padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <span style={{
                                display: 'inline-block', padding: '3px 8px', borderRadius: 6,
                                fontSize: 10, fontWeight: 700, background: 'rgba(139,92,246,0.15)',
                                color: C.purple, border: '1px solid rgba(139,92,246,0.2)', marginBottom: 6
                            }}>
                                התחלה חכמה
                            </span>
                            <h3 style={{ fontSize: 17, fontWeight: 700, margin: '0 0 4px', color: C.text }}>
                                המשך ללמוד
                            </h3>
                            <p style={{ color: C.muted, fontSize: 13, margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Flash size={13} /> מתמקד ב{smartStart.label}
                            </p>
                        </div>
                        <div style={{
                            width: 48, height: 48, borderRadius: RADIUS.full,
                            background: C.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 8px 24px rgba(139,92,246,0.3)'
                        }}>
                            <Play size={22} color="white" />
                        </div>
                    </div>
                </motion.button>

                {/* Quick Actions — one-tap Flashcards + Quiz */}
                <motion.div
                    variants={MOTION.fadeUp}
                    initial="hidden"
                    animate="visible"
                    transition={{ duration: 0.4, delay: 0.15 }}
                    style={{ display: 'flex', gap: 10 }}
                >
                    {[
                        { icon: Layer, label: 'כרטיסיות', color: C.muted, action: () => onStart('flash', 10) },
                        { icon: Edit2, label: 'בוחן מילים', color: C.muted, action: () => onStart('quiz', 10) },
                    ].map((q, i) => (
                        <motion.button
                            key={i}
                            whileTap={{ scale: 0.95 }}
                            onClick={q.action}
                            style={{
                                flex: 1, padding: '14px 16px', borderRadius: 9999,
                                background: `${q.color}08`, border: `1px solid ${q.color}18`,
                                color: q.color, fontSize: 14, fontWeight: 600,
                                cursor: 'pointer', display: 'flex', alignItems: 'center',
                                justifyContent: 'center', gap: 8,
                                transition: 'background 0.2s'
                            }}
                        >
                            <q.icon size={18} />
                            {q.label}
                        </motion.button>
                    ))}
                </motion.div>

                {/* 3 Section Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <SectionCard
                        icon={Book1}
                        title="אוצר מילים"
                        desc="קטגוריות, טעויות, AI, המילים שלי"
                        color={C.muted}
                        onClick={() => navigate('/vocab-hub')}
                        delay={0.2}
                    />
                    <SectionCard
                        icon={Teacher}
                        title="שאלות אנגלית"
                        desc="השלמת משפטים, ניסוח מחדש, מבחן"
                        color={C.muted}
                        onClick={() => navigate('/english-select')}
                        delay={0.25}
                    />
                    <SectionCard
                        icon={Headphone}
                        title="הקשבה"
                        desc="הרצאות, שאלות הקשבה, השלמת טקסט"
                        color={C.muted}
                        onClick={() => navigate('/vocal-select')}
                        delay={0.3}
                    />
                </div>
            </main>

            {/* Bottom Nav */}
            <nav style={{
                position: 'fixed', bottom: 0, left: 0, width: '100%',
                ...GLASS.nav, padding: '8px 8px 24px', zIndex: 50
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', height: 50 }}>
                    <button style={{
                        background: 'none', border: 'none', color: C.purple, cursor: 'pointer',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2
                    }}>
                        <Home2 size={22} />
                        <span style={{ fontSize: 10, fontWeight: 700 }}>ראשי</span>
                    </button>
                    <button
                        onClick={() => navigate('/stats')}
                        style={{
                            background: 'none', border: 'none', color: C.muted, cursor: 'pointer',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2
                        }}
                    >
                        <Chart size={22} />
                        <span style={{ fontSize: 10 }}>מדדים</span>
                    </button>
                </div>
            </nav>
        </div>
    );
};

// Section card — uses SURFACE.elevated with accent glow
const SectionCard = ({ icon: Icon, title, desc, color, onClick, delay }) => (
    <motion.button
        variants={MOTION.slideRight}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.4, delay }}
        whileTap={{ scale: 0.97 }}
        onClick={onClick}
        style={{
            display: 'flex', alignItems: 'center', gap: 14, width: '100%',
            padding: '18px 16px', ...SURFACE.elevated,
            color: C.text, cursor: 'pointer', textAlign: 'right',
            transition: 'background 0.2s',
        }}
    >
        <Icon size={20} color={color} style={{ flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
            <h3 style={{ margin: 0, fontWeight: 600, fontSize: 15, color: C.text }}>{title}</h3>
            <p style={{ margin: '3px 0 0', fontSize: 13, color: C.muted }}>{desc}</p>
        </div>
        <ArrowLeft2 size={18} color={C.dim} />
    </motion.button>
);

// Progress Ring
const ProgressRing = ({ value }) => {
    const pct = Math.round(value * 100);
    const offset = 264 - (264 * Math.min(value, 1));
    return (
        <div style={{ position: 'relative', width: 72, height: 72, flexShrink: 0 }}>
            <svg width="72" height="72" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="50" cy="50" r="42" fill="none" stroke={C.border} strokeWidth="7" />
                <circle
                    cx="50" cy="50" r="42" fill="none"
                    stroke="url(#homeRingG)" strokeWidth="7"
                    strokeLinecap="round"
                    strokeDasharray={264}
                    strokeDashoffset={offset}
                    style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                />
                <defs>
                    <linearGradient id="homeRingG" x1="0%" y1="0%" x2="100%">
                        <stop offset="0%" stopColor="#9333ea" />
                        <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                </defs>
            </svg>
            <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, fontWeight: 700, color: C.text
            }}>
                {pct}%
            </div>
        </div>
    );
};

Home.propTypes = {
    onStart: PropTypes.func.isRequired,
};

export default Home;
