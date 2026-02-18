import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Icon from '../components/Icon';
import { C } from '../styles/theme';

const Settings = ({ onBack, onResetStats, onOpenLegal, onOpenAccessibility }) => {
    const [confirmReset, setConfirmReset] = useState(null); // 'all', 'vocab', 'english', or null

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
            onResetStats(type);
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
                    onClick={onBack}
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
                        onClick={onOpenLegal}
                    />
                    <SettingItem
                        icon="accessibility"
                        title="הצהרת נגישות"
                        desc="מידע על נגישות האפליקציה"
                        onClick={onOpenAccessibility}
                    />
                </section>

            </main>
        </div>
    );
};

Settings.propTypes = {
    onBack: PropTypes.func.isRequired,
    onResetStats: PropTypes.func.isRequired,
    onOpenLegal: PropTypes.func,
    onOpenAccessibility: PropTypes.func
};

export default Settings;
