import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Icon from '../../components/Icon';
import { C } from '../../styles/theme';
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

    const handleSelect = (index) => {
        if (answered) return;
        setSelected(index);
        setAnswered(true);

        const isCorrect = options[index].isCorrect;
        onResult(isCorrect);
    };

    return (
        <div style={{ flex: 1, padding: 24, maxWidth: 448, margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <section style={{ marginTop: 8, textAlign: 'left' }} dir="ltr">
                    <h2 style={{ fontSize: 24, fontWeight: 600, lineHeight: 1.6, color: 'rgba(255,255,255,0.95)', margin: 0 }}>
                        The word "<span style={{ background: C.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 700 }}>{word.english}</span>" means:
                    </h2>
                </section>

                <section style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 32 }} dir="rtl">
                    {options.map((opt, i) => {
                        const letter = ['A', 'B', 'C', 'D'][i];
                        const isSelected = selected === i;
                        let bg = '#232323', brd = '#2f2f2f';

                        if (answered) {
                            if (opt.isCorrect) { bg = 'rgba(34,197,94,0.1)'; brd = C.green; }
                            else if (isSelected) { bg = 'rgba(239,68,68,0.1)'; brd = C.red; }
                        } else if (isSelected) { bg = '#2a2a2a'; brd = 'transparent'; }

                        return (
                            <button
                                key={i}
                                onClick={() => handleSelect(i)}
                                disabled={answered}
                                style={{
                                    display: 'flex', alignItems: 'center', padding: 14, borderRadius: 12,
                                    background: bg, border: isSelected && !answered ? '1px solid transparent' : `1px solid ${brd}`,
                                    cursor: answered ? 'default' : 'pointer', position: 'relative', backgroundClip: 'padding-box',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <div style={{ width: 20, height: 20, borderRadius: '50%', border: isSelected ? 'none' : '1.5px solid #6b728080', background: isSelected ? C.gradient : 'transparent', marginLeft: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                                    {isSelected && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'white' }} />}
                                </div>
                                <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: isSelected ? '#a78bfa' : '#6b728080', width: 16, marginLeft: 12 }}>{letter}</span>
                                <span style={{ fontSize: 17, fontWeight: 500, color: isSelected ? 'white' : '#e5e5e5' }}>{opt.text}</span>
                            </button>
                        );
                    })}
                </section>
            </div>

            <footer style={{ marginTop: 32 }} dir="ltr">
                <button
                    onClick={onNext}
                    disabled={!answered}
                    style={{
                        width: '100%', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        borderRadius: 12, background: C.gradient, border: 'none', color: 'white',
                        fontSize: 17, fontWeight: 700, letterSpacing: 0.5, cursor: answered ? 'pointer' : 'default',
                        opacity: answered ? 1 : 0.5, boxShadow: '0 8px 24px rgba(124,58,237,0.25)'
                    }}
                >
                    Check Answer <Icon name="arrow_forward" size={20} />
                </button>
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
