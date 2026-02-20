import React, { useState, useRef, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { VolumeHigh, FingerCricle } from 'iconsax-react';
import { C, GLASS, RADIUS } from '../styles/theme';
import { playFlip } from '../utils/sounds';

const SWIPE_THRESHOLD = 100;
const MAX_ROTATION = 15;

const SwipeCard = ({ word, onSwipeRight, onSwipeLeft, stackIndex = 0, onFlip }) => {
    const [flipped, setFlipped] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [exitDirection, setExitDirection] = useState(null);
    const cardRef = useRef(null);

    const dragX = useMotionValue(0);
    const dragRotate = useTransform(dragX, [-300, 0, 300], [-MAX_ROTATION, 0, MAX_ROTATION]);

    // Green glow opacity when dragging right
    const rightGlowOpacity = useTransform(dragX, [0, SWIPE_THRESHOLD], [0, 1]);
    // Red glow opacity when dragging left
    const leftGlowOpacity = useTransform(dragX, [-SWIPE_THRESHOLD, 0], [1, 0]);

    // Label opacity
    const rightLabelOpacity = useTransform(dragX, [20, SWIPE_THRESHOLD * 0.6], [0, 1]);
    const leftLabelOpacity = useTransform(dragX, [-SWIPE_THRESHOLD * 0.6, -20], [1, 0]);

    // Background glow color
    const bgShadow = useTransform(
        dragX,
        [-SWIPE_THRESHOLD, 0, SWIPE_THRESHOLD],
        [
            '0 0 60px rgba(239,68,68,0.3)',
            '0 8px 24px rgba(0,0,0,0.4)',
            '0 0 60px rgba(34,197,94,0.3)'
        ]
    );

    // Pointer tracking for touch and mouse
    const pointerStartRef = useRef(null);
    const currentXRef = useRef(0);

    const handlePointerDown = useCallback((e) => {
        if (stackIndex !== 0) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        pointerStartRef.current = { x: e.clientX, y: e.clientY };
        setIsDragging(true);
    }, [stackIndex]);

    const handlePointerMove = useCallback((e) => {
        if (!pointerStartRef.current || stackIndex !== 0) return;
        const dx = e.clientX - pointerStartRef.current.x;
        currentXRef.current = dx;
        dragX.set(dx);
    }, [dragX, stackIndex]);

    const handlePointerUp = useCallback((e) => {
        if (!pointerStartRef.current || stackIndex !== 0) return;
        try { e.currentTarget.releasePointerCapture(e.pointerId); } catch {}
        const dx = currentXRef.current;

        if (dx > SWIPE_THRESHOLD) {
            setExitDirection('right');
            setTimeout(() => onSwipeRight?.(), 300);
        } else if (dx < -SWIPE_THRESHOLD) {
            setExitDirection('left');
            setTimeout(() => onSwipeLeft?.(), 300);
        } else {
            // Spring back
            dragX.set(0);
        }

        pointerStartRef.current = null;
        currentXRef.current = 0;
        setIsDragging(false);
    }, [dragX, onSwipeRight, onSwipeLeft, stackIndex]);

    const handleTap = useCallback(() => {
        if (isDragging || stackIndex !== 0) return;
        if (Math.abs(currentXRef.current) < 5) {
            playFlip();
            setFlipped(f => !f);
            onFlip?.();
        }
    }, [isDragging, stackIndex, onFlip]);

    // Auto-focus the top card for keyboard access
    useEffect(() => {
        if (stackIndex === 0 && cardRef.current) {
            cardRef.current.focus({ preventScroll: true });
        }
    }, [stackIndex, word.id]);

    // Keyboard shortcuts
    const handleKeyDown = useCallback((e) => {
        if (stackIndex !== 0) return;
        const key = e.key;

        if ((key === ' ' || key === 'Enter') && !flipped) {
            e.preventDefault();
            playFlip();
            setFlipped(true);
            onFlip?.();
        } else if (key === 'ArrowRight' || key === '1') {
            e.preventDefault();
            setExitDirection('right');
            setTimeout(() => onSwipeRight?.(), 300);
        } else if (key === 'ArrowLeft' || key === '2') {
            e.preventDefault();
            setExitDirection('left');
            setTimeout(() => onSwipeLeft?.(), 300);
        }
    }, [stackIndex, flipped, onSwipeRight, onSwipeLeft, onFlip]);

    // Stack offset styling
    const stackScale = 1 - stackIndex * 0.05;
    const stackY = stackIndex * 8;
    const stackOpacity = stackIndex > 2 ? 0 : 1 - stackIndex * 0.15;

    if (exitDirection) {
        return (
            <motion.div
                initial={{ x: 0, rotate: 0 }}
                animate={{
                    x: exitDirection === 'right' ? 600 : -600,
                    rotate: exitDirection === 'right' ? 30 : -30,
                    opacity: 0,
                }}
                transition={{ duration: 0.3, ease: 'easeIn' }}
                style={{
                    position: 'absolute',
                    width: '100%',
                    maxWidth: 340,
                    aspectRatio: '3/4',
                    ...GLASS.card,
                    zIndex: 10 - stackIndex,
                }}
            />
        );
    }

    return (
        <motion.div
            ref={cardRef}
            role="button"
            tabIndex={stackIndex === 0 ? 0 : -1}
            aria-label={
                flipped
                    ? `${word.hebrew} - ${word.english}. החלק ימינה אם ידעת, שמאלה אם לא`
                    : `${word.english}. הקש להיפוך הכרטיס`
            }
            initial={stackIndex === 0 ? { y: 40, opacity: 0, scale: 0.95 } : false}
            animate={{
                y: stackY,
                opacity: stackOpacity,
                scale: stackScale,
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            style={{
                position: 'absolute',
                width: '100%',
                maxWidth: 340,
                aspectRatio: '3/4',
                ...GLASS.card,
                boxShadow: stackIndex === 0 ? bgShadow : C.shadowMd,
                display: 'flex',
                flexDirection: 'column',
                padding: 32,
                cursor: stackIndex === 0 ? 'grab' : 'default',
                zIndex: 10 - stackIndex,
                x: stackIndex === 0 ? dragX : 0,
                rotate: stackIndex === 0 ? dragRotate : 0,
                touchAction: 'none',
                userSelect: 'none',
                perspective: 800,
                outline: 'none',
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onClick={handleTap}
            onKeyDown={handleKeyDown}
        >
            {/* Right swipe overlay - green glow */}
            {stackIndex === 0 && (
                <motion.div style={{
                    position: 'absolute', inset: 0,
                    borderRadius: GLASS.card.borderRadius,
                    background: 'rgba(34,197,94,0.12)',
                    border: '2px solid rgba(34,197,94,0.4)',
                    pointerEvents: 'none',
                    opacity: rightGlowOpacity,
                    zIndex: 20,
                }} />
            )}

            {/* Left swipe overlay - red glow */}
            {stackIndex === 0 && (
                <motion.div style={{
                    position: 'absolute', inset: 0,
                    borderRadius: GLASS.card.borderRadius,
                    background: 'rgba(239,68,68,0.12)',
                    border: '2px solid rgba(239,68,68,0.4)',
                    pointerEvents: 'none',
                    opacity: leftGlowOpacity,
                    zIndex: 20,
                }} />
            )}

            {/* Right label */}
            {stackIndex === 0 && (
                <motion.div style={{
                    position: 'absolute', top: 32, left: 24,
                    padding: '8px 16px', borderRadius: RADIUS.md,
                    background: 'rgba(34,197,94,0.2)',
                    border: '2px solid rgba(34,197,94,0.5)',
                    opacity: rightLabelOpacity,
                    zIndex: 21,
                    pointerEvents: 'none',
                    transform: 'rotate(-12deg)',
                }}>
                    <span style={{
                        fontSize: 18, fontWeight: 800, color: C.green,
                    }}>
                        {'\u2713'} ידעתי
                    </span>
                </motion.div>
            )}

            {/* Left label */}
            {stackIndex === 0 && (
                <motion.div style={{
                    position: 'absolute', top: 32, right: 24,
                    padding: '8px 16px', borderRadius: RADIUS.md,
                    background: 'rgba(239,68,68,0.2)',
                    border: '2px solid rgba(239,68,68,0.5)',
                    opacity: leftLabelOpacity,
                    zIndex: 21,
                    pointerEvents: 'none',
                    transform: 'rotate(12deg)',
                }}>
                    <span style={{
                        fontSize: 18, fontWeight: 800, color: C.red,
                    }}>
                        {'\u2717'} לא ידעתי
                    </span>
                </motion.div>
            )}

            {/* POS Badge + Volume */}
            <div style={{
                display: 'flex', justifyContent: 'space-between',
                marginBottom: 24, position: 'relative', zIndex: 5,
            }}>
                <div style={{
                    ...GLASS.button,
                    padding: '6px 12px',
                    borderRadius: RADIUS.full,
                    display: 'flex', alignItems: 'center', gap: 6,
                }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.purple }} />
                    <span style={{
                        fontSize: 10, fontWeight: 700, color: C.muted,
                        textTransform: 'uppercase', letterSpacing: 1,
                    }}>
                        {word.pos || 'General'}
                    </span>
                </div>
                <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={(e) => {
                        e.stopPropagation();
                        if (window.speechSynthesis) {
                            const u = new SpeechSynthesisUtterance(word.english);
                            u.lang = 'en-US';
                            window.speechSynthesis.speak(u);
                        }
                    }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
                >
                    <VolumeHigh size={20} color={C.dim} />
                </motion.button>
            </div>

            {/* Card Face Content */}
            <div style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                textAlign: 'center', overflow: 'hidden',
                position: 'relative', zIndex: 5,
            }} dir="ltr">
                <AnimatePresence mode="wait">
                    {!flipped ? (
                        <motion.div
                            key="front"
                            initial={{ opacity: 0, rotateY: 80 }}
                            animate={{ opacity: 1, rotateY: 0 }}
                            exit={{ opacity: 0, rotateY: -80 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                        >
                            <h1 style={{
                                fontSize: 42, fontWeight: 500, margin: '0 0 12px',
                                fontFamily: 'Manrope, sans-serif', color: C.text,
                                letterSpacing: -0.5,
                            }}>
                                {word.english}
                            </h1>
                            {word.phonetic && (
                                <p style={{
                                    fontSize: 18, color: C.dim,
                                    fontFamily: 'monospace', fontWeight: 300,
                                }}>
                                    {word.phonetic}
                                </p>
                            )}
                            <p style={{
                                fontSize: 13, color: C.dim, marginTop: 16,
                                display: 'flex', alignItems: 'center', gap: 6,
                            }}>
                                <FingerCricle size={14} /> הקש לגילוי התרגום
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="back"
                            initial={{ opacity: 0, rotateY: 80 }}
                            animate={{ opacity: 1, rotateY: 0 }}
                            exit={{ opacity: 0, rotateY: -80 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                        >
                            <h1 style={{
                                fontSize: 36, fontWeight: 700, margin: '0 0 16px',
                            }} dir="rtl">
                                {word.hebrew}
                            </h1>
                            <p style={{
                                fontSize: 20, color: C.muted,
                                fontFamily: 'Manrope',
                            }}>
                                {word.english}
                            </p>
                            {word.example && (
                                <p style={{
                                    fontSize: 14, color: C.dim,
                                    marginTop: 16, fontStyle: 'italic',
                                }}>
                                    &ldquo;{word.example}&rdquo;
                                </p>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Bottom hint */}
            <div style={{
                marginTop: 'auto', paddingTop: 16,
                borderTop: `1px solid ${C.border}`,
                textAlign: 'center', position: 'relative', zIndex: 5,
            }}>
                <p style={{
                    fontSize: 12, color: C.dim, margin: 0,
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center', gap: 6, opacity: 0.6,
                }}>
                    {flipped
                        ? 'החלק ימינה = ידעתי, שמאלה = לא'
                        : 'הקש להיפוך'}
                </p>
            </div>
        </motion.div>
    );
};

SwipeCard.propTypes = {
    word: PropTypes.object.isRequired,
    onSwipeRight: PropTypes.func.isRequired,
    onSwipeLeft: PropTypes.func.isRequired,
    stackIndex: PropTypes.number,
    onFlip: PropTypes.func,
};

export default SwipeCard;
