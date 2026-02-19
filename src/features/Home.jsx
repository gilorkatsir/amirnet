import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useLocation } from 'wouter';
import Icon from '../components/Icon';
import { C } from '../styles/theme';
import { isSoundEnabled, setSoundEnabled } from '../utils/sounds';
import { calculateStreak } from '../utils/dailyStats';
import { useStatsContext } from '../contexts/StatsContext';
import { useUserWords } from '../contexts/UserWordsContext';
import useDerivedStats from '../hooks/useStats';
import { hasAiKey } from '../services/apiKeys';

const Home = ({ onStart, onStartFailedVocab, onStartFailedEnglish, onStartAiPractice }) => {
    const [, navigate] = useLocation();
    const { stats, englishStats, totalWords, totalQuestions } = useStatsContext();
    const { userWords } = useUserWords();
    const [soundOn, setSoundOn] = useState(isSoundEnabled());
    const streak = calculateStreak();
    const { learnedCount, masteredCount, totalCorrect, totalAttempts, accuracy, failedCount } = useDerivedStats(stats, totalWords);

    // Calculate English questions stats
    const englishAnswered = Object.keys(englishStats).length;
    const englishCorrect = Object.values(englishStats).reduce((acc, s) => acc + (s.correct || 0), 0);
    const englishTotal = Object.values(englishStats).reduce((acc, s) => acc + (s.attempts || 0), 0);
    const englishAccuracy = englishTotal > 0 ? Math.round((englishCorrect / englishTotal) * 100) : 0;

    const StudyOption = ({ icon, title, desc, color, onClick }) => (
        <button
            onClick={onClick}
            style={{
                display: 'flex', alignItems: 'center', gap: 16, width: '100%',
                padding: 16, marginBottom: 12, background: C.surface,
                border: `1px solid ${C.border}`, borderRadius: 12,
                color: C.text, cursor: 'pointer', textAlign: 'right',
                transition: 'all 0.2s', position: 'relative'
            }}
        >
            <div style={{
                width: 48, height: 48, borderRadius: 8, background: C.bg,
                border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: color, flexShrink: 0
            }}>
                <Icon name={icon} size={24} />
            </div>
            <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0, fontWeight: 600, fontSize: 15, color: 'white' }}>{title}</h3>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: C.muted }}>{desc}</p>
            </div>
            <Icon name="chevron_right" size={20} style={{ color: C.muted, transform: 'rotate(180deg)' }} />
        </button>
    );

    return (
        <div style={{ paddingBottom: 100 }}>
            {/* Header */}
            <header style={{
                position: 'sticky', top: 0, zIndex: 10, background: 'rgba(18,18,18,0.9)',
                backdropFilter: 'blur(12px)', padding: '24px 20px 8px',
                borderBottom: `1px solid ${C.border}50`
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <p style={{ color: C.muted, fontSize: 12, fontWeight: 500, letterSpacing: 0.5, margin: 0 }}>ערב טוב 👋</p>
                        <h1 style={{ fontSize: 20, fontWeight: 700, margin: '2px 0 0', color: 'white' }}>מוכן ללמוד?</h1>
                    </div>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <button
                            onClick={() => {
                                const newVal = !soundOn;
                                setSoundOn(newVal);
                                setSoundEnabled(newVal);
                            }}
                            style={{
                                width: 40, height: 40, borderRadius: '50%', background: C.surface,
                                border: `1px solid ${C.border}`, color: C.muted, cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}
                        >
                            <Icon name={soundOn ? "volume_up" : "volume_off"} size={20} />
                        </button>
                        <button
                            onClick={() => navigate('/pomodoro')}
                            style={{
                                width: 40, height: 40, borderRadius: '50%', background: C.surface,
                                border: `1px solid ${C.border}`, color: C.muted, cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}
                        >
                            <Icon name="timer" size={20} />
                        </button>
                        <button
                            onClick={() => navigate('/settings')}
                            style={{
                                width: 40, height: 40, borderRadius: '50%', background: C.surface,
                                border: `1px solid ${C.border}`, color: C.muted, cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}
                        >
                            <Icon name="settings" size={20} />
                        </button>
                    </div>
                </div>
            </header>

            <main style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 24 }}>
                {/* Enhanced Stats with Animation */}
                <section style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {/* Progress Ring Card */}
                    <div style={{
                        background: C.surface, border: `1px solid ${C.border}`,
                        borderRadius: 16, padding: 24,
                        display: 'flex', alignItems: 'center', justifyContent: 'space-around'
                    }}>
                        {/* Animated Progress Ring - Vocabulary */}
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ position: 'relative', width: 80, height: 80, margin: '0 auto 8px' }}>
                                <svg width="80" height="80" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                                    <circle cx="50" cy="50" r="42" fill="none" stroke={C.border} strokeWidth="8" />
                                    <circle
                                        cx="50" cy="50" r="42" fill="none"
                                        stroke="url(#vocabGradient)" strokeWidth="8"
                                        strokeLinecap="round"
                                        strokeDasharray={264}
                                        strokeDashoffset={264 - (264 * (learnedCount / totalWords))}
                                        style={{
                                            transition: 'stroke-dashoffset 1s ease-out',
                                            animation: 'progressPulse 2s ease-in-out infinite'
                                        }}
                                    />
                                    <defs>
                                        <linearGradient id="vocabGradient" x1="0%" y1="0%" x2="100%">
                                            <stop offset="0%" stopColor="#9333ea" />
                                            <stop offset="100%" stopColor="#ec4899" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                <div style={{
                                    position: 'absolute', inset: 0,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 18, fontWeight: 700
                                }}>
                                    {Math.round((learnedCount / totalWords) * 100)}%
                                </div>
                            </div>
                            <p style={{ margin: 0, fontSize: 12, color: C.muted }}>אוצר מילים</p>
                        </div>

                        {/* Animated Progress Ring - English */}
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ position: 'relative', width: 80, height: 80, margin: '0 auto 8px' }}>
                                <svg width="80" height="80" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                                    <circle cx="50" cy="50" r="42" fill="none" stroke={C.border} strokeWidth="8" />
                                    <circle
                                        cx="50" cy="50" r="42" fill="none"
                                        stroke="url(#englishGradient)" strokeWidth="8"
                                        strokeLinecap="round"
                                        strokeDasharray={264}
                                        strokeDashoffset={264 - (264 * (englishAnswered / totalQuestions))}
                                        style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                                    />
                                    <defs>
                                        <linearGradient id="englishGradient" x1="0%" y1="0%" x2="100%">
                                            <stop offset="0%" stopColor="#fb923c" />
                                            <stop offset="100%" stopColor="#22c55e" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                <div style={{
                                    position: 'absolute', inset: 0,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 18, fontWeight: 700
                                }}>
                                    {Math.round((englishAnswered / totalQuestions) * 100)}%
                                </div>
                            </div>
                            <p style={{ margin: 0, fontSize: 12, color: C.muted }}>אנגלית</p>
                        </div>

                        {/* Accuracy Stat */}
                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                width: 80, height: 80, borderRadius: 12,
                                background: accuracy >= 70 ? 'rgba(34,197,94,0.15)' : 'rgba(251,146,60,0.15)',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                border: `1px solid ${accuracy >= 70 ? 'rgba(34,197,94,0.3)' : 'rgba(251,146,60,0.3)'}`,
                                margin: '0 auto 8px'
                            }}>
                                <span style={{ fontSize: 24, fontWeight: 700, color: accuracy >= 70 ? C.green : C.orange }}>
                                    {accuracy}%
                                </span>
                                <Icon name="check_circle" size={16} style={{ color: accuracy >= 70 ? C.green : C.orange }} />
                            </div>
                            <p style={{ margin: 0, fontSize: 12, color: C.muted }}>דיוק כללי</p>
                        </div>
                    </div>

                    {/* Last Session + Streak Row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        {/* Last Session */}
                        <div style={{
                            background: C.surface, border: `1px solid ${C.border}`,
                            borderRadius: 12, padding: 14
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                <Icon name="history" size={16} style={{ color: C.purple }} />
                                <span style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>אימון אחרון</span>
                            </div>
                            {totalAttempts > 0 ? (
                                <>
                                    <p style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>{totalCorrect}/{totalAttempts}</p>
                                    <p style={{ margin: '4px 0 0', fontSize: 11, color: C.muted }}>
                                        {masteredCount} מילים נשלטו ✨
                                    </p>
                                </>
                            ) : (
                                <p style={{ margin: 0, fontSize: 14, color: C.muted }}>עדיין לא התחלת 🚀</p>
                            )}
                        </div>

                        {/* Study Streak */}
                        <div style={{
                            background: C.surface, border: `1px solid ${C.border}`,
                            borderRadius: 12, padding: 14
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                <Icon name="local_fire_department" size={16} style={{ color: C.orange }} />
                                <span style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>רצף לימוד</span>
                            </div>
                            <p style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>
                                {streak} 🔥
                            </p>
                            <p style={{ margin: '4px 0 0', fontSize: 11, color: C.muted }}>
                                {streak > 0 ? (streak === 1 ? 'יום ברציפות!' : `ימים ברציפות!`) : 'התחל היום!'}
                            </p>
                        </div>
                    </div>
                </section>

                {/* CSS Animation Keyframes */}
                <style>{`
                    @keyframes progressPulse {
                        0%, 100% { filter: brightness(1); }
                        50% { filter: brightness(1.2); }
                    }
                `}</style>

                {/* Hero Card - Vocabulary */}
                <section
                    onClick={() => onStart('flash', 10)}
                    style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: `1px solid ${C.border}`, cursor: 'pointer', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}
                >
                    <div style={{ position: 'absolute', inset: 0, background: C.surface }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to left, rgba(147,51,234,0.1), rgba(236,72,153,0.05), transparent)' }} />
                    <div style={{ position: 'absolute', top: 0, width: '100%', height: 1, background: C.gradient, opacity: 0.7 }} />
                    <div style={{ position: 'relative', padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <span style={{ display: 'inline-block', padding: '4px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700, background: 'linear-gradient(to right, rgba(251,146,60,0.2), rgba(236,72,153,0.2))', color: C.orange, border: '1px solid rgba(251,146,60,0.2)', marginBottom: 6 }}>המשך ללמוד</span>
                            <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 6px', color: 'white' }}>אוצר מילים מתקדם</h3>
                            <p style={{ color: C.muted, fontSize: 14, margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Icon name="style" size={14} /> נותרו {totalWords - learnedCount} כרטיסים
                            </p>
                        </div>
                        <div style={{ width: 48, height: 48, borderRadius: '50%', background: C.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(236,72,153,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <Icon name="play_arrow" size={24} fill style={{ color: 'white' }} />
                        </div>
                    </div>
                    <div style={{ position: 'absolute', bottom: 0, width: '100%', height: 2, background: C.border }}>
                        <div style={{ height: '100%', width: `${totalWords > 0 ? (learnedCount / totalWords) * 100 : 0}%`, background: C.gradient }} />
                    </div>
                </section>

                {/* English Questions Hero */}
                <section
                    onClick={() => navigate('/english-select')}
                    style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: `1px solid ${C.border}`, cursor: 'pointer', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}
                >
                    <div style={{ position: 'absolute', inset: 0, background: C.surface }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to left, rgba(251,146,60,0.1), rgba(34,197,94,0.05), transparent)' }} />
                    <div style={{ position: 'absolute', top: 0, width: '100%', height: 1, background: 'linear-gradient(to right, #fb923c, #22c55e)', opacity: 0.7 }} />
                    <div style={{ position: 'relative', padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <span style={{ display: 'inline-block', padding: '4px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700, background: 'rgba(34,197,94,0.15)', color: C.green, border: '1px solid rgba(34,197,94,0.2)', marginBottom: 6 }}>חדש!</span>
                            <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 6px', color: 'white' }}>שאלות באנגלית</h3>
                            <p style={{ color: C.muted, fontSize: 14, margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Icon name="quiz" size={14} /> {totalQuestions} שאלות מ-5 מבחנים
                            </p>
                        </div>
                        <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #fb923c, #22c55e)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(34,197,94,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <Icon name="arrow_forward" size={24} style={{ color: 'white' }} />
                        </div>
                    </div>
                </section>

                {/* Vocabulary Modules */}
                <section>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, padding: '0 4px' }}>
                        <h2 style={{ fontSize: 18, fontWeight: 700, color: 'white', margin: 0 }}>אוצר מילים</h2>
                    </div>

                    <StudyOption
                        icon="style" title="כרטיסיות" desc="לימוד מילים עם כרטיסיות"
                        color={C.pink} onClick={() => onStart('flash', 10)}
                    />
                    <StudyOption
                        icon="edit_note" title="בוחן מילים" desc="תרגול שיבוץ מילים בהקשר"
                        color={C.purple} onClick={() => onStart('quiz', 10)}
                    />
                    <StudyOption
                        icon="category" title="לפי קטגוריה" desc="10 קטגוריות + חזרה חכמה"
                        color={C.blue || '#3b82f6'} onClick={() => navigate('/vocab-categories')}
                    />
                    <StudyOption
                        icon="replay" title="חזרה על טעויות" desc={`${failedCount} מילים לחזרה`}
                        color={C.orange} onClick={onStartFailedVocab}
                    />
                    {hasAiKey() && failedCount > 0 && (
                        <StudyOption
                            icon="auto_awesome" title="תרגול AI חכם" desc={`שאלות מותאמות ל-${failedCount} מילים קשות`}
                            color="#8B5CF6" onClick={onStartAiPractice}
                        />
                    )}
                    <StudyOption
                        icon="bookmark" title="המילים שלי" desc={`${userWords?.length || 0} מילים ששמרת`}
                        color={C.pink} onClick={() => navigate('/my-words')}
                    />
                </section>

                {/* English Questions Section */}
                <section>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, padding: '0 4px' }}>
                        <h2 style={{ fontSize: 18, fontWeight: 700, color: 'white', margin: 0 }}>שאלות אנגלית</h2>
                    </div>

                    <StudyOption
                        icon="quiz" title="תרגול לפי סוג" desc="השלמת משפטים, רסטייטמנט, הבנת הנקרא"
                        color={C.green} onClick={() => navigate('/english-select')}
                    />
                    <StudyOption
                        icon="assignment" title="סימולציית מבחן" desc="22 שאלות כמו במבחן האמיתי"
                        color={C.orange} onClick={() => navigate('/english-select')}
                    />
                    <StudyOption
                        icon="headphones" title="שאלות קוליות" desc="הרצאה + שאלות, השלמת טקסט"
                        color="#3b82f6" onClick={() => navigate('/vocal-select')}
                    />
                    <StudyOption
                        icon="replay" title="חזרה על טעויות" desc={`${Object.values(englishStats).filter(s => s.attempts > s.correct).length} שאלות לחזרה`}
                        color={C.red} onClick={onStartFailedEnglish}
                    />
                </section>
            </main>

            {/* Bottom Nav */}
            <nav style={{
                position: 'fixed', bottom: 0, left: 0, width: '100%',
                background: 'rgba(18,18,18,0.85)', backdropFilter: 'blur(12px)',
                borderTop: `1px solid ${C.border}50`, padding: '8px 8px 24px', zIndex: 50
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', height: 64 }}>
                    <button style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                        <Icon name="home" size={24} fill style={{ background: C.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }} />
                        <span style={{ display: 'block', fontSize: 10, marginTop: 4, fontWeight: 700 }}>ראשי</span>
                    </button>
                    <button onClick={() => onStart('flash', 10)} style={{ width: 56, height: 56, borderRadius: '50%', background: C.gradient, border: `4px solid ${C.bg}`, marginTop: -30, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 20px -5px ${C.pink}`, cursor: 'pointer' }}>
                        <Icon name="bolt" size={28} style={{ color: 'white' }} />
                    </button>
                    <button onClick={() => navigate('/stats')} style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer' }}>
                        <Icon name="bar_chart" size={24} />
                        <span style={{ display: 'block', fontSize: 10, marginTop: 4 }}>מדדים</span>
                    </button>
                </div>
            </nav>
        </div>
    );
};

Home.propTypes = {
    onStart: PropTypes.func.isRequired,
    onStartFailedVocab: PropTypes.func,
    onStartFailedEnglish: PropTypes.func
};

export default Home;
