import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Icon from '../../components/Icon';
import { C } from '../../styles/theme';
import { readingPassages } from '../../data/reading_passages';
import { playCorrect, playIncorrect } from '../../utils/sounds';

/**
 * Universal English Question Component
 * Handles all question types: Sentence Completion, Restatement, Reading Comprehension
 */
const EnglishQuestion = ({ question, onResult, onSaveWord, onNext }) => {
    const [selected, setSelected] = useState(null);
    const [answered, setAnswered] = useState(false);

    // Reset state when question changes
    React.useEffect(() => {
        setSelected(null);
        setAnswered(false);
        setUnknownWord('');
        setWordSaved(false);
    }, [question]);

    const handleSelect = (index) => {
        if (answered) return;
        setSelected(index);
        setAnswered(true);

        // correctIndex is 1-based in the data, convert to 0-based
        const isCorrect = index === (question.correctIndex - 1);

        // Play sound feedback
        if (isCorrect) {
            playCorrect();
        } else {
            playIncorrect();
        }

        onResult(isCorrect);
    };

    const renderQuestionHeader = () => {
        const typeLabels = {
            'Sentence Completion': { he: 'השלמת משפט', icon: 'edit_note', color: C.purple },
            'Restatement': { he: 'ניסוח מחדש', icon: 'swap_horiz', color: C.orange },
            'Reading Comprehension': { he: 'הבנת הנקרא', icon: 'menu_book', color: C.pink }
        };

        const typeInfo = typeLabels[question.type] || { he: question.type, icon: 'quiz', color: C.muted };

        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 16,
                padding: '8px 12px',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: 8,
                width: 'fit-content'
            }}>
                <Icon name={typeInfo.icon} size={16} style={{ color: typeInfo.color }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: typeInfo.color }}>{typeInfo.he}</span>
            </div>
        );
    };

    const renderQuestion = () => {

        if (question.type === 'Reading Comprehension' && question.passage) {
            const passageData = readingPassages[question.passage];
            const passageContent = passageData ? passageData.content : "Passage text not found.";

            return (
                <div style={{ marginBottom: 24 }}>
                    <div style={{
                        padding: '16px',
                        background: 'rgba(139, 92, 246, 0.1)',
                        borderRadius: 12,
                        marginBottom: 20,
                        borderRight: `3px solid ${C.purple}`,
                        maxHeight: '300px',
                        overflowY: 'auto',
                        border: '1px solid rgba(139, 92, 246, 0.2)'
                    }}>
                        <h4 style={{
                            marginTop: 0,
                            color: C.purple,
                            fontSize: 14,
                            marginBottom: 8,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6
                        }}>
                            <Icon name="menu_book" size={16} />
                            {question.passage}
                        </h4>
                        <p style={{
                            fontSize: 15,
                            lineHeight: 1.6,
                            color: 'rgba(255,255,255,0.9)',
                            whiteSpace: 'pre-wrap',
                            margin: 0
                        }}>
                            {passageContent}
                        </p>
                    </div>
                    <p style={{
                        fontSize: 18,
                        lineHeight: 1.6,
                        color: 'rgba(255,255,255,0.95)',
                        margin: 0,
                        fontWeight: 500
                    }}>
                        {question.question}
                    </p>
                </div>
            );
        }

        if (question.type === 'Restatement') {
            return (
                <div style={{ marginBottom: 24 }}>
                    <p style={{ fontSize: 13, color: C.muted, marginBottom: 8 }}>
                        Choose the sentence that best restates the following:
                    </p>
                    <div style={{
                        padding: '16px 20px',
                        background: 'rgba(251, 146, 60, 0.1)',
                        borderRadius: 12,
                        borderRight: `3px solid ${C.orange}`,
                        marginBottom: 8
                    }}>
                        <p style={{
                            fontSize: 17,
                            lineHeight: 1.7,
                            color: 'white',
                            margin: 0,
                            fontStyle: 'italic'
                        }}>
                            "{question.question}"
                        </p>
                    </div>
                </div>
            );
        }

        // Sentence Completion - highlight the blank
        const questionText = question.question.replace(/____/g, '______');

        return (
            <div style={{ marginBottom: 24 }}>
                <p style={{
                    fontSize: 18,
                    lineHeight: 1.7,
                    color: 'rgba(255,255,255,0.95)',
                    margin: 0
                }}>
                    {questionText}
                </p>
            </div>
        );
    };

    const renderOptions = () => {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {question.options.map((option, i) => {
                    const letter = ['A', 'B', 'C', 'D'][i];
                    const isSelected = selected === i;
                    const isCorrect = i === (question.correctIndex - 1);

                    let bg = '#232323';
                    let brd = '#2f2f2f';
                    let textColor = '#e5e5e5';

                    if (answered) {
                        if (isCorrect) {
                            bg = 'rgba(34,197,94,0.15)';
                            brd = C.green;
                            textColor = 'white';
                        } else if (isSelected) {
                            bg = 'rgba(239,68,68,0.15)';
                            brd = C.red;
                        }
                    } else if (isSelected) {
                        bg = '#2a2a2a';
                        brd = C.purple;
                    }

                    return (
                        <button
                            key={i}
                            onClick={() => handleSelect(i)}
                            disabled={answered}
                            style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                padding: '14px 16px',
                                borderRadius: 12,
                                background: bg,
                                border: `1px solid ${brd}`,
                                cursor: answered ? 'default' : 'pointer',
                                textAlign: 'left',
                                transition: 'all 0.2s',
                                gap: 12
                            }}
                        >
                            <div style={{
                                width: 24,
                                height: 24,
                                borderRadius: '50%',
                                border: isSelected ? 'none' : '1.5px solid #6b728080',
                                background: isSelected ? C.gradient : 'transparent',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                marginTop: 2
                            }}>
                                {isSelected && (
                                    answered ? (
                                        <Icon
                                            name={isCorrect ? 'check' : 'close'}
                                            size={14}
                                            style={{ color: 'white' }}
                                        />
                                    ) : (
                                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'white' }} />
                                    )
                                )}
                            </div>
                            <div style={{ flex: 1 }}>
                                <span style={{
                                    fontSize: 11,
                                    fontWeight: 700,
                                    color: isSelected ? C.purple : '#6b728080',
                                    marginRight: 8
                                }}>
                                    {letter}
                                </span>
                                <span style={{
                                    fontSize: 15,
                                    lineHeight: 1.5,
                                    color: textColor
                                }}>
                                    {option}
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>
        );
    };

    const [unknownWord, setUnknownWord] = useState('');
    const [wordSaved, setWordSaved] = useState(false);

    const handleSaveWord = () => {
        if (onSaveWord && unknownWord.trim()) {
            onSaveWord(unknownWord);
            setWordSaved(true);
            setUnknownWord('');
            playCorrect(); // Simple feedback
        }
    };

    return (
        <div style={{
            flex: 1,
            padding: 24,
            maxWidth: 560,
            margin: '0 auto',
            width: '100%',
            display: 'flex',
            flexDirection: 'column'
        }} dir="ltr">
            <div style={{ flex: 1 }}>
                {renderQuestionHeader()}
                {renderQuestion()}
                {renderOptions()}
            </div>

            {/* Add Unknown Word Section */}
            {answered && onSaveWord && (
                <div style={{
                    marginTop: 24,
                    padding: 16,
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: 12,
                    border: `1px solid ${C.border}`
                }}>
                    <p style={{ margin: '0 0 12px', fontSize: 13, color: C.muted, textAlign: 'right' }} dir="rtl">
                        נתקלת במילה לא מוכרת בשאלה? הוסף אותה לרשימה האישית:
                    </p>
                    {wordSaved ? (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 8,
                            color: C.green,
                            padding: 8
                        }} dir="rtl">
                            <Icon name="check_circle" size={20} />
                            <span style={{ fontWeight: 600 }}>המילה נשמרה בהצלחה!</span>
                            <button
                                onClick={() => setWordSaved(false)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: C.muted,
                                    fontSize: 12,
                                    textDecoration: 'underline',
                                    cursor: 'pointer',
                                    marginRight: 'auto'
                                }}
                            >
                                הוסף עוד
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button
                                onClick={handleSaveWord}
                                disabled={!unknownWord.trim()}
                                style={{
                                    padding: '0 16px',
                                    borderRadius: 8,
                                    background: unknownWord.trim() ? C.purple : '#333',
                                    border: 'none',
                                    color: 'white',
                                    fontWeight: 600,
                                    fontSize: 13,
                                    cursor: unknownWord.trim() ? 'pointer' : 'default',
                                    opacity: unknownWord.trim() ? 1 : 0.6
                                }}
                            >
                                Save
                            </button>
                            <input
                                type="text"
                                value={unknownWord}
                                onChange={(e) => setUnknownWord(e.target.value)}
                                placeholder="Type word here..."
                                style={{
                                    flex: 1,
                                    background: 'rgba(0,0,0,0.3)',
                                    border: `1px solid ${C.border}`,
                                    borderRadius: 8,
                                    padding: '10px 12px',
                                    color: 'white',
                                    fontSize: 15,
                                    outline: 'none'
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveWord();
                                }}
                            />
                        </div>
                    )}
                </div>
            )}

            <footer style={{ marginTop: 32 }}>
                <button
                    onClick={onNext}
                    disabled={!answered}
                    style={{
                        width: '100%',
                        height: 56,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        borderRadius: 12,
                        background: answered ? C.gradient : '#333',
                        border: 'none',
                        color: 'white',
                        fontSize: 16,
                        fontWeight: 700,
                        cursor: answered ? 'pointer' : 'default',
                        opacity: answered ? 1 : 0.5,
                        boxShadow: answered ? '0 8px 24px rgba(124,58,237,0.25)' : 'none',
                        transition: 'all 0.2s'
                    }}
                >
                    {answered ? (
                        <>Continue <Icon name="arrow_forward" size={20} /></>
                    ) : (
                        'Select an answer'
                    )}
                </button>
            </footer>
        </div>
    );
};

EnglishQuestion.propTypes = {
    question: PropTypes.shape({
        id: PropTypes.number.isRequired,
        type: PropTypes.string.isRequired,
        question: PropTypes.string.isRequired,
        options: PropTypes.arrayOf(PropTypes.string).isRequired,
        correctIndex: PropTypes.number.isRequired,
        passage: PropTypes.string
    }).isRequired,
    onResult: PropTypes.func.isRequired,
    onSaveWord: PropTypes.func,
    onNext: PropTypes.func.isRequired
};

export default EnglishQuestion;
