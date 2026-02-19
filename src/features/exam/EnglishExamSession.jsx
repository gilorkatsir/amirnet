import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Timer, TimerOff, Brain } from 'lucide-react';
import { C, GLASS, RADIUS } from '../../styles/theme';
import EnglishQuestion from '../study/EnglishQuestion';
import { playTimerComplete, playClick } from '../../utils/sounds';
import { useStatsContext } from '../../contexts/StatsContext';
import { useUserWords } from '../../contexts/UserWordsContext';

const EnglishExamSession = ({ mode, questions, title, onComplete }) => {
    const [, navigate] = useLocation();
    const { updateEnglishProgress } = useStatsContext();
    const { saveWord } = useUserWords();

    const [index, setIndex] = useState(0);
    const [sessionResults, setSessionResults] = useState({ correct: 0, incorrect: 0, answers: [] });
    const resultsRef = useRef(sessionResults);

    // Guard: empty questions
    if (!questions || questions.length === 0) {
        navigate('/', { replace: true });
        return null;
    }

    const currentQuestion = questions[index];
    const progress = ((index + 1) / questions.length) * 100;

    const [timeLeft, setTimeLeft] = useState(mode === 'exam' ? 20 * 60 : null);
    const [timerEnabled, setTimerEnabled] = useState(mode === 'exam');

    const formatTime = (seconds) => {
        if (seconds === null) return '--:--';
        return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
    };

    React.useEffect(() => {
        const saved = localStorage.getItem('wm_english_progress');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed.questionId === questions[0]?.id) {
                    if (parsed.index < questions.length) {
                        setIndex(parsed.index);
                        setSessionResults(parsed.results);
                        if (parsed.timeLeft !== undefined) setTimeLeft(parsed.timeLeft);
                    }
                } else if (questions.length > 0 && parsed.index < questions.length) {
                    setIndex(parsed.index);
                    setSessionResults(parsed.results);
                }
            } catch (e) { console.error('Failed to restore english progress', e); }
        }
    }, []);

    React.useEffect(() => {
        if (timerEnabled && timeLeft !== null && timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft((prev) => {
                    const next = prev - 1;
                    if (next <= 0) { clearInterval(timer); playTimerComplete(); onComplete(sessionResults); return 0; }
                    return next;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [timerEnabled, timeLeft, onComplete, sessionResults]);

    React.useEffect(() => {
        if (sessionResults.answers.length > 0 || index > 0) {
            localStorage.setItem('wm_english_progress', JSON.stringify({ index, results: sessionResults, timeLeft, timestamp: Date.now() }));
        }
    }, [index, sessionResults]);

    const handleResult = (isCorrect) => {
        const updated = {
            correct: resultsRef.current.correct + (isCorrect ? 1 : 0),
            incorrect: resultsRef.current.incorrect + (isCorrect ? 0 : 1),
            answers: [...resultsRef.current.answers, { questionId: currentQuestion.id, type: currentQuestion.type, isCorrect }]
        };
        resultsRef.current = updated;
        setSessionResults(updated);
        if (updateEnglishProgress) updateEnglishProgress(currentQuestion.id, isCorrect);
    };

    const handleNext = () => {
        setIndex(prev => {
            if (prev < questions.length - 1) {
                return prev + 1;
            } else {
                onComplete(resultsRef.current);
                return prev;
            }
        });
    };

    const getModeLabel = () => {
        if (mode === 'exam') return 'סימולציית מבחן';
        const labels = { 'Sentence Completion': 'השלמת משפטים', 'Restatement': 'ניסוח מחדש', 'Reading Comprehension': 'הבנת הנקרא' };
        return title || labels[currentQuestion?.type] || 'תרגול אנגלית';
    };

    const circleBtn = (bg, brd) => ({
        width: 38, height: 38, borderRadius: RADIUS.full,
        background: bg, border: brd ? `1px solid ${brd}` : 'none',
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
    });

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: C.bg }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', ...GLASS.header }}>
                <button onClick={() => { if (window.confirm('לצאת מהתרגול? ההתקדמות נשמרת.')) navigate('/'); }} style={circleBtn(C.glass, C.glassBorder)}>
                    <X size={18} color={C.muted} />
                </button>

                <div style={{ textAlign: 'center' }}>
                    {mode === 'exam' && timeLeft !== null ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <motion.div
                                animate={timeLeft < 60 ? { scale: [1, 1.05, 1] } : {}}
                                transition={timeLeft < 60 ? { repeat: Infinity, duration: 1 } : {}}
                                style={{
                                    fontSize: 20, fontWeight: 700,
                                    color: timeLeft < 60 ? C.red : C.text,
                                    fontVariantNumeric: 'tabular-nums',
                                    display: 'flex', alignItems: 'center', gap: 6
                                }}
                            >
                                <Timer size={18} /> {formatTime(timeLeft)}
                            </motion.div>
                            <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
                                שאלה {index + 1} מתוך {questions.length}
                            </div>
                        </div>
                    ) : (
                        <>
                            <h2 style={{
                                fontSize: 11, fontWeight: 700, color: C.purple,
                                letterSpacing: 1.5, margin: '0 0 6px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                            }}>
                                <Brain size={13} /> {getModeLabel()}
                            </h2>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontSize: 13, fontWeight: 700, ...C.gradientText }}>{index + 1}</span>
                                <div style={{ width: 100, height: 4, background: C.border, borderRadius: 2, overflow: 'hidden' }}>
                                    <div style={{ height: '100%', borderRadius: 2, width: `${progress}%`, background: C.gradient, transition: 'width 0.3s ease' }} />
                                </div>
                                <span style={{ fontSize: 13, color: C.dim }}>{questions.length}</span>
                            </div>
                        </>
                    )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <button
                        onClick={() => { playClick(); setTimerEnabled(!timerEnabled); }}
                        style={circleBtn(timerEnabled ? C.orange : C.glass, timerEnabled ? undefined : C.glassBorder)}
                        title={timerEnabled ? 'כבה טיימר' : 'הפעל טיימר'}
                    >
                        {timerEnabled ? <Timer size={16} color="white" /> : <TimerOff size={16} color={C.muted} />}
                    </button>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '5px 10px', borderRadius: RADIUS.full, background: C.glass
                    }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: C.green }}>{sessionResults.correct}</span>
                        <span style={{ fontSize: 11, color: C.dim }}>/</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: C.red }}>{sessionResults.incorrect}</span>
                    </div>
                </div>
            </header>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentQuestion.id}
                    initial={{ opacity: 0, x: 50, scale: 0.97 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -50, scale: 0.97 }}
                    transition={{ duration: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
                    style={{ flex: 1, display: 'flex', background: C.bg, overflowY: 'auto' }}
                >
                    <EnglishQuestion
                        question={currentQuestion}
                        onResult={handleResult}
                        onSaveWord={saveWord}
                        onNext={handleNext}
                    />
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

EnglishExamSession.propTypes = {
    mode: PropTypes.oneOf(['practice', 'exam']).isRequired,
    questions: PropTypes.array.isRequired,
    title: PropTypes.string,
    onComplete: PropTypes.func.isRequired
};

export default EnglishExamSession;
