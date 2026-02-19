import React from 'react';
import { useLocation } from 'wouter';
import Icon from '../components/Icon';
import { C } from '../styles/theme';
import { VOCAL_SECTIONS } from '../data/vocalQuestions';
import { hasElevenLabsKey } from '../services/apiKeys';

/**
 * Selector screen for vocal exam sections
 * Shows available lectures and text continuation exercises
 */
const VocalSectionSelector = ({ onSelect }) => {
  const [, navigate] = useLocation();
  const hasTts = hasElevenLabsKey();

  const lectures = VOCAL_SECTIONS.filter(s => s.type === 'lecture');
  const continuations = VOCAL_SECTIONS.filter(s => s.type === 'continuation');

  const SectionCard = ({ section, color, icon }) => {
    const totalQs = section.type === 'lecture' ? section.questions.length : section.clips.length;
    const timeMin = Math.floor(section.timeLimit / 60);

    return (
      <button
        onClick={() => onSelect(section)}
        style={{
          display: 'flex', alignItems: 'center', gap: 16, width: '100%',
          padding: 16, marginBottom: 12, background: C.surface,
          border: `1px solid ${C.border}`, borderRadius: 12,
          color: C.text, cursor: 'pointer', textAlign: 'right',
          transition: 'all 0.2s'
        }}
      >
        <div style={{
          width: 48, height: 48, borderRadius: 8, background: C.bg,
          border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center',
          justifyContent: 'center', color, flexShrink: 0
        }}>
          <Icon name={icon} size={24} />
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: 0, fontWeight: 600, fontSize: 15, color: 'white' }}>
            {section.title}
          </h3>
          <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
            <span style={{ fontSize: 12, color: C.muted, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Icon name="quiz" size={12} /> {totalQs} שאלות
            </span>
            <span style={{ fontSize: 12, color: C.muted, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Icon name="timer" size={12} /> {timeMin} דקות
            </span>
            {section.type === 'lecture' && (
              <span style={{ fontSize: 12, color: C.muted, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Icon name="headphones" size={12} /> {section.clips.length} קליפים
              </span>
            )}
          </div>
        </div>
        <Icon name="chevron_right" size={20} style={{ color: C.muted, transform: 'rotate(180deg)' }} />
      </button>
    );
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: C.bg }}>
      <header style={{
        display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px',
        background: 'rgba(26,26,26,0.95)', backdropFilter: 'blur(8px)',
        borderBottom: `1px solid ${C.border}`
      }}>
        <button onClick={() => navigate('/')} style={{
          width: 40, height: 40, borderRadius: '50%', background: 'transparent',
          border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Icon name="arrow_forward" size={24} style={{ color: 'white' }} />
        </button>
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: 'white' }}>תרגול שאלות קוליות</h2>
      </header>

      <main style={{ padding: 20, flex: 1 }}>
        {/* TTS Warning */}
        {!hasTts && (
          <div style={{
            padding: 16, background: 'rgba(251, 146, 60, 0.1)', borderRadius: 12,
            border: `1px solid rgba(251, 146, 60, 0.3)`, marginBottom: 24
          }} dir="rtl">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Icon name="info" size={18} style={{ color: C.orange }} />
              <span style={{ fontWeight: 700, color: C.orange, fontSize: 14 }}>מצב טקסט</span>
            </div>
            <p style={{ margin: 0, fontSize: 13, color: C.muted, lineHeight: 1.6 }}>
              מפתח ElevenLabs לא מוגדר. הטקסט יוצג לקריאה במקום השמעה קולית.
              <br />
              להפעלת קול, הגדר מפתח API בהגדרות.
            </p>
          </div>
        )}

        {/* Info banner */}
        <div style={{
          padding: 16, background: 'rgba(139, 92, 246, 0.08)', borderRadius: 12,
          border: `1px solid rgba(139, 92, 246, 0.2)`, marginBottom: 24
        }} dir="rtl">
          <p style={{ margin: 0, fontSize: 13, color: C.muted, lineHeight: 1.6 }}>
            סוג חדש של שאלות במבחן אמיר"נט מאז מרץ 2025.
            <br />
            שני סוגים: <strong style={{ color: C.orange }}>הרצאה + שאלות</strong> ו<strong style={{ color: '#3b82f6' }}>השלמת טקסט</strong>.
          </p>
        </div>

        {/* Lecture sections */}
        <section style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, paddingRight: 4 }}>
            <Icon name="headphones" size={18} style={{ color: C.orange }} />
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'white', margin: 0 }}>הרצאה + שאלות</h3>
          </div>
          <p style={{ fontSize: 13, color: C.muted, marginBottom: 12, paddingRight: 4, lineHeight: 1.5 }} dir="rtl">
            האזן ל-3 קליפים וענה על 5 שאלות. זמן: 7 דקות.
          </p>
          {lectures.map(section => (
            <SectionCard key={section.id} section={section} color={C.orange} icon="headphones" />
          ))}
        </section>

        {/* Continuation sections */}
        <section style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, paddingRight: 4 }}>
            <Icon name="hearing" size={18} style={{ color: '#3b82f6' }} />
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'white', margin: 0 }}>השלמת טקסט</h3>
          </div>
          <p style={{ fontSize: 13, color: C.muted, marginBottom: 12, paddingRight: 4, lineHeight: 1.5 }} dir="rtl">
            האזן לקליפ שנקטע באמצע ובחר את ההמשך הנכון. זמן: 4 דקות.
          </p>
          {continuations.map(section => (
            <SectionCard key={section.id} section={section} color="#3b82f6" icon="hearing" />
          ))}
        </section>
      </main>
    </div>
  );
};

export default VocalSectionSelector;
