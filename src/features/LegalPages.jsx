import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useLocation } from 'wouter';
import Icon from '../components/Icon';
import { C } from '../styles/theme';

const LegalPages = () => {
    const [, navigate] = useLocation();
    const [activeTab, setActiveTab] = useState('privacy');

    const tabs = [
        { id: 'privacy', label: 'מדיניות פרטיות', icon: 'shield' },
        { id: 'terms', label: 'תנאי שימוש', icon: 'description' }
    ];

    return (
        <div style={{ minHeight: '100vh', background: C.bg }}>
            {/* Header */}
            <header style={{
                position: 'sticky', top: 0, zIndex: 50,
                background: 'rgba(18,18,18,0.9)', backdropFilter: 'blur(12px)',
                borderBottom: `1px solid ${C.border}`, padding: '12px 16px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>מידע משפטי</h1>
                    <button
                        onClick={() => navigate('/settings')}
                        style={{
                            background: 'none', border: 'none',
                            color: C.muted, cursor: 'pointer', padding: 8
                        }}
                    >
                        <Icon name="close" size={24} />
                    </button>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                flex: 1, padding: '10px 16px', borderRadius: 8,
                                border: 'none', cursor: 'pointer',
                                background: activeTab === tab.id ? C.surface : 'transparent',
                                color: activeTab === tab.id ? 'white' : C.muted,
                                fontSize: 13, fontWeight: 600,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                transition: 'all 0.2s'
                            }}
                        >
                            <Icon name={tab.icon} size={16} />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </header>

            {/* Content */}
            <main style={{ padding: 20, paddingBottom: 100 }}>
                {activeTab === 'privacy' && <PrivacyPolicy />}
                {activeTab === 'terms' && <TermsOfService />}
            </main>
        </div>
    );
};

const PrivacyPolicy = () => (
    <div style={{ color: C.text, lineHeight: 1.8 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16, color: 'white' }}>
            מדיניות פרטיות
        </h2>
        <p style={{ color: C.muted, fontSize: 12, marginBottom: 24 }}>
            עודכן לאחרונה: ינואר 2026
        </p>

        <Section title="1. מידע שאנו אוספים">
            <p>
                האפליקציה WordMaster שומרת מידע <strong>מקומית בלבד</strong> על המכשיר שלך:
            </p>
            <ul>
                <li>התקדמות בלמידה (מילים שנלמדו, תשובות נכונות/שגויות)</li>
                <li>הגדרות אישיות (זמני טיימר, העדפות)</li>
                <li>תאריך כניסה אחרונה</li>
            </ul>
            <p>
                <strong>אנחנו לא שולחים שום מידע לשרתים חיצוניים.</strong>
            </p>
        </Section>

        <Section title="2. אחסון מידע">
            <p>
                כל המידע נשמר ב-localStorage של הדפדפן שלך. המידע נשאר על המכשיר שלך בלבד
                ולא משותף עם צד שלישי כלשהו.
            </p>
        </Section>

        <Section title="3. מחיקת מידע">
            <p>
                באפשרותך למחוק את כל המידע בכל עת דרך:
            </p>
            <ul>
                <li>הגדרות → איפוס התקדמות</li>
                <li>ניקוי נתוני הדפדפן</li>
            </ul>
        </Section>

        <Section title="4. אבטחת מידע">
            <p>
                האפליקציה:
            </p>
            <ul>
                <li>לא אוספת מידע אישי מזהה</li>
                <li>לא משתמשת בעוגיות (cookies) למעקב</li>
                <li>לא מתחברת לשרתים חיצוניים</li>
                <li>לא דורשת הרשמה או התחברות</li>
            </ul>
        </Section>

        <Section title="5. עדכונים למדיניות">
            <p>
                אנו עשויים לעדכן מדיניות זו מעת לעת. שינויים משמעותיים יוצגו באפליקציה.
            </p>
        </Section>

        <Section title="6. יצירת קשר">
            <p>
                לשאלות בנושא פרטיות, ניתן לפנות אלינו.
            </p>
        </Section>
    </div>
);

const TermsOfService = () => (
    <div style={{ color: C.text, lineHeight: 1.8 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16, color: 'white' }}>
            תנאי שימוש
        </h2>
        <p style={{ color: C.muted, fontSize: 12, marginBottom: 24 }}>
            עודכן לאחרונה: ינואר 2026
        </p>

        <Section title="1. קבלת התנאים">
            <p>
                השימוש באפליקציית WordMaster מהווה הסכמה לתנאי שימוש אלה.
            </p>
        </Section>

        <Section title="2. שימוש באפליקציה">
            <p>
                האפליקציה מיועדת ללמידת אוצר מילים ותרגול אנגלית בלבד. המשתמש מתחייב:
            </p>
            <ul>
                <li>להשתמש באפליקציה למטרות לימודיות בלבד</li>
                <li>לא לנסות לפרוץ או לשבש את פעולת האפליקציה</li>
                <li>לא להעתיק או להפיץ את תוכן האפליקציה ללא רשות</li>
            </ul>
        </Section>

        <Section title="3. תוכן לימודי">
            <p>
                התוכן הלימודי באפליקציה מבוסס על מקורות פתוחים ומשמש למטרות לימוד בלבד.
                אין לראות בתוכן כתחליף להכנה רשמית לבחינות.
            </p>
        </Section>

        <Section title="4. הגבלת אחריות">
            <p>
                האפליקציה מסופקת "כמות שהיא" (AS IS). איננו מתחייבים לתוצאות ספציפיות
                בלמידה או בבחינות. המשתמש אחראי באופן בלעדי על שימושו באפליקציה.
            </p>
        </Section>

        <Section title="5. קניין רוחני">
            <p>
                כל הזכויות באפליקציה, כולל עיצוב, קוד ותוכן, שמורות ליוצרים.
            </p>
        </Section>

        <Section title="6. שינויים ועדכונים">
            <p>
                אנו שומרים לעצמנו את הזכות לעדכן או לשנות את האפליקציה ותנאי השימוש בכל עת.
            </p>
        </Section>

        <Section title="7. יצירת קשר">
            <p>
                לשאלות או הערות, ניתן לפנות אלינו.
            </p>
        </Section>
    </div>
);

const Section = ({ title, children }) => (
    <div style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: 'white' }}>
            {title}
        </h3>
        <div style={{ color: C.muted, fontSize: 14 }}>
            {children}
        </div>
        <style>{`
            ul { margin: 8px 0; padding-right: 20px; }
            li { margin-bottom: 4px; }
            strong { color: white; }
        `}</style>
    </div>
);

Section.propTypes = {
    title: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired
};

export default LegalPages;
