import React from 'react';
import PropTypes from 'prop-types';
import { useLocation } from 'wouter';
import Icon from '../components/Icon';
import { C } from '../styles/theme';

const Results = ({ results, sessionType, onRestart, onReview }) => {
    const [, navigate] = useLocation();
    const total = results.correct + results.incorrect;
    const pct = total > 0 ? Math.round((results.correct / total) * 100) : 0;

    const emoji = pct >= 90 ? '🏆' : pct >= 70 ? '⭐' : pct >= 50 ? '💪' : '📚';
    const msg = pct >= 90 ? 'מצוין! שליטה מרשימה!' : pct >= 70 ? 'כל הכבוד!' : pct >= 50 ? 'לא רע!' : 'המשך להתאמן!';

    // Breakdown by question type (for English sessions)
    const typeBreakdown = React.useMemo(() => {
        if (!results.answers || results.answers.length === 0) return null;

        const breakdown = {};
        results.answers.forEach(a => {
            const type = a.type || 'Unknown';
            if (!breakdown[type]) breakdown[type] = { correct: 0, total: 0 };
            breakdown[type].total++;
            if (a.isCorrect) breakdown[type].correct++;
        });
        return breakdown;
    }, [results.answers]);

    const typeLabels = {
        'Sentence Completion': { he: 'השלמת משפטים', icon: 'edit_note', color: C.purple },
        'Restatement': { he: 'ניסוח מחדש', icon: 'swap_horiz', color: C.orange },
        'Reading Comprehension': { he: 'הבנת הנקרא', icon: 'menu_book', color: C.pink }
    };

    // Find weakest type for recommendation
    const weakestType = React.useMemo(() => {
        if (!typeBreakdown) return null;
        let worst = null;
        let worstPct = 100;
        for (const [type, data] of Object.entries(typeBreakdown)) {
            const typePct = data.total > 0 ? (data.correct / data.total) * 100 : 100;
            if (typePct < worstPct && data.total >= 2) {
                worstPct = typePct;
                worst = type;
            }
        }
        return worst && worstPct < 70 ? worst : null;
    }, [typeBreakdown]);

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 24, textAlign: 'center', overflowY: 'auto' }}>
            <div style={{ marginTop: 40, fontSize: 80, marginBottom: 24 }}>{emoji}</div>
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

            <div style={{ display: 'flex', gap: 48, marginBottom: 32 }}>
                <div>
                    <span style={{ fontSize: 32, color: C.green }}>✓</span>
                    <p style={{ fontSize: 24, fontWeight: 700, margin: '8px 0 4px' }}>{results.correct}</p>
                    <span style={{ color: C.muted, fontSize: 14 }}>נכונות</span>
                </div>
                <div>
                    <span style={{ fontSize: 32, color: C.red }}>✗</span>
                    <p style={{ fontSize: 24, fontWeight: 700, margin: '8px 0 4px' }}>{results.incorrect}</p>
                    <span style={{ color: C.muted, fontSize: 14 }}>שגויות</span>
                </div>
            </div>

            {/* Type Breakdown */}
            {typeBreakdown && Object.keys(typeBreakdown).length > 1 && (
                <div style={{ width: '100%', maxWidth: 340, marginBottom: 24 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 600, color: C.muted, marginBottom: 12, textAlign: 'right' }}>
                        פירוט לפי סוג שאלה
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {Object.entries(typeBreakdown).map(([type, data]) => {
                            const info = typeLabels[type] || { he: type, icon: 'quiz', color: C.muted };
                            const typePct = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
                            return (
                                <div key={type} style={{
                                    background: C.surface, border: `1px solid ${C.border}`,
                                    borderRadius: 10, padding: '10px 14px',
                                    display: 'flex', alignItems: 'center', gap: 10
                                }}>
                                    <Icon name={info.icon} size={18} style={{ color: info.color }} />
                                    <div style={{ flex: 1, textAlign: 'right' }}>
                                        <span style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>{info.he}</span>
                                    </div>
                                    <span style={{ fontSize: 12, color: C.muted }}>{data.correct}/{data.total}</span>
                                    <span style={{
                                        fontSize: 13, fontWeight: 700, minWidth: 40, textAlign: 'center',
                                        color: typePct >= 70 ? C.green : typePct >= 50 ? C.orange : C.red
                                    }}>
                                        {typePct}%
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Recommendation */}
            {weakestType && (
                <div style={{
                    width: '100%', maxWidth: 340, marginBottom: 24,
                    background: 'rgba(251,146,60,0.1)', border: '1px solid rgba(251,146,60,0.2)',
                    borderRadius: 12, padding: '12px 16px',
                    display: 'flex', alignItems: 'center', gap: 10, textAlign: 'right'
                }}>
                    <Icon name="lightbulb" size={20} style={{ color: C.orange, flexShrink: 0 }} />
                    <p style={{ margin: 0, fontSize: 13, color: C.orange, lineHeight: 1.4 }}>
                        ציון נמוך ב{typeLabels[weakestType]?.he || weakestType} — מומלץ לתרגל עוד!
                    </p>
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 320, paddingBottom: 40 }}>
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
                        חזרה על טעויות
                    </button>
                )}
                <button
                    onClick={() => navigate('/')}
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
    sessionType: PropTypes.string,
    onRestart: PropTypes.func.isRequired,
    onReview: PropTypes.func
};

export default Results;
