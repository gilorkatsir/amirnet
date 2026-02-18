import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Icon from '../components/Icon';
import { C } from '../styles/theme';

const WelcomeScreen = ({ stats, englishStats, totalWords, totalQuestions, onContinue }) => {
    const [showContent, setShowContent] = useState(false);
    const [animationPhase, setAnimationPhase] = useState(0);

    // Animate in on mount
    useEffect(() => {
        setTimeout(() => setShowContent(true), 100);
        setTimeout(() => setAnimationPhase(1), 400);
        setTimeout(() => setAnimationPhase(2), 800);
        setTimeout(() => setAnimationPhase(3), 1200);
    }, []);

    // Get time-based greeting
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) return { text: 'בוקר טוב', emoji: '☀️' };
        if (hour >= 12 && hour < 17) return { text: 'צהריים טובים', emoji: '🌤️' };
        if (hour >= 17 && hour < 21) return { text: 'ערב טוב', emoji: '🌅' };
        return { text: 'לילה טוב', emoji: '🌙' };
    };

    // Calculate stats
    const learnedCount = Object.keys(stats).length;
    const englishAnswered = Object.keys(englishStats).length;

    const totalCorrect = Object.values(stats).reduce((acc, s) => acc + s.correct, 0);
    const totalIncorrect = Object.values(stats).reduce((acc, s) => acc + s.incorrect, 0);
    const totalAttempts = totalCorrect + totalIncorrect;
    const accuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;

    // Get last login from localStorage
    const getLastLogin = () => {
        try {
            const last = localStorage.getItem('wm_last_login');
            if (last) {
                const date = new Date(parseInt(last));
                const now = new Date();
                const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
                if (diffDays === 0) return 'היום';
                if (diffDays === 1) return 'אתמול';
                return `לפני ${diffDays} ימים`;
            }
            return 'פעם ראשונה!';
        } catch { return 'פעם ראשונה!'; }
    };

    // Save current login
    useEffect(() => {
        localStorage.setItem('wm_last_login', Date.now().toString());
    }, []);

    const greeting = getGreeting();
    const progress = Math.round(((learnedCount / totalWords) + (englishAnswered / totalQuestions)) / 2 * 100);

    return (
        <div style={{
            minHeight: '100vh',
            background: C.bg,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Animated Background Elements */}
            <div style={{
                position: 'absolute',
                top: '10%',
                left: '10%',
                width: 300,
                height: 300,
                background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
                borderRadius: '50%',
                filter: 'blur(60px)',
                animation: 'float 6s ease-in-out infinite',
                pointerEvents: 'none'
            }} />
            <div style={{
                position: 'absolute',
                bottom: '20%',
                right: '5%',
                width: 250,
                height: 250,
                background: 'radial-gradient(circle, rgba(236,72,153,0.12) 0%, transparent 70%)',
                borderRadius: '50%',
                filter: 'blur(50px)',
                animation: 'float 8s ease-in-out infinite reverse',
                pointerEvents: 'none'
            }} />

            {/* Logo/Brand */}
            <div style={{
                opacity: showContent ? 1 : 0,
                transform: showContent ? 'translateY(0)' : 'translateY(-20px)',
                transition: 'all 0.6s ease-out',
                textAlign: 'center',
                marginBottom: 40
            }}>
                <div style={{
                    width: 80,
                    height: 80,
                    margin: '0 auto 16px',
                    borderRadius: 20,
                    background: C.gradient,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 32px rgba(139,92,246,0.4)',
                    animation: 'pulse 2s ease-in-out infinite'
                }}>
                    <Icon name="school" size={40} style={{ color: 'white' }} />
                </div>
                <h1 style={{
                    fontSize: 28,
                    fontWeight: 700,
                    margin: 0,
                    background: C.gradient,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>
                    WordMaster
                </h1>
            </div>

            {/* Greeting */}
            <div style={{
                opacity: animationPhase >= 1 ? 1 : 0,
                transform: animationPhase >= 1 ? 'translateY(0)' : 'translateY(20px)',
                transition: 'all 0.5s ease-out',
                textAlign: 'center',
                marginBottom: 32
            }}>
                <p style={{ fontSize: 32, margin: 0, marginBottom: 8 }}>{greeting.emoji}</p>
                <h2 style={{ fontSize: 24, fontWeight: 600, margin: 0, color: 'white' }}>
                    {greeting.text}!
                </h2>
                <p style={{ fontSize: 14, color: C.muted, marginTop: 8 }}>
                    כניסה אחרונה: {getLastLogin()}
                </p>
            </div>

            {/* Stats Cards */}
            <div style={{
                opacity: animationPhase >= 2 ? 1 : 0,
                transform: animationPhase >= 2 ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
                transition: 'all 0.5s ease-out',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 12,
                width: '100%',
                maxWidth: 360,
                marginBottom: 40
            }}>
                {/* Progress */}
                <div style={{
                    background: C.surface,
                    border: `1px solid ${C.border}`,
                    borderRadius: 16,
                    padding: 16,
                    textAlign: 'center'
                }}>
                    <div style={{
                        fontSize: 28,
                        fontWeight: 700,
                        background: C.gradient,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        {progress}%
                    </div>
                    <p style={{ fontSize: 11, color: C.muted, margin: '4px 0 0' }}>התקדמות</p>
                </div>

                {/* Accuracy */}
                <div style={{
                    background: C.surface,
                    border: `1px solid ${C.border}`,
                    borderRadius: 16,
                    padding: 16,
                    textAlign: 'center'
                }}>
                    <div style={{
                        fontSize: 28,
                        fontWeight: 700,
                        color: accuracy >= 70 ? C.green : C.orange
                    }}>
                        {accuracy}%
                    </div>
                    <p style={{ fontSize: 11, color: C.muted, margin: '4px 0 0' }}>דיוק</p>
                </div>

                {/* Words Learned */}
                <div style={{
                    background: C.surface,
                    border: `1px solid ${C.border}`,
                    borderRadius: 16,
                    padding: 16,
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: 28, fontWeight: 700, color: C.purple }}>
                        {learnedCount}
                    </div>
                    <p style={{ fontSize: 11, color: C.muted, margin: '4px 0 0' }}>מילים</p>
                </div>
            </div>

            {/* Improvement Trend */}
            {totalAttempts > 0 && (
                <div style={{
                    opacity: animationPhase >= 2 ? 1 : 0,
                    transition: 'all 0.5s ease-out 0.2s',
                    background: 'rgba(34,197,94,0.1)',
                    border: '1px solid rgba(34,197,94,0.2)',
                    borderRadius: 12,
                    padding: '12px 20px',
                    marginBottom: 32,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                }}>
                    <Icon name="trending_up" size={20} style={{ color: C.green }} />
                    <span style={{ fontSize: 14, color: C.green, fontWeight: 500 }}>
                        המשך כך! התקדמת יפה 💪
                    </span>
                </div>
            )}

            {/* CTA Button */}
            <button
                onClick={onContinue}
                style={{
                    opacity: animationPhase >= 3 ? 1 : 0,
                    transform: animationPhase >= 3 ? 'translateY(0)' : 'translateY(20px)',
                    transition: 'all 0.5s ease-out',
                    width: '100%',
                    maxWidth: 320,
                    padding: '18px 32px',
                    borderRadius: 16,
                    border: 'none',
                    background: C.gradient,
                    color: 'white',
                    fontSize: 18,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                    boxShadow: '0 8px 32px rgba(139,92,246,0.4)',
                    animation: animationPhase >= 3 ? 'glow 2s ease-in-out infinite' : 'none'
                }}
            >
                <Icon name="rocket_launch" size={24} />
                בוא נתחיל ללמוד!
            </button>

            {/* CSS Animations */}
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(5deg); }
                }
                @keyframes pulse {
                    0%, 100% { transform: scale(1); box-shadow: 0 8px 32px rgba(139,92,246,0.4); }
                    50% { transform: scale(1.05); box-shadow: 0 12px 40px rgba(139,92,246,0.5); }
                }
                @keyframes glow {
                    0%, 100% { box-shadow: 0 8px 32px rgba(139,92,246,0.4); }
                    50% { box-shadow: 0 8px 48px rgba(236,72,153,0.5); }
                }
            `}</style>
        </div>
    );
};

WelcomeScreen.propTypes = {
    stats: PropTypes.object.isRequired,
    englishStats: PropTypes.object,
    totalWords: PropTypes.number.isRequired,
    totalQuestions: PropTypes.number,
    onContinue: PropTypes.func.isRequired
};

WelcomeScreen.defaultProps = {
    englishStats: {},
    totalQuestions: 220
};

export default WelcomeScreen;
