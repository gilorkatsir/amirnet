import React, { useState, useRef } from 'react';
import { useLocation } from 'wouter';
import {
    ArrowRight, Volume2, VolumeX, Trash2, Layers, Brain,
    Download, Upload, Key, ChevronDown, ChevronUp, ChevronLeft,
    Shield, Accessibility, GraduationCap, LogIn, LogOut, Crown, User
} from 'lucide-react';
import { C, GLASS, RADIUS, SURFACE } from '../styles/theme';
import { isSoundEnabled, setSoundEnabled } from '../utils/sounds';
import { validateStatsStructure, safeLocalStorageGet } from '../utils/security';
import { useStatsContext } from '../contexts/StatsContext';
import { useUserWords } from '../contexts/UserWordsContext';
import { useAuth } from '../contexts/AuthContext';
import {
    getElevenLabsKey, setElevenLabsKey
} from '../services/apiKeys';

const Settings = () => {
    const [, navigate] = useLocation();
    const { resetStats, setStats, setEnglishStats } = useStatsContext();
    const { setUserWords } = useUserWords();
    const { user, isLoggedIn, isPremium, signOut } = useAuth();
    const [confirmReset, setConfirmReset] = useState(null);
    const [soundOn, setSoundOn] = useState(isSoundEnabled());
    const [importStatus, setImportStatus] = useState(null);
    const fileInputRef = useRef(null);
    const [elevenLabsKey, setElevenLabsKeyState] = useState(getElevenLabsKey());
    const [showApiKeys, setShowApiKeys] = useState(false);

    const SettingItem = ({ icon: ItemIcon, title, desc, onClick, danger = false, rightElement }) => (
        <button
            onClick={onClick}
            style={{
                display: 'flex', alignItems: 'center', gap: 14, width: '100%',
                padding: '14px 16px', marginBottom: 8,
                background: C.surface, border: `1px solid ${C.border}`,
                borderRadius: 14, color: C.text, cursor: 'pointer', textAlign: 'right',
                transition: 'background 0.2s',
            }}
        >
            <ItemIcon size={18} color={danger ? C.red : C.dim} style={{ flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0, fontWeight: 600, fontSize: 15, color: danger ? C.red : C.text }}>{title}</h3>
                {desc && <p style={{ margin: '3px 0 0', fontSize: 13, color: C.muted }}>{desc}</p>}
            </div>
            {rightElement || <ChevronLeft size={18} color={C.dim} />}
        </button>
    );

    const handleReset = (type) => {
        if (confirmReset === type) {
            resetStats(type);
            setConfirmReset(null);
        } else {
            setConfirmReset(type);
            setTimeout(() => setConfirmReset(null), 3000);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: C.bg }}>
            <header style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px',
                ...GLASS.header
            }}>
                <button
                    onClick={() => navigate('/')}
                    style={{
                        width: 38, height: 38, borderRadius: RADIUS.full, background: 'transparent',
                        border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                >
                    <ArrowRight size={20} color={C.text} />
                </button>
                <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: C.text }}>הגדרות</h2>
            </header>

            <main style={{ padding: 20, flex: 1 }}>
                <section style={{ marginBottom: 28 }}>
                    <h3 style={{ fontSize: 13, fontWeight: 700, color: C.muted, marginBottom: 10, paddingRight: 4 }}>חשבון</h3>
                    {isLoggedIn ? (
                        <div style={{
                            padding: 16, background: C.surface, border: `1px solid ${C.border}`,
                            borderRadius: 14, marginBottom: 8,
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                                <div style={{
                                    width: 40, height: 40, borderRadius: '50%',
                                    background: C.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 16, fontWeight: 700, color: 'white', flexShrink: 0,
                                }}>
                                    {(user?.email?.[0] || '?').toUpperCase()}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: C.text }}>{user?.email}</p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                                        {isPremium ? (
                                            <span style={{
                                                display: 'inline-flex', alignItems: 'center', gap: 4,
                                                padding: '2px 8px', borderRadius: 6,
                                                background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.25)',
                                                fontSize: 11, fontWeight: 600, color: C.purple,
                                            }}>
                                                <Crown size={11} /> פרימיום
                                            </span>
                                        ) : (
                                            <span style={{ fontSize: 12, color: C.muted }}>חינמי</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={signOut}
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                    width: '100%', padding: '10px 16px', borderRadius: 10,
                                    background: 'rgba(239,68,68,0.08)', border: `1px solid rgba(239,68,68,0.15)`,
                                    color: C.red, fontSize: 14, fontWeight: 600, cursor: 'pointer',
                                }}
                            >
                                <LogOut size={16} />
                                התנתק
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => navigate('/login')}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 14, width: '100%',
                                padding: '14px 16px', marginBottom: 8,
                                background: 'rgba(139,92,246,0.06)', border: `1px solid rgba(139,92,246,0.15)`,
                                borderRadius: 14, color: C.text, cursor: 'pointer', textAlign: 'right',
                            }}
                        >
                            <LogIn size={18} color={C.purple} style={{ flexShrink: 0 }} />
                            <div style={{ flex: 1 }}>
                                <h3 style={{ margin: 0, fontWeight: 600, fontSize: 15, color: C.text }}>צור חשבון</h3>
                                <p style={{ margin: '3px 0 0', fontSize: 13, color: C.muted }}>שמור התקדמות בכל מכשיר</p>
                            </div>
                            <ChevronLeft size={18} color={C.dim} />
                        </button>
                    )}
                </section>

                <section style={{ marginBottom: 28 }}>
                    <h3 style={{ fontSize: 13, fontWeight: 700, color: C.muted, marginBottom: 10, paddingRight: 4 }}>העדפות</h3>
                    <SettingItem
                        icon={soundOn ? Volume2 : VolumeX}
                        title="אפקטי קול"
                        desc={soundOn ? "קולות מופעלים" : "קולות מושתקים"}
                        onClick={() => { const v = !soundOn; setSoundOn(v); setSoundEnabled(v); }}
                        rightElement={
                            <div style={{
                                width: 44, height: 24, borderRadius: 12,
                                background: soundOn ? C.green : C.border,
                                padding: 2, cursor: 'pointer', transition: 'background 0.2s'
                            }}>
                                <div style={{
                                    width: 20, height: 20, borderRadius: '50%', background: 'white',
                                    transition: 'transform 0.2s',
                                    transform: soundOn ? 'translateX(20px)' : 'translateX(0)'
                                }} />
                            </div>
                        }
                    />
                </section>

                <section style={{ marginBottom: 28 }}>
                    <h3 style={{ fontSize: 13, fontWeight: 700, color: C.muted, marginBottom: 10, paddingRight: 4 }}>נתונים ואיפוס</h3>
                    <SettingItem icon={Trash2} title={confirmReset === 'all' ? "לחץ שוב לאישור" : "איפוס כל הנתונים"} desc="מחיקת כל ההתקדמות (מילים ושאלות)" danger onClick={() => handleReset('all')} />
                    <SettingItem icon={Layers} title={confirmReset === 'vocab' ? "לחץ שוב לאישור" : "איפוס אוצר מילים"} desc="מחיקת התקדמות המילים בלבד" danger onClick={() => handleReset('vocab')} />
                    <SettingItem icon={Brain} title={confirmReset === 'english' ? "לחץ שוב לאישור" : "איפוס שאלות אנגלית"} desc="מחיקת היסטורית המענה על שאלות" danger onClick={() => handleReset('english')} />
                </section>

                <section style={{ marginBottom: 28 }}>
                    <h3 style={{ fontSize: 13, fontWeight: 700, color: C.muted, marginBottom: 10, paddingRight: 4 }}>גיבוי ושחזור</h3>
                    <SettingItem icon={Download} title="ייצוא נתונים" desc="הורדת כל הנתונים כקובץ JSON" onClick={() => {
                        const data = {};
                        for (let i = 0; i < localStorage.length; i++) {
                            const key = localStorage.key(i);
                            if (key.startsWith('wm_')) {
                                try { data[key] = JSON.parse(localStorage.getItem(key)); }
                                catch { data[key] = localStorage.getItem(key); }
                            }
                        }
                        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `amirnet-backup-${new Date().toISOString().split('T')[0]}.json`;
                        a.click();
                        URL.revokeObjectURL(url);
                    }} />
                    <SettingItem icon={Upload} title="ייבוא נתונים" desc={importStatus === 'success' ? 'הנתונים יובאו בהצלחה!' : importStatus === 'error' ? 'שגיאה בייבוא הקובץ' : 'שחזור נתונים מקובץ גיבוי'} onClick={() => fileInputRef.current?.click()} />
                    <input ref={fileInputRef} type="file" accept=".json" style={{ display: 'none' }} onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = (event) => {
                            try {
                                const data = JSON.parse(event.target.result);
                                if (typeof data !== 'object' || data === null) throw new Error('Invalid format');
                                if (data.wm_stats && !validateStatsStructure(data.wm_stats)) throw new Error('Invalid stats structure');
                                for (const [key, value] of Object.entries(data)) {
                                    if (key.startsWith('wm_')) localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
                                }
                                setImportStatus('success');
                                const s = safeLocalStorageGet('wm_stats'); if (s) setStats(s);
                                const es = safeLocalStorageGet('wm_english_stats'); if (es) setEnglishStats(es);
                                const uw = safeLocalStorageGet('wm_user_words'); if (uw) setUserWords(uw);
                                setTimeout(() => setImportStatus(null), 3000);
                            } catch { setImportStatus('error'); setTimeout(() => setImportStatus(null), 3000); }
                        };
                        reader.readAsText(file);
                        e.target.value = '';
                    }} />
                </section>

                <section style={{ marginBottom: 28 }}>
                    <h3 style={{ fontSize: 13, fontWeight: 700, color: C.muted, marginBottom: 10, paddingRight: 4 }}>חיבורי AI</h3>
                    <SettingItem
                        icon={Key}
                        title="מפתח ElevenLabs"
                        desc={elevenLabsKey ? 'מפתח מוגדר' : 'הגדר מפתח עבור קול פרימיום (אופציונלי)'}
                        onClick={() => setShowApiKeys(!showApiKeys)}
                        rightElement={showApiKeys ? <ChevronUp size={18} color={C.muted} /> : <ChevronDown size={18} color={C.muted} />}
                    />
                    {showApiKeys && (
                        <div style={{
                            ...SURFACE.inset, padding: 20, marginBottom: 8,
                            display: 'flex', flexDirection: 'column', gap: 16
                        }}>
                            <div>
                                <label style={{ display: 'block', fontSize: 13, color: C.muted, marginBottom: 6 }} dir="rtl">
                                    ElevenLabs API Key (קול פרימיום)
                                </label>
                                <input
                                    type="password"
                                    value={elevenLabsKey}
                                    onChange={(e) => { setElevenLabsKeyState(e.target.value); setElevenLabsKey(e.target.value); }}
                                    placeholder="xi-xxxxxxxxxxxxxxxx"
                                    style={{
                                        width: '100%', background: 'rgba(0,0,0,0.3)',
                                        border: `1px solid ${C.border}`, borderRadius: RADIUS.sm,
                                        padding: '10px 12px', color: C.text, fontSize: 14,
                                        outline: 'none', direction: 'ltr', boxSizing: 'border-box'
                                    }}
                                />
                            </div>
                            <p style={{ margin: 0, fontSize: 11, color: C.muted, lineHeight: 1.5 }} dir="rtl">
                                המפתח נשמר מקומית על המכשיר שלך בלבד.
                                <br />
                                שאלות AI פועלות אוטומטית — לא נדרש מפתח.
                            </p>
                        </div>
                    )}
                </section>

                <section>
                    <h3 style={{ fontSize: 13, fontWeight: 700, color: C.muted, marginBottom: 10, paddingRight: 4 }}>אודות</h3>
                    <div style={{ ...SURFACE.inset, padding: 20, textAlign: 'center' }}>
                        <h3 style={{ margin: '0 0 4px', ...C.gradientText, fontSize: 22, fontWeight: 700 }}>AMIRNET</h3>
                        <p style={{ margin: 0, color: C.muted, fontSize: 14 }}>גרסה 1.0.0</p>
                        <p style={{ margin: '14px 0 0', color: C.muted, fontSize: 13, lineHeight: 1.5 }}>
                            אפליקציית הכנה למבחן אמי"ר / אמיר"ם.
                            <br />
                            נבנה בהתאמה אישית ללמידה אפקטיבית.
                        </p>
                    </div>
                </section>

                <section style={{ marginTop: 20 }}>
                    <h3 style={{ fontSize: 13, fontWeight: 700, color: C.muted, marginBottom: 10, paddingRight: 4 }}>משפטי ונגישות</h3>
                    <SettingItem icon={Shield} title="מדיניות פרטיות ותנאי שימוש" desc="קרא את המידע המשפטי" onClick={() => navigate('/legal')} />
                    <SettingItem icon={Accessibility} title="הצהרת נגישות" desc="מידע על נגישות האפליקציה" onClick={() => navigate('/accessibility')} />
                </section>
            </main>
        </div>
    );
};

export default Settings;
