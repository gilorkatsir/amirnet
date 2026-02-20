import React, { useState, useMemo } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowRight, Sparkles, Trash2, Play, Plus, CheckCircle, Clock,
    ChevronDown, ChevronUp
} from 'lucide-react';
import { C, GLASS, SURFACE, MOTION, HEADING } from '../styles/theme';
import { useStatsContext } from '../contexts/StatsContext';
import { useTier } from '../contexts/TierContext';
import { VOCABULARY } from '../data/vocabulary';
import {
    getSavedQuestionSets,
    saveQuestionSet,
    deleteQuestionSet,
} from '../services/aiQuestionStorage';
import { generateQuestions } from '../services/aiQuestionService';
import { Quantum } from 'ldrs/react';
import 'ldrs/react/Quantum.css';

const DIFFICULTY_LABELS = {
    easy: { label: 'קל', desc: 'B1-B2', color: C.green },
    medium: { label: 'בינוני', desc: 'B2-C1', color: C.orange },
    hard: { label: 'קשה', desc: 'C1-C2', color: C.red },
};

const COUNT_OPTIONS = [5, 10, 15];

const AIPracticeHub = ({ onStartSavedSession }) => {
    const [, navigate] = useLocation();
    const { stats } = useStatsContext();
    const { isPremium, canAccessWord, canUseAiPractice, recordAiUsage, aiUsageToday, FREE_LIMITS } = useTier();

    const [savedSets, setSavedSets] = useState(() => getSavedQuestionSets());
    const [showCreate, setShowCreate] = useState(false);
    const [difficulty, setDifficulty] = useState('medium');
    const [count, setCount] = useState(10);
    const [selectedWordIds, setSelectedWordIds] = useState(new Set());
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState(null);
    const [expandedSetId, setExpandedSetId] = useState(null);

    // Get failed words for chip selection
    const failedWords = useMemo(() => {
        const pool = isPremium ? VOCABULARY : VOCABULARY.filter(w => canAccessWord(w.id));
        return pool.filter(word => {
            const s = stats[word.id];
            return s && s.incorrect > s.correct;
        });
    }, [stats, isPremium, canAccessWord]);

    const aiAvailable = canUseAiPractice();

    const toggleWord = (id) => {
        setSelectedWordIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const selectAll = () => {
        setSelectedWordIds(new Set(failedWords.map(w => w.id)));
    };

    const clearSelection = () => {
        setSelectedWordIds(new Set());
    };

    const handleGenerate = async () => {
        if (!aiAvailable) return;
        if (selectedWordIds.size === 0) return;

        setGenerating(true);
        setError(null);

        try {
            const words = failedWords.filter(w => selectedWordIds.has(w.id));
            const sliced = words.slice(0, count);
            const questions = await generateQuestions(sliced, sliced.length, difficulty);

            recordAiUsage();

            const saved = saveQuestionSet(questions, {
                sourceWords: sliced.map(w => w.english),
                difficulty,
            });

            setSavedSets(getSavedQuestionSets());
            setShowCreate(false);
            setSelectedWordIds(new Set());

            // Auto-start the session
            onStartSavedSession(saved.id, questions);
        } catch (err) {
            setError(err.message);
        } finally {
            setGenerating(false);
        }
    };

    const handleDelete = (id, e) => {
        e.stopPropagation();
        deleteQuestionSet(id);
        setSavedSets(getSavedQuestionSets());
    };

    const handleReplay = (set) => {
        onStartSavedSession(set.id, set.questions);
    };

    const formatDate = (isoString) => {
        const d = new Date(isoString);
        return d.toLocaleDateString('he-IL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div style={{ minHeight: '100vh', background: C.bg }}>
            {/* Header */}
            <header style={{
                position: 'sticky', top: 0, zIndex: 10, ...GLASS.header,
                padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12
            }}>
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => navigate('/vocab-hub')}
                    style={{
                        width: 36, height: 36, borderRadius: 9999, background: 'transparent',
                        border: 'none', color: C.muted, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                >
                    <ArrowRight size={20} />
                </motion.button>
                <Sparkles size={20} color={C.purple} />
                <h1 style={{ ...HEADING.section, margin: 0, color: C.text }}>
                    תרגול AI
                </h1>
            </header>

            <main style={{ padding: 20 }}>
                {/* Create New Button */}
                {!showCreate && (
                    <motion.button
                        variants={MOTION.fadeUp}
                        initial="hidden"
                        animate="visible"
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setShowCreate(true)}
                        style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                            width: '100%', padding: '14px 16px', marginBottom: 20,
                            background: `${C.purple}12`, border: `1px solid ${C.purple}25`,
                            borderRadius: 14, color: C.purple, fontSize: 15, fontWeight: 600,
                            cursor: aiAvailable ? 'pointer' : 'not-allowed',
                            opacity: aiAvailable ? 1 : 0.5,
                        }}
                        disabled={!aiAvailable}
                    >
                        <Plus size={18} />
                        {aiAvailable ? 'יצירת שאלות חדשות' : `ניצלת את הניסיון היומי (${aiUsageToday}/${FREE_LIMITS.aiPracticePerDay})`}
                    </motion.button>
                )}

                {/* Create New Flow */}
                <AnimatePresence>
                    {showCreate && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            style={{ overflow: 'hidden', marginBottom: 20 }}
                        >
                            <div style={{
                                ...SURFACE.elevated, padding: 20,
                            }}>
                                <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 600, color: C.text }}>
                                    יצירת שאלות חדשות
                                </h3>

                                {/* Difficulty Selector */}
                                <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 600, color: C.muted }}>רמת קושי</p>
                                <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                                    {Object.entries(DIFFICULTY_LABELS).map(([key, val]) => (
                                        <button
                                            key={key}
                                            onClick={() => setDifficulty(key)}
                                            style={{
                                                flex: 1, padding: '10px 8px', borderRadius: 10,
                                                border: difficulty === key ? `2px solid ${val.color}` : `1px solid ${C.border}`,
                                                background: difficulty === key ? `${val.color}15` : C.surface,
                                                color: difficulty === key ? val.color : C.muted,
                                                cursor: 'pointer', textAlign: 'center',
                                            }}
                                        >
                                            <div style={{ fontSize: 14, fontWeight: 600 }}>{val.label}</div>
                                            <div style={{ fontSize: 11, marginTop: 2 }}>{val.desc}</div>
                                        </button>
                                    ))}
                                </div>

                                {/* Count Selector */}
                                <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 600, color: C.muted }}>מספר שאלות</p>
                                <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                                    {COUNT_OPTIONS.map(c => (
                                        <button
                                            key={c}
                                            onClick={() => setCount(c)}
                                            style={{
                                                flex: 1, padding: '10px 8px', borderRadius: 10,
                                                border: count === c ? `2px solid ${C.purple}` : `1px solid ${C.border}`,
                                                background: count === c ? `${C.purple}15` : C.surface,
                                                color: count === c ? C.purple : C.muted,
                                                fontSize: 15, fontWeight: 600, cursor: 'pointer',
                                            }}
                                        >
                                            {c}
                                        </button>
                                    ))}
                                </div>

                                {/* Word Selection */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: C.muted }}>
                                        מילים קשות ({failedWords.length} זמינות)
                                    </p>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button onClick={selectAll} style={{
                                            background: 'none', border: 'none', color: C.purple,
                                            fontSize: 12, fontWeight: 600, cursor: 'pointer'
                                        }}>בחר הכל</button>
                                        <button onClick={clearSelection} style={{
                                            background: 'none', border: 'none', color: C.muted,
                                            fontSize: 12, cursor: 'pointer'
                                        }}>נקה</button>
                                    </div>
                                </div>

                                {failedWords.length === 0 ? (
                                    <p style={{ color: C.muted, fontSize: 13, textAlign: 'center', padding: '16px 0' }}>
                                        אין מילים קשות עדיין. תרגל אוצר מילים קודם!
                                    </p>
                                ) : (
                                    <div style={{
                                        display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16,
                                        maxHeight: 160, overflowY: 'auto', padding: '4px 0'
                                    }}>
                                        {failedWords.map(w => {
                                            const selected = selectedWordIds.has(w.id);
                                            return (
                                                <button
                                                    key={w.id}
                                                    onClick={() => toggleWord(w.id)}
                                                    style={{
                                                        padding: '5px 10px', borderRadius: 9999,
                                                        border: selected ? `1px solid ${C.purple}` : `1px solid ${C.border}`,
                                                        background: selected ? `${C.purple}20` : C.surface,
                                                        color: selected ? C.purple : C.text,
                                                        fontSize: 12, fontWeight: 500, cursor: 'pointer',
                                                        transition: 'background 0.15s, border-color 0.15s, color 0.15s',
                                                    }}
                                                >
                                                    {w.english}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}

                                {error && (
                                    <p style={{ color: C.red, fontSize: 13, margin: '0 0 12px', textAlign: 'center' }}>
                                        {error}
                                    </p>
                                )}

                                {/* Action Buttons */}
                                <div style={{ display: 'flex', gap: 10 }}>
                                    <button
                                        onClick={() => { setShowCreate(false); setError(null); }}
                                        style={{
                                            flex: 1, padding: '12px', borderRadius: 10,
                                            border: `1px solid ${C.border}`, background: C.surface,
                                            color: C.muted, fontSize: 14, fontWeight: 600, cursor: 'pointer'
                                        }}
                                    >
                                        ביטול
                                    </button>
                                    <button
                                        onClick={handleGenerate}
                                        disabled={generating || selectedWordIds.size === 0}
                                        style={{
                                            flex: 2, padding: '12px', borderRadius: 10,
                                            border: 'none',
                                            background: (generating || selectedWordIds.size === 0)
                                                ? C.surface : C.purple,
                                            color: (generating || selectedWordIds.size === 0)
                                                ? C.muted : 'white',
                                            fontSize: 14, fontWeight: 600, cursor: generating ? 'wait' : 'pointer',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                        }}
                                    >
                                        {generating ? (
                                            <>
                                                <Quantum size={18} speed={1.2} color="white" />
                                                מייצר...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles size={16} />
                                                ייצר {selectedWordIds.size > 0 ? Math.min(selectedWordIds.size, count) : count} שאלות
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Saved Question Sets */}
                <div style={{ marginBottom: 8 }}>
                    <h2 style={{ ...HEADING.card, color: C.text, margin: '0 0 12px' }}>
                        שאלות שנשמרו ({savedSets.length})
                    </h2>
                </div>

                {savedSets.length === 0 ? (
                    <motion.div
                        variants={MOTION.fadeUp}
                        initial="hidden"
                        animate="visible"
                        style={{
                            ...SURFACE.elevated, padding: 32,
                            display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center'
                        }}
                    >
                        <Sparkles size={32} color={C.dim} style={{ marginBottom: 12 }} />
                        <p style={{ color: C.muted, fontSize: 14, margin: '0 0 4px', fontWeight: 600 }}>
                            אין שאלות שמורות
                        </p>
                        <p style={{ color: C.dim, fontSize: 13, margin: 0 }}>
                            צור שאלות AI חדשות והן יישמרו כאן לתרגול חוזר
                        </p>
                    </motion.div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {savedSets.map((set, i) => {
                            const isExpanded = expandedSetId === set.id;
                            const diffInfo = DIFFICULTY_LABELS[set.difficulty] || DIFFICULTY_LABELS.medium;
                            const hasResults = set.results !== null;
                            const score = hasResults
                                ? Math.round((set.results.correct / set.results.total) * 100)
                                : null;

                            return (
                                <motion.div
                                    key={set.id}
                                    variants={MOTION.fadeUp}
                                    initial="hidden"
                                    animate="visible"
                                    transition={{ delay: i * 0.03 }}
                                    style={{
                                        background: C.surface, border: `1px solid ${C.border}`,
                                        borderRadius: 14, overflow: 'hidden'
                                    }}
                                >
                                    {/* Card header — always visible */}
                                    <button
                                        onClick={() => setExpandedSetId(isExpanded ? null : set.id)}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: 12,
                                            width: '100%', padding: '14px 16px',
                                            background: 'transparent', border: 'none',
                                            color: C.text, cursor: 'pointer', textAlign: 'right'
                                        }}
                                    >
                                        <div style={{
                                            width: 36, height: 36, borderRadius: 10,
                                            background: `${diffInfo.color}15`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            flexShrink: 0
                                        }}>
                                            {hasResults ? (
                                                <CheckCircle size={18} color={score >= 70 ? C.green : C.orange} />
                                            ) : (
                                                <Clock size={18} color={C.muted} />
                                            )}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                                                <span style={{ fontSize: 14, fontWeight: 600 }}>
                                                    {set.count} שאלות
                                                </span>
                                                <span style={{
                                                    fontSize: 10, fontWeight: 600, padding: '2px 6px',
                                                    borderRadius: 6, background: `${diffInfo.color}15`,
                                                    color: diffInfo.color,
                                                }}>
                                                    {diffInfo.label}
                                                </span>
                                            </div>
                                            <div style={{ fontSize: 12, color: C.muted }}>
                                                {formatDate(set.createdAt)}
                                                {hasResults && (
                                                    <span style={{ marginRight: 8, color: score >= 70 ? C.green : C.orange, fontWeight: 600 }}>
                                                        {' '}{score}% ({set.results.correct}/{set.results.total})
                                                    </span>
                                                )}
                                                {!hasResults && (
                                                    <span style={{ marginRight: 8, color: C.dim }}>
                                                        {' '}לא נפתר
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        {isExpanded ? <ChevronUp size={16} color={C.dim} /> : <ChevronDown size={16} color={C.dim} />}
                                    </button>

                                    {/* Expanded details */}
                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                                style={{ overflow: 'hidden' }}
                                            >
                                                <div style={{
                                                    padding: '0 16px 14px',
                                                    borderTop: `1px solid ${C.border}`, paddingTop: 12
                                                }}>
                                                    {/* Source words */}
                                                    {set.sourceWords && set.sourceWords.length > 0 && (
                                                        <div style={{ marginBottom: 12 }}>
                                                            <p style={{ fontSize: 11, color: C.dim, margin: '0 0 4px', fontWeight: 600 }}>
                                                                מילים שנבדקו:
                                                            </p>
                                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                                                {set.sourceWords.map((w, j) => (
                                                                    <span key={j} style={{
                                                                        padding: '2px 8px', borderRadius: 9999,
                                                                        background: C.surface, border: `1px solid ${C.border}`,
                                                                        fontSize: 11, color: C.text,
                                                                    }}>
                                                                        {w}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Actions */}
                                                    <div style={{ display: 'flex', gap: 8 }}>
                                                        <button
                                                            onClick={() => handleReplay(set)}
                                                            style={{
                                                                flex: 1, padding: '10px', borderRadius: 10,
                                                                border: 'none', background: C.purple,
                                                                color: 'white', fontSize: 13, fontWeight: 600,
                                                                cursor: 'pointer', display: 'flex',
                                                                alignItems: 'center', justifyContent: 'center', gap: 6
                                                            }}
                                                        >
                                                            <Play size={14} />
                                                            {hasResults ? 'תרגול חוזר' : 'התחל'}
                                                        </button>
                                                        <button
                                                            onClick={(e) => handleDelete(set.id, e)}
                                                            style={{
                                                                padding: '10px 14px', borderRadius: 10,
                                                                border: `1px solid ${C.border}`, background: C.surface,
                                                                color: C.red, cursor: 'pointer',
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                            }}
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
};

export default AIPracticeHub;
