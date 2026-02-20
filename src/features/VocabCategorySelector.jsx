import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useLocation } from 'wouter';
import { ArrowRight, MagicStar, Category, TrendUp, TickCircle, Judge, Activity, StatusUp, Teacher, MessageSquare, Briefcase, DollarCircle, Link, Tag, ArrowLeft2, Lock } from 'iconsax-react';
import { C, GLASS, SURFACE, HEADING } from '../styles/theme';
import { VOCABULARY } from '../data/vocabulary';
import { useStatsContext } from '../contexts/StatsContext';
import { useTier } from '../contexts/TierContext';
import UpgradePrompt from '../components/UpgradePrompt';
import { selectWithVariety } from '../utils/smartSelection';

const CATEGORY_ICONS = {
    'Crime & Justice': Judge,
    'Emotions & Character': Activity,
    'Science & Nature': StatusUp,
    'Education & Law': Teacher,
    'Discussion & Persuasion': MessageSquare,
    'Work & Society': Briefcase,
    'Wealth & Status': DollarCircle,
    'Connectors & Transitions': Link,
    'Legal & Judicial': Judge,
    'General Words': Tag
};

const CATEGORY_COLORS = {
    'Crime & Justice': '#ef4444',
    'Emotions & Character': '#ec4899',
    'Science & Nature': '#22c55e',
    'Education & Law': '#8B5CF6',
    'Discussion & Persuasion': '#fb923c',
    'Work & Society': '#3b82f6',
    'Wealth & Status': '#eab308',
    'Connectors & Transitions': '#06b6d4',
    'Legal & Judicial': '#a855f7',
    'General Words': '#6b7280'
};

/**
 * Vocabulary Category Selector
 * Filter by category, mastery level, or start smart review
 */
const VocabCategorySelector = ({ onStart }) => {
    const [, navigate] = useLocation();
    const { stats } = useStatsContext();
    const { isPremium, canAccessWord } = useTier();
    const [filter, setFilter] = useState('all'); // 'all', 'new', 'learning', 'mastered'
    const [showUpgrade, setShowUpgrade] = useState(false);

    const categories = useMemo(() => {
        const catMap = {};
        VOCABULARY.forEach(word => {
            const cat = word.category || 'General Words';
            if (!catMap[cat]) catMap[cat] = { words: [], mastered: 0, learning: 0, newCount: 0 };
            catMap[cat].words.push(word);

            const s = stats[word.id];
            if (!s) catMap[cat].newCount++;
            else if (s.level >= 4) catMap[cat].mastered++;
            else catMap[cat].learning++;
        });
        return Object.entries(catMap)
            .sort((a, b) => b[1].words.length - a[1].words.length)
            .map(([name, data]) => ({ name, ...data }));
    }, [stats]);

    const getFilteredWords = (categoryWords) => {
        if (filter === 'all') return categoryWords;
        return categoryWords.filter(w => {
            const s = stats[w.id];
            if (filter === 'new') return !s;
            if (filter === 'learning') return s && s.level < 4;
            if (filter === 'mastered') return s && s.level >= 4;
            return true;
        });
    };

    // Smart Review: prioritize words due for review, with variety filter
    const handleSmartReview = () => {
        const now = Date.now();
        const pool = isPremium ? VOCABULARY : VOCABULARY.filter(w => canAccessWord(w.id));
        const scored = pool.map(w => {
            const s = stats[w.id];
            if (!s) return { word: w, score: 100 }; // new words get high priority
            const daysSince = s.lastSeen ? (now - new Date(s.lastSeen).getTime()) / (1000 * 60 * 60 * 24) : 30;
            const errorRate = s.incorrect / Math.max(s.correct + s.incorrect, 1);
            return { word: w, score: (errorRate * 50) + (daysSince * 2) - (s.level * 10) };
        });
        scored.sort((a, b) => b.score - a.score);
        // Take top candidates, then let smart selection add variety
        const candidates = scored.slice(0, 40).map(s => s.word);
        const selection = selectWithVariety(candidates, 20, {
            type: 'vocab', diversifyBy: 'category', record: true,
        });
        onStart('flash', selection.length, selection);
    };

    const handleCategoryStart = (category, mode = 'flash') => {
        const accessible = isPremium ? category.words : category.words.filter(w => canAccessWord(w.id));
        if (accessible.length === 0) {
            setShowUpgrade(true);
            return;
        }
        const filtered = getFilteredWords(accessible);
        if (filtered.length === 0) return;
        const selection = selectWithVariety(filtered, Math.min(20, filtered.length), {
            type: 'vocab', record: true,
        });
        onStart(mode, selection.length, selection);
    };

    const filterOptions = [
        { key: 'all', label: 'הכל', Icon: Category },
        { key: 'new', label: 'חדשות', Icon: MagicStar },
        { key: 'learning', label: 'בלמידה', Icon: TrendUp },
        { key: 'mastered', label: 'נשלטו', Icon: TickCircle }
    ];

    return (
        <div style={{ minHeight: '100vh', background: C.bg, color: C.text }}>
            <header style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px',
                position: 'sticky', top: 0, zIndex: 10, ...GLASS.header
            }}>
                <button onClick={() => navigate('/')} style={{
                    width: 38, height: 38, borderRadius: 9999, background: 'transparent',
                    border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <ArrowRight size={20} color={C.muted} />
                </button>
                <div>
                    <h2 style={{ ...HEADING.section, margin: 0, color: C.text }}>קטגוריות מילים</h2>
                    <p style={{ fontSize: 12, color: C.muted, margin: '2px 0 0' }}>{VOCABULARY.length} מילים ב-{categories.length} קטגוריות</p>
                </div>
            </header>

            <main style={{ padding: 20 }}>
                {/* Smart Review Button */}
                <button
                    onClick={handleSmartReview}
                    style={{
                        width: '100%', padding: 16, marginBottom: 20,
                        background: C.gradient, border: 'none', borderRadius: 12,
                        color: 'white', fontSize: 15, fontWeight: 700, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        boxShadow: '0 8px 24px rgba(124,58,237,0.3)'
                    }}
                >
                    <MagicStar size={20} />
                    חזרה חכמה (20 מילים)
                </button>

                {/* Filter Pills */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 20, overflowX: 'auto' }}>
                    {filterOptions.map(opt => (
                        <button
                            key={opt.key}
                            onClick={() => setFilter(opt.key)}
                            style={{
                                padding: '8px 14px', borderRadius: 20, whiteSpace: 'nowrap',
                                background: filter === opt.key ? C.purple : C.surface,
                                border: filter === opt.key ? 'none' : `1px solid ${C.border}`,
                                color: filter === opt.key ? 'white' : C.muted,
                                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: 6, transition: 'background 0.2s, border-color 0.2s, opacity 0.2s'
                            }}
                        >
                            <opt.Icon size={14} />
                            {opt.label}
                        </button>
                    ))}
                </div>

                {/* Category Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {categories.map(cat => {
                        const accessible = isPremium ? cat.words : cat.words.filter(w => canAccessWord(w.id));
                        const isLocked = !isPremium && accessible.length === 0;
                        const filtered = getFilteredWords(accessible);
                        const color = CATEGORY_COLORS[cat.name] || C.muted;
                        const CatIcon = CATEGORY_ICONS[cat.name] || Tag;
                        const masteryPercent = cat.words.length > 0
                            ? Math.round((cat.mastered / cat.words.length) * 100) : 0;

                        return (
                            <button
                                key={cat.name}
                                onClick={() => handleCategoryStart(cat)}
                                disabled={filtered.length === 0 && !isLocked}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 14,
                                    padding: 16, ...SURFACE.elevated,
                                    cursor: (filtered.length > 0 || isLocked) ? 'pointer' : 'default',
                                    textAlign: 'right', transition: 'background 0.2s, border-color 0.2s, opacity 0.2s',
                                    opacity: isLocked ? 0.5 : (filtered.length === 0 ? 0.5 : 1)
                                }}
                            >
                                {isLocked ? (
                                    <Lock size={20} color={C.dim} style={{ flexShrink: 0 }} />
                                ) : (
                                    <CatIcon size={20} color={color} style={{ flexShrink: 0 }} />
                                )}
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: isLocked ? C.muted : C.text }}>{cat.name}</h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                                        <span style={{ fontSize: 12, color: C.muted }}>{isLocked ? `${cat.words.length} מילים` : `${filtered.length} מילים`}</span>
                                        <div style={{ flex: 1, maxWidth: 80, height: 4, background: C.border, borderRadius: 2, overflow: 'hidden' }}>
                                            <div style={{ height: '100%', width: `${masteryPercent}%`, background: color, borderRadius: 2 }} />
                                        </div>
                                        <span style={{ fontSize: 11, color, fontWeight: 600 }}>{masteryPercent}%</span>
                                    </div>
                                </div>
                                {isLocked ? (
                                    <Lock size={16} color={C.dim} />
                                ) : (
                                    <ArrowLeft2 size={20} color={C.muted} />
                                )}
                            </button>
                        );
                    })}
                </div>
            </main>
            <UpgradePrompt isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} limitType="vocab" />
        </div>
    );
};

VocabCategorySelector.propTypes = {
    onStart: PropTypes.func.isRequired
};

export default VocabCategorySelector;
