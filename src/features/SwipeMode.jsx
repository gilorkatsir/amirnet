import React, { useState, useMemo, useCallback, useReducer } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowRight, RotateCcw, Home, Check, X, Trophy, Target, Flame
} from 'lucide-react';
import { C, GLASS, RADIUS, HEADING, MOTION } from '../styles/theme';
import { VOCABULARY } from '../data/vocabulary';
import { useStatsContext } from '../contexts/StatsContext';
import { useTier } from '../contexts/TierContext';
import { selectWithVariety } from '../utils/smartSelection';
import { playCorrect, playIncorrect } from '../utils/sounds';
import SwipeCard from '../components/SwipeCard';

const SWIPE_SESSION_SIZE = 20;

const SwipeMode = () => {
    const [, navigate] = useLocation();
    const { stats, calculatePriority, updateWordProgress } = useStatsContext();
    const { isPremium, canAccessWord } = useTier();
    const [sessionKey, refreshSession] = useReducer(x => x + 1, 0);

    // Build session words — refreshes on restart
    const sessionWords = useMemo(() => {
        const pool = isPremium
            ? VOCABULARY
            : VOCABULARY.filter(w => canAccessWord(w.id));
        const sorted = [...pool].sort((a, b) => calculatePriority(b.id) - calculatePriority(a.id));
        const topSlice = sorted.slice(0, Math.min(sorted.length, SWIPE_SESSION_SIZE * 3));
        return selectWithVariety(topSlice, Math.min(SWIPE_SESSION_SIZE, pool.length), {
            type: 'vocab', diversifyBy: 'category', record: true,
        });
    }, [isPremium, canAccessWord, calculatePriority, sessionKey]);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [results, setResults] = useState({ knew: [], didntKnow: [] });
    const [isComplete, setIsComplete] = useState(false);

    const totalWords = sessionWords.length;
    const progress = totalWords > 0 ? (currentIndex / totalWords) * 100 : 0;

    const advance = useCallback(() => {
        if (currentIndex + 1 >= totalWords) {
            setIsComplete(true);
        } else {
            setCurrentIndex(i => i + 1);
        }
    }, [currentIndex, totalWords]);

    const handleSwipeRight = useCallback(() => {
        const word = sessionWords[currentIndex];
        playCorrect();
        updateWordProgress(word.id, true);
        setResults(prev => ({ ...prev, knew: [...prev.knew, word] }));
        advance();
    }, [sessionWords, currentIndex, updateWordProgress, advance]);

    const handleSwipeLeft = useCallback(() => {
        const word = sessionWords[currentIndex];
        playIncorrect();
        updateWordProgress(word.id, false);
        setResults(prev => ({ ...prev, didntKnow: [...prev.didntKnow, word] }));
        advance();
    }, [sessionWords, currentIndex, updateWordProgress, advance]);

    const handleRestart = useCallback(() => {
        setCurrentIndex(0);
        setResults({ knew: [], didntKnow: [] });
        setIsComplete(false);
        refreshSession();
    }, []);

    const handleReviewMistakes = useCallback(() => {
        // This would ideally re-queue only the missed words, but for simplicity
        // we just restart. The missed words are already tracked in stats.
        navigate('/');
    }, [navigate]);

    // Summary screen
    if (isComplete) {
        const knewCount = results.knew.length;
        const didntCount = results.didntKnow.length;
        const total = knewCount + didntCount;
        const percentage = total > 0 ? Math.round((knewCount / total) * 100) : 0;

        return (
            <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', flexDirection: 'column' }}>
                {/* Header */}
                <header style={{
                    position: 'sticky', top: 0, zIndex: 10, ...GLASS.header,
                    padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12,
                }}>
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => navigate('/')}
                        style={{
                            width: 36, height: 36, borderRadius: 9999,
                            background: 'transparent', border: 'none',
                            color: C.muted, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                    >
                        <ArrowRight size={20} />
                    </motion.button>
                    <h1 style={{ ...HEADING.section, margin: 0, color: C.text }}>סיכום</h1>
                </header>

                <main style={{
                    flex: 1, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', padding: 24, gap: 32,
                }}>
                    {/* Score circle */}
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.1 }}
                        style={{
                            width: 140, height: 140, borderRadius: '50%',
                            background: percentage >= 70
                                ? 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(34,197,94,0.05))'
                                : 'linear-gradient(135deg, rgba(251,146,60,0.15), rgba(236,72,153,0.05))',
                            border: `2px solid ${percentage >= 70 ? 'rgba(34,197,94,0.3)' : 'rgba(251,146,60,0.3)'}`,
                            display: 'flex', flexDirection: 'column',
                            alignItems: 'center', justifyContent: 'center',
                        }}
                    >
                        <Trophy size={28} color={percentage >= 70 ? C.green : C.orange} />
                        <span style={{
                            fontSize: 36, fontWeight: 800, color: C.text,
                            marginTop: 4,
                        }}>
                            {percentage}%
                        </span>
                    </motion.div>

                    {/* Stats row */}
                    <motion.div
                        variants={MOTION.fadeUp}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: 0.25 }}
                        style={{
                            display: 'flex', gap: 24, width: '100%',
                            maxWidth: 340, justifyContent: 'center',
                        }}
                    >
                        <div style={{
                            flex: 1, ...GLASS.card, padding: 16,
                            display: 'flex', flexDirection: 'column',
                            alignItems: 'center', gap: 6,
                        }}>
                            <Check size={20} color={C.green} />
                            <span style={{ fontSize: 24, fontWeight: 700, color: C.text }}>
                                {knewCount}
                            </span>
                            <span style={{ fontSize: 12, color: C.muted }}>ידעתי</span>
                        </div>
                        <div style={{
                            flex: 1, ...GLASS.card, padding: 16,
                            display: 'flex', flexDirection: 'column',
                            alignItems: 'center', gap: 6,
                        }}>
                            <X size={20} color={C.red} />
                            <span style={{ fontSize: 24, fontWeight: 700, color: C.text }}>
                                {didntCount}
                            </span>
                            <span style={{ fontSize: 12, color: C.muted }}>לא ידעתי</span>
                        </div>
                        <div style={{
                            flex: 1, ...GLASS.card, padding: 16,
                            display: 'flex', flexDirection: 'column',
                            alignItems: 'center', gap: 6,
                        }}>
                            <Target size={20} color={C.purple} />
                            <span style={{ fontSize: 24, fontWeight: 700, color: C.text }}>
                                {total}
                            </span>
                            <span style={{ fontSize: 12, color: C.muted }}>סה&quot;כ</span>
                        </div>
                    </motion.div>

                    {/* Didn't know list */}
                    {results.didntKnow.length > 0 && (
                        <motion.div
                            variants={MOTION.fadeUp}
                            initial="hidden"
                            animate="visible"
                            transition={{ delay: 0.4 }}
                            style={{ width: '100%', maxWidth: 340 }}
                        >
                            <h3 style={{
                                ...HEADING.card, color: C.red, margin: '0 0 12px',
                                display: 'flex', alignItems: 'center', gap: 6,
                            }}>
                                <Flame size={16} /> מילים לחזרה
                            </h3>
                            <div style={{
                                ...GLASS.card, padding: 12,
                                maxHeight: 180, overflowY: 'auto',
                            }}>
                                {results.didntKnow.map((w) => (
                                    <div key={w.id} style={{
                                        display: 'flex', justifyContent: 'space-between',
                                        alignItems: 'center', padding: '8px 4px',
                                        borderBottom: `1px solid ${C.border}`,
                                    }}>
                                        <span style={{ fontSize: 14, color: C.text, fontFamily: 'Manrope' }} dir="ltr">
                                            {w.english}
                                        </span>
                                        <span style={{ fontSize: 14, color: C.muted }} dir="rtl">
                                            {w.hebrew}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Action buttons */}
                    <motion.div
                        variants={MOTION.fadeUp}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: 0.55 }}
                        style={{
                            display: 'flex', flexDirection: 'column',
                            gap: 12, width: '100%', maxWidth: 340,
                        }}
                    >
                        <motion.button
                            whileTap={{ scale: 0.96 }}
                            onClick={handleRestart}
                            style={{
                                width: '100%', padding: 16, borderRadius: RADIUS.md,
                                border: 'none',
                                background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
                                color: C.text, fontSize: 16, fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex', alignItems: 'center',
                                justifyContent: 'center', gap: 8,
                                boxShadow: '0 8px 24px rgba(236,72,153,0.2)',
                            }}
                        >
                            <RotateCcw size={18} /> סבב נוסף
                        </motion.button>
                        <motion.button
                            whileTap={{ scale: 0.96 }}
                            onClick={() => navigate('/')}
                            style={{
                                width: '100%', padding: 16, borderRadius: RADIUS.md,
                                ...GLASS.card,
                                color: C.text, fontSize: 15, fontWeight: 500,
                                cursor: 'pointer',
                                display: 'flex', alignItems: 'center',
                                justifyContent: 'center', gap: 8,
                            }}
                        >
                            <Home size={18} /> חזרה לדף הבית
                        </motion.button>
                    </motion.div>
                </main>
            </div>
        );
    }

    // Active swipe session
    return (
        <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <header style={{
                position: 'sticky', top: 0, zIndex: 20, ...GLASS.header,
                padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => navigate('/vocab-hub')}
                        style={{
                            width: 36, height: 36, borderRadius: 9999,
                            background: 'transparent', border: 'none',
                            color: C.muted, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                    >
                        <ArrowRight size={20} />
                    </motion.button>
                    <h1 style={{ ...HEADING.section, margin: 0, color: C.text, flex: 1 }}>
                        תרגול החלקה
                    </h1>
                    <span style={{
                        fontSize: 14, fontWeight: 600, color: C.muted,
                    }}>
                        {currentIndex + 1}/{totalWords} מילים
                    </span>
                </div>

                {/* Progress bar */}
                <div style={{
                    width: '100%', height: 4, borderRadius: 2,
                    background: 'rgba(255,255,255,0.06)',
                    overflow: 'hidden',
                }}>
                    <motion.div
                        animate={{ width: `${progress}%` }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        style={{
                            height: '100%', borderRadius: 2,
                            background: 'linear-gradient(90deg, #8B5CF6, #EC4899)',
                        }}
                    />
                </div>
            </header>

            {/* Card stack area */}
            <main style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                padding: 24, position: 'relative',
                overflow: 'hidden',
            }}>
                {/* Background glow */}
                <div style={{
                    position: 'absolute', top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 256, height: 256,
                    background: 'rgba(139,92,246,0.08)',
                    borderRadius: '50%', filter: 'blur(80px)',
                    pointerEvents: 'none', zIndex: 0,
                }} />

                {/* Card stack */}
                <div style={{
                    position: 'relative', width: '100%', maxWidth: 340,
                    aspectRatio: '3/4',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <AnimatePresence>
                        {sessionWords.slice(currentIndex, currentIndex + 3).map((word, i) => (
                            <SwipeCard
                                key={`${word.id}-${currentIndex + i}`}
                                word={word}
                                stackIndex={i}
                                onSwipeRight={handleSwipeRight}
                                onSwipeLeft={handleSwipeLeft}
                            />
                        ))}
                    </AnimatePresence>
                </div>

                {/* Bottom controls hint */}
                <div style={{
                    marginTop: 40, display: 'flex', gap: 48,
                    alignItems: 'center', justifyContent: 'center',
                }}>
                    <div style={{
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', gap: 6,
                    }}>
                        <div style={{
                            width: 48, height: 48, borderRadius: '50%',
                            background: 'rgba(239,68,68,0.1)',
                            border: '1px solid rgba(239,68,68,0.3)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <X size={22} color={C.red} />
                        </div>
                        <span style={{ fontSize: 11, color: C.dim }}>לא ידעתי</span>
                    </div>
                    <div style={{
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', gap: 6,
                    }}>
                        <div style={{
                            width: 48, height: 48, borderRadius: '50%',
                            background: 'rgba(34,197,94,0.1)',
                            border: '1px solid rgba(34,197,94,0.3)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Check size={22} color={C.green} />
                        </div>
                        <span style={{ fontSize: 11, color: C.dim }}>ידעתי</span>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default SwipeMode;
