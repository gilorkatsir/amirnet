import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Icon from '../../components/Icon';
import { C } from '../../styles/theme';
import EnglishQuestion from '../study/EnglishQuestion';
import { playTimerComplete, playClick } from '../../utils/sounds';

/**
 * English Exam Session Component
 * Handles both practice mode (by question type) and full exam mode
 */
const EnglishExamSession = ({
    mode, // 'practice' or 'exam'
    questions,
    title,
    onUpdateProgress,
    onSaveWord,
    onComplete,
    onExit
}) => {
    const [index, setIndex] = useState(0);
    const [sessionResults, setSessionResults] = useState({
        correct: 0,
        incorrect: 0,
        answers: [] // Track individual answers for detailed results
    });

    const currentQuestion = questions[index];
    const progress = ((index + 1) / questions.length) * 100;

    // Timer Logic
    const [timeLeft, setTimeLeft] = useState(mode === 'exam' ? 20 * 60 : null);
    const [timerEnabled, setTimerEnabled] = useState(mode === 'exam');

    const formatTime = (seconds) => {
        if (seconds === null) return '--:--';
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    // Load saved progress on mount
    React.useEffect(() => {
        const saved = localStorage.getItem('wm_english_progress');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed.questionId === questions[0]?.id) { // explicit check to ensure we match the session
                    // Logic: if the saved progress matches the current set of questions (heuristic)
                    // Actually, questions prop might be dynamic. Ideally we'd have a session ID.
                    // For now, we'll trust the user just refreshed the page with the same session active.
                    if (parsed.index < questions.length) {
                        setIndex(parsed.index);
                        setSessionResults(parsed.results);
                        if (parsed.timeLeft !== undefined) setTimeLeft(parsed.timeLeft);
                    }
                } else if (questions.length > 0) {
                    // If questions don't match (e.g. new random set generated on reload but we saved old one),
                    // we might want to be careful. However, App.jsx restores the *exact* same questions array.
                    // So we can rely on index being valid.
                    // Let's just check bounds.
                    if (parsed.index < questions.length) {
                        setIndex(parsed.index);
                        setSessionResults(parsed.results);
                    }
                }
            } catch (e) {
                console.error('Failed to restore english progress', e);
            }
        }
    }, []);

    // Timer Countdown
    React.useEffect(() => {
        if (timerEnabled && timeLeft !== null && timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft((prev) => {
                    const next = prev - 1;
                    if (next <= 0) {
                        clearInterval(timer);
                        playTimerComplete();
                        onComplete(sessionResults); // Auto-submit
                        return 0;
                    }
                    return next;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [timerEnabled, timeLeft, onComplete, sessionResults]);

    // Save progress on change
    React.useEffect(() => {
        if (sessionResults.answers.length > 0 || index > 0) {
            localStorage.setItem('wm_english_progress', JSON.stringify({
                index,
                results: sessionResults,
                timeLeft, // Save timer
                timestamp: Date.now()
            }));
        }
    }, [index, sessionResults]);

    const handleResult = (isCorrect) => {
        setSessionResults(prev => ({
            correct: prev.correct + (isCorrect ? 1 : 0),
            incorrect: prev.incorrect + (isCorrect ? 0 : 1),
            answers: [...prev.answers, {
                questionId: currentQuestion.id,
                type: currentQuestion.type,
                isCorrect
            }]
        }));

        // Update global progress
        if (onUpdateProgress) {
            onUpdateProgress(currentQuestion.id, isCorrect);
        }
    };

    const handleNext = () => {
        if (index < questions.length - 1) {
            setIndex(index + 1);
        } else {
            onComplete(sessionResults);
        }
    };

    // Get current question type breakdown for exam mode
    const getTypeProgress = () => {
        if (mode !== 'exam') return null;

        const answered = sessionResults.answers;
        const byType = {
            'Sentence Completion': { total: 0, correct: 0 },
            'Restatement': { total: 0, correct: 0 },
            'Reading Comprehension': { total: 0, correct: 0 }
        };

        answered.forEach(a => {
            if (byType[a.type]) {
                byType[a.type].total++;
                if (a.isCorrect) byType[a.type].correct++;
            }
        });

        return byType;
    };

    const getModeLabel = () => {
        if (mode === 'exam') return 'סימולציית מבחן';

        const labels = {
            'Sentence Completion': 'השלמת משפטים',
            'Restatement': 'ניסוח מחדש',
            'Reading Comprehension': 'הבנת הנקרא'
        };
        return title || labels[currentQuestion?.type] || 'תרגול אנגלית';
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: C.bg }}>
            {/* Header */}
            <header style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 20px',
                background: 'rgba(26,26,26,0.95)',
                backdropFilter: 'blur(8px)',
                borderBottom: `1px solid ${C.border}`
            }}>
                <button
                    onClick={onExit}
                    style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <Icon name="close" size={24} style={{ color: '#d1d5db' }} />
                </button>

                <div style={{ textAlign: 'center' }}>
                    {mode === 'exam' && timeLeft !== null ? (
                        /* Exam Timer Display */
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{
                                fontSize: 20, fontWeight: 700,
                                color: timeLeft < 60 ? '#ef4444' : 'white',
                                fontVariantNumeric: 'tabular-nums',
                                display: 'flex', alignItems: 'center', gap: 6
                            }}>
                                <Icon name="timer" size={20} />
                                {formatTime(timeLeft)}
                            </div>
                            <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
                                שאלה {index + 1} מתוך {questions.length}
                            </div>
                        </div>
                    ) : (
                        /* Standard Progress Display */
                        <>
                            <h2 style={{
                                fontSize: 11,
                                fontWeight: 700,
                                color: C.purple,
                                textTransform: 'uppercase',
                                letterSpacing: 1.5,
                                margin: '0 0 6px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 6
                            }}>
                                <Icon name="quiz" size={14} />
                                {getModeLabel()}
                            </h2>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{
                                    fontSize: 13,
                                    fontWeight: 700,
                                    background: C.gradient,
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent'
                                }}>
                                    {index + 1}
                                </span>
                                <div style={{
                                    width: 100,
                                    height: 4,
                                    background: '#282828',
                                    borderRadius: 2,
                                    overflow: 'hidden'
                                }}>
                                    <div style={{
                                        height: '100%',
                                        borderRadius: 2,
                                        width: `${progress}%`,
                                        background: C.gradient,
                                        transition: 'width 0.3s ease'
                                    }} />
                                </div>
                                <span style={{ fontSize: 13, color: '#4b5563' }}>{questions.length}</span>
                            </div>
                        </>
                    )}
                </div>

                {/* Timer Toggle + Score indicator */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12
                }}>
                    {/* Timer Toggle Button */}
                    <button
                        onClick={() => {
                            playClick();
                            setTimerEnabled(!timerEnabled);
                        }}
                        style={{
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            background: timerEnabled ? C.orange : C.surface,
                            border: timerEnabled ? 'none' : `1px solid ${C.border}`,
                            color: timerEnabled ? 'white' : C.muted,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s'
                        }}
                        title={timerEnabled ? 'כבה טיימר' : 'הפעל טיימר'}
                    >
                        <Icon name={timerEnabled ? "timer" : "timer_off"} size={18} />
                    </button>

                    {/* Score */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '6px 12px',
                        background: sessionResults.correct > 0 ? 'rgba(34,197,94,0.1)' : 'transparent',
                        borderRadius: 20
                    }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: C.green }}>
                            {sessionResults.correct}
                        </span>
                        <span style={{ fontSize: 11, color: C.muted }}>/</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: C.red }}>
                            {sessionResults.incorrect}
                        </span>
                    </div>
                </div>
            </header>

            {/* Question Content */}
            <div style={{ flex: 1, display: 'flex', background: '#1a1a1a', overflowY: 'auto' }}>
                <EnglishQuestion
                    key={currentQuestion.id}
                    question={currentQuestion}
                    onResult={handleResult}
                    onSaveWord={onSaveWord}
                    onNext={handleNext}
                />
            </div>
        </div>
    );
};

EnglishExamSession.propTypes = {
    mode: PropTypes.oneOf(['practice', 'exam']).isRequired,
    questions: PropTypes.array.isRequired,
    title: PropTypes.string,
    onUpdateProgress: PropTypes.func,
    onSaveWord: PropTypes.func,
    onComplete: PropTypes.func.isRequired,
    onExit: PropTypes.func.isRequired
};

export default EnglishExamSession;
