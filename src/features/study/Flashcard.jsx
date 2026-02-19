import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Volume2, Hand, ArrowLeftRight, X, Check, CheckCircle } from 'lucide-react';
import { C, GLASS, RADIUS } from '../../styles/theme';
import { playCorrect, playIncorrect, playClick } from '../../utils/sounds';

const SWIPE_THRESHOLD = 80;

const cardVariants = {
    enter: { opacity: 0, scale: 0.92, y: 10 },
    center: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.92, y: -10 },
};

const faceVariants = {
    enter: { opacity: 0, rotateY: 80 },
    center: { opacity: 1, rotateY: 0 },
    exit: { opacity: 0, rotateY: -80 },
};

const resultBtnVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: (i) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.08, type: 'spring', stiffness: 300, damping: 24 },
    }),
};

const Flashcard = ({ word, onResult, onNext }) => {
    const [flipped, setFlipped] = useState(false);
    const [revealed, setRevealed] = useState(false);
    const [showReinforcement, setShowReinforcement] = useState(false);

    // Refs to ensure callbacks in setTimeout always use latest props
    const onNextRef = useRef(onNext);
    const onResultRef = useRef(onResult);
    onNextRef.current = onNext;
    onResultRef.current = onResult;

    const dragX = useMotionValue(0);
    const dragRotate = useTransform(dragX, [-200, 0, 200], [-12, 0, 12]);
    const dragOpacityLeft = useTransform(dragX, [-SWIPE_THRESHOLD, 0], [1, 0]);
    const dragOpacityRight = useTransform(dragX, [0, SWIPE_THRESHOLD], [0, 1]);

    const handleDragEnd = (_e, info) => {
        if (!flipped || revealed) return;
        if (info.offset.x > SWIPE_THRESHOLD) {
            handleResult(true);
        } else if (info.offset.x < -SWIPE_THRESHOLD) {
            handleResult(false);
        }
    };

    const handleResult = (success) => {
        if (revealed) return;
        setRevealed(true);

        if (success) {
            playCorrect();
            onResultRef.current(success);
            setTimeout(() => {
                setFlipped(false);
                setRevealed(false);
                onNextRef.current();
            }, 100);
        } else {
            playIncorrect();
            onResultRef.current(success);
            // Show reinforcement for wrong answers
            setFlipped(true);
            setShowReinforcement(true);
            setTimeout(() => {
                setFlipped(false);
                setRevealed(false);
                setShowReinforcement(false);
                onNextRef.current();
            }, 1800);
        }
    };

    // Keyboard shortcuts: Space to flip, ArrowRight/1 = known, ArrowLeft/2 = unknown
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (revealed) return;
            const key = e.key;

            if ((key === ' ' || key === 'Enter') && !flipped) {
                e.preventDefault();
                setFlipped(true);
            } else if (flipped) {
                if (key === 'ArrowRight' || key === '1') {
                    e.preventDefault();
                    handleResult(true);
                } else if (key === 'ArrowLeft' || key === '2') {
                    e.preventDefault();
                    handleResult(false);
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [flipped, revealed]);

    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative' }}>
            {/* Background Glow */}
            <div style={{
                position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 256, height: 256,
                background: 'rgba(139,92,246,0.1)',
                borderRadius: '50%', filter: 'blur(80px)',
                pointerEvents: 'none', zIndex: 0
            }} />

            {/* Card */}
            <motion.div
                variants={cardVariants}
                initial="enter"
                animate="center"
                transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                onClick={() => !flipped && setFlipped(true)}
                drag={flipped && !revealed ? 'x' : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.8}
                onDragEnd={handleDragEnd}
                style={{
                    width: '100%', maxWidth: 340, aspectRatio: '3/4',
                    ...GLASS.card,
                    boxShadow: C.shadowMd,
                    display: 'flex', flexDirection: 'column',
                    padding: 32, cursor: 'pointer',
                    position: 'relative', zIndex: 1,
                    perspective: 800,
                    x: flipped ? dragX : 0,
                    rotate: flipped ? dragRotate : 0,
                }}
            >
                {/* Swipe overlays */}
                {flipped && !revealed && (
                    <>
                        <motion.div style={{
                            position: 'absolute', inset: 0, borderRadius: GLASS.card.borderRadius,
                            background: 'rgba(34,197,94,0.12)', border: '2px solid rgba(34,197,94,0.4)',
                            pointerEvents: 'none', opacity: dragOpacityRight, zIndex: 10,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Check size={48} style={{ color: C.green, opacity: 0.7 }} />
                        </motion.div>
                        <motion.div style={{
                            position: 'absolute', inset: 0, borderRadius: GLASS.card.borderRadius,
                            background: 'rgba(239,68,68,0.12)', border: '2px solid rgba(239,68,68,0.4)',
                            pointerEvents: 'none', opacity: dragOpacityLeft, zIndex: 10,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <X size={48} style={{ color: C.red, opacity: 0.7 }} />
                        </motion.div>
                    </>
                )}
                {/* POS Badge + Volume */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 32 }}>
                    <div style={{
                        ...GLASS.button,
                        padding: '6px 12px',
                        borderRadius: RADIUS.full,
                        display: 'flex', alignItems: 'center', gap: 6,
                    }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.purple }} />
                        <span style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: 1 }}>
                            {word.pos || 'General'}
                        </span>
                    </div>
                    <motion.button
                        whileTap={{ scale: 0.96 }}
                        onClick={(e) => { e.stopPropagation(); if (window.speechSynthesis) { const u = new SpeechSynthesisUtterance(word.english); u.lang = 'en-US'; window.speechSynthesis.speak(u); } }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
                    >
                        <Volume2 size={20} style={{ color: C.dim }} />
                    </motion.button>
                </div>

                {/* Card Face Content */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', overflow: 'hidden' }} dir="ltr">
                    <AnimatePresence mode="wait">
                        {!flipped ? (
                            <motion.div
                                key="front"
                                variants={faceVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                            >
                                <h1 style={{
                                    fontSize: 42, fontWeight: 500, margin: '0 0 12px',
                                    fontFamily: 'Manrope, sans-serif', color: C.text, letterSpacing: -0.5,
                                }}>
                                    {word.english}
                                </h1>
                                {word.phonetic && (
                                    <p style={{ fontSize: 18, color: C.dim, fontFamily: 'monospace', fontWeight: 300 }}>
                                        {word.phonetic}
                                    </p>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="back"
                                variants={faceVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                            >
                                {showReinforcement && (
                                    <p style={{
                                        fontSize: 12, fontWeight: 700, color: C.red,
                                        margin: '0 0 12px', padding: '4px 12px', borderRadius: 8,
                                        background: 'rgba(239,68,68,0.1)',
                                    }}>
                                        התשובה הנכונה:
                                    </p>
                                )}
                                <h1 style={{ fontSize: 36, fontWeight: 700, margin: '0 0 16px' }} dir="rtl">
                                    {word.hebrew}
                                </h1>
                                <p style={{ fontSize: 20, color: C.muted, fontFamily: 'Manrope' }}>
                                    {word.english}
                                </p>
                                {word.example && (
                                    <p style={{ fontSize: 14, color: C.dim, marginTop: 16, fontStyle: 'italic' }}>
                                        "{word.example}"
                                    </p>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Bottom hint */}
                <div style={{ marginTop: 'auto', paddingTop: 24, borderTop: `1px solid ${C.border}`, textAlign: 'center' }}>
                    <p style={{
                        fontSize: 12, color: C.dim, margin: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, opacity: 0.6,
                    }}>
                        <Hand size={14} /> {!flipped ? 'הקש להיפוך' : 'החלק ימינה = ידעתי, שמאלה = לא'}
                    </p>
                </div>
            </motion.div>

            {/* Controls */}
            <div style={{ width: '100%', maxWidth: 340, marginTop: 32, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <AnimatePresence mode="wait">
                    {!flipped ? (
                        <motion.div
                            key="pre-flip"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.2 }}
                            style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
                        >
                            <motion.button
                                whileTap={{ scale: 0.96 }}
                                onClick={() => setFlipped(true)}
                                style={{
                                    width: '100%', padding: 16, borderRadius: RADIUS.md, border: 'none',
                                    background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
                                    color: C.text, fontSize: 16, fontWeight: 700, cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                    boxShadow: '0 8px 24px rgba(236,72,153,0.2)',
                                }}
                            >
                                <ArrowLeftRight size={20} /> הצג הגדרה
                            </motion.button>

                            <motion.button
                                whileTap={{ scale: 0.96 }}
                                onClick={() => handleResult(true)}
                                style={{
                                    width: '100%', padding: 16, borderRadius: RADIUS.md,
                                    ...GLASS.card,
                                    color: C.text, fontSize: 15, fontWeight: 500, cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                }}
                            >
                                <CheckCircle size={18} style={{ color: C.purple, opacity: 0 }} /> אני מכיר
                            </motion.button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="post-flip"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            style={{ display: 'flex', gap: 12 }}
                        >
                            <motion.button
                                custom={0}
                                variants={resultBtnVariants}
                                initial="hidden"
                                animate="visible"
                                whileTap={{ scale: 0.96 }}
                                onClick={() => handleResult(false)}
                                style={{
                                    flex: 1, padding: 16, borderRadius: RADIUS.md,
                                    background: 'rgba(239,68,68,0.1)',
                                    border: '1px solid rgba(239,68,68,0.3)',
                                    color: C.red, fontSize: 15, fontWeight: 600, cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                }}
                            >
                                <X size={18} /> לא ידעתי
                            </motion.button>
                            <motion.button
                                custom={1}
                                variants={resultBtnVariants}
                                initial="hidden"
                                animate="visible"
                                whileTap={{ scale: 0.96 }}
                                onClick={() => handleResult(true)}
                                style={{
                                    flex: 1, padding: 16, borderRadius: RADIUS.md,
                                    background: 'rgba(34,197,94,0.1)',
                                    border: '1px solid rgba(34,197,94,0.3)',
                                    color: C.green, fontSize: 15, fontWeight: 600, cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                }}
                            >
                                <Check size={18} /> ידעתי
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

Flashcard.propTypes = {
    word: PropTypes.object.isRequired,
    onResult: PropTypes.func.isRequired,
    onNext: PropTypes.func.isRequired
};

export default Flashcard;
