import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowRight, Brain, Volume2, RotateCcw, Trophy,
    ChevronLeft, Zap, TrendingUp, Clock
} from 'lucide-react';
import { C, GLASS, RADIUS, MOTION, HEADING } from '../styles/theme';
import { VOCABULARY } from '../data/vocabulary';
import { useTier } from '../contexts/TierContext';
import { useGamification } from '../contexts/GamificationContext';
import {
    loadSRData, saveSRData, getItemData, processReview,
    getNextReviewItems, getDueCount, getRetentionStats
} from '../services/spacedRepetition';

// ---------- Sub-components ----------

/** Session progress bar */
const ProgressBar = ({ current, total }) => {
    const pct = total > 0 ? (current / total) * 100 : 0;
    return (
        <div style={{
            width: '100%', height: 4, borderRadius: RADIUS.full,
            background: 'rgba(255,255,255,0.06)', overflow: 'hidden',
        }}>
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                style={{
                    height: '100%', borderRadius: RADIUS.full,
                    background: 'linear-gradient(90deg, #8B5CF6, #EC4899)',
                }}
            />
        </div>
    );
};

/** Grade button */
const GradeButton = ({ grade, label, sublabel, color, bgColor, borderColor, onClick, delay }) => (
    <motion.button
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, type: 'spring', stiffness: 300, damping: 24 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onClick(grade)}
        style={{
            flex: 1, padding: '12px 4px', borderRadius: RADIUS.md,
            background: bgColor, border: `1px solid ${borderColor}`,
            color, cursor: 'pointer', textAlign: 'center',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
            minWidth: 0,
        }}
    >
        <span style={{ fontSize: 15, fontWeight: 700 }}>{grade}</span>
        <span style={{ fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap' }}>{label}</span>
        {sublabel && <span style={{ fontSize: 9, opacity: 0.6, whiteSpace: 'nowrap' }}>{sublabel}</span>}
    </motion.button>
);

/** Stat pill for the summary screen */
const StatPill = ({ icon: Icon, label, value, color }) => (
    <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '12px 16px', borderRadius: RADIUS.md,
        background: C.surface, border: `1px solid ${C.border}`,
    }}>
        <Icon size={18} color={color} style={{ flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: 13, color: C.muted }}>{label}</p>
        </div>
        <span style={{ fontSize: 18, fontWeight: 700, color }}>{value}</span>
    </div>
);

// ---------- Grade palette ----------
const GRADES = [
    { grade: 1, label: 'שכחתי', sublabel: 'לא ידעתי', color: C.red, bg: `${C.red}1a`, border: `${C.red}4d` },
    { grade: 2, label: 'קשה', sublabel: 'זיהיתי', color: C.orange, bg: `${C.orange}1a`, border: `${C.orange}4d` },
    { grade: 3, label: 'בקושי', sublabel: 'נכון', color: C.yellow, bg: `${C.yellow}1a`, border: `${C.yellow}4d` },
    { grade: 4, label: 'טוב', sublabel: '', color: C.green, bg: `${C.green}1a`, border: `${C.green}4d` },
    { grade: 5, label: 'מושלם', sublabel: 'מיידי', color: C.purple, bg: `${C.purple}1a`, border: `${C.purple}4d` },
];

// ---------- Main Component ----------

const SpacedRepSection = () => {
    const [, navigate] = useLocation();
    const { isPremium, canAccessWord } = useTier();
    const { addXP, recordActivity } = useGamification();

    // State
    const [srData, setSrData] = useState(() => loadSRData());
    const [phase, setPhase] = useState('overview'); // overview | review | summary
    const [sessionItems, setSessionItems] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [flipped, setFlipped] = useState(false);
    const [sessionGrades, setSessionGrades] = useState([]); // { wordId, grade }[]
    const [sessionXpEarned, setSessionXpEarned] = useState(0);
    const sessionCompletedRef = useRef(false);

    // Available vocab (respecting free tier)
    const availableVocab = useMemo(() => {
        return isPremium ? VOCABULARY : VOCABULARY.filter(w => canAccessWord(w.id));
    }, [isPremium, canAccessWord]);

    const dueCount = useMemo(() => getDueCount(availableVocab, srData), [availableVocab, srData]);
    const retentionStats = useMemo(() => getRetentionStats(srData), [srData]);

    const currentWord = sessionItems[currentIndex] || null;

    // ---- Actions ----

    const startSession = useCallback(() => {
        const due = getNextReviewItems(availableVocab, srData, 20);
        if (due.length === 0) return;
        setSessionItems(due);
        setCurrentIndex(0);
        setFlipped(false);
        setSessionGrades([]);
        setSessionXpEarned(0);
        sessionCompletedRef.current = false;
        setPhase('review');
    }, [availableVocab, srData]);

    const handleGrade = useCallback((grade) => {
        if (!currentWord) return;

        // Update SR data
        const itemData = getItemData(srData, currentWord.id);
        const updated = processReview(itemData, grade);
        const newSrData = { ...srData, [currentWord.id]: updated };
        setSrData(newSrData);
        saveSRData(newSrData);

        // Award XP based on grade quality
        // Grade 4-5 (good/perfect recall) = 5 XP
        // Grade 3 (hard but correct) = 3 XP
        // Grade 1-2 (forgot/wrong) = 2 XP for effort
        const xpMap = { 1: 2, 2: 2, 3: 3, 4: 5, 5: 5 };
        const cardXp = xpMap[grade] || 2;
        addXP(cardXp);
        setSessionXpEarned(prev => prev + cardXp);

        // Record grade for summary
        setSessionGrades(prev => [...prev, { wordId: currentWord.id, grade, word: currentWord.english }]);

        // Advance
        const isLastCard = currentIndex + 1 >= sessionItems.length;
        if (!isLastCard) {
            setCurrentIndex(prev => prev + 1);
            setFlipped(false);
        } else {
            // Session complete — award bonus XP and record activity for streak
            const bonusXp = 10;
            addXP(bonusXp);
            setSessionXpEarned(prev => prev + bonusXp);
            recordActivity();
            sessionCompletedRef.current = true;
            setPhase('summary');
        }
    }, [currentWord, currentIndex, sessionItems, srData, addXP, recordActivity]);

    // Record activity when entering summary from early exit (back arrow during review)
    // This ensures streak is tracked even for partial sessions
    useEffect(() => {
        if (phase === 'summary' && sessionGrades.length > 0 && !sessionCompletedRef.current) {
            recordActivity();
            sessionCompletedRef.current = true;
        }
    }, [phase, sessionGrades.length, recordActivity]);

    // Keyboard shortcuts
    useEffect(() => {
        if (phase !== 'review') return;

        const handleKey = (e) => {
            if ((e.key === ' ' || e.key === 'Enter') && !flipped) {
                e.preventDefault();
                setFlipped(true);
            } else if (flipped) {
                const num = parseInt(e.key, 10);
                if (num >= 1 && num <= 5) {
                    e.preventDefault();
                    handleGrade(num);
                }
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [phase, flipped, handleGrade]);

    // ---------- RENDER ----------

    // ---- Overview screen ----
    if (phase === 'overview') {
        return (
            <div style={{ minHeight: '100vh', background: C.bg }}>
                {/* Header */}
                <header style={{
                    position: 'sticky', top: 0, zIndex: 10, ...GLASS.header,
                    padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12,
                }}>
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => navigate('/vocab-hub')}
                        style={{
                            width: 36, height: 36, borderRadius: RADIUS.full, background: 'transparent',
                            border: 'none', color: C.muted, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                    >
                        <ArrowRight size={20} />
                    </motion.button>
                    <Brain size={22} color={C.purple} />
                    <h1 style={{ ...HEADING.section, margin: 0, color: C.text }}>חזרה מרווחת</h1>
                </header>

                <main style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {/* Hero card */}
                    <motion.div
                        variants={MOTION.fadeUp}
                        initial="hidden"
                        animate="visible"
                        transition={{ duration: 0.3 }}
                        style={{
                            padding: 24, borderRadius: 20,
                            background: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(236,72,153,0.08))',
                            border: '1px solid rgba(139,92,246,0.15)',
                            textAlign: 'center',
                        }}
                    >
                        <div style={{
                            width: 56, height: 56, borderRadius: RADIUS.full, margin: '0 auto 16px',
                            background: 'rgba(139,92,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Brain size={28} color={C.purple} />
                        </div>
                        <h2 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 700, color: C.text }}>
                            {dueCount > 0 ? `${dueCount} מילים ממתינות לחזרה` : 'אין מילים לחזרה כרגע'}
                        </h2>
                        <p style={{ margin: 0, fontSize: 14, color: C.muted, lineHeight: 1.6 }}>
                            האלגוריתם מזהה מתי אתה עומד לשכוח מילה ומתזמן חזרות בדיוק בזמן הנכון
                        </p>
                    </motion.div>

                    {/* Start button */}
                    <motion.button
                        variants={MOTION.fadeUp}
                        initial="hidden"
                        animate="visible"
                        transition={{ duration: 0.3, delay: 0.05 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={startSession}
                        disabled={dueCount === 0}
                        style={{
                            width: '100%', padding: 16, borderRadius: RADIUS.md, border: 'none',
                            background: dueCount > 0
                                ? 'linear-gradient(135deg, #8B5CF6, #EC4899)'
                                : 'rgba(255,255,255,0.06)',
                            color: dueCount > 0 ? '#fff' : C.dim,
                            fontSize: 16, fontWeight: 700, cursor: dueCount > 0 ? 'pointer' : 'default',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                            boxShadow: dueCount > 0 ? '0 8px 24px rgba(139,92,246,0.25)' : 'none',
                            opacity: dueCount > 0 ? 1 : 0.5,
                        }}
                    >
                        <Zap size={20} />
                        {dueCount > 0 ? `התחל חזרה (${Math.min(dueCount, 20)} מילים)` : 'חזור מאוחר יותר'}
                    </motion.button>

                    {/* Stats */}
                    {retentionStats.totalReviewed > 0 && (
                        <motion.div
                            variants={MOTION.fadeUp}
                            initial="hidden"
                            animate="visible"
                            transition={{ duration: 0.3, delay: 0.1 }}
                            style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
                        >
                            <h3 style={{ ...HEADING.label, margin: '8px 0 4px' }}>סטטיסטיקות</h3>
                            <StatPill icon={Brain} label="מילים שנלמדו" value={retentionStats.totalReviewed} color={C.purple} />
                            <StatPill icon={TrendingUp} label="אחוז שימור" value={`${retentionStats.retentionRate}%`} color={C.green} />
                            <StatPill icon={RotateCcw} label="סה״כ חזרות" value={retentionStats.totalReviews} color={C.blue} />
                            <StatPill icon={Clock} label="מקדם קלות ממוצע" value={retentionStats.avgEaseFactor} color={C.orange} />
                        </motion.div>
                    )}

                    {/* Info */}
                    <motion.div
                        variants={MOTION.fadeUp}
                        initial="hidden"
                        animate="visible"
                        transition={{ duration: 0.3, delay: 0.15 }}
                        style={{
                            padding: 16, borderRadius: RADIUS.lg,
                            background: C.surface, border: `1px solid ${C.border}`,
                        }}
                    >
                        <h3 style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 700, color: C.text }}>איך זה עובד?</h3>
                        <ul style={{ margin: 0, paddingRight: 18, paddingLeft: 0, fontSize: 13, color: C.muted, lineHeight: 1.8 }}>
                            <li>תראה מילה באנגלית ותנסה להיזכר בתרגום</li>
                            <li>דרג את עצמך מ-1 (שכחתי) עד 5 (מושלם)</li>
                            <li>מילים קשות יחזרו מהר יותר, קלות — בהפרשים גדולים</li>
                            <li>חזור כל יום לתוצאות מיטביות</li>
                        </ul>
                    </motion.div>
                </main>
            </div>
        );
    }

    // ---- Review screen ----
    if (phase === 'review' && currentWord) {
        const itemSR = getItemData(srData, currentWord.id);
        const reviewCount = itemSR.totalReviews || 0;

        return (
            <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', flexDirection: 'column' }}>
                {/* Header */}
                <header style={{
                    ...GLASS.header, padding: '12px 20px',
                    display: 'flex', alignItems: 'center', gap: 12,
                }}>
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setPhase('summary')}
                        style={{
                            width: 36, height: 36, borderRadius: RADIUS.full, background: 'transparent',
                            border: 'none', color: C.muted, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                    >
                        <ArrowRight size={20} />
                    </motion.button>
                    <div style={{ flex: 1 }}>
                        <ProgressBar current={currentIndex + 1} total={sessionItems.length} />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: C.muted, whiteSpace: 'nowrap' }}>
                        {currentIndex + 1}/{sessionItems.length}
                    </span>
                </header>

                {/* Card area */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative' }}>
                    {/* Glow */}
                    <div style={{
                        position: 'absolute', top: '45%', left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 220, height: 220,
                        background: 'rgba(139,92,246,0.08)',
                        borderRadius: '50%', filter: 'blur(80px)',
                        pointerEvents: 'none',
                    }} />

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentWord.id}
                            initial={{ opacity: 0, scale: 0.92, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.92, y: -10 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                            onClick={() => !flipped && setFlipped(true)}
                            style={{
                                width: '100%', maxWidth: 340,
                                minHeight: 320,
                                ...GLASS.card,
                                boxShadow: C.shadowMd,
                                display: 'flex', flexDirection: 'column',
                                padding: 28, cursor: 'pointer',
                                position: 'relative', zIndex: 1,
                            }}
                        >
                            {/* POS badge + review count */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                                <div style={{
                                    ...GLASS.button, padding: '5px 10px', borderRadius: RADIUS.full,
                                    display: 'flex', alignItems: 'center', gap: 5,
                                }}>
                                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: C.purple }} />
                                    <span style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: 1 }}>
                                        {currentWord.pos || 'general'}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    {reviewCount > 0 && (
                                        <span style={{ fontSize: 10, color: C.dim }}>
                                            x{reviewCount}
                                        </span>
                                    )}
                                    <motion.button
                                        whileTap={{ scale: 0.96 }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (window.speechSynthesis) {
                                                const u = new SpeechSynthesisUtterance(currentWord.english);
                                                u.lang = 'en-US';
                                                window.speechSynthesis.speak(u);
                                            }
                                        }}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
                                    >
                                        <Volume2 size={18} color={C.dim} />
                                    </motion.button>
                                </div>
                            </div>

                            {/* Content */}
                            <div style={{
                                flex: 1, display: 'flex', flexDirection: 'column',
                                alignItems: 'center', justifyContent: 'center', textAlign: 'center',
                            }} dir="ltr">
                                <AnimatePresence mode="wait">
                                    {!flipped ? (
                                        <motion.div
                                            key="front"
                                            initial={{ opacity: 0, rotateY: 80 }}
                                            animate={{ opacity: 1, rotateY: 0 }}
                                            exit={{ opacity: 0, rotateY: -80 }}
                                            transition={{ duration: 0.3 }}
                                            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                                        >
                                            <h1 style={{
                                                fontSize: 38, fontWeight: 500, margin: '0 0 12px',
                                                fontFamily: 'Manrope, sans-serif', color: C.text, letterSpacing: -0.5,
                                            }}>
                                                {currentWord.english}
                                            </h1>
                                            {currentWord.phonetic && (
                                                <p style={{ fontSize: 16, color: C.dim, fontFamily: 'monospace', fontWeight: 300 }}>
                                                    {currentWord.phonetic}
                                                </p>
                                            )}
                                            <p style={{ fontSize: 12, color: C.dim, marginTop: 24, opacity: 0.5 }}>
                                                הקש לחשיפת התרגום
                                            </p>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="back"
                                            initial={{ opacity: 0, rotateY: 80 }}
                                            animate={{ opacity: 1, rotateY: 0 }}
                                            exit={{ opacity: 0, rotateY: -80 }}
                                            transition={{ duration: 0.3 }}
                                            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                                        >
                                            <h1 style={{ fontSize: 32, fontWeight: 700, margin: '0 0 12px' }} dir="rtl">
                                                {currentWord.hebrew}
                                            </h1>
                                            <p style={{ fontSize: 18, color: C.muted, fontFamily: 'Manrope' }}>
                                                {currentWord.english}
                                            </p>
                                            {currentWord.example && (
                                                <p style={{ fontSize: 13, color: C.dim, marginTop: 16, fontStyle: 'italic', maxWidth: 280 }}>
                                                    &ldquo;{currentWord.example}&rdquo;
                                                </p>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Grade buttons — visible only when flipped */}
                    <AnimatePresence>
                        {flipped && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                transition={{ duration: 0.25 }}
                                style={{
                                    width: '100%', maxWidth: 340, marginTop: 24,
                                    display: 'flex', gap: 6,
                                }}
                            >
                                {GRADES.map((g, i) => (
                                    <GradeButton
                                        key={g.grade}
                                        grade={g.grade}
                                        label={g.label}
                                        sublabel={g.sublabel}
                                        color={g.color}
                                        bgColor={g.bg}
                                        borderColor={g.border}
                                        onClick={handleGrade}
                                        delay={i * 0.04}
                                    />
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Tap hint when not flipped */}
                    {!flipped && (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.4 }}
                            style={{ fontSize: 12, color: C.dim, marginTop: 24, textAlign: 'center' }}
                        >
                            רווח/Enter לחשיפה, מקשים 1-5 לדירוג
                        </motion.p>
                    )}
                </div>
            </div>
        );
    }

    // ---- Summary screen ----
    if (phase === 'summary') {
        const totalGraded = sessionGrades.length;
        const avgGrade = totalGraded > 0
            ? Math.round((sessionGrades.reduce((s, g) => s + g.grade, 0) / totalGraded) * 10) / 10
            : 0;
        const correctCount = sessionGrades.filter(g => g.grade >= 3).length;
        const retention = totalGraded > 0 ? Math.round((correctCount / totalGraded) * 100) : 0;

        // Grade distribution
        const dist = [0, 0, 0, 0, 0];
        sessionGrades.forEach(g => { dist[g.grade - 1]++; });

        const newDueCount = getDueCount(availableVocab, srData);

        return (
            <div style={{ minHeight: '100vh', background: C.bg }}>
                <header style={{
                    ...GLASS.header, padding: '16px 20px',
                    display: 'flex', alignItems: 'center', gap: 12,
                }}>
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => navigate('/vocab-hub')}
                        style={{
                            width: 36, height: 36, borderRadius: RADIUS.full, background: 'transparent',
                            border: 'none', color: C.muted, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                    >
                        <ArrowRight size={20} />
                    </motion.button>
                    <h1 style={{ ...HEADING.section, margin: 0, color: C.text }}>סיכום חזרה</h1>
                </header>

                <main style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {/* Trophy hero */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                        style={{
                            padding: 28, borderRadius: 20, textAlign: 'center',
                            background: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(236,72,153,0.08))',
                            border: '1px solid rgba(139,92,246,0.15)',
                        }}
                    >
                        <Trophy size={40} color={C.orange} style={{ marginBottom: 12 }} />
                        <h2 style={{ margin: '0 0 6px', fontSize: 24, fontWeight: 700, color: C.text }}>
                            {retention >= 80 ? 'מצוין!' : retention >= 50 ? 'עבודה טובה!' : 'המשך לתרגל!'}
                        </h2>
                        <p style={{ margin: 0, fontSize: 14, color: C.muted }}>
                            חזרת על {totalGraded} מילים, שימור {retention}%
                        </p>
                    </motion.div>

                    {/* Stats */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <StatPill icon={Brain} label="מילים שנבחנו" value={totalGraded} color={C.purple} />
                        <StatPill icon={TrendingUp} label="ציון ממוצע" value={avgGrade} color={C.blue} />
                        <StatPill icon={Zap} label="שימור בחזרה" value={`${retention}%`} color={C.green} />
                        {sessionXpEarned > 0 && (
                            <StatPill icon={Zap} label="XP שנצבר" value={`+${sessionXpEarned}`} color={C.orange} />
                        )}
                    </div>

                    {/* Grade distribution */}
                    <div style={{
                        padding: 16, borderRadius: RADIUS.lg,
                        background: C.surface, border: `1px solid ${C.border}`,
                    }}>
                        <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700, color: C.text }}>התפלגות דירוגים</h3>
                        <div style={{ display: 'flex', gap: 6 }}>
                            {GRADES.map((g, i) => {
                                const pct = totalGraded > 0 ? (dist[i] / totalGraded) * 100 : 0;
                                return (
                                    <div key={g.grade} style={{ flex: 1, textAlign: 'center' }}>
                                        <div style={{
                                            height: 48, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', marginBottom: 4,
                                        }}>
                                            <motion.div
                                                initial={{ height: 0 }}
                                                animate={{ height: `${Math.max(4, pct)}%` }}
                                                transition={{ delay: i * 0.05, type: 'spring', stiffness: 120 }}
                                                style={{
                                                    width: '100%', borderRadius: 4,
                                                    background: g.color, maxWidth: 24, minHeight: 4,
                                                }}
                                            />
                                        </div>
                                        <span style={{ fontSize: 11, fontWeight: 700, color: g.color }}>{dist[i]}</span>
                                        <p style={{ margin: '2px 0 0', fontSize: 9, color: C.dim }}>{g.label}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                        {newDueCount > 0 && (
                            <motion.button
                                whileTap={{ scale: 0.97 }}
                                onClick={() => {
                                    setSrData(loadSRData());
                                    startSession();
                                }}
                                style={{
                                    flex: 1, padding: 14, borderRadius: RADIUS.md, border: 'none',
                                    background: C.purple,
                                    color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                    boxShadow: '0 4px 16px rgba(139,92,246,0.25)',
                                }}
                            >
                                <RotateCcw size={18} /> עוד סבב ({Math.min(newDueCount, 20)})
                            </motion.button>
                        )}
                        <motion.button
                            whileTap={{ scale: 0.97 }}
                            onClick={() => navigate('/vocab-hub')}
                            style={{
                                flex: 1, padding: 14, borderRadius: RADIUS.md,
                                ...GLASS.card, color: C.text, fontSize: 15, fontWeight: 600,
                                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                            }}
                        >
                            <ChevronLeft size={18} /> חזרה לאוצר מילים
                        </motion.button>
                    </div>
                </main>
            </div>
        );
    }

    // Fallback (shouldn't happen)
    return null;
};

export default SpacedRepSection;
