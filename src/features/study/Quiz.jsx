import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { C, GLASS, RADIUS } from '../../styles/theme';
import { VOCABULARY } from '../../data/vocabulary';

const Quiz = ({ word, onResult, onNext }) => {
    const [options, setOptions] = useState([]);
    const [selected, setSelected] = useState(null);
    const [answered, setAnswered] = useState(false);

    useEffect(() => {
        // Generate options when word changes
        const generateOptions = () => {
            // Find distractors (try same category first)
            let distractors = VOCABULARY.filter(w => w.id !== word.id && w.category === word.category);
            if (distractors.length < 3) {
                // Fallback to random words if not enough in category
                const others = VOCABULARY.filter(w => w.id !== word.id);
                distractors = [...distractors, ...others];
            }

            // Shuffle and pick 3
            const chosenDistractors = distractors.sort(() => Math.random() - 0.5).slice(0, 3);

            const allOptions = [
                { text: word.hebrew, isCorrect: true },
                ...chosenDistractors.map(d => ({ text: d.hebrew, isCorrect: false }))
            ];

            setOptions(allOptions.sort(() => Math.random() - 0.5));
            setSelected(null);
            setAnswered(false);
        };

        generateOptions();
    }, [word]);

    const handleSelect = useCallback((index) => {
        if (answered) return;
        setSelected(index);
        setAnswered(true);

        const isCorrect = options[index].isCorrect;
        onResult(isCorrect);
    }, [answered, options, onResult]);

    // Keyboard shortcuts: A/B/C/D to select, Enter to advance
    useEffect(() => {
        const handleKeyDown = (e) => {
            const keyMap = { a: 0, b: 1, c: 2, d: 3, '1': 0, '2': 1, '3': 2, '4': 3 };
            const key = e.key.toLowerCase();

            if (key in keyMap && !answered && options[keyMap[key]]) {
                e.preventDefault();
                handleSelect(keyMap[key]);
            } else if ((key === 'enter' || key === ' ') && answered) {
                e.preventDefault();
                onNext();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [answered, options, handleSelect, onNext]);

    return (
        <div style={{ flex: 1, padding: 24, maxWidth: 448, margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <motion.section
                    key={word.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                    style={{ marginTop: 8, textAlign: 'left' }}
                    dir="ltr"
                >
                    <h2 style={{ fontSize: 24, fontWeight: 600, lineHeight: 1.6, color: 'rgba(255,255,255,0.95)', margin: 0 }}>
                        The word "<span style={{ background: C.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 700 }}>{word.english}</span>" means:
                    </h2>
                </motion.section>

                <section style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 32 }} dir="rtl">
                    {options.map((opt, i) => {
                        const letter = ['A', 'B', 'C', 'D'][i];
                        const isSelected = selected === i;
                        let bg = C.glass;
                        let brd = C.glassBorder;

                        if (answered) {
                            if (opt.isCorrect) { bg = 'rgba(34,197,94,0.1)'; brd = C.green; }
                            else if (isSelected) { bg = 'rgba(239,68,68,0.1)'; brd = C.red; }
                        } else if (isSelected) { bg = C.surfaceHover; brd = 'transparent'; }

                        return (
                            <motion.button
                                key={i}
                                initial={{ opacity: 0, x: -12 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: i * 0.05, ease: 'easeOut' }}
                                whileTap={!answered ? { scale: 0.97 } : undefined}
                                onClick={() => handleSelect(i)}
                                disabled={answered}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: 14,
                                    borderRadius: RADIUS.md,
                                    background: bg,
                                    backdropFilter: 'blur(20px)',
                                    WebkitBackdropFilter: 'blur(20px)',
                                    border: isSelected && !answered ? '1px solid transparent' : `1px solid ${brd}`,
                                    cursor: answered ? 'default' : 'pointer',
                                    position: 'relative',
                                    backgroundClip: 'padding-box',
                                    transition: 'background 0.2s, border-color 0.2s'
                                }}
                            >
                                <div style={{
                                    width: 20,
                                    height: 20,
                                    borderRadius: '50%',
                                    border: isSelected ? 'none' : `1.5px solid ${C.dim}`,
                                    background: isSelected ? C.gradient : 'transparent',
                                    marginLeft: 16,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    position: 'relative'
                                }}>
                                    {isSelected && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'white' }} />}
                                </div>
                                <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: isSelected ? C.purple : C.dim, width: 16, marginLeft: 12 }}>{letter}</span>
                                <span style={{ fontSize: 17, fontWeight: 500, color: isSelected ? C.text : C.text }}>{opt.text}</span>
                            </motion.button>
                        );
                    })}
                </section>

                {/* Wrong answer reinforcement */}
                {answered && selected !== null && !options[selected]?.isCorrect && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{
                            marginTop: 16, padding: '12px 16px', borderRadius: 12,
                            background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)',
                            textAlign: 'right'
                        }}
                        dir="rtl"
                    >
                        <p style={{ margin: 0, fontSize: 13, color: C.red, fontWeight: 600, marginBottom: 4 }}>
                            התשובה הנכונה:
                        </p>
                        <p style={{ margin: 0, fontSize: 16, color: C.text }}>
                            <strong>{word.english}</strong> = {word.hebrew}
                        </p>
                        {word.example && (
                            <p style={{ margin: '6px 0 0', fontSize: 13, color: C.dim, fontStyle: 'italic' }} dir="ltr">
                                "{word.example}"
                            </p>
                        )}
                    </motion.div>
                )}
            </div>

            <footer style={{ marginTop: 32 }} dir="ltr">
                <motion.button
                    whileTap={answered ? { scale: 0.96 } : undefined}
                    onClick={onNext}
                    disabled={!answered}
                    style={{
                        width: '100%',
                        height: 56,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        borderRadius: RADIUS.md,
                        background: C.gradient,
                        border: 'none',
                        color: 'white',
                        fontSize: 17,
                        fontWeight: 700,
                        letterSpacing: 0.5,
                        cursor: answered ? 'pointer' : 'default',
                        opacity: answered ? 1 : 0.5,
                        boxShadow: '0 8px 24px rgba(124,58,237,0.25)'
                    }}
                >
                    {answered ? 'הבא' : 'Check Answer'} <ArrowLeft size={20} />
                </motion.button>
            </footer>
        </div>
    );
};

Quiz.propTypes = {
    word: PropTypes.object.isRequired,
    onResult: PropTypes.func.isRequired,
    onNext: PropTypes.func.isRequired
};

export default Quiz;
