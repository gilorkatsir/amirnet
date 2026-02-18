import React from 'react';
import PropTypes from 'prop-types';
import Icon from '../components/Icon';
import { C } from '../styles/theme';

const UserWordsList = ({ words, onDelete, onBack }) => {
    return (
        <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <header style={{
                position: 'sticky', top: 0, zIndex: 10,
                background: 'rgba(18,18,18,0.95)', backdropFilter: 'blur(12px)',
                padding: '16px 20px', borderBottom: `1px solid ${C.border}`,
                display: 'flex', alignItems: 'center', gap: 16
            }}>
                <button
                    onClick={onBack}
                    style={{
                        width: 40, height: 40, borderRadius: '50%',
                        background: 'transparent', border: 'none',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                >
                    <Icon name="arrow_forward" size={24} style={{ color: 'white' }} />
                </button>
                <div>
                    <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: 'white' }}>המילים שלי</h1>
                    <p style={{ margin: '2px 0 0', fontSize: 12, color: C.muted }}>
                        {words.length} מילים שמורות
                    </p>
                </div>
            </header>

            {/* List */}
            <main style={{ flex: 1, padding: 20 }}>
                {words.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        marginTop: 60,
                        padding: 32,
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: 16,
                        border: `1px solid ${C.border}`
                    }}>
                        <div style={{
                            width: 64, height: 64, borderRadius: '50%',
                            background: 'rgba(236, 72, 153, 0.1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 16px'
                        }}>
                            <Icon name="bookmark" size={32} style={{ color: C.pink }} />
                        </div>
                        <h3 style={{ margin: '0 0 8px', color: 'white' }}>עדיין אין מילים שמורות</h3>
                        <p style={{ margin: 0, color: C.muted, lineHeight: 1.5, fontSize: 14 }}>
                            כשתתקל במילים לא מוכרות במהלך התרגול,
                            <br />
                            תוכל לשמור אותן כאן לחזרה.
                        </p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {words.map((item) => (
                            <div
                                key={item.id}
                                style={{
                                    background: C.surface,
                                    border: `1px solid ${C.border}`,
                                    borderRadius: 12,
                                    padding: 16,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}
                            >
                                <div>
                                    <h3 style={{
                                        margin: '0 0 4px',
                                        fontSize: 18,
                                        fontWeight: 600,
                                        color: 'white',
                                        letterSpacing: 0.5
                                    }}>
                                        {item.text}
                                    </h3>
                                    <p style={{ margin: 0, fontSize: 12, color: C.muted }}>
                                        נוסף ב-{new Date(item.date).toLocaleDateString('he-IL')}
                                    </p>
                                </div>
                                <button
                                    onClick={() => {
                                        if (window.confirm('למחוק את המילה מהרשימה?')) {
                                            onDelete(item.id);
                                        }
                                    }}
                                    style={{
                                        width: 36, height: 36,
                                        borderRadius: 8,
                                        background: 'rgba(239, 68, 68, 0.1)',
                                        border: 'none',
                                        color: C.red,
                                        cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        transition: 'background 0.2s'
                                    }}
                                >
                                    <Icon name="delete" size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

UserWordsList.propTypes = {
    words: PropTypes.array.isRequired,
    onDelete: PropTypes.func.isRequired,
    onBack: PropTypes.func.isRequired
};

export default UserWordsList;
