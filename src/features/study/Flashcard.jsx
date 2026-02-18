import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Icon from '../../components/Icon';
import { C } from '../../styles/theme';
import { playCorrect, playIncorrect, playClick } from '../../utils/sounds';

const Flashcard = ({ word, onResult, onNext }) => {
    const [flipped, setFlipped] = useState(false);
    const [revealed, setRevealed] = useState(false); // To prevent multiple answers

    const handleResult = (success) => {
        if (revealed) return;
        setRevealed(true);

        // Play sound feedback
        if (success) {
            playCorrect();
        } else {
            playIncorrect();
        }

        onResult(success);

        // Auto advance after short delay if correct, or let user read only if incorrect?
        // V2 implementation: User clicks "Known" -> Next immediately. 
        // User clicks "Unknown" -> Next immediately.
        // So we just call onNext.
        setTimeout(() => {
            setFlipped(false);
            setRevealed(false);
            onNext();
        }, 200);
    };

    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative' }}>
            {/* Background Glow */}
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 256, height: 256, background: 'rgba(139,92,246,0.1)', borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0 }} />

            {/* Card */}
            <div
                onClick={() => !flipped && setFlipped(true)}
                style={{
                    width: '100%', maxWidth: 340, aspectRatio: '3/4',
                    background: '#282828', borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column',
                    padding: 32, cursor: 'pointer', position: 'relative', zIndex: 1
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 32 }}>
                    <div style={{ padding: '6px 12px', borderRadius: 16, background: '#1a1a1a', border: '1px solid #333', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#8B5CF6' }} />
                        <span style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1 }}>{word.pos || 'General'}</span>
                    </div>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                        <Icon name="volume_up" size={20} style={{ color: '#6b7280' }} />
                    </button>
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }} dir="ltr">
                    {!flipped ? (
                        <>
                            <h1 style={{ fontSize: 42, fontWeight: 500, margin: '0 0 12px', fontFamily: 'Manrope, sans-serif', color: 'white', letterSpacing: -0.5 }}>{word.english}</h1>
                            {word.phonetic && <p style={{ fontSize: 18, color: '#6b7280', fontFamily: 'monospace', fontWeight: 300 }}>{word.phonetic}</p>}
                        </>
                    ) : (
                        <>
                            <h1 style={{ fontSize: 36, fontWeight: 700, margin: '0 0 16px' }} dir="rtl">{word.hebrew}</h1>
                            <p style={{ fontSize: 20, color: '#9ca3af', fontFamily: 'Manrope' }}>{word.english}</p>
                            {word.example && <p style={{ fontSize: 14, color: '#6b7280', marginTop: 16, fontStyle: 'italic' }}>"{word.example}"</p>}
                        </>
                    )}
                </div>

                <div style={{ marginTop: 'auto', paddingTop: 24, borderTop: '1px solid #33333380', textAlign: 'center' }}>
                    <p style={{ fontSize: 12, color: '#4b5563', margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, opacity: 0.6 }}>
                        <Icon name="touch_app" size={14} /> {!flipped ? 'הקש להיפוך' : 'בחר אם ידעת'}
                    </p>
                </div>
            </div>

            {/* Controls */}
            <div style={{ width: '100%', maxWidth: 340, marginTop: 32, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {!flipped ? (
                    <button
                        onClick={() => setFlipped(true)}
                        style={{ width: '100%', padding: 16, borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #8B5CF6, #EC4899)', color: 'white', fontSize: 16, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 8px 24px rgba(236,72,153,0.2)' }}
                    >
                        <Icon name="sync_alt" size={20} /> הצג הגדרה
                    </button>
                ) : (
                    <div style={{ display: 'flex', gap: 12 }}>
                        <button
                            onClick={() => handleResult(false)}
                            style={{ flex: 1, padding: 16, borderRadius: 12, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: C.red, fontSize: 15, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                        >
                            <Icon name="close" size={18} /> לא ידעתי
                        </button>
                        <button
                            onClick={() => handleResult(true)}
                            style={{ flex: 1, padding: 16, borderRadius: 12, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: C.green, fontSize: 15, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                        >
                            <Icon name="check" size={18} /> ידעתי
                        </button>
                    </div>
                )}

                {!flipped && (
                    <button
                        onClick={() => handleResult(true)}
                        style={{ width: '100%', padding: 16, borderRadius: 12, background: '#282828', border: '1px solid #333', color: '#d1d5db', fontSize: 15, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                    >
                        <Icon name="check_circle" size={18} style={{ color: '#8B5CF6', opacity: 0 }} /> אני מכיר
                    </button>
                )}
            </div>
        </div>
    );
};

Flashcard.propTypes = {
    word: PropTypes.object.isRequired,
    onResult: PropTypes.func.isRequired,
    onNext: PropTypes.func.isRequired
};

export default Flashcard;
