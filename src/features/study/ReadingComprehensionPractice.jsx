import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useLocation } from 'wouter';
import Icon from '../../components/Icon';
import { C } from '../../styles/theme';
import rcDatabase from '../../data/reading_comprehension_database.json';
import { playCorrect, playIncorrect, playClick } from '../../utils/sounds';
import { useStatsContext } from '../../contexts/StatsContext';
import { useUserWords } from '../../contexts/UserWordsContext';

const passages = rcDatabase.passages;

/**
 * Reading Comprehension Study Mode
 * Browse passages, answer questions with always-visible text, save words
 */
const ReadingComprehensionPractice = ({ onComplete }) => {
    const [, navigate] = useLocation();
    const { updateEnglishProgress } = useStatsContext();
    const { saveWord } = useUserWords();
    const [view, setView] = useState('list'); // 'list' or 'practice'
    const [selectedPassage, setSelectedPassage] = useState(null);
    const [questionIndex, setQuestionIndex] = useState(0);
    const [selected, setSelected] = useState(null);
    const [answered, setAnswered] = useState(false);
    const [results, setResults] = useState({ correct: 0, incorrect: 0, answers: [] });

    // Track per-passage accuracy in localStorage
    const getPassageStats = useCallback(() => {
        try {
            const stored = localStorage.getItem('wm_rc_passage_stats');
            return stored ? JSON.parse(stored) : {};
        } catch { return {}; }
    }, []);

    const savePassageStats = useCallback((passageId, correct, total) => {
        const stats = getPassageStats();
        if (!stats[passageId]) stats[passageId] = { correct: 0, total: 0 };
        stats[passageId].correct += correct;
        stats[passageId].total += total;
        localStorage.setItem('wm_rc_passage_stats', JSON.stringify(stats));
    }, [getPassageStats]);

    const passageStats = getPassageStats();

    const handleSelectPassage = (passage) => {
        playClick();
        setSelectedPassage(passage);
        setQuestionIndex(0);
        setSelected(null);
        setAnswered(false);
        setResults({ correct: 0, incorrect: 0, answers: [] });
        setView('practice');
    };

    const handleAnswer = (index) => {
        if (answered) return;
        setSelected(index);
        setAnswered(true);

        const question = selectedPassage.questions[questionIndex];
        const isCorrect = index === (question.correctAnswer - 1);

        if (isCorrect) playCorrect();
        else playIncorrect();

        setResults(prev => ({
            correct: prev.correct + (isCorrect ? 1 : 0),
            incorrect: prev.incorrect + (isCorrect ? 0 : 1),
            answers: [...prev.answers, { questionNumber: question.questionNumber, isCorrect }]
        }));

        if (updateEnglishProgress) {
            updateEnglishProgress(`rc_${question.questionNumber}`, isCorrect);
        }
    };

    const handleNext = () => {
        if (questionIndex < selectedPassage.questions.length - 1) {
            setQuestionIndex(prev => prev + 1);
            setSelected(null);
            setAnswered(false);
        } else {
            // Passage complete
            savePassageStats(selectedPassage.id, results.correct, results.correct + results.incorrect);
            if (onComplete) onComplete(results);
            else setView('list');
        }
    };

    const handleWordTap = (word) => {
        if (!saveWord) return;
        // Clean the word from punctuation
        const cleaned = word.replace(/[^a-zA-Z'-]/g, '');
        if (cleaned.length > 1) {
            saveWord(cleaned);
        }
    };

    // Passage List View
    if (view === 'list') {
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
                        <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: 'white' }}>הבנת הנקרא</h2>
                        <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>{passages.length} קטעים לתרגול</p>
                    </div>
                </header>

                <main style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {passages.map((passage, i) => {
                        const stats = passageStats[passage.id];
                        const accuracy = stats && stats.total > 0
                            ? Math.round((stats.correct / stats.total) * 100)
                            : null;
                        const preview = passage.passage.substring(0, 80) + '...';

                        return (
                            <button
                                key={passage.id}
                                onClick={() => handleSelectPassage(passage)}
                                style={{
                                    display: 'flex', flexDirection: 'column', gap: 8,
                                    padding: 16, background: C.surface,
                                    border: `1px solid ${C.border}`, borderRadius: 12,
                                    cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <div style={{
                                            width: 36, height: 36, borderRadius: 8,
                                            background: accuracy !== null ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.05)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: accuracy !== null ? C.purple : C.muted
                                        }}>
                                            <Icon name="menu_book" size={18} />
                                        </div>
                                        <div>
                                            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'white' }}>
                                                קטע {i + 1} - מבחן {passage.exam}
                                            </h3>
                                            <p style={{ margin: '2px 0 0', fontSize: 12, color: C.muted }}>
                                                {passage.questions.length} שאלות
                                            </p>
                                        </div>
                                    </div>
                                    {accuracy !== null && (
                                        <span style={{
                                            fontSize: 13, fontWeight: 700,
                                            color: accuracy >= 70 ? C.green : C.orange,
                                            padding: '4px 10px', borderRadius: 8,
                                            background: accuracy >= 70 ? 'rgba(34,197,94,0.1)' : 'rgba(251,146,60,0.1)'
                                        }}>
                                            {accuracy}%
                                        </span>
                                    )}
                                </div>
                                <p style={{ margin: 0, fontSize: 13, color: C.muted, lineHeight: 1.4 }} dir="ltr">
                                    {preview}
                                </p>
                            </button>
                        );
                    })}
                </main>
            </div>
        );
    }

    // Practice View
    const currentQuestion = selectedPassage.questions[questionIndex];
    const progress = ((questionIndex + 1) / selectedPassage.questions.length) * 100;

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: C.bg }}>
            {/* Header */}
            <header style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 20px', background: 'rgba(26,26,26,0.95)',
                backdropFilter: 'blur(8px)', borderBottom: `1px solid ${C.border}`
            }}>
                <button onClick={() => setView('list')} style={{
                    width: 36, height: 36, borderRadius: '50%', background: 'transparent',
                    border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <Icon name="close" size={22} style={{ color: '#d1d5db' }} />
                </button>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, background: C.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            {questionIndex + 1}
                        </span>
                        <div style={{ width: 100, height: 4, background: '#282828', borderRadius: 2, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${progress}%`, background: C.gradient, borderRadius: 2, transition: 'width 0.3s ease' }} />
                        </div>
                        <span style={{ fontSize: 13, color: '#4b5563' }}>{selectedPassage.questions.length}</span>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 10px', background: results.correct > 0 ? 'rgba(34,197,94,0.1)' : 'transparent', borderRadius: 16 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: C.green }}>{results.correct}</span>
                    <span style={{ fontSize: 11, color: C.muted }}>/</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: C.red }}>{results.incorrect}</span>
                </div>
            </header>

            {/* Content - scrollable */}
            <div style={{ flex: 1, overflowY: 'auto', padding: 20 }} dir="ltr">
                {/* Always-visible passage */}
                <div style={{
                    padding: 16, background: 'rgba(139,92,246,0.08)',
                    borderRadius: 12, marginBottom: 20,
                    border: '1px solid rgba(139,92,246,0.15)',
                    maxHeight: '40vh', overflowY: 'auto'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                        <Icon name="menu_book" size={14} style={{ color: C.purple }} />
                        <span style={{ fontSize: 11, fontWeight: 700, color: C.purple, textTransform: 'uppercase', letterSpacing: 1 }}>
                            Passage (tap a word to save)
                        </span>
                    </div>
                    <p style={{ fontSize: 15, lineHeight: 1.7, color: 'rgba(255,255,255,0.9)', margin: 0 }}>
                        {selectedPassage.passage.split(/(\s+)/).map((word, i) => {
                            if (/^\s+$/.test(word)) return word;
                            return (
                                <span
                                    key={i}
                                    onClick={() => handleWordTap(word)}
                                    style={{ cursor: 'pointer', borderRadius: 2, transition: 'background 0.15s' }}
                                    onMouseEnter={(e) => e.target.style.background = 'rgba(139,92,246,0.25)'}
                                    onMouseLeave={(e) => e.target.style.background = 'transparent'}
                                >
                                    {word}
                                </span>
                            );
                        })}
                    </p>
                </div>

                {/* Question */}
                <div style={{ marginBottom: 20 }}>
                    <p style={{ fontSize: 17, lineHeight: 1.6, color: 'rgba(255,255,255,0.95)', margin: 0, fontWeight: 500 }}>
                        {currentQuestion.question}
                    </p>
                </div>

                {/* Options */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                    {currentQuestion.choices.map((choice, i) => {
                        const letter = ['A', 'B', 'C', 'D'][i];
                        const isSelected = selected === i;
                        const isCorrect = i === (currentQuestion.correctAnswer - 1);

                        let bg = '#232323', brd = '#2f2f2f', textColor = '#e5e5e5';
                        if (answered) {
                            if (isCorrect) { bg = 'rgba(34,197,94,0.15)'; brd = C.green; textColor = 'white'; }
                            else if (isSelected) { bg = 'rgba(239,68,68,0.15)'; brd = C.red; }
                        } else if (isSelected) { bg = '#2a2a2a'; brd = C.purple; }

                        return (
                            <button
                                key={i}
                                onClick={() => handleAnswer(i)}
                                disabled={answered}
                                style={{
                                    display: 'flex', alignItems: 'flex-start', padding: '14px 16px',
                                    borderRadius: 12, background: bg, border: `1px solid ${brd}`,
                                    cursor: answered ? 'default' : 'pointer', textAlign: 'left',
                                    transition: 'all 0.2s', gap: 12
                                }}
                            >
                                <div style={{
                                    width: 24, height: 24, borderRadius: '50%',
                                    border: isSelected ? 'none' : '1.5px solid #6b728080',
                                    background: isSelected ? C.gradient : 'transparent',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    flexShrink: 0, marginTop: 2
                                }}>
                                    {isSelected && (
                                        answered ? (
                                            <Icon name={isCorrect ? 'check' : 'close'} size={14} style={{ color: 'white' }} />
                                        ) : (
                                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'white' }} />
                                        )
                                    )}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <span style={{ fontSize: 11, fontWeight: 700, color: isSelected ? C.purple : '#6b728080', marginRight: 8 }}>{letter}</span>
                                    <span style={{ fontSize: 15, lineHeight: 1.5, color: textColor }}>{choice}</span>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Next button */}
                <button
                    onClick={handleNext}
                    disabled={!answered}
                    style={{
                        width: '100%', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        borderRadius: 12, background: answered ? C.gradient : '#333',
                        border: 'none', color: 'white', fontSize: 16, fontWeight: 700,
                        cursor: answered ? 'pointer' : 'default', opacity: answered ? 1 : 0.5,
                        boxShadow: answered ? '0 8px 24px rgba(124,58,237,0.25)' : 'none',
                        transition: 'all 0.2s'
                    }}
                >
                    {answered ? (
                        questionIndex < selectedPassage.questions.length - 1
                            ? <>שאלה הבאה <Icon name="arrow_back" size={20} /></>
                            : <>סיום <Icon name="check" size={20} /></>
                    ) : 'בחר תשובה'}
                </button>
            </div>
        </div>
    );
};

ReadingComprehensionPractice.propTypes = {
    onComplete: PropTypes.func
};

export default ReadingComprehensionPractice;
