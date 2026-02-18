import React from 'react';
import PropTypes from 'prop-types';
import { C } from '../styles/theme';

const Results = ({ results, onRestart, onHome, onReview }) => {
    const total = results.correct + results.incorrect;
    const pct = total > 0 ? Math.round((results.correct / total) * 100) : 0;

    const emoji = pct >= 90 ? '🏆' : pct >= 70 ? '⭐' : pct >= 50 ? '💪' : '📚';
    const msg = pct >= 90 ? 'מצוין! שליטה מרשימה!' : pct >= 70 ? 'כל הכבוד!' : pct >= 50 ? 'לא רע!' : 'המשך להתאמן!';

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
            <div style={{ fontSize: 80, marginBottom: 24 }}>{emoji}</div>
            <h2 style={{ fontSize: 32, fontWeight: 700, margin: '0 0 8px' }}>סיום סט!</h2>
            <p style={{ color: C.muted, fontSize: 18, marginBottom: 32 }}>{msg}</p>

            {/* Circular Progress */}
            <div style={{ position: 'relative', width: 160, height: 160, marginBottom: 32 }}>
                <svg style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }} viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke={C.border} strokeWidth="8" />
                    <circle
                        cx="50" cy="50" r="45" fill="none" stroke="url(#rg)" strokeWidth="8"
                        strokeLinecap="round" strokeDasharray={`${pct * 2.83} 283`}
                    />
                    <defs>
                        <linearGradient id="rg" x1="0%" y1="0%" x2="100%">
                            <stop offset="0%" stopColor={C.purple} />
                            <stop offset="100%" stopColor={C.pink} />
                        </linearGradient>
                    </defs>
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 36, fontWeight: 700 }}>{pct}%</span>
                </div>
            </div>

            <div style={{ display: 'flex', gap: 48, marginBottom: 40 }}>
                <div>
                    <span style={{ fontSize: 32, color: C.green }}>✓</span>
                    <p style={{ fontSize: 24, fontWeight: 700, margin: '8px 0 4px' }}>{results.correct}</p>
                    <span style={{ color: C.dim, fontSize: 14 }}>נכונות</span>
                </div>
                <div>
                    <span style={{ fontSize: 32, color: C.red }}>✗</span>
                    <p style={{ fontSize: 24, fontWeight: 700, margin: '8px 0 4px' }}>{results.incorrect}</p>
                    <span style={{ color: C.dim, fontSize: 14 }}>שגויות</span>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 320 }}>
                <button
                    onClick={onRestart}
                    style={{ width: '100%', padding: 16, borderRadius: 12, border: 'none', background: C.gradient, color: 'white', fontSize: 18, fontWeight: 700, cursor: 'pointer' }}
                >
                    תרגול נוסף
                </button>
                {results.incorrect > 0 && onReview && (
                    <button
                        onClick={onReview}
                        style={{ width: '100%', padding: 16, borderRadius: 12, border: `2px solid ${C.orange}`, background: 'transparent', color: C.orange, fontSize: 18, fontWeight: 700, cursor: 'pointer' }}
                    >
                        חזרה על טעויות 📝
                    </button>
                )}
                <button
                    onClick={onHome}
                    style={{ width: '100%', padding: 16, borderRadius: 12, background: C.surface, border: `1px solid ${C.border}`, color: C.text, fontSize: 18, fontWeight: 700, cursor: 'pointer' }}
                >
                    חזרה לתפריט
                </button>
            </div>
        </div>
    );
};

Results.propTypes = {
    results: PropTypes.object.isRequired,
    onRestart: PropTypes.func.isRequired,
    onHome: PropTypes.func.isRequired,
    onReview: PropTypes.func
};

export default Results;
