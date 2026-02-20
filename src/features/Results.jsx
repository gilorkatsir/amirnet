import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Cup, Star1, Weight, Book1, TickCircle, CloseCircle, Edit2, ArrowSwapHorizontal, LampOn, RotateLeft, Home2 } from 'iconsax-react';
import { C, GLASS, RADIUS, SURFACE } from '../styles/theme';
import { playComplete } from '../utils/sounds';

const Results = ({ results, sessionType, onRestart, onReview }) => {
    const [, navigate] = useLocation();
    const total = results.correct + results.incorrect;
    const pct = total > 0 ? Math.round((results.correct / total) * 100) : 0;

    // Play completion sound once on mount
    const completeSoundPlayed = useRef(false);
    useEffect(() => {
        if (!completeSoundPlayed.current) {
            completeSoundPlayed.current = true;
            // Small delay to let the page render first
            const timer = setTimeout(() => playComplete(), 200);
            return () => clearTimeout(timer);
        }
    }, []);

    const getInfo = () => {
        if (pct >= 90) return { icon: Cup, msg: 'מצוין! שליטה מרשימה!', color: '#fbbf24' };
        if (pct >= 70) return { icon: Star1, msg: 'כל הכבוד!', color: C.green };
        if (pct >= 50) return { icon: Weight, msg: 'לא רע!', color: C.orange };
        return { icon: Book1, msg: 'המשך להתאמן!', color: C.purple };
    };
    const info = getInfo();
    const Icon = info.icon;

    const typeBreakdown = React.useMemo(() => {
        if (!results.answers || results.answers.length === 0) return null;
        const breakdown = {};
        results.answers.forEach(a => {
            const type = a.type || 'Unknown';
            if (!breakdown[type]) breakdown[type] = { correct: 0, total: 0 };
            breakdown[type].total++;
            if (a.isCorrect) breakdown[type].correct++;
        });
        return breakdown;
    }, [results.answers]);

    const typeLabels = {
        'Sentence Completion': { he: 'השלמת משפטים', icon: Edit2, color: C.purple },
        'Restatement': { he: 'ניסוח מחדש', icon: ArrowSwapHorizontal, color: C.orange },
        'Reading Comprehension': { he: 'הבנת הנקרא', icon: Book1, color: C.pink }
    };

    const weakestType = React.useMemo(() => {
        if (!typeBreakdown) return null;
        let worst = null, worstPct = 100;
        for (const [type, data] of Object.entries(typeBreakdown)) {
            const typePct = data.total > 0 ? (data.correct / data.total) * 100 : 100;
            if (typePct < worstPct && data.total >= 2) { worstPct = typePct; worst = type; }
        }
        return worst && worstPct < 70 ? worst : null;
    }, [typeBreakdown]);

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 24, textAlign: 'center', overflowY: 'auto', background: C.bg }}>
            {/* Result icon */}
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                style={{
                    marginTop: 40, marginBottom: 20,
                    width: 80, height: 80, borderRadius: RADIUS.xl,
                    ...SURFACE.hero,
                    background: `${info.color}10`,
                    border: `1px solid ${info.color}20`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
            >
                <Icon size={40} color={info.color} />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                <h2 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 6px' }}>סיום סט!</h2>
                <p style={{ color: C.muted, fontSize: 17, marginBottom: 28 }}>{info.msg}</p>
            </motion.div>

            {/* Circular Progress */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.35, type: 'spring', stiffness: 150 }}
                style={{ position: 'relative', width: 150, height: 150, marginBottom: 28 }}
            >
                <svg style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }} viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke={C.border} strokeWidth="7" />
                    <circle
                        cx="50" cy="50" r="45" fill="none" stroke="url(#rg)" strokeWidth="7"
                        strokeLinecap="round" strokeDasharray={`${pct * 2.83} 283`}
                    />
                    <defs>
                        <linearGradient id="rg" x1="0%" y1="0%" x2="100%">
                            <stop offset="0%" stopColor={C.purple} />
                            <stop offset="100%" stopColor={C.pink} />
                        </linearGradient>
                    </defs>
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 34, fontWeight: 700 }}>{pct}%</span>
                </div>
            </motion.div>

            {/* Correct / Incorrect */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45 }}
                style={{ display: 'flex', gap: 40, marginBottom: 28 }}
            >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <TickCircle size={28} color={C.green} />
                    <p style={{ fontSize: 24, fontWeight: 700, margin: '6px 0 2px' }}>{results.correct}</p>
                    <span style={{ color: C.muted, fontSize: 13 }}>נכונות</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <CloseCircle size={28} color={C.red} />
                    <p style={{ fontSize: 24, fontWeight: 700, margin: '6px 0 2px' }}>{results.incorrect}</p>
                    <span style={{ color: C.muted, fontSize: 13 }}>שגויות</span>
                </div>
            </motion.div>

            {/* Type Breakdown */}
            {typeBreakdown && Object.keys(typeBreakdown).length > 1 && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.55 }}
                    style={{ width: '100%', maxWidth: 340, marginBottom: 20 }}
                >
                    <h3 style={{ fontSize: 13, fontWeight: 600, color: C.muted, marginBottom: 10, textAlign: 'right' }}>
                        פירוט לפי סוג שאלה
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {Object.entries(typeBreakdown).map(([type, data]) => {
                            const meta = typeLabels[type] || { he: type, icon: Book1, color: C.muted };
                            const TypeIcon = meta.icon;
                            const typePct = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
                            return (
                                <div key={type} style={{
                                    ...SURFACE.subtle, padding: '9px 4px',
                                    display: 'flex', alignItems: 'center', gap: 10
                                }}>
                                    <TypeIcon size={16} color={meta.color} />
                                    <div style={{ flex: 1, textAlign: 'right' }}>
                                        <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{meta.he}</span>
                                    </div>
                                    <span style={{ fontSize: 12, color: C.muted }}>{data.correct}/{data.total}</span>
                                    <span style={{
                                        fontSize: 13, fontWeight: 700, minWidth: 38, textAlign: 'center',
                                        color: typePct >= 70 ? C.green : typePct >= 50 ? C.orange : C.red
                                    }}>{typePct}%</span>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            )}

            {/* Recommendation */}
            {weakestType && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.65 }}
                    style={{
                        width: '100%', maxWidth: 340, marginBottom: 20,
                        background: 'rgba(251,146,60,0.06)',
                        borderRadius: 12, padding: '10px 16px',
                        display: 'flex', alignItems: 'center', gap: 10, textAlign: 'right'
                    }}
                >
                    <LampOn size={18} color={C.orange} style={{ flexShrink: 0 }} />
                    <p style={{ margin: 0, fontSize: 13, color: C.orange, lineHeight: 1.4 }}>
                        ציון נמוך ב{typeLabels[weakestType]?.he || weakestType} — מומלץ לתרגל עוד!
                    </p>
                </motion.div>
            )}

            {/* Action Buttons */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 320, paddingBottom: 40 }}
            >
                <button onClick={onRestart} style={{
                    width: '100%', padding: 16, borderRadius: 9999, border: 'none',
                    background: C.gradient, color: 'white', fontSize: 17, fontWeight: 700, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    boxShadow: '0 8px 24px rgba(139,92,246,0.3)'
                }}>
                    <RotateLeft size={18} color="white" /> תרגול נוסף
                </button>
                {results.incorrect > 0 && onReview && (
                    <button onClick={onReview} style={{
                        width: '100%', padding: 14, borderRadius: RADIUS.md,
                        border: `1px solid ${C.orange}40`, background: `${C.orange}08`,
                        color: C.orange, fontSize: 17, fontWeight: 700, cursor: 'pointer'
                    }}>
                        חזרה על טעויות
                    </button>
                )}
                <button onClick={() => navigate('/')} style={{
                    width: '100%', padding: 14, borderRadius: RADIUS.md,
                    ...GLASS.button, color: C.text, fontSize: 17, fontWeight: 700, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                }}>
                    <Home2 size={18} color={C.text} /> חזרה לתפריט
                </button>
            </motion.div>
        </div>
    );
};

Results.propTypes = {
    results: PropTypes.object.isRequired,
    sessionType: PropTypes.string,
    onRestart: PropTypes.func.isRequired,
    onReview: PropTypes.func
};

export default Results;
