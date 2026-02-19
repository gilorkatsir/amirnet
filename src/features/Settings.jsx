import React, { useState, useRef } from 'react';
import { useLocation } from 'wouter';
import Icon from '../components/Icon';
import { C } from '../styles/theme';
import { isSoundEnabled, setSoundEnabled } from '../utils/sounds';
import { validateStatsStructure, safeLocalStorageGet } from '../utils/security';
import { useStatsContext } from '../contexts/StatsContext';
import { useUserWords } from '../contexts/UserWordsContext';
import {
    getElevenLabsKey, setElevenLabsKey,
    getAiKey, setAiKey,
    getAiProvider, setAiProvider
} from '../services/apiKeys';

const Settings = () => {
    const [, navigate] = useLocation();
    const { resetStats, setStats, setEnglishStats } = useStatsContext();
    const { setUserWords } = useUserWords();
    const [confirmReset, setConfirmReset] = useState(null); // 'all', 'vocab', 'english', or null
    const [soundOn, setSoundOn] = useState(isSoundEnabled());
    const [importStatus, setImportStatus] = useState(null); // 'success', 'error', null
    const fileInputRef = useRef(null);
    const [elevenLabsKey, setElevenLabsKeyState] = useState(getElevenLabsKey());
    const [aiKey, setAiKeyState] = useState(getAiKey());
    const [aiProvider, setAiProviderState] = useState(getAiProvider());
    const [showApiKeys, setShowApiKeys] = useState(false);

    const SettingItem = ({ icon, title, desc, onClick, danger = false, rightElement }) => (
        <button
            onClick={onClick}
            style={{
                display: 'flex', alignItems: 'center', gap: 16, width: '100%',
                padding: 16, marginBottom: 12, background: C.surface,
                border: `1px solid ${confirmReset ? '#ef4444' : C.border}`,
                borderRadius: 12, color: C.text, cursor: 'pointer', textAlign: 'right',
                transition: 'all 0.2s'
            }}
        >
            <div style={{
                width: 40, height: 40, borderRadius: 8, background: danger ? 'rgba(239,68,68,0.1)' : C.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: danger ? '#ef4444' : C.muted
            }}>
                <Icon name={icon} size={20} />
            </div>
            <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0, fontWeight: 600, fontSize: 15, color: danger ? '#ef4444' : 'white' }}>{title}</h3>
                {desc && <p style={{ margin: '4px 0 0', fontSize: 13, color: C.muted }}>{desc}</p>}
            </div>
            {rightElement || <Icon name="chevron_right" size={20} style={{ color: C.muted, transform: 'rotate(180deg)' }} />}
        </button>
    );

    const handleReset = (type) => {
        if (confirmReset === type) {
            resetStats(type);
            setConfirmReset(null);
        } else {
            setConfirmReset(type);
            setTimeout(() => setConfirmReset(null), 3000); // Clear confirmation after 3s
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: C.bg }}>
            {/* Header */}
            <header style={{
                display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px',
                background: 'rgba(26,26,26,0.95)', backdropFilter: 'blur(8px)',
                borderBottom: `1px solid ${C.border}`
            }}>
                <button
                    onClick={() => navigate('/')}
                    style={{
                        width: 40, height: 40, borderRadius: '50%', background: 'transparent',
                        border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                >
                    <Icon name="arrow_forward" size={24} style={{ color: 'white' }} />
                </button>
                <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: 'white' }}>הגדרות</h2>
            </header>

            <main style={{ padding: 20, flex: 1 }}>

                <section style={{ marginBottom: 32 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: C.muted, marginBottom: 12, paddingRight: 4 }}>העדפות</h3>
                    <SettingItem
                        icon={soundOn ? "volume_up" : "volume_off"}
                        title="אפקטי קול"
                        desc={soundOn ? "קולות מופעלים" : "קולות מושתקים"}
                        onClick={() => {
                            const newVal = !soundOn;
                            setSoundOn(newVal);
                            setSoundEnabled(newVal);
                        }}
                        rightElement={
                            <div style={{
                                width: 44, height: 24, borderRadius: 12,
                                background: soundOn ? C.green : C.border,
                                padding: 2, cursor: 'pointer', transition: 'background 0.2s'
                            }}>
                                <div style={{
                                    width: 20, height: 20, borderRadius: '50%', background: 'white',
                                    transition: 'transform 0.2s',
                                    transform: soundOn ? 'translateX(-20px)' : 'translateX(0)'
                                }} />
                            </div>
                        }
                    />
                </section>

                <section style={{ marginBottom: 32 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: C.muted, marginBottom: 12, paddingRight: 4 }}>נתונים ואיפוס</h3>

                    <SettingItem
                        icon="delete"
                        title={confirmReset === 'all' ? "לחץ שוב לאישור" : "איפוס כל הנתונים"}
                        desc="מחיקת כל ההתקדמות (מילים ושאלות)"
                        danger
                        onClick={() => handleReset('all')}
                    />
                    <SettingItem
                        icon="style"
                        title={confirmReset === 'vocab' ? "לחץ שוב לאישור" : "איפוס אוצר מילים"}
                        desc="מחיקת התקדמות המילים בלבד"
                        danger
                        onClick={() => handleReset('vocab')}
                    />
                    <SettingItem
                        icon="quiz"
                        title={confirmReset === 'english' ? "לחץ שוב לאישור" : "איפוס שאלות אנגלית"}
                        desc="מחיקת היסטורית המענה על שאלות"
                        danger
                        onClick={() => handleReset('english')}
                    />
                </section>

                <section style={{ marginBottom: 32 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: C.muted, marginBottom: 12, paddingRight: 4 }}>גיבוי ושחזור</h3>
                    <SettingItem
                        icon="download"
                        title="ייצוא נתונים"
                        desc="הורדת כל הנתונים כקובץ JSON"
                        onClick={() => {
                            const data = {};
                            for (let i = 0; i < localStorage.length; i++) {
                                const key = localStorage.key(i);
                                if (key.startsWith('wm_')) {
                                    try {
                                        data[key] = JSON.parse(localStorage.getItem(key));
                                    } catch {
                                        data[key] = localStorage.getItem(key);
                                    }
                                }
                            }
                            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `amirnet-backup-${new Date().toISOString().split('T')[0]}.json`;
                            a.click();
                            URL.revokeObjectURL(url);
                        }}
                    />
                    <SettingItem
                        icon="upload"
                        title="ייבוא נתונים"
                        desc={importStatus === 'success' ? 'הנתונים יובאו בהצלחה!' : importStatus === 'error' ? 'שגיאה בייבוא הקובץ' : 'שחזור נתונים מקובץ גיבוי'}
                        onClick={() => fileInputRef.current?.click()}
                    />
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".json"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onload = (event) => {
                                try {
                                    const data = JSON.parse(event.target.result);
                                    if (typeof data !== 'object' || data === null) throw new Error('Invalid format');

                                    // Validate stats structures if present
                                    if (data.wm_stats && !validateStatsStructure(data.wm_stats)) {
                                        throw new Error('Invalid stats structure');
                                    }

                                    // Import all wm_ keys
                                    for (const [key, value] of Object.entries(data)) {
                                        if (key.startsWith('wm_')) {
                                            localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
                                        }
                                    }
                                    setImportStatus('success');
                                    // Reload contexts from localStorage
                                    const s = safeLocalStorageGet('wm_stats');
                                    if (s) setStats(s);
                                    const es = safeLocalStorageGet('wm_english_stats');
                                    if (es) setEnglishStats(es);
                                    const uw = safeLocalStorageGet('wm_user_words');
                                    if (uw) setUserWords(uw);
                                    setTimeout(() => setImportStatus(null), 3000);
                                } catch {
                                    setImportStatus('error');
                                    setTimeout(() => setImportStatus(null), 3000);
                                }
                            };
                            reader.readAsText(file);
                            e.target.value = ''; // Reset to allow re-import
                        }}
                    />
                </section>

                <section style={{ marginBottom: 32 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: C.muted, marginBottom: 12, paddingRight: 4 }}>חיבורי AI</h3>
                    <SettingItem
                        icon="key"
                        title="מפתחות API"
                        desc={elevenLabsKey || aiKey ? 'מפתחות מוגדרים' : 'הגדר מפתחות עבור קול ושאלות AI'}
                        onClick={() => setShowApiKeys(!showApiKeys)}
                        rightElement={
                            <Icon name={showApiKeys ? 'expand_less' : 'expand_more'} size={20} style={{ color: C.muted }} />
                        }
                    />
                    {showApiKeys && (
                        <div style={{
                            background: C.surface,
                            border: `1px solid ${C.border}`,
                            borderRadius: 12,
                            padding: 20,
                            marginBottom: 12,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 16
                        }}>
                            <div>
                                <label style={{ display: 'block', fontSize: 13, color: C.muted, marginBottom: 6 }} dir="rtl">
                                    ElevenLabs API Key (קול לשאלות)
                                </label>
                                <input
                                    type="password"
                                    value={elevenLabsKey}
                                    onChange={(e) => {
                                        setElevenLabsKeyState(e.target.value);
                                        setElevenLabsKey(e.target.value);
                                    }}
                                    placeholder="xi-xxxxxxxxxxxxxxxx"
                                    style={{
                                        width: '100%',
                                        background: 'rgba(0,0,0,0.3)',
                                        border: `1px solid ${C.border}`,
                                        borderRadius: 8,
                                        padding: '10px 12px',
                                        color: 'white',
                                        fontSize: 14,
                                        outline: 'none',
                                        direction: 'ltr',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: 13, color: C.muted, marginBottom: 6 }} dir="rtl">
                                    ספק AI לשאלות
                                </label>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    {['openai', 'anthropic'].map(p => (
                                        <button
                                            key={p}
                                            onClick={() => {
                                                setAiProviderState(p);
                                                setAiProvider(p);
                                            }}
                                            style={{
                                                flex: 1,
                                                padding: '8px 12px',
                                                borderRadius: 8,
                                                background: aiProvider === p ? 'rgba(139, 92, 246, 0.2)' : 'rgba(0,0,0,0.3)',
                                                border: `1px solid ${aiProvider === p ? C.purple : C.border}`,
                                                color: aiProvider === p ? C.purple : C.muted,
                                                cursor: 'pointer',
                                                fontSize: 13,
                                                fontWeight: 600
                                            }}
                                        >
                                            {p === 'openai' ? 'OpenAI' : 'Anthropic'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: 13, color: C.muted, marginBottom: 6 }} dir="rtl">
                                    {aiProvider === 'openai' ? 'OpenAI API Key' : 'Anthropic API Key'} (שאלות AI)
                                </label>
                                <input
                                    type="password"
                                    value={aiKey}
                                    onChange={(e) => {
                                        setAiKeyState(e.target.value);
                                        setAiKey(e.target.value);
                                    }}
                                    placeholder={aiProvider === 'openai' ? 'sk-xxxxxxxxxxxxxxxx' : 'sk-ant-xxxxxxxxxxxxxxxx'}
                                    style={{
                                        width: '100%',
                                        background: 'rgba(0,0,0,0.3)',
                                        border: `1px solid ${C.border}`,
                                        borderRadius: 8,
                                        padding: '10px 12px',
                                        color: 'white',
                                        fontSize: 14,
                                        outline: 'none',
                                        direction: 'ltr',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>
                            <p style={{ margin: 0, fontSize: 11, color: C.muted, lineHeight: 1.5 }} dir="rtl">
                                המפתחות נשמרים מקומית על המכשיר שלך בלבד.
                            </p>
                        </div>
                    )}
                </section>

                <section>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: C.muted, marginBottom: 12, paddingRight: 4 }}>אודות</h3>
                    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, textAlign: 'center' }}>
                        <div style={{ width: 64, height: 64, borderRadius: 16, background: C.gradient, margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>
                            🧠
                        </div>
                        <h3 style={{ margin: '0 0 4px', color: 'white' }}>AMIRNET</h3>
                        <p style={{ margin: 0, color: C.muted, fontSize: 14 }}>גרסה 1.0.0</p>
                        <p style={{ margin: '16px 0 0', color: C.muted, fontSize: 13, lineHeight: 1.5 }}>
                            אפליקציית הכנה למבחן אמי"ר / אמיר"ם.
                            <br />
                            נבנה בהתאמה אישית ללמידה אפקטיבית.
                        </p>
                    </div>
                </section>

                <section style={{ marginTop: 24 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: C.muted, marginBottom: 12, paddingRight: 4 }}>משפטי ונגישות</h3>
                    <SettingItem
                        icon="shield"
                        title="מדיניות פרטיות ותנאי שימוש"
                        desc="קרא את המידע המשפטי"
                        onClick={() => navigate('/legal')}
                    />
                    <SettingItem
                        icon="accessibility"
                        title="הצהרת נגישות"
                        desc="מידע על נגישות האפליקציה"
                        onClick={() => navigate('/accessibility')}
                    />
                </section>

            </main>
        </div>
    );
};

export default Settings;
