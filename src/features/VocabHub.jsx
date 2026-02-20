import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import {
    ArrowRight, Layer, RotateLeft, MagicStar, Bookmark, Activity, ArrowSwapHorizontal
} from 'iconsax-react';
import { C, GLASS, MOTION, HEADING } from '../styles/theme';
import { useStatsContext } from '../contexts/StatsContext';
import { useUserWords } from '../contexts/UserWordsContext';
import { useTier } from '../contexts/TierContext';
import { VOCABULARY } from '../data/vocabulary';
import useDerivedStats from '../hooks/useStats';
import { loadSRData, getDueCount } from '../services/spacedRepetition';

const VocabHub = ({ onStartFailedVocab }) => {
    const [, navigate] = useLocation();
    const { stats, totalWords } = useStatsContext();
    const { userWords } = useUserWords();
    const { isPremium, canAccessWord, canUseAiPractice, aiUsageToday, FREE_LIMITS } = useTier();
    const { failedCount } = useDerivedStats(stats, totalWords);
    const aiAvailable = canUseAiPractice();

    // Spaced repetition due count
    const srDueCount = useMemo(() => {
        const availableVocab = isPremium ? VOCABULARY : VOCABULARY.filter(w => canAccessWord(w.id));
        const srData = loadSRData();
        return getDueCount(availableVocab, srData);
    }, [isPremium, canAccessWord]);

    const items = [
        {
            icon: Activity, title: 'חזרה מרווחת',
            desc: srDueCount > 0 ? `${srDueCount} מילים ממתינות לחזרה` : 'אין מילים לחזרה כרגע',
            color: C.muted, onClick: () => navigate('/spaced-rep'),
            badge: srDueCount > 0 ? srDueCount : null,
        },
        {
            icon: Layer, title: 'לפי קטגוריה', desc: '10 קטגוריות + חזרה חכמה',
            color: C.muted, onClick: () => navigate('/vocab-categories')
        },
        {
            icon: ArrowSwapHorizontal, title: 'תרגול החלקה', desc: 'החלק ימינה = ידעתי, שמאלה = לא',
            color: C.muted, onClick: () => navigate('/swipe')
        },
        {
            icon: RotateLeft, title: 'חזרה על טעויות', desc: `${failedCount} מילים לחזרה`,
            color: C.muted, onClick: onStartFailedVocab
        },
        {
            icon: MagicStar, title: 'תרגול AI חכם',
            desc: !aiAvailable && !isPremium
                ? `ניצלת את הניסיון היומי (${aiUsageToday}/${FREE_LIMITS.aiPracticePerDay})`
                : 'שאלות מותאמות, שמירה ותרגול חוזר',
            color: C.muted,
            onClick: () => navigate('/ai-practice')
        },
        {
            icon: Bookmark, title: 'המילים שלי', desc: `${userWords?.length || 0} מילים ששמרת`,
            color: C.muted, onClick: () => navigate('/my-words')
        },
    ];

    return (
        <div style={{ minHeight: '100vh', background: C.bg }}>
            {/* Header */}
            <header style={{
                position: 'sticky', top: 0, zIndex: 10, ...GLASS.header,
                padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12
            }}>
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => navigate('/')}
                    style={{
                        width: 36, height: 36, borderRadius: 9999, background: 'transparent',
                        border: 'none', color: C.muted, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                >
                    <ArrowRight size={20} color={C.muted} />
                </motion.button>
                <h1 style={{ ...HEADING.section, margin: 0, color: C.text }}>אוצר מילים</h1>
            </header>

            <main style={{ padding: 20 }}>
                {items.map((item, i) => (
                    <motion.button
                        key={i}
                        variants={MOTION.fadeUp}
                        initial="hidden"
                        animate="visible"
                        transition={{ duration: 0.25, delay: i * 0.04 }}
                        whileHover={{ background: 'rgba(255,255,255,0.03)' }}
                        whileTap={{ scale: 0.98 }}
                        onClick={item.onClick}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 14, width: '100%',
                            padding: '14px 16px', marginBottom: 8,
                            background: C.surface, border: `1px solid ${C.border}`,
                            borderRadius: 14, color: C.text, cursor: 'pointer', textAlign: 'right',
                            transition: 'background 0.2s'
                        }}
                    >
                        <div style={{ position: 'relative', flexShrink: 0 }}>
                            <item.icon
                                size={20}
                                color={item.color}
                            />
                            {item.badge && (
                                <span style={{
                                    position: 'absolute', top: -6, right: -8,
                                    minWidth: 16, height: 16, borderRadius: 9999,
                                    background: C.pink, color: '#fff',
                                    fontSize: 9, fontWeight: 700,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    padding: '0 4px', lineHeight: 1,
                                }}>
                                    {item.badge > 99 ? '99+' : item.badge}
                                </span>
                            )}
                        </div>
                        <div style={{ flex: 1 }}>
                            <h3 style={{ margin: 0, fontWeight: 600, fontSize: 15, color: C.text }}>{item.title}</h3>
                            <p style={{ margin: '3px 0 0', fontSize: 13, color: C.muted }}>{item.desc}</p>
                        </div>
                    </motion.button>
                ))}
            </main>
        </div>
    );
};

VocabHub.propTypes = {
    onStartFailedVocab: PropTypes.func.isRequired,
};

export default VocabHub;
