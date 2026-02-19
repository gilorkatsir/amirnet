import React from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowRight, LineChart, Layers, GraduationCap, Trophy, CheckCircle, ClipboardList, TrendingUp, HelpCircle, Trash2 } from 'lucide-react';
import ProgressChart from '../components/ProgressChart';
import { C, GLASS, RADIUS, SURFACE, HEADING } from '../styles/theme';
import { getLastNDaysAccuracy, getWeeklyAccuracy } from '../utils/dailyStats';
import { useStatsContext } from '../contexts/StatsContext';
import useDerivedStats from '../hooks/useStats';

/**
 * Stats/Metrics Page Component
 * Shows detailed statistics for vocabulary and English questions progress
 */
const Stats = () => {
    const [, navigate] = useLocation();
    const { stats, englishStats, totalWords, totalQuestions } = useStatsContext();
    // Get chart data
    const dailyData = getLastNDaysAccuracy(7);
    const weeklyData = getWeeklyAccuracy(4);

    // Vocabulary stats via hook
    const { learnedCount: vocabLearned, masteredCount: vocabMastered, totalCorrect: vocabCorrect, totalAttempts: vocabTotal, accuracy: vocabAccuracy } = useDerivedStats(stats, totalWords);

    // English stats
    const englishAnswered = Object.keys(englishStats).length;
    const englishCorrect = Object.values(englishStats).reduce((acc, s) => acc + (s.correct || 0), 0);
    const englishTotal = Object.values(englishStats).reduce((acc, s) => acc + (s.attempts || 0), 0);
    const englishAccuracy = englishTotal > 0 ? Math.round((englishCorrect / englishTotal) * 100) : 0;

    const StatCard = ({ icon: StatIcon, title, value, subtitle, color, progress, index = 0 }) => (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.08, ease: 'easeOut' }}
            style={{
                ...SURFACE.inset,
                padding: 16,
                marginBottom: 12
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <StatIcon size={18} color={color} style={{ flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                    <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: C.text }}>{title}</h3>
                    <p style={{ margin: '2px 0 0', fontSize: 12, color: C.muted }}>{subtitle}</p>
                </div>
                <span style={{ fontSize: 24, fontWeight: 700, color }}>{value}</span>
            </div>
            {progress !== undefined && (
                <div style={{ height: 6, background: C.border, borderRadius: 3, overflow: 'hidden' }}>
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        style={{
                            height: '100%',
                            background: color,
                            borderRadius: 3
                        }}
                    />
                </div>
            )}
        </motion.div>
    );

    return (
        <div style={{ minHeight: '100vh', background: C.bg, color: C.text }}>
            {/* Header */}
            <header style={{
                position: 'sticky',
                top: 0,
                zIndex: 10,
                ...GLASS.header,
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: 16
            }}>
                <button
                    onClick={() => navigate('/')}
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 8
                    }}
                >
                    <ArrowRight size={24} style={{ color: C.muted }} />
                </button>
                <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: C.text }}>
                    סטטיסטיקות
                </h1>
            </header>

            <main style={{ padding: 20 }}>
                {/* Progress Charts */}
                <section style={{ marginBottom: 32 }}>
                    <motion.h2
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4 }}
                        style={{ fontSize: 14, fontWeight: 600, color: C.muted, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}
                    >
                        <LineChart size={16} />
                        מעקב התקדמות
                    </motion.h2>

                    <ProgressChart data={dailyData} type="daily" />
                    <ProgressChart data={weeklyData} type="weekly" />
                </section>

                {/* Vocabulary Section */}
                <section style={{ marginBottom: 32 }}>
                    <motion.h2
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                        style={{ fontSize: 14, fontWeight: 600, color: C.muted, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}
                    >
                        <Layers size={16} />
                        אוצר מילים
                    </motion.h2>

                    <StatCard
                        icon={GraduationCap}
                        title="מילים שנלמדו"
                        value={vocabLearned}
                        subtitle={`מתוך ${totalWords} מילים`}
                        color={C.pink}
                        progress={totalWords > 0 ? (vocabLearned / totalWords) * 100 : 0}
                        index={0}
                    />

                    <StatCard
                        icon={Trophy}
                        title="מילים שנשלטו"
                        value={vocabMastered}
                        subtitle="רמה 4 ומעלה"
                        color={C.orange}
                        progress={vocabLearned > 0 ? (vocabMastered / vocabLearned) * 100 : 0}
                        index={1}
                    />

                    <StatCard
                        icon={CheckCircle}
                        title="דיוק"
                        value={`${vocabAccuracy}%`}
                        subtitle={`${vocabCorrect} נכון מתוך ${vocabTotal} ניסיונות`}
                        color={C.green}
                        index={2}
                    />
                </section>

                {/* English Questions Section */}
                <section style={{ marginBottom: 32 }}>
                    <motion.h2
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                        style={{ fontSize: 14, fontWeight: 600, color: C.muted, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}
                    >
                        <HelpCircle size={16} />
                        שאלות באנגלית
                    </motion.h2>

                    <StatCard
                        icon={ClipboardList}
                        title="שאלות שנענו"
                        value={englishAnswered}
                        subtitle={`מתוך ${totalQuestions} שאלות`}
                        color={C.purple}
                        progress={totalQuestions > 0 ? (englishAnswered / totalQuestions) * 100 : 0}
                        index={3}
                    />

                    <StatCard
                        icon={TrendingUp}
                        title="דיוק"
                        value={`${englishAccuracy}%`}
                        subtitle={`${englishCorrect} נכון מתוך ${englishTotal} ניסיונות`}
                        color={C.green}
                        index={4}
                    />
                </section>

                {/* Reset Data */}
                <section>
                    <motion.button
                        whileTap={{ scale: 0.96 }}
                        onClick={() => {
                            if (window.confirm('האם אתה בטוח שברצונך לאפס את כל הנתונים?')) {
                                localStorage.removeItem('wm_stats');
                                localStorage.removeItem('wm_english_stats');
                                window.location.reload();
                            }
                        }}
                        style={{
                            width: '100%',
                            padding: '14px 20px',
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: `1px solid ${C.red}50`,
                            borderRadius: RADIUS.md,
                            color: C.red,
                            fontSize: 14,
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 8
                        }}
                    >
                        <Trash2 size={18} />
                        איפוס כל הנתונים
                    </motion.button>
                </section>
            </main>
        </div>
    );
};

export default Stats;
