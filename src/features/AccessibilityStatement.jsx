import React from 'react';
import { useLocation } from 'wouter';
import Icon from '../components/Icon';
import { C } from '../styles/theme';

/**
 * Accessibility Statement Page - הצהרת נגישות
 * Required by Israeli Accessibility Law (תקנות שוויון זכויות לאנשים עם מוגבלות)
 */
const AccessibilityStatement = () => {
    const [, navigate] = useLocation();
    const Section = ({ title, children }) => (
        <section style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'white', marginBottom: 12 }}>{title}</h2>
            <div style={{ fontSize: 14, lineHeight: 1.7, color: C.muted }}>{children}</div>
        </section>
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
                    onClick={() => navigate('/settings')}
                    aria-label="חזרה לדף הקודם"
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
                    הצהרת נגישות
                </h1>
            </header>

            <main style={{ padding: 20 }} role="main" aria-label="הצהרת נגישות">
                <Section title="מחויבות לנגישות">
                    <p>
                        WordMaster מחויבת להנגשת האפליקציה לאנשים עם מוגבלות,
                        בהתאם לתקנות שוויון זכויות לאנשים עם מוגבלות (התאמות נגישות לשירות),
                        התשע"ג-2013 ולתקן הישראלי ת"י 5568.
                    </p>
                </Section>

                <Section title="רמת הנגישות">
                    <p>אנו פועלים להתאמת האפליקציה לרמת AA של הנחיות WCAG 2.1.</p>
                    <ul style={{ margin: '12px 0', paddingRight: 20 }}>
                        <li>תמיכה בניווט באמצעות מקלדת</li>
                        <li>תאימות לקוראי מסך</li>
                        <li>ניגודיות צבעים מספקת</li>
                        <li>טקסט חלופי לאלמנטים גרפיים</li>
                        <li>מבנה סמנטי ברור</li>
                        <li>תמיכה בשפה העברית (RTL)</li>
                    </ul>
                </Section>

                <Section title="התאמות נגישות באפליקציה">
                    <ul style={{ margin: '12px 0', paddingRight: 20 }}>
                        <li><strong>ניווט מקלדת:</strong> ניתן לנווט בכל האפליקציה בעזרת מקלדת בלבד</li>
                        <li><strong>קורא מסך:</strong> כל האלמנטים מסומנים עם תגיות ARIA מתאימות</li>
                        <li><strong>ניגודיות:</strong> הצבעים נבחרו להבטיח ניגודיות מספקת</li>
                        <li><strong>גודל טקסט:</strong> ניתן להגדיל את הטקסט באמצעות הגדרות המכשיר</li>
                        <li><strong>תמיכה בעברית:</strong> האפליקציה תומכת בכיוון כתיבה מימין לשמאל</li>
                    </ul>
                </Section>

                <Section title="קיצורי מקלדת">
                    <ul style={{ margin: '12px 0', paddingRight: 20 }}>
                        <li><kbd style={{ background: C.surface, padding: '2px 6px', borderRadius: 4, border: `1px solid ${C.border}` }}>Tab</kbd> - מעבר לאלמנט הבא</li>
                        <li><kbd style={{ background: C.surface, padding: '2px 6px', borderRadius: 4, border: `1px solid ${C.border}` }}>Shift+Tab</kbd> - מעבר לאלמנט הקודם</li>
                        <li><kbd style={{ background: C.surface, padding: '2px 6px', borderRadius: 4, border: `1px solid ${C.border}` }}>Enter</kbd> - הפעלת כפתור או קישור</li>
                        <li><kbd style={{ background: C.surface, padding: '2px 6px', borderRadius: 4, border: `1px solid ${C.border}` }}>Escape</kbd> - סגירת חלון או ביטול פעולה</li>
                    </ul>
                </Section>

                <Section title="דיווח על בעיית נגישות">
                    <p>
                        אם נתקלתם בבעיית נגישות באפליקציה, אנא פנו אלינו ונשמח לטפל בכך:
                    </p>
                    <div style={{
                        background: C.surface,
                        border: `1px solid ${C.border}`,
                        borderRadius: 12,
                        padding: 16,
                        marginTop: 12
                    }}>
                        <p style={{ margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Icon name="email" size={16} style={{ color: C.purple }} />
                            <strong>אימייל:</strong> accessibility@wordmaster.app
                        </p>
                        <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Icon name="phone" size={16} style={{ color: C.green }} />
                            <strong>טלפון:</strong> 03-1234567
                        </p>
                    </div>
                </Section>

                <Section title="תאריך עדכון">
                    <p>הצהרת נגישות זו עודכנה לאחרונה בתאריך: ינואר 2026</p>
                </Section>
            </main>
        </div>
    );
};

export default AccessibilityStatement;
