import React from 'react';
import PropTypes from 'prop-types';
import Icon from '../components/Icon';
import ProgressChart from '../components/ProgressChart';
import { C } from '../styles/theme';
import { getLastNDaysAccuracy, getWeeklyAccuracy } from '../utils/dailyStats';

/**
 * Stats/Metrics Page Component
 * Shows detailed statistics for vocabulary and English questions progress
 */
const Stats = ({ stats, englishStats, totalWords, totalQuestions, onBack }) => {
    // Get chart data
    const dailyData = getLastNDaysAccuracy(7);
    const weeklyData = getWeeklyAccuracy(4);
    // Vocabulary stats
    const vocabLearned = Object.keys(stats).length;
    const vocabMastered = Object.values(stats).filter(s => s.level >= 4).length;
    const vocabCorrect = Object.values(stats).reduce((acc, s) => acc + s.correct, 0);
    const vocabIncorrect = Object.values(stats).reduce((acc, s) => acc + s.incorrect, 0);
    const vocabTotal = vocabCorrect + vocabIncorrect;
    const vocabAccuracy = vocabTotal > 0 ? Math.round((vocabCorrect / vocabTotal) * 100) : 0;

    // English stats
    const englishAnswered = Object.keys(englishStats).length;
    const englishCorrect = Object.values(englishStats).reduce((acc, s) => acc + s.correct, 0);
    const englishTotal = Object.values(englishStats).reduce((acc, s) => acc + s.attempts, 0);
    const englishAccuracy = englishTotal > 0 ? Math.round((englishCorrect / englishTotal) * 100) : 0;

    const StatCard = ({ icon, title, value, subtitle, color, progress }) => (
        <div style={{
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: 12,
            padding: 16,
            marginBottom: 12
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: `${color}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Icon name={icon} size={20} style={{ color }} />
                </div>
                <div style={{ flex: 1 }}>
                    <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'white' }}>{title}</h3>
                    <p style={{ margin: '2px 0 0', fontSize: 12, color: C.muted }}>{subtitle}</p>
                </div>
                <span style={{ fontSize: 24, fontWeight: 700, color }}>{value}</span>
            </div>
            {progress !== undefined && (
                <div style={{ height: 6, background: C.border, borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{
                        height: '100%',
                        width: `${progress}%`,
                        background: color,
                        borderRadius: 3,
                        transition: 'width 0.3s ease'
                    }} />
                </div>
            )}
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: C.bg, color: C.text }}>
            {/* Header */}
            <header style={{
                position: 'sticky',
                top: 0,
                zIndex: 10,
                background: 'rgba(18,18,18,0.95)',
                backdropFilter: 'blur(12px)',
                padding: '16px 20px',
                borderBottom: `1px solid ${C.border}`,
                display: 'flex',
                alignItems: 'center',
                gap: 16
            }}>
                <button
                    onClick={onBack}
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 8
                    }}
                >
                    <Icon name="arrow_back" size={24} style={{ color: C.muted }} />
                </button>
                <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: 'white' }}>
                    סטטיסטיקות
                </h1>
            </header>

            <main style={{ padding: 20 }}>
                {/* Progress Charts */}
                <section style={{ marginBottom: 32 }}>
                    <h2 style={{ fontSize: 14, fontWeight: 600, color: C.muted, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Icon name="show_chart" size={16} />
                        מעקב התקדמות
                    </h2>

                    <ProgressChart data={dailyData} type="daily" />
                    <ProgressChart data={weeklyData} type="weekly" />
                </section>

                {/* Vocabulary Section */}
                <section style={{ marginBottom: 32 }}>
                    <h2 style={{ fontSize: 14, fontWeight: 600, color: C.muted, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Icon name="style" size={16} />
                        אוצר מילים
                    </h2>

                    <StatCard
                        icon="school"
                        title="מילים שנלמדו"
                        value={vocabLearned}
                        subtitle={`מתוך ${totalWords} מילים`}
                        color={C.pink}
                        progress={totalWords > 0 ? (vocabLearned / totalWords) * 100 : 0}
                    />

                    <StatCard
                        icon="emoji_events"
                        title="מילים שנשלטו"
                        value={vocabMastered}
                        subtitle="רמה 4 ומעלה"
                        color={C.orange}
                        progress={vocabLearned > 0 ? (vocabMastered / vocabLearned) * 100 : 0}
                    />

                    <StatCard
                        icon="check_circle"
                        title="דיוק"
                        value={`${vocabAccuracy}%`}
                        subtitle={`${vocabCorrect} נכון מתוך ${vocabTotal} ניסיונות`}
                        color={C.green}
                    />
                </section>

                {/* English Questions Section */}
                <section style={{ marginBottom: 32 }}>
                    <h2 style={{ fontSize: 14, fontWeight: 600, color: C.muted, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Icon name="quiz" size={16} />
                        שאלות באנגלית
                    </h2>

                    <StatCard
                        icon="assignment"
                        title="שאלות שנענו"
                        value={englishAnswered}
                        subtitle={`מתוך ${totalQuestions} שאלות`}
                        color={C.purple}
                        progress={totalQuestions > 0 ? (englishAnswered / totalQuestions) * 100 : 0}
                    />

                    <StatCard
                        icon="trending_up"
                        title="דיוק"
                        value={`${englishAccuracy}%`}
                        subtitle={`${englishCorrect} נכון מתוך ${englishTotal} ניסיונות`}
                        color={C.green}
                    />
                </section>

                {/* Reset Data */}
                <section>
                    <button
                        onClick={() => {
                            if (window.confirm('האם אתה בטוח שברצונך לאפס את כל הנתונים?')) {
                                localStorage.removeItem('wm_stats');
                                localStorage.removeItem('wm_english_stats');
                                window.location.reload();
                            }
                        }}
                        style={{
                            width: '100%',
                            padding: '14px 20px',
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: `1px solid ${C.red}50`,
                            borderRadius: 12,
                            color: C.red,
                            fontSize: 14,
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 8
                        }}
                    >
                        <Icon name="delete" size={18} />
                        איפוס כל הנתונים
                    </button>
                </section>
            </main>
        </div>
    );
};

Stats.propTypes = {
    stats: PropTypes.object.isRequired,
    englishStats: PropTypes.object.isRequired,
    totalWords: PropTypes.number.isRequired,
    totalQuestions: PropTypes.number.isRequired,
    onBack: PropTypes.func.isRequired
};

export default Stats;
