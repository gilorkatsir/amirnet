import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Pencil, ArrowLeftRight, BookOpen, Shuffle, Play, ChevronLeft, ClipboardList, Lock } from 'lucide-react';
import { C, GLASS, RADIUS, SURFACE, HEADING } from '../styles/theme';
import { useTier } from '../contexts/TierContext';
import UpgradePrompt from '../components/UpgradePrompt';
import {
    ENGLISH_QUESTIONS_METADATA,
    getQuestionsByType,
    getQuestionsByExam,
    getTypeHebrewName
} from '../data/englishQuestions';

const TYPE_ICON_MAP = {
    'edit_note': Pencil,
    'swap_horiz': ArrowLeftRight,
    'menu_book': BookOpen
};

/**
 * Question Type Selector Component
 * Allows users to choose practice mode: by question type, by exam, or mixed
 */
const QuestionTypeSelector = ({ onSelect }) => {
    const [, navigate] = useLocation();
    const { isPremium, FREE_LIMITS } = useTier();
    const [selectedType, setSelectedType] = useState(null);
    const [questionCount, setQuestionCount] = useState(10);
    const [showUpgrade, setShowUpgrade] = useState(false);

    const questionTypes = [
        {
            type: 'Sentence Completion',
            count: ENGLISH_QUESTIONS_METADATA.breakdown.sentenceCompletion.total,
            color: C.purple,
            desc: 'השלם את המשפט עם המילה המתאימה',
            Icon: Pencil
        },
        {
            type: 'Restatement',
            count: ENGLISH_QUESTIONS_METADATA.breakdown.restatement.total,
            color: C.orange,
            desc: 'בחר את הניסוח המחדש הנכון',
            Icon: ArrowLeftRight
        },
        {
            type: 'Reading Comprehension',
            count: ENGLISH_QUESTIONS_METADATA.breakdown.readingComprehension.total,
            color: C.pink,
            desc: 'ענה על שאלות מבוססות קטע',
            Icon: BookOpen
        }
    ];

    const exams = ENGLISH_QUESTIONS_METADATA.exams;

    const handleTypeSelect = (type) => {
        setSelectedType(type);
    };

    const handleStart = () => {
        if (selectedType) {
            const questions = selectedType === 'mixed'
                ? null  // Will be handled by parent
                : getQuestionsByType(selectedType);

            onSelect({
                mode: 'practice',
                type: selectedType,
                count: questionCount,
                questions
            });
        }
    };

    const handleExamSelect = (exam) => {
        const questions = getQuestionsByExam(exam);
        onSelect({
            mode: 'exam',
            exam,
            count: questions.length,
            questions
        });
    };

    const countOptions = [10, 20, 30];

    // Shared style for type/mixed buttons in their selected vs unselected state
    const typeCardStyle = (isSelected, color) => ({
        ...SURFACE.elevated,
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: 16,
        background: isSelected ? `${color}12` : SURFACE.elevated.background,
        border: isSelected ? `2px solid ${color}` : SURFACE.elevated.border,
        cursor: 'pointer',
        textAlign: 'right',
        width: '100%',
    });

    return (
        <div style={{ minHeight: '100vh', background: C.bg, color: C.text }}>
            {/* Header */}
            <header style={{
                ...GLASS.header,
                position: 'sticky',
                top: 0,
                zIndex: 10,
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: 16
            }}>
                <button
                    onClick={() => navigate('/')}
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 8
                    }}
                >
                    <ArrowRight size={24} style={{ color: C.muted }} />
                </button>
                <div>
                    <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: C.text }}>
                        שאלות באנגלית
                    </h1>
                    <p style={{ fontSize: 12, color: C.muted, margin: '4px 0 0' }}>
                        {ENGLISH_QUESTIONS_METADATA.totalQuestions} שאלות מ-{ENGLISH_QUESTIONS_METADATA.exams.length} מבחנים
                        {!isPremium && <span style={{ color: C.orange }}> · חינמי: עד {FREE_LIMITS.englishQuestions}</span>}
                    </p>
                </div>
            </header>

            <main style={{ padding: 20 }}>
                {/* Question Type Selection */}
                <section style={{ marginBottom: 32 }}>
                    <h2 style={{ fontSize: 14, fontWeight: 600, color: C.muted, marginBottom: 16 }}>
                        בחר סוג שאלה
                    </h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {questionTypes.map(({ type, count, color, desc, Icon: TypeIcon }, i) => (
                            <motion.button
                                key={type}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.06, duration: 0.35, ease: 'easeOut' }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => handleTypeSelect(type)}
                                style={typeCardStyle(selectedType === type, color)}
                            >
                                <TypeIcon size={22} color={color} style={{ flexShrink: 0 }} />
                                <div style={{ flex: 1 }}>
                                    <h3 style={{
                                        margin: 0,
                                        fontSize: 15,
                                        fontWeight: 600,
                                        color: C.text
                                    }}>
                                        {getTypeHebrewName(type)}
                                    </h3>
                                    <p style={{
                                        margin: '4px 0 0',
                                        fontSize: 12,
                                        color: C.muted
                                    }}>
                                        {desc}
                                    </p>
                                </div>
                                <div style={{
                                    padding: '4px 10px',
                                    background: `${color}15`,
                                    borderRadius: RADIUS.md,
                                    fontSize: 12,
                                    fontWeight: 600,
                                    color
                                }}>
                                    {count}
                                </div>
                            </motion.button>
                        ))}

                        {/* Mixed option */}
                        <motion.button
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: questionTypes.length * 0.06, duration: 0.35, ease: 'easeOut' }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => handleTypeSelect('mixed')}
                            style={typeCardStyle(selectedType === 'mixed', C.green)}
                        >
                            <Shuffle size={22} color={C.green} style={{ flexShrink: 0 }} />
                            <div style={{ flex: 1 }}>
                                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: C.text }}>
                                    תרגול מעורב
                                </h3>
                                <p style={{ margin: '4px 0 0', fontSize: 12, color: C.muted }}>
                                    כל סוגי השאלות ביחד
                                </p>
                            </div>
                            <div style={{
                                padding: '4px 10px',
                                background: `${C.green}15`,
                                borderRadius: RADIUS.md,
                                fontSize: 12,
                                fontWeight: 600,
                                color: C.green
                            }}>
                                {ENGLISH_QUESTIONS_METADATA.totalQuestions}
                            </div>
                        </motion.button>
                    </div>
                </section>

                {/* Question Count Selection */}
                <AnimatePresence>
                    {selectedType && (
                        <motion.section
                            key="count-selector"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            style={{ marginBottom: 32, overflow: 'hidden' }}
                        >
                            <h2 style={{ fontSize: 14, fontWeight: 600, color: C.muted, marginBottom: 12 }}>
                                מספר שאלות
                            </h2>
                            <div style={{ display: 'flex', gap: 10 }}>
                                {countOptions.map(count => (
                                    <motion.button
                                        key={count}
                                        whileTap={{ scale: 0.97 }}
                                        onClick={() => setQuestionCount(count)}
                                        style={{
                                            ...(questionCount === count ? {} : GLASS.button),
                                            flex: 1,
                                            padding: '12px 16px',
                                            background: questionCount === count ? C.gradient : GLASS.button.background,
                                            border: questionCount === count ? 'none' : GLASS.button.border,
                                            borderRadius: RADIUS.md,
                                            fontSize: 15,
                                            fontWeight: 600,
                                            color: C.text,
                                            cursor: 'pointer',
                                        }}
                                    >
                                        {count}
                                    </motion.button>
                                ))}
                            </div>
                        </motion.section>
                    )}
                </AnimatePresence>

                {/* Start Practice Button */}
                <AnimatePresence>
                    {selectedType && (
                        <motion.button
                            key="start-btn"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 12 }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                            whileTap={{ scale: 0.96 }}
                            onClick={handleStart}
                            style={{
                                width: '100%',
                                padding: '16px 24px',
                                background: C.gradient,
                                border: 'none',
                                borderRadius: RADIUS.lg,
                                fontSize: 16,
                                fontWeight: 700,
                                color: C.text,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 8,
                                boxShadow: '0 8px 24px rgba(124,58,237,0.3)',
                                marginBottom: 32
                            }}
                        >
                            התחל תרגול
                            <Play size={20} />
                        </motion.button>
                    )}
                </AnimatePresence>

                {/* RC Study Mode */}
                {(
                    <section style={{ marginBottom: 32 }}>
                        <h2 style={{ fontSize: 14, fontWeight: 600, color: C.muted, marginBottom: 12 }}>
                            תרגול הבנת הנקרא
                        </h2>
                        <motion.button
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1, duration: 0.35, ease: 'easeOut' }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => navigate('/rc-practice')}
                            style={{
                                ...SURFACE.elevated,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 14,
                                padding: 16,
                                width: '100%',
                                cursor: 'pointer',
                                textAlign: 'right',
                            }}
                        >
                            <BookOpen size={22} color={C.pink} style={{ flexShrink: 0 }} />
                            <div style={{ flex: 1 }}>
                                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: C.text }}>
                                    לימוד קטעי קריאה
                                </h3>
                                <p style={{ margin: '4px 0 0', fontSize: 12, color: C.muted }}>
                                    בחר קטע, קרא ותרגל שאלות עם הטקסט לנגד עיניך
                                </p>
                            </div>
                            <ChevronLeft size={20} style={{ color: C.muted }} />
                        </motion.button>
                    </section>
                )}

                {/* Full Exam Mode */}
                <section>
                    <h2 style={{ fontSize: 14, fontWeight: 600, color: C.muted, marginBottom: 16 }}>
                        סימולציית מבחן מלאה
                    </h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {exams.map((exam, i) => {
                            const examQuestions = getQuestionsByExam(exam);
                            const locked = !isPremium;
                            return (
                                <motion.button
                                    key={exam}
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.06, duration: 0.35, ease: 'easeOut' }}
                                    whileTap={{ scale: locked ? 1 : 0.97 }}
                                    onClick={() => locked ? setShowUpgrade(true) : handleExamSelect(exam)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 14,
                                        padding: '14px 16px',
                                        background: C.surface,
                                        border: `1px solid ${C.border}`,
                                        borderRadius: 14,
                                        cursor: 'pointer',
                                        textAlign: 'right',
                                        width: '100%',
                                        opacity: locked ? 0.5 : 1,
                                    }}
                                >
                                    {locked ? (
                                        <Lock size={20} color={C.dim} style={{ flexShrink: 0 }} />
                                    ) : (
                                        <ClipboardList size={20} color={C.orange} style={{ flexShrink: 0 }} />
                                    )}
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: locked ? C.muted : C.text }}>
                                            {exam}
                                        </h3>
                                        <p style={{ margin: '2px 0 0', fontSize: 11, color: C.muted }}>
                                            {examQuestions.length} שאלות • 2 חלקים
                                        </p>
                                    </div>
                                    {locked ? <Lock size={16} color={C.dim} /> : <ChevronLeft size={20} style={{ color: C.muted }} />}
                                </motion.button>
                            );
                        })}
                    </div>
                </section>
            </main>
            <UpgradePrompt isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} limitType="questions" />
        </div>
    );
};

QuestionTypeSelector.propTypes = {
    onSelect: PropTypes.func.isRequired
};

export default QuestionTypeSelector;
