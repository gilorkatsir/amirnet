import React from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import {
    ArrowRight, Headphone, Microphone2, InfoCircle, ArrowLeft2,
    MessageQuestion, Clock, VoiceSquare, Lock
} from 'iconsax-react';
import { C, GLASS, RADIUS, SURFACE } from '../styles/theme';
import { VOCAL_SECTIONS } from '../data/vocalQuestions';
import { VOICES } from '../services/elevenLabsService';
import { hasElevenLabsKey } from '../services/apiKeys';
import { useTier } from '../contexts/TierContext';
import UpgradePrompt from '../components/UpgradePrompt';

const VocalSectionSelector = ({ onSelect }) => {
  const [, navigate] = useLocation();
  const hasTts = hasElevenLabsKey();
  const { canAccessVocalSection } = useTier();
  const [showUpgrade, setShowUpgrade] = React.useState(false);

  const lectures = VOCAL_SECTIONS.filter(s => s.type === 'lecture');
  const continuations = VOCAL_SECTIONS.filter(s => s.type === 'continuation');

  const SectionCard = ({ section, color, icon: CardIcon, delay = 0, locked = false }) => {
    const totalQs = section.type === 'lecture' ? section.questions.length : section.clips.length;
    const timeMin = Math.floor(section.timeLimit / 60);
    const voice = section.voiceId && VOICES[section.voiceId];

    return (
      <motion.button
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: delay * 0.05, duration: 0.3 }}
        whileTap={{ scale: locked ? 1 : 0.97 }}
        onClick={() => locked ? setShowUpgrade(true) : onSelect(section)}
        style={{
          display: 'flex', alignItems: 'center', gap: 14, width: '100%',
          padding: '14px 16px', marginBottom: 8,
          background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: 14, color: C.text, cursor: 'pointer', textAlign: 'right',
          transition: 'background 0.2s', opacity: locked ? 0.5 : 1,
        }}
      >
        {locked ? (
          <Lock size={20} color={C.dim} style={{ flexShrink: 0 }} />
        ) : (
          <CardIcon size={20} color={color} style={{ flexShrink: 0 }} />
        )}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h3 style={{ margin: 0, fontWeight: 600, fontSize: 15, color: locked ? C.muted : C.text }}>{section.title}</h3>
            {voice && (
              <span style={{
                fontSize: 10, fontWeight: 600, color: C.dim,
                padding: '2px 6px', borderRadius: RADIUS.full,
                background: C.glass, border: `1px solid ${C.glassBorder}`,
                whiteSpace: 'nowrap'
              }}>
                {voice.accent} {voice.gender === 'male' ? '\u2642' : '\u2640'}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
            <span style={{ fontSize: 12, color: C.muted, display: 'flex', alignItems: 'center', gap: 3 }}>
              <MessageQuestion size={11} color={C.muted} /> {totalQs} שאלות
            </span>
            <span style={{ fontSize: 12, color: C.muted, display: 'flex', alignItems: 'center', gap: 3 }}>
              <Clock size={11} color={C.muted} /> {timeMin} דקות
            </span>
            {section.type === 'lecture' && (
              <span style={{ fontSize: 12, color: C.muted, display: 'flex', alignItems: 'center', gap: 3 }}>
                <VoiceSquare size={11} color={C.muted} /> {section.clips.length} קליפים
              </span>
            )}
          </div>
        </div>
        {locked ? <Lock size={16} color={C.dim} /> : <ArrowLeft2 size={18} color={C.dim} />}
      </motion.button>
    );
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: C.bg }}>
      <header style={{
        display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px',
        ...GLASS.header
      }}>
        <button onClick={() => navigate('/')} style={{
          width: 38, height: 38, borderRadius: RADIUS.full, background: 'transparent',
          border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <ArrowRight size={20} color={C.text} />
        </button>
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: C.text }}>הקשבה</h2>
      </header>

      <main style={{ padding: 20, flex: 1 }}>
        {!hasTts && (
          <div style={{
            padding: 14, ...SURFACE.inset,
            background: 'rgba(251,146,60,0.06)',
            marginBottom: 20
          }} dir="rtl">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <InfoCircle size={16} color={C.orange} />
              <span style={{ fontWeight: 700, color: C.orange, fontSize: 13 }}>מצב טקסט</span>
            </div>
            <p style={{ margin: 0, fontSize: 12, color: C.muted, lineHeight: 1.6 }}>
              מפתח ElevenLabs לא מוגדר. הטקסט יוצג לקריאה במקום השמעה קולית.
              <br />
              להפעלת קול, הגדר מפתח API בהגדרות.
            </p>
          </div>
        )}

        <div style={{
          padding: 14, ...SURFACE.inset,
          background: 'rgba(139,92,246,0.04)',
          marginBottom: 20
        }} dir="rtl">
          <p style={{ margin: 0, fontSize: 12, color: C.muted, lineHeight: 1.6 }}>
            סוג חדש של שאלות במבחן אמיר"נט מאז מרץ 2025.
            <br />
            שני סוגים: <strong style={{ color: C.orange }}>הרצאה + שאלות</strong> ו<strong style={{ color: C.blue }}>השלמת טקסט</strong>.
          </p>
        </div>

        <section style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, paddingRight: 4 }}>
            <Headphone size={16} color={C.orange} />
            <h3 style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: 0 }}>הרצאה + שאלות</h3>
          </div>
          <p style={{ fontSize: 12, color: C.muted, marginBottom: 10, paddingRight: 4, lineHeight: 1.5 }} dir="rtl">
            האזן ל-3 קליפים וענה על 5 שאלות. זמן: 7 דקות.
          </p>
          {lectures.map((section, i) => (
            <SectionCard key={section.id} section={section} color={C.orange} icon={Headphone} delay={i} locked={!canAccessVocalSection(i)} />
          ))}
        </section>

        <section style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, paddingRight: 4 }}>
            <Microphone2 size={16} color={C.blue} />
            <h3 style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: 0 }}>השלמת טקסט</h3>
          </div>
          <p style={{ fontSize: 12, color: C.muted, marginBottom: 10, paddingRight: 4, lineHeight: 1.5 }} dir="rtl">
            האזן לקליפ שנקטע באמצע ובחר את ההמשך הנכון. זמן: 4 דקות.
          </p>
          {continuations.map((section, i) => (
            <SectionCard key={section.id} section={section} color={C.blue} icon={Microphone2} delay={lectures.length + i} locked={!canAccessVocalSection(lectures.length + i)} />
          ))}
        </section>
      </main>
      <UpgradePrompt isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} limitType="vocal" />
    </div>
  );
};

export default VocalSectionSelector;
