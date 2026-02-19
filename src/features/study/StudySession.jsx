import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MoreHorizontal } from 'lucide-react';
import { C, GLASS, RADIUS } from '../../styles/theme';
import { useStatsContext } from '../../contexts/StatsContext';
import Flashcard from './Flashcard';
import Quiz from './Quiz';

const StudySession = ({ mode, session, onComplete }) => {
    const [, navigate] = useLocation();
    const { updateWordProgress } = useStatsContext();
    const [index, setIndex] = useState(0);
    const [sessionResults, setSessionResults] = useState({ correct: 0, incorrect: 0, incorrectItems: [] });

    const currentWord = session[index];
    const progress = ((index + 1) / session.length) * 100;

    // Load saved progress on mount
    React.useEffect(() => {
        const saved = localStorage.getItem('wm_vocab_progress');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed.index < session.length) {
                    setIndex(parsed.index);
                    setSessionResults(parsed.results);
                }
            } catch (e) {
                console.error('Failed to restore vocab progress', e);
            }
        }
    }, []);

    // Save progress on change
    React.useEffect(() => {
        if (sessionResults.correct > 0 || sessionResults.incorrect > 0 || index > 0) {
            localStorage.setItem('wm_vocab_progress', JSON.stringify({
                index,
                results: sessionResults,
                timestamp: Date.now()
            }));
        }
    }, [index, sessionResults]);

    const handleResult = (isCorrect) => {
        setSessionResults(prev => ({
            correct: prev.correct + (isCorrect ? 1 : 0),
            incorrect: prev.incorrect + (isCorrect ? 0 : 1),
            incorrectItems: isCorrect ? prev.incorrectItems : [...(prev.incorrectItems || []), currentWord.id]
        }));
        updateWordProgress(currentWord.id, isCorrect);
    };

    const handleNext = () => {
        if (index < session.length - 1) {
            setIndex(index + 1);
        } else {
            onComplete(sessionResults);
        }
    };

    const circleBtn = {
        width: 38, height: 38, borderRadius: RADIUS.full,
        ...GLASS.button, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: C.bg }}>
            {/* Header */}
            <motion.header
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '16px 20px', ...GLASS.header
                }}
            >
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => navigate('/')}
                    style={circleBtn}
                >
                    <X size={18} color={C.muted} />
                </motion.button>

                <div style={{ textAlign: 'center' }}>
                    <h2 style={{
                        fontSize: 11, fontWeight: 700, color: C.purple,
                        textTransform: 'uppercase', letterSpacing: 2, margin: '0 0 4px'
                    }}>
                        {mode === 'flash' ? 'אוצר מילים' : 'תרגול'}
                    </h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, ...C.gradientText }}>{index + 1}</span>
                        <div style={{ width: 80, height: 4, background: C.border, borderRadius: 2, overflow: 'hidden' }}>
                            <motion.div
                                style={{ height: '100%', borderRadius: 2, background: C.gradient }}
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                            />
                        </div>
                        <span style={{ fontSize: 12, color: C.dim }}>{session.length}</span>
                    </div>
                </div>

                <div style={circleBtn}>
                    <MoreHorizontal size={18} color={C.muted} />
                </div>
            </motion.header>

            {/* Mode Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentWord.id}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                    style={{ flex: 1, display: 'flex', background: C.bg }}
                >
                    {mode === 'flash' ? (
                        <Flashcard
                            word={currentWord}
                            onResult={handleResult}
                            onNext={handleNext}
                        />
                    ) : (
                        <Quiz
                            word={currentWord}
                            onResult={handleResult}
                            onNext={handleNext}
                        />
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

StudySession.propTypes = {
    mode: PropTypes.oneOf(['flash', 'quiz']).isRequired,
    session: PropTypes.array.isRequired,
    onComplete: PropTypes.func.isRequired
};

export default StudySession;
