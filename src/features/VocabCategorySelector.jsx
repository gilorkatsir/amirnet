import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useLocation } from 'wouter';
import Icon from '../components/Icon';
import { C } from '../styles/theme';
import { VOCABULARY } from '../data/vocabulary';
import { useStatsContext } from '../contexts/StatsContext';

const CATEGORY_ICONS = {
    'Crime & Justice': 'gavel',
    'Emotions & Character': 'psychology',
    'Science & Nature': 'science',
    'Education & Law': 'school',
    'Discussion & Persuasion': 'forum',
    'Work & Society': 'work',
    'Wealth & Status': 'paid',
    'Connectors & Transitions': 'link',
    'Legal & Judicial': 'balance',
    'General Words': 'abc'
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
    const [filter, setFilter] = useState('all'); // 'all', 'new', 'learning', 'mastered'

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

    // Smart Review: prioritize words due for review
    const handleSmartReview = () => {
        const now = Date.now();
        const scored = VOCABULARY.map(w => {
            const s = stats[w.id];
            if (!s) return { word: w, score: 100 }; // new words get high priority
            const daysSince = s.lastSeen ? (now - new Date(s.lastSeen).getTime()) / (1000 * 60 * 60 * 24) : 30;
            const errorRate = s.incorrect / Math.max(s.correct + s.incorrect, 1);
            return { word: w, score: (errorRate * 50) + (daysSince * 2) - (s.level * 10) };
        });
        scored.sort((a, b) => b.score - a.score);
        const selection = scored.slice(0, 20).map(s => s.word);
        onStart('flash', selection.length, selection);
    };

    const handleCategoryStart = (category, mode = 'flash') => {
        const filtered = getFilteredWords(category.words);
        if (filtered.length === 0) return;
        const shuffled = [...filtered].sort(() => Math.random() - 0.5);
        const selection = shuffled.slice(0, Math.min(20, shuffled.length));
        onStart(mode, selection.length, selection);
    };

    const filterOptions = [
        { key: 'all', label: 'הכל', icon: 'apps' },
        { key: 'new', label: 'חדשות', icon: 'fiber_new' },
        { key: 'learning', label: 'בלמידה', icon: 'trending_up' },
        { key: 'mastered', label: 'נשלטו', icon: 'check_circle' }
    ];

    return (
        <div style={{ minHeight: '100vh', background: C.bg, color: C.text }}>
            <header style={{
                display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px',
                background: 'rgba(26,26,26,0.95)', backdropFilter: 'blur(8px)',
                borderBottom: `1px solid ${C.border}`
            }}>
                <button onClick={() => navigate('/')} style={{
                    width: 40, height: 40, borderRadius: '50%', background: 'transparent',
                    border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <Icon name="arrow_forward" size={24} style={{ color: 'white' }} />
                </button>
                <div>
                    <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: 'white' }}>קטגוריות מילים</h2>
                    <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>{VOCABULARY.length} מילים ב-{categories.length} קטגוריות</p>
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
                    <Icon name="auto_awesome" size={20} />
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
                                display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s'
                            }}
                        >
                            <Icon name={opt.icon} size={14} />
                            {opt.label}
                        </button>
                    ))}
                </div>

                {/* Category Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {categories.map(cat => {
                        const filtered = getFilteredWords(cat.words);
                        const color = CATEGORY_COLORS[cat.name] || C.muted;
                        const icon = CATEGORY_ICONS[cat.name] || 'label';
                        const masteryPercent = cat.words.length > 0
                            ? Math.round((cat.mastered / cat.words.length) * 100) : 0;

                        return (
                            <button
                                key={cat.name}
                                onClick={() => handleCategoryStart(cat)}
                                disabled={filtered.length === 0}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 14,
                                    padding: 16, background: C.surface,
                                    border: `1px solid ${C.border}`, borderRadius: 12,
                                    cursor: filtered.length > 0 ? 'pointer' : 'default',
                                    textAlign: 'right', transition: 'all 0.2s',
                                    opacity: filtered.length === 0 ? 0.5 : 1
                                }}
                            >
                                <div style={{
                                    width: 44, height: 44, borderRadius: 10,
                                    background: `${color}20`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                }}>
                                    <Icon name={icon} size={22} style={{ color }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'white' }}>{cat.name}</h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                                        <span style={{ fontSize: 12, color: C.muted }}>{filtered.length} מילים</span>
                                        <div style={{ flex: 1, maxWidth: 80, height: 4, background: C.border, borderRadius: 2, overflow: 'hidden' }}>
                                            <div style={{ height: '100%', width: `${masteryPercent}%`, background: color, borderRadius: 2 }} />
                                        </div>
                                        <span style={{ fontSize: 11, color, fontWeight: 600 }}>{masteryPercent}%</span>
                                    </div>
                                </div>
                                <Icon name="chevron_left" size={20} style={{ color: C.muted }} />
                            </button>
                        );
                    })}
                </div>
            </main>
        </div>
    );
};

VocabCategorySelector.propTypes = {
    onStart: PropTypes.func.isRequired
};

export default VocabCategorySelector;
