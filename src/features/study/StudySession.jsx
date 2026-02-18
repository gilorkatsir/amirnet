import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Icon from '../../components/Icon';
import { C } from '../../styles/theme';
import Flashcard from './Flashcard';
import Quiz from './Quiz';

const StudySession = ({ mode, session, onUpdateProgress, onComplete, onExit }) => {
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
                // Heuristic: check if current word ID matches stored session data to ensure validity
                // Since session prop is dynamic, we rely on App.jsx restoring the correct session array
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
        // Update local session stats
        setSessionResults(prev => ({
            correct: prev.correct + (isCorrect ? 1 : 0),
            incorrect: prev.incorrect + (isCorrect ? 0 : 1),
            incorrectItems: isCorrect ? prev.incorrectItems : [...(prev.incorrectItems || []), currentWord.id]
        }));

        // Update global progress immediately (spaced repetition)
        onUpdateProgress(currentWord.id, isCorrect);
    };

    const handleNext = () => {
        if (index < session.length - 1) {
            setIndex(index + 1);
        } else {
            onComplete(sessionResults);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: 'rgba(26,26,26,0.95)', backdropFilter: 'blur(8px)' }}>
                <button onClick={onExit} style={{ width: 40, height: 40, borderRadius: '50%', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="close" size={24} style={{ color: '#d1d5db' }} />
                </button>
                <div style={{ textAlign: 'center' }}>
                    <h2 style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 2, margin: '0 0 4px' }}>
                        {mode === 'flash' ? 'אוצר מילים' : 'תרגול'}
                    </h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, background: C.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{index + 1}</span>
                        <div style={{ width: 80, height: 4, background: '#282828', borderRadius: 2, overflow: 'hidden' }}>
                            <div style={{ height: '100%', borderRadius: 2, width: `${progress}%`, background: C.gradient }} />
                        </div>
                        <span style={{ fontSize: 12, color: '#4b5563' }}>{session.length}</span>
                    </div>
                </div>
                <button style={{ width: 40, height: 40, borderRadius: '50%', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="more_horiz" size={24} style={{ color: '#d1d5db' }} />
                </button>
            </header>

            {/* Mode Content */}
            <div style={{ flex: 1, display: 'flex', background: '#1a1a1a' }}>
                {mode === 'flash' ? (
                    <Flashcard
                        key={currentWord.id}
                        word={currentWord}
                        onResult={handleResult}
                        onNext={handleNext}
                    />
                ) : (
                    <Quiz
                        key={currentWord.id}
                        word={currentWord}
                        onResult={handleResult}
                        onNext={handleNext}
                    />
                )}
            </div>
        </div>
    );
};

StudySession.propTypes = {
    mode: PropTypes.oneOf(['flash', 'quiz']).isRequired,
    session: PropTypes.array.isRequired,
    onUpdateProgress: PropTypes.func.isRequired,
    onComplete: PropTypes.func.isRequired,
    onExit: PropTypes.func.isRequired
};

export default StudySession;
