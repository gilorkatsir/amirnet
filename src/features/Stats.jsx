import React, { useMemo } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import {
    ArrowRight, Flame, Zap, Target, BookOpen, Brain,
    Trophy, Award, CheckCircle, TrendingUp, RotateCcw,
    GraduationCap, HelpCircle, Trash2, Star, Clock
} from 'lucide-react';
import { C, GLASS, RADIUS, SURFACE, HEADING, SPACING } from '../styles/theme';
import { getDailyStats, getTodayKey, getLastNDaysAccuracy } from '../utils/dailyStats';
import { useStatsContext } from '../contexts/StatsContext';
import { useGamification } from '../contexts/GamificationContext';
import useDerivedStats from '../hooks/useStats';
import { ENGLISH_QUESTIONS, getQuestionsByType } from '../data/englishQuestions';
import { loadSRData, getRetentionStats } from '../services/spacedRepetition';

/* ---- SVG Progress Ring ---- */
const ProgressRing = ({ progress, size = 80, stroke = 6, color = C.purple, children }) => {
    const radius = (size - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (Math.min(progress, 1) * circumference);

    return (
        <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
            <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                <circle
                    cx={size / 2} cy={size / 2} r={radius}
                    fill="none" stroke={C.border} strokeWidth={stroke}
                />
                <motion.circle
                    cx={size / 2} cy={size / 2} r={radius}
                    fill="none" stroke={color} strokeWidth={stroke}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                />
            </svg>
            <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexDirection: 'column',
            }}>
                {children}
            </div>
        </div>
    );
};

/* ---- Mini bar chart ---- */
const MiniBarChart = ({ data, height = 48, color = C.purple }) => {
    const max = Math.max(...data.map(d => d.value), 1);
    return (
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height }}>
            {data.map((d, i) => (
                <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max((d.value / max) * 100, 4)}%` }}
                    transition={{ duration: 0.6, delay: i * 0.05, ease: 'easeOut' }}
                    title={d.label}
                    style={{
                        flex: 1,
                        borderRadius: 3,
                        background: d.value > 0 ? color : 'rgba(255,255,255,0.04)',
                        opacity: d.value > 0 ? (0.5 + (d.value / max) * 0.5) : 0.3,
                        minHeight: 3,
                    }}
                />
            ))}
        </div>
    );
};

/* ---- Section header ---- */
const SectionHeader = ({ icon: Icon, title, color, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay }}
        style={{
            display: 'flex', alignItems: 'center', gap: 8,
            marginBottom: 12, paddingBottom: 8,
            borderBottom: `1px solid ${C.border}`,
        }}
    >
        <div style={{
            width: 28, height: 28, borderRadius: RADIUS.sm,
            background: `${color}18`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
            <Icon size={15} color={color} />
        </div>
        <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.text }}>{title}</h2>
    </motion.div>
);

/* ---- Stagger container ---- */
const stagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.06 } },
};
const fadeUp = {
    hidden: { opacity: 0, y: 14 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

/* ============== STATS PAGE ============== */
const Stats = () => {
    const [, navigate] = useLocation();
    const { stats, englishStats, totalWords, totalQuestions, resetStats } = useStatsContext();
    const {
        totalXp, level, levelTitle, levelProgress,
        xpInCurrentLevel, xpNeededForNextLevel,
        currentStreak, longestStreak, badges, totalSessions,
        BADGE_DEFINITIONS,
    } = useGamification();

    // Vocab stats
    const {
        learnedCount: vocabLearned,
        masteredCount: vocabMastered,
        totalCorrect: vocabCorrect,
        totalAttempts: vocabTotal,
        accuracy: vocabAccuracy,
    } = useDerivedStats(stats, totalWords);

    // English stats
    const englishAnswered = Object.keys(englishStats).length;
    const englishCorrect = Object.values(englishStats).reduce((acc, s) => acc + (s.correct || 0), 0);
    const englishTotal = Object.values(englishStats).reduce((acc, s) => acc + (s.attempts || 0), 0);
    const englishAccuracy = englishTotal > 0 ? Math.round((englishCorrect / englishTotal) * 100) : 0;

    // Per-section exam readiness
    const sectionReadiness = useMemo(() => {
        const types = ['Sentence Completion', 'Restatement', 'Reading Comprehension'];
        return types.map(type => {
            const typeQuestions = getQuestionsByType(type);
            let correct = 0, attempts = 0, answered = 0;
            typeQuestions.forEach(q => {
                const s = englishStats[q.id];
                if (s) {
                    correct += s.correct || 0;
                    attempts += s.attempts || 0;
                    answered++;
                }
            });
            return {
                type,
                total: typeQuestions.length,
                answered,
                correct,
                attempts,
                accuracy: attempts > 0 ? Math.round((correct / attempts) * 100) : 0,
                coverage: typeQuestions.length > 0 ? Math.round((answered / typeQuestions.length) * 100) : 0,
            };
        });
    }, [englishStats]);

    // Today's activity from daily stats
    const todayData = useMemo(() => {
        const allDaily = getDailyStats();
        const today = getTodayKey();
        const d = allDaily[today] || { vocab: { correct: 0, total: 0 }, english: { correct: 0, total: 0 } };
        const totalToday = (d.vocab?.total || 0) + (d.english?.total || 0);
        const correctToday = (d.vocab?.correct || 0) + (d.english?.correct || 0);
        return {
            totalAnswers: totalToday,
            correctAnswers: correctToday,
            accuracy: totalToday > 0 ? Math.round((correctToday / totalToday) * 100) : 0,
            vocabAnswers: d.vocab?.total || 0,
            englishAnswers: d.english?.total || 0,
        };
    }, []);

    // 7-day chart data
    const weekData = useMemo(() => {
        const days = getLastNDaysAccuracy(7);
        return days.map(d => ({ value: d.accuracy || 0, label: d.dayName }));
    }, []);

    // Spaced repetition stats
    const srStats = useMemo(() => {
        const srData = loadSRData();
        return getRetentionStats(srData);
    }, []);

    // Overall accuracy (combined)
    const overallAccuracy = useMemo(() => {
        const total = vocabTotal + englishTotal;
        const correct = vocabCorrect + englishCorrect;
        return total > 0 ? Math.round((correct / total) * 100) : 0;
    }, [vocabTotal, vocabCorrect, englishTotal, englishCorrect]);

    const typeLabels = {
        'Sentence Completion': { he: 'השלמת משפטים', color: C.purple },
        'Restatement': { he: 'ניסוח מחדש', color: C.orange },
        'Reading Comprehension': { he: 'הבנת הנקרא', color: C.pink },
    };

    return (
        <div style={{ minHeight: '100vh', background: C.bg, color: C.text }}>
            {/* Header */}
            <header style={{
                position: 'sticky', top: 0, zIndex: 10,
                ...GLASS.header,
                padding: '14px 20px',
                display: 'flex', alignItems: 'center', gap: 14,
            }}>
                <button
                    onClick={() => navigate('/')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8 }}
                >
                    <ArrowRight size={22} color={C.muted} />
                </button>
                <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: C.text }}>
                    סטטיסטיקות
                </h1>
            </header>

            <main style={{ padding: '16px 16px 100px' }}>
                {/* =========== TODAY'S ACTIVITY =========== */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    style={{
                        ...GLASS.card,
                        padding: 20,
                        marginBottom: 20,
                        background: 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(236,72,153,0.06))',
                        border: '1px solid rgba(139,92,246,0.12)',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                        <Zap size={16} color={C.orange} />
                        <span style={{ fontSize: 13, fontWeight: 700, color: C.muted }}>פעילות היום</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <ProgressRing
                            progress={todayData.accuracy / 100}
                            size={72}
                            stroke={5}
                            color={todayData.accuracy >= 70 ? C.green : todayData.accuracy >= 40 ? C.orange : C.purple}
                        >
                            <span style={{ fontSize: 18, fontWeight: 700, color: C.text }}>
                                {todayData.totalAnswers > 0 ? `${todayData.accuracy}%` : '—'}
                            </span>
                        </ProgressRing>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', gap: 16, marginBottom: 8 }}>
                                <div>
                                    <div style={{ fontSize: 22, fontWeight: 700, color: C.text }}>{todayData.totalAnswers}</div>
                                    <div style={{ fontSize: 11, color: C.muted }}>תשובות</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: 22, fontWeight: 700, color: C.green }}>{todayData.correctAnswers}</div>
                                    <div style={{ fontSize: 11, color: C.muted }}>נכונות</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 8, fontSize: 11, color: C.dim }}>
                                <span>אוצר מילים: {todayData.vocabAnswers}</span>
                                <span>|</span>
                                <span>אנגלית: {todayData.englishAnswers}</span>
                            </div>
                        </div>
                    </div>

                    {/* 7-day mini chart */}
                    <div style={{ marginTop: 16, paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                            <span style={{ fontSize: 11, color: C.dim }}>7 ימים אחרונים</span>
                            <span style={{ fontSize: 11, color: C.dim }}>דיוק</span>
                        </div>
                        <MiniBarChart data={weekData} height={36} color={C.purple} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                            {weekData.map((d, i) => (
                                <span key={i} style={{ fontSize: 9, color: C.dim, flex: 1, textAlign: 'center' }}>{d.label}</span>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* =========== OVERVIEW HERO CARDS =========== */}
                <motion.div
                    variants={stagger}
                    initial="hidden"
                    animate="visible"
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: 10,
                        marginBottom: 20,
                    }}
                >
                    {/* Level */}
                    <motion.div variants={fadeUp} style={{ ...GLASS.card, padding: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                            <Star size={14} color={C.purple} />
                            <span style={{ fontSize: 11, fontWeight: 600, color: C.muted }}>רמה</span>
                        </div>
                        <div style={{ fontSize: 28, fontWeight: 700, color: C.text, marginBottom: 2 }}>{level}</div>
                        <div style={{ fontSize: 12, color: C.purple, fontWeight: 600, marginBottom: 8 }}>{levelTitle}</div>
                        <div style={{ height: 4, background: C.border, borderRadius: RADIUS.full, overflow: 'hidden' }}>
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.round(levelProgress * 100)}%` }}
                                transition={{ duration: 1, ease: 'easeOut' }}
                                style={{ height: '100%', borderRadius: RADIUS.full, background: C.purple }}
                            />
                        </div>
                        <div style={{ fontSize: 10, color: C.dim, marginTop: 4 }}>
                            {xpInCurrentLevel}/{xpNeededForNextLevel} XP
                        </div>
                    </motion.div>

                    {/* Streak */}
                    <motion.div variants={fadeUp} style={{ ...GLASS.card, padding: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                            <Flame size={14} color={C.orange} />
                            <span style={{ fontSize: 11, fontWeight: 600, color: C.muted }}>רצף</span>
                        </div>
                        <div style={{ fontSize: 28, fontWeight: 700, color: C.text, marginBottom: 2 }}>
                            {currentStreak}
                            <span style={{ fontSize: 14, fontWeight: 500, color: C.muted, marginRight: 4 }}> ימים</span>
                        </div>
                        <div style={{ fontSize: 12, color: C.dim }}>
                            שיא: {longestStreak} ימים
                        </div>
                    </motion.div>

                    {/* XP */}
                    <motion.div variants={fadeUp} style={{ ...GLASS.card, padding: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                            <Zap size={14} color={C.cyan} />
                            <span style={{ fontSize: 11, fontWeight: 600, color: C.muted }}>ניסיון</span>
                        </div>
                        <div style={{ fontSize: 28, fontWeight: 700, color: C.text }}>{totalXp.toLocaleString()}</div>
                        <div style={{ fontSize: 12, color: C.dim }}>XP</div>
                    </motion.div>

                    {/* Accuracy */}
                    <motion.div variants={fadeUp} style={{ ...GLASS.card, padding: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                            <Target size={14} color={C.green} />
                            <span style={{ fontSize: 11, fontWeight: 600, color: C.muted }}>דיוק כולל</span>
                        </div>
                        <div style={{
                            fontSize: 28, fontWeight: 700,
                            color: overallAccuracy >= 70 ? C.green : overallAccuracy >= 40 ? C.orange : C.text,
                        }}>
                            {overallAccuracy}%
                        </div>
                        <div style={{ fontSize: 12, color: C.dim }}>
                            {vocabCorrect + englishCorrect} / {vocabTotal + englishTotal}
                        </div>
                    </motion.div>
                </motion.div>

                {/* =========== VOCABULARY =========== */}
                <motion.section
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    style={{ ...GLASS.card, padding: 18, marginBottom: 16 }}
                >
                    <SectionHeader icon={BookOpen} title="אוצר מילים" color={C.pink} delay={0.2} />

                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <ProgressRing
                            progress={totalWords > 0 ? vocabLearned / totalWords : 0}
                            size={88}
                            stroke={6}
                            color={C.pink}
                        >
                            <span style={{ fontSize: 20, fontWeight: 700, color: C.text }}>{vocabLearned}</span>
                            <span style={{ fontSize: 9, color: C.dim }}>/ {totalWords}</span>
                        </ProgressRing>

                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {/* Mastered */}
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                    <span style={{ fontSize: 12, color: C.muted }}>נשלטו (רמה 4+)</span>
                                    <span style={{ fontSize: 13, fontWeight: 700, color: C.orange }}>{vocabMastered}</span>
                                </div>
                                <div style={{ height: 4, background: C.border, borderRadius: RADIUS.full, overflow: 'hidden' }}>
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${vocabLearned > 0 ? (vocabMastered / vocabLearned) * 100 : 0}%` }}
                                        transition={{ duration: 0.8, ease: 'easeOut' }}
                                        style={{ height: '100%', borderRadius: RADIUS.full, background: C.orange }}
                                    />
                                </div>
                            </div>

                            {/* Accuracy */}
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                    <span style={{ fontSize: 12, color: C.muted }}>דיוק</span>
                                    <span style={{ fontSize: 13, fontWeight: 700, color: C.green }}>{vocabAccuracy}%</span>
                                </div>
                                <div style={{ height: 4, background: C.border, borderRadius: RADIUS.full, overflow: 'hidden' }}>
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${vocabAccuracy}%` }}
                                        transition={{ duration: 0.8, ease: 'easeOut' }}
                                        style={{ height: '100%', borderRadius: RADIUS.full, background: C.green }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: 12, display: 'flex', gap: 8, fontSize: 11, color: C.dim }}>
                        <span>{vocabCorrect} נכון</span>
                        <span>|</span>
                        <span>{vocabTotal - vocabCorrect} שגוי</span>
                        <span>|</span>
                        <span>{vocabTotal} ניסיונות</span>
                    </div>
                </motion.section>

                {/* =========== ENGLISH QUESTIONS =========== */}
                <motion.section
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                    style={{ ...GLASS.card, padding: 18, marginBottom: 16 }}
                >
                    <SectionHeader icon={HelpCircle} title="שאלות באנגלית" color={C.purple} delay={0.3} />

                    {/* Overview row */}
                    <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 24, fontWeight: 700, color: C.text }}>{englishAnswered}</div>
                            <div style={{ fontSize: 11, color: C.muted }}>נענו</div>
                        </div>
                        <div style={{ width: 1, background: C.border }} />
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 24, fontWeight: 700, color: C.text }}>{totalQuestions}</div>
                            <div style={{ fontSize: 11, color: C.muted }}>סה״כ</div>
                        </div>
                        <div style={{ width: 1, background: C.border }} />
                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                fontSize: 24, fontWeight: 700,
                                color: englishAccuracy >= 70 ? C.green : englishAccuracy >= 40 ? C.orange : C.text,
                            }}>
                                {englishAccuracy}%
                            </div>
                            <div style={{ fontSize: 11, color: C.muted }}>דיוק</div>
                        </div>
                    </div>

                    {/* Coverage bar */}
                    <div style={{ marginBottom: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                            <span style={{ fontSize: 12, color: C.muted }}>כיסוי שאלות</span>
                            <span style={{ fontSize: 12, fontWeight: 600, color: C.purple }}>
                                {totalQuestions > 0 ? Math.round((englishAnswered / totalQuestions) * 100) : 0}%
                            </span>
                        </div>
                        <div style={{ height: 4, background: C.border, borderRadius: RADIUS.full, overflow: 'hidden' }}>
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${totalQuestions > 0 ? (englishAnswered / totalQuestions) * 100 : 0}%` }}
                                transition={{ duration: 0.8, ease: 'easeOut' }}
                                style={{ height: '100%', borderRadius: RADIUS.full, background: C.purple }}
                            />
                        </div>
                    </div>

                    {/* Per-section breakdown */}
                    {sectionReadiness.map((sec, i) => {
                        const meta = typeLabels[sec.type] || { he: sec.type, color: C.muted };
                        return (
                            <div key={sec.type} style={{
                                padding: '10px 12px',
                                background: 'rgba(0,0,0,0.15)',
                                borderRadius: RADIUS.sm,
                                marginBottom: i < sectionReadiness.length - 1 ? 8 : 0,
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                    <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{meta.he}</span>
                                    <span style={{
                                        fontSize: 14, fontWeight: 700,
                                        color: sec.accuracy >= 70 ? C.green : sec.accuracy >= 50 ? C.orange : C.red,
                                    }}>
                                        {sec.accuracy}%
                                    </span>
                                </div>
                                <div style={{ height: 3, background: C.border, borderRadius: RADIUS.full, overflow: 'hidden', marginBottom: 4 }}>
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${sec.accuracy}%` }}
                                        transition={{ duration: 0.8, ease: 'easeOut' }}
                                        style={{ height: '100%', borderRadius: RADIUS.full, background: meta.color }}
                                    />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: C.dim }}>
                                    <span>{sec.correct}/{sec.attempts} נכון</span>
                                    <span>כיסוי {sec.answered}/{sec.total}</span>
                                </div>
                            </div>
                        );
                    })}
                </motion.section>

                {/* =========== SPACED REPETITION =========== */}
                {srStats.totalReviewed > 0 && (
                    <motion.section
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.4 }}
                        style={{ ...GLASS.card, padding: 18, marginBottom: 16 }}
                    >
                        <SectionHeader icon={Brain} title="חזרה מרווחת" color={C.blue} delay={0.4} />

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: 10,
                        }}>
                            <div style={{
                                padding: 12, borderRadius: RADIUS.sm,
                                background: 'rgba(0,0,0,0.15)', textAlign: 'center',
                            }}>
                                <div style={{ fontSize: 22, fontWeight: 700, color: C.green }}>{srStats.retentionRate}%</div>
                                <div style={{ fontSize: 11, color: C.muted }}>אחוז שימור</div>
                            </div>
                            <div style={{
                                padding: 12, borderRadius: RADIUS.sm,
                                background: 'rgba(0,0,0,0.15)', textAlign: 'center',
                            }}>
                                <div style={{ fontSize: 22, fontWeight: 700, color: C.blue }}>{srStats.totalReviews}</div>
                                <div style={{ fontSize: 11, color: C.muted }}>סה״כ חזרות</div>
                            </div>
                            <div style={{
                                padding: 12, borderRadius: RADIUS.sm,
                                background: 'rgba(0,0,0,0.15)', textAlign: 'center',
                            }}>
                                <div style={{ fontSize: 22, fontWeight: 700, color: C.purple }}>{srStats.totalReviewed}</div>
                                <div style={{ fontSize: 11, color: C.muted }}>מילים שנלמדו</div>
                            </div>
                            <div style={{
                                padding: 12, borderRadius: RADIUS.sm,
                                background: 'rgba(0,0,0,0.15)', textAlign: 'center',
                            }}>
                                <div style={{ fontSize: 22, fontWeight: 700, color: C.orange }}>{srStats.avgEaseFactor}</div>
                                <div style={{ fontSize: 11, color: C.muted }}>מקדם קלות</div>
                            </div>
                        </div>
                    </motion.section>
                )}

                {/* =========== BADGES / GAMIFICATION =========== */}
                <motion.section
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.5 }}
                    style={{ ...GLASS.card, padding: 18, marginBottom: 16 }}
                >
                    <SectionHeader icon={Award} title="הישגים" color={C.orange} delay={0.5} />

                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16,
                        fontSize: 13, color: C.muted,
                    }}>
                        <Trophy size={16} color={C.orange} />
                        <span>{badges.length} מתוך {BADGE_DEFINITIONS.length} הישגים הושגו</span>
                    </div>

                    {/* Progress bar for badges */}
                    <div style={{ height: 4, background: C.border, borderRadius: RADIUS.full, overflow: 'hidden', marginBottom: 16 }}>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${BADGE_DEFINITIONS.length > 0 ? (badges.length / BADGE_DEFINITIONS.length) * 100 : 0}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            style={{ height: '100%', borderRadius: RADIUS.full, background: C.orange }}
                        />
                    </div>

                    {/* Badge grid */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: 8,
                    }}>
                        {BADGE_DEFINITIONS.map((def) => {
                            const earned = badges.find(b => b.id === def.id);
                            return (
                                <motion.div
                                    key={def.id}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.3 }}
                                    style={{
                                        padding: '10px 6px',
                                        borderRadius: RADIUS.sm,
                                        background: earned ? 'rgba(251,146,60,0.08)' : 'rgba(0,0,0,0.15)',
                                        border: earned ? `1px solid rgba(251,146,60,0.2)` : `1px solid ${C.border}`,
                                        textAlign: 'center',
                                        opacity: earned ? 1 : 0.4,
                                    }}
                                >
                                    <div style={{ fontSize: 20, marginBottom: 4 }}>
                                        {earned ? '\u2B50' : '\uD83D\uDD12'}
                                    </div>
                                    <div style={{
                                        fontSize: 10, fontWeight: 700,
                                        color: earned ? C.text : C.dim,
                                        marginBottom: 2,
                                    }}>
                                        {def.name}
                                    </div>
                                    <div style={{ fontSize: 9, color: C.dim, lineHeight: 1.3 }}>
                                        {def.desc}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Session count */}
                    <div style={{
                        marginTop: 14, paddingTop: 12, borderTop: `1px solid ${C.border}`,
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        fontSize: 12, color: C.dim,
                    }}>
                        <span>סה״כ תרגולים</span>
                        <span style={{ fontWeight: 700, color: C.muted }}>{totalSessions}</span>
                    </div>
                </motion.section>

                {/* =========== RESET =========== */}
                <motion.section
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                >
                    <motion.button
                        whileTap={{ scale: 0.96 }}
                        onClick={() => {
                            if (window.confirm('האם אתה בטוח שברצונך לאפס את כל הנתונים?')) {
                                resetStats('all');
                            }
                        }}
                        style={{
                            width: '100%',
                            padding: '14px 20px',
                            background: 'rgba(239, 68, 68, 0.08)',
                            border: `1px solid rgba(239, 68, 68, 0.15)`,
                            borderRadius: RADIUS.md,
                            color: C.red,
                            fontSize: 14,
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 8,
                        }}
                    >
                        <Trash2 size={16} />
                        איפוס כל הנתונים
                    </motion.button>
                </motion.section>
            </main>
        </div>
    );
};

export default Stats;
