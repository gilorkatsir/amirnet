import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { Setting2, CloseCircle, Play, Pause, RotateLeft } from 'iconsax-react';
import { C } from '../styles/theme';
import { playTimerComplete, playBreak, playStart, playClick } from '../utils/sounds';

// Default intervals (in minutes)
const DEFAULT_INTERVALS = {
    focus: 25,
    short: 5,
    long: 15
};

const PomodoroTimer = () => {
    const [, navigate] = useLocation();
    // Load saved intervals from localStorage
    const getSavedIntervals = () => {
        try {
            const saved = localStorage.getItem('wm_pomodoro_intervals');
            if (saved) return JSON.parse(saved);
        } catch (e) { console.error(e); }
        return DEFAULT_INTERVALS;
    };

    const [intervals, setIntervals] = useState(getSavedIntervals);
    const [timeLeft, setTimeLeft] = useState(intervals.focus * 60);
    const [isActive, setIsActive] = useState(false);
    const [mode, setMode] = useState('focus'); // focus, short, long
    const [showSettings, setShowSettings] = useState(false);
    const [editIntervals, setEditIntervals] = useState({ ...intervals });

    const timerRef = useRef(null);

    const MODES = {
        focus: { color: C.purple, label: 'פוקוס', icon: 'psychology' },
        short: { color: C.green, label: 'הפסקה קצרה', icon: 'coffee' },
        long: { color: C.blue, label: 'הפסקה ארוכה', icon: 'self_improvement' }
    };

    useEffect(() => {
        if (isActive && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && isActive) {
            setIsActive(false);
            if (timerRef.current) clearInterval(timerRef.current);
            // Play completion sound
            playTimerComplete();
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isActive, timeLeft]);

    const toggleTimer = () => {
        if (!isActive) {
            playStart();
        }
        setIsActive(!isActive);
    };

    const resetTimer = () => {
        playClick();
        setIsActive(false);
        setTimeLeft(intervals[mode] * 60);
    };

    const changeMode = (newMode) => {
        playClick();
        if (newMode === 'focus') {
            playStart();
        } else {
            playBreak();
        }
        setMode(newMode);
        setIsActive(false);
        setTimeLeft(intervals[newMode] * 60);
    };

    const saveIntervals = () => {
        playClick();
        setIntervals(editIntervals);
        localStorage.setItem('wm_pomodoro_intervals', JSON.stringify(editIntervals));
        setTimeLeft(editIntervals[mode] * 60);
        setShowSettings(false);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const progress = timeLeft / (intervals[mode] * 60);
    const strokeDasharray = 283; // 2 * pi * 45
    const strokeDashoffset = strokeDasharray * (1 - progress);

    // Settings Modal
    const SettingsModal = () => (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
        }}>
            <div style={{
                background: C.surface, borderRadius: 20, padding: 24,
                width: '90%', maxWidth: 360, border: `1px solid ${C.border}`
            }}>
                <h3 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 700, textAlign: 'center' }}>
                    ⚙️ הגדרות זמנים
                </h3>

                {Object.keys(MODES).map((m) => (
                    <div key={m} style={{ marginBottom: 16 }}>
                        <label style={{ display: 'block', marginBottom: 8, color: C.muted, fontSize: 14 }}>
                            {MODES[m].label} (דקות)
                        </label>
                        <input
                            type="number"
                            min="1"
                            max="60"
                            value={editIntervals[m]}
                            onChange={(e) => setEditIntervals({
                                ...editIntervals,
                                [m]: Math.max(1, Math.min(60, parseInt(e.target.value) || 1))
                            })}
                            style={{
                                width: '100%', padding: 12, borderRadius: 10,
                                background: C.bg, border: `1px solid ${C.border}`,
                                color: C.text, fontSize: 18, textAlign: 'center'
                            }}
                        />
                    </div>
                ))}

                <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                    <button
                        onClick={() => setShowSettings(false)}
                        style={{
                            flex: 1, padding: 12, borderRadius: 10,
                            background: C.bg, border: `1px solid ${C.border}`,
                            color: C.muted, fontSize: 16, cursor: 'pointer'
                        }}
                    >
                        ביטול
                    </button>
                    <button
                        onClick={saveIntervals}
                        style={{
                            flex: 1, padding: 12, borderRadius: 10,
                            background: C.gradient, border: 'none',
                            color: 'white', fontSize: 16, fontWeight: 600, cursor: 'pointer'
                        }}
                    >
                        שמור
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: C.bg, alignItems: 'center', justifyContent: 'center', position: 'relative' }}>

            {/* Header Buttons */}
            <div style={{ position: 'absolute', top: 20, right: 20, display: 'flex', gap: 12 }}>
                <button
                    onClick={() => { playClick(); setShowSettings(true); }}
                    style={{
                        width: 40, height: 40, borderRadius: '50%', background: C.surface,
                        border: `1px solid ${C.border}`, color: C.muted, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                >
                    <Setting2 size={20} />
                </button>
                <button
                    onClick={() => navigate('/')}
                    style={{
                        width: 40, height: 40, borderRadius: '50%', background: C.surface,
                        border: `1px solid ${C.border}`, color: C.muted, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                >
                    <CloseCircle size={24} />
                </button>
            </div>

            {/* Mode Selectors */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 40, background: C.surface, padding: 4, borderRadius: 24, border: `1px solid ${C.border}` }}>
                {Object.keys(MODES).map((m) => (
                    <button
                        key={m}
                        onClick={() => changeMode(m)}
                        style={{
                            background: mode === m ? MODES[m].color : 'transparent',
                            color: mode === m ? 'white' : C.muted,
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: 20,
                            cursor: 'pointer',
                            fontSize: 14,
                            fontWeight: 600,
                            transition: 'background 0.3s, color 0.3s'
                        }}
                    >
                        {MODES[m].label}
                    </button>
                ))}
            </div>

            {/* Timer Display */}
            <div style={{ position: 'relative', width: 300, height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {/* SVG Ring */}
                <svg width="300" height="300" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)', position: 'absolute' }}>
                    <circle
                        cx="50" cy="50" r="45"
                        fill="none"
                        stroke={C.surface}
                        strokeWidth="4"
                    />
                    <circle
                        cx="50" cy="50" r="45"
                        fill="none"
                        stroke={MODES[mode].color}
                        strokeWidth="4"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dashoffset 1s linear' }}
                    />
                </svg>

                {/* Time Text */}
                <div style={{ textAlign: 'center', zIndex: 10 }}>
                    <div style={{ fontSize: 72, fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: 'white' }}>
                        {formatTime(timeLeft)}
                    </div>
                    <p style={{ margin: 0, color: C.muted, fontSize: 16 }}>
                        {isActive ? 'בהצלחה!' : timeLeft === 0 ? 'סיימת! 🎉' : 'מוכן להתחיל?'}
                    </p>
                </div>
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', gap: 20, marginTop: 40 }}>
                <button
                    onClick={toggleTimer}
                    style={{
                        width: 64, height: 64, borderRadius: '50%',
                        background: isActive ? C.surface : MODES[mode].color,
                        border: `2px solid ${isActive ? C.border : 'transparent'}`,
                        color: isActive ? C.text : 'white',
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 24,
                        boxShadow: isActive ? 'none' : `0 0 20px -5px ${MODES[mode].color}`
                    }}
                >
                    {isActive ? <Pause size={32} /> : <Play size={32} />}
                </button>

                <button
                    onClick={resetTimer}
                    style={{
                        width: 64, height: 64, borderRadius: '50%',
                        background: C.surface,
                        border: `1px solid ${C.border}`,
                        color: C.muted,
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                >
                    <RotateLeft size={32} />
                </button>
            </div>

            {/* Settings Modal */}
            {showSettings && <SettingsModal />}
        </div>
    );
};

export default PomodoroTimer;
