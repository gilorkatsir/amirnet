import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useLocation } from 'wouter';
import Icon from '../components/Icon';
import { C } from '../styles/theme';
import {
    ENGLISH_QUESTIONS_METADATA,
    getQuestionsByType,
    getQuestionsByExam,
    getTypeHebrewName,
    getTypeIcon
} from '../data/englishQuestions';

/**
 * Question Type Selector Component
 * Allows users to choose practice mode: by question type, by exam, or mixed
 */
const QuestionTypeSelector = ({ onSelect }) => {
    const [, navigate] = useLocation();
    const [selectedType, setSelectedType] = useState(null);
    const [questionCount, setQuestionCount] = useState(10);

    const questionTypes = [
        {
            type: 'Sentence Completion',
            count: ENGLISH_QUESTIONS_METADATA.breakdown.sentenceCompletion.total,
            color: C.purple,
            desc: 'השלם את המשפט עם המילה המתאימה'
        },
        {
            type: 'Restatement',
            count: ENGLISH_QUESTIONS_METADATA.breakdown.restatement.total,
            color: C.orange,
            desc: 'בחר את הניסוח המחדש הנכון'
        },
        {
            type: 'Reading Comprehension',
            count: ENGLISH_QUESTIONS_METADATA.breakdown.readingComprehension.total,
            color: C.pink,
            desc: 'ענה על שאלות מבוססות קטע'
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

    return (
        <div style={{ minHeight: '100vh', background: C.bg, color: C.text }}>
            {/* Header */}
            <header style={{
                position: 'sticky',
                top: 0,
                zIndex: 10,
                background: 'rgba(18,18,18,0.95)',
                backdropFilter: 'blur(12px)',
                padding: '16px 20px',
                borderBottom: `1px solid ${C.border}`,
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
                    <Icon name="arrow_back" size={24} style={{ color: C.muted }} />
                </button>
                <div>
                    <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: 'white' }}>
                        שאלות באנגלית
                    </h1>
                    <p style={{ fontSize: 12, color: C.muted, margin: '4px 0 0' }}>
                        {ENGLISH_QUESTIONS_METADATA.totalQuestions} שאלות מ-{ENGLISH_QUESTIONS_METADATA.exams.length} מבחנים
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
                        {questionTypes.map(({ type, count, color, desc }) => (
                            <button
                                key={type}
                                onClick={() => handleTypeSelect(type)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 14,
                                    padding: 16,
                                    background: selectedType === type ? 'rgba(139, 92, 246, 0.1)' : C.surface,
                                    border: selectedType === type ? `2px solid ${color}` : `1px solid ${C.border}`,
                                    borderRadius: 12,
                                    cursor: 'pointer',
                                    textAlign: 'right',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <div style={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: 10,
                                    background: `${color}20`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    <Icon name={getTypeIcon(type)} size={22} style={{ color }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{
                                        margin: 0,
                                        fontSize: 15,
                                        fontWeight: 600,
                                        color: 'white'
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
                                    borderRadius: 12,
                                    fontSize: 12,
                                    fontWeight: 600,
                                    color
                                }}>
                                    {count}
                                </div>
                            </button>
                        ))}

                        {/* Mixed option */}
                        <button
                            onClick={() => handleTypeSelect('mixed')}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 14,
                                padding: 16,
                                background: selectedType === 'mixed' ? 'rgba(139, 92, 246, 0.1)' : C.surface,
                                border: selectedType === 'mixed' ? `2px solid ${C.green}` : `1px solid ${C.border}`,
                                borderRadius: 12,
                                cursor: 'pointer',
                                textAlign: 'right',
                                transition: 'all 0.2s'
                            }}
                        >
                            <div style={{
                                width: 44,
                                height: 44,
                                borderRadius: 10,
                                background: `${C.green}20`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                            }}>
                                <Icon name="shuffle" size={22} style={{ color: C.green }} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: 'white' }}>
                                    תרגול מעורב
                                </h3>
                                <p style={{ margin: '4px 0 0', fontSize: 12, color: C.muted }}>
                                    כל סוגי השאלות ביחד
                                </p>
                            </div>
                            <div style={{
                                padding: '4px 10px',
                                background: `${C.green}15`,
                                borderRadius: 12,
                                fontSize: 12,
                                fontWeight: 600,
                                color: C.green
                            }}>
                                {ENGLISH_QUESTIONS_METADATA.totalQuestions}
                            </div>
                        </button>
                    </div>
                </section>

                {/* Question Count Selection */}
                {selectedType && (
                    <section style={{ marginBottom: 32 }}>
                        <h2 style={{ fontSize: 14, fontWeight: 600, color: C.muted, marginBottom: 12 }}>
                            מספר שאלות
                        </h2>
                        <div style={{ display: 'flex', gap: 10 }}>
                            {countOptions.map(count => (
                                <button
                                    key={count}
                                    onClick={() => setQuestionCount(count)}
                                    style={{
                                        flex: 1,
                                        padding: '12px 16px',
                                        background: questionCount === count ? C.gradient : C.surface,
                                        border: questionCount === count ? 'none' : `1px solid ${C.border}`,
                                        borderRadius: 10,
                                        fontSize: 15,
                                        fontWeight: 600,
                                        color: 'white',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {count}
                                </button>
                            ))}
                        </div>
                    </section>
                )}

                {/* Start Practice Button */}
                {selectedType && (
                    <button
                        onClick={handleStart}
                        style={{
                            width: '100%',
                            padding: '16px 24px',
                            background: C.gradient,
                            border: 'none',
                            borderRadius: 12,
                            fontSize: 16,
                            fontWeight: 700,
                            color: 'white',
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
                        <Icon name="play_arrow" size={20} />
                    </button>
                )}

                {/* RC Study Mode */}
                {(
                    <section style={{ marginBottom: 32 }}>
                        <h2 style={{ fontSize: 14, fontWeight: 600, color: C.muted, marginBottom: 12 }}>
                            תרגול הבנת הנקרא
                        </h2>
                        <button
                            onClick={() => navigate('/rc-practice')}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 14,
                                padding: 16, width: '100%', background: C.surface,
                                border: `1px solid ${C.border}`, borderRadius: 12,
                                cursor: 'pointer', textAlign: 'right', transition: 'all 0.2s'
                            }}
                        >
                            <div style={{
                                width: 44, height: 44, borderRadius: 10,
                                background: 'rgba(236,72,153,0.15)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                            }}>
                                <Icon name="menu_book" size={22} style={{ color: C.pink }} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: 'white' }}>
                                    לימוד קטעי קריאה
                                </h3>
                                <p style={{ margin: '4px 0 0', fontSize: 12, color: C.muted }}>
                                    בחר קטע, קרא ותרגל שאלות עם הטקסט לנגד עיניך
                                </p>
                            </div>
                            <Icon name="chevron_left" size={20} style={{ color: C.muted }} />
                        </button>
                    </section>
                )}

                {/* Full Exam Mode */}
                <section>
                    <h2 style={{ fontSize: 14, fontWeight: 600, color: C.muted, marginBottom: 16 }}>
                        סימולציית מבחן מלאה
                    </h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {exams.map(exam => {
                            const examQuestions = getQuestionsByExam(exam);
                            return (
                                <button
                                    key={exam}
                                    onClick={() => handleExamSelect(exam)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 14,
                                        padding: '14px 16px',
                                        background: C.surface,
                                        border: `1px solid ${C.border}`,
                                        borderRadius: 12,
                                        cursor: 'pointer',
                                        textAlign: 'right',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <div style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 8,
                                        background: `${C.orange}15`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <Icon name="assignment" size={20} style={{ color: C.orange }} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'white' }}>
                                            {exam}
                                        </h3>
                                        <p style={{ margin: '2px 0 0', fontSize: 11, color: C.muted }}>
                                            {examQuestions.length} שאלות • 2 חלקים
                                        </p>
                                    </div>
                                    <Icon name="chevron_left" size={20} style={{ color: C.muted }} />
                                </button>
                            );
                        })}
                    </div>
                </section>
            </main>
        </div>
    );
};

QuestionTypeSelector.propTypes = {
    onSelect: PropTypes.func.isRequired
};

export default QuestionTypeSelector;
