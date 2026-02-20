import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CloseCircle, Play, Pause, Refresh, RotateLeft, TickCircle, ArrowLeft,
    Timer, Flag, Headphone, Microphone2, Eye, EyeSlash, Next,
    VoiceSquare, ArrowLeft2
} from 'iconsax-react';
import { C, GLASS, RADIUS } from '../../styles/theme';
import { playCorrect, playIncorrect, playTimerComplete, playClick } from '../../utils/sounds';
import { textToSpeech, VOICES } from '../../services/elevenLabsService';
import { hasElevenLabsKey } from '../../services/apiKeys';
import AudioVisualizer from '../../components/AudioVisualizer';

const VocalExamSession = ({ section, onComplete }) => {
  const [, navigate] = useLocation();
  const isLecture = section.type === 'lecture';
  const hasTts = hasElevenLabsKey();

  const [phase, setPhase] = useState('listening');
  const [currentClipIndex, setCurrentClipIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [audioState, setAudioState] = useState('idle');
  const [timeLeft, setTimeLeft] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [markedForReview, setMarkedForReview] = useState(new Set());
  const [showText, setShowText] = useState(!hasTts);

  const audioRef = useRef(null);
  const audioUrlRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
      if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    };
  }, []);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timer); playTimerComplete(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  useEffect(() => {
    if (timeLeft === 0) {
      const correct = answers.filter(a => a.isCorrect).length;
      const incorrect = answers.filter(a => !a.isCorrect).length;
      onComplete({ correct, incorrect, answers });
    }
  }, [timeLeft]);

  const formatTime = (s) => {
    if (s === null) return '--:--';
    return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  };

  const stopAudio = useCallback(() => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    if (audioUrlRef.current) { URL.revokeObjectURL(audioUrlRef.current); audioUrlRef.current = null; }
  }, []);

  // Resolve voice ID: clip-level > section-level > default
  const getVoiceId = useCallback((clip) => {
    const key = clip?.voiceId || section.voiceId;
    if (key && VOICES[key]) return VOICES[key].id;
    if (key) return key; // raw voice ID
    return undefined; // use default
  }, [section.voiceId]);

  const tryStaticAudio = useCallback((clipId) => {
    return new Promise((resolve, reject) => {
      const staticUrl = '/audio/' + clipId + '.mp3';
      const audio = new Audio(staticUrl);
      audio.addEventListener('canplaythrough', () => resolve(audio), { once: true });
      audio.addEventListener('error', () => reject(new Error('Static file not found')), { once: true });
    });
  }, []);

  const playClip = useCallback(async (clipText, clip) => {
    stopAudio();
    setAudioState('loading');
    try {
      // 1. Try static file first (/audio/{clip.id}.mp3)
      const audio = await tryStaticAudio(clip.id);
      if (!mountedRef.current) return;
      audioRef.current = audio;
      audio.addEventListener('ended', () => { if (mountedRef.current) setAudioState('done'); });
      audio.addEventListener('error', () => { if (mountedRef.current) setAudioState('done'); });
      setAudioState('playing');
      await audio.play();
    } catch {
      // 2. Static file not available — fall back to ElevenLabs API
      if (!mountedRef.current) return;
      if (!hasTts) { setAudioState('done'); return; }
      try {
        const voiceId = getVoiceId(clip);
        const blob = await textToSpeech(clipText, voiceId);
        if (!mountedRef.current) return;
        const url = URL.createObjectURL(blob);
        audioUrlRef.current = url;
        const audio = new Audio(url);
        audioRef.current = audio;
        audio.addEventListener('ended', () => { if (mountedRef.current) setAudioState('done'); });
        audio.addEventListener('error', () => { if (mountedRef.current) setAudioState('done'); });
        setAudioState('playing');
        await audio.play();
      } catch { if (mountedRef.current) setAudioState('done'); }
    }
  }, [hasTts, stopAudio, getVoiceId, tryStaticAudio]);

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    if (audioState === 'playing') { audioRef.current.pause(); setAudioState('paused'); }
    else if (audioState === 'paused') { audioRef.current.play(); setAudioState('playing'); }
  };

  const replayCurrentClip = () => {
    const clip = section.clips[currentClipIndex];
    if (clip) playClip(clip.text, clip);
  };

  const prevClipRef = useRef(-1);
  useEffect(() => {
    if (phase !== 'listening') return;
    if (prevClipRef.current === currentClipIndex) return;
    prevClipRef.current = currentClipIndex;
    const clip = section.clips[currentClipIndex];
    if (clip) playClip(clip.text, clip);
  }, [phase, currentClipIndex, playClip, section.clips]);

  const handleNextClip = () => {
    playClick(); stopAudio();
    if (!isLecture) {
      // Continuations: answer each clip's question immediately after listening
      goToQuestions();
    } else if (currentClipIndex < section.clips.length - 1) {
      setAudioState('idle'); prevClipRef.current = -1; setCurrentClipIndex(prev => prev + 1);
    } else { goToQuestions(); }
  };

  const goToQuestions = () => {
    stopAudio(); setPhase('questions');
    if (isLecture) setCurrentClipIndex(0);
    if (timeLeft === null) setTimeLeft(section.timeLimit);
  };

  const getCurrentQuestion = () => isLecture ? section.questions[currentQuestionIndex] : section.clips[currentClipIndex];

  const handleSelect = (index) => {
    if (answered) return;
    setSelected(index); setAnswered(true);
    const q = getCurrentQuestion();
    const isCorrect = index === (q.correctIndex - 1);
    if (isCorrect) playCorrect(); else playIncorrect();
    setAnswers(prev => [...prev, { questionIndex: isLecture ? currentQuestionIndex : currentClipIndex, selected: index, isCorrect }]);
  };

  const handleNext = () => {
    playClick(); setSelected(null); setAnswered(false);
    if (isLecture) {
      if (currentQuestionIndex < section.questions.length - 1) { setCurrentQuestionIndex(prev => prev + 1); }
      else { setAnswers(c => { const cor = c.filter(a => a.isCorrect).length; setTimeout(() => onComplete({ correct: cor, incorrect: c.length - cor, answers: c }), 0); return c; }); }
    } else {
      if (currentClipIndex < section.clips.length - 1) { prevClipRef.current = -1; setCurrentClipIndex(prev => prev + 1); setPhase('listening'); setAudioState('idle'); }
      else { setAnswers(c => { const cor = c.filter(a => a.isCorrect).length; setTimeout(() => onComplete({ correct: cor, incorrect: c.length - cor, answers: c }), 0); return c; }); }
    }
  };

  const handleJumpToQuestion = (idx) => {
    if (!isLecture || phase !== 'questions') return;
    if (idx <= answers.length) {
      setCurrentQuestionIndex(idx);
      const existing = answers.find(a => a.questionIndex === idx);
      if (existing) { setSelected(existing.selected); setAnswered(true); }
      else { setSelected(null); setAnswered(false); }
    }
  };

  const toggleMarkForReview = () => {
    const idx = isLecture ? currentQuestionIndex : currentClipIndex;
    setMarkedForReview(prev => { const next = new Set(prev); if (next.has(idx)) next.delete(idx); else next.add(idx); return next; });
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      const key = e.key.toLowerCase();
      if (phase === 'listening') {
        if (key === ' ' || key === 'enter') { e.preventDefault(); if (audioState === 'done') handleNextClip(); else if (audioState === 'idle') replayCurrentClip(); else togglePlayPause(); }
        if (key === 'r') { e.preventDefault(); replayCurrentClip(); }
        if (key === 's') { e.preventDefault(); goToQuestions(); }
      } else {
        const keyMap = { a: 0, b: 1, c: 2, d: 3, '1': 0, '2': 1, '3': 2, '4': 3 };
        if (key in keyMap && !answered) { e.preventDefault(); handleSelect(keyMap[key]); }
        if ((key === 'enter' || key === ' ') && answered) { e.preventDefault(); handleNext(); }
        if (key === 'm') { e.preventDefault(); toggleMarkForReview(); }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, audioState, answered, currentClipIndex, currentQuestionIndex]);

  const totalQs = isLecture ? section.questions.length : section.clips.length;
  const currentIdx = isLecture ? currentQuestionIndex : currentClipIndex;
  const accentColor = isLecture ? C.orange : C.blue;

  const circleBtn = (color) => ({
    width: 48, height: 48, borderRadius: RADIUS.full, ...GLASS.button,
    border: `1px solid ${color}30`, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center'
  });

  // ─── LISTENING PHASE ────────────────────────────────────────
  if (phase === 'listening') {
    const clip = section.clips[currentClipIndex];
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: C.bg }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', ...GLASS.header }}>
          <button onClick={() => navigate('/')} style={{ ...circleBtn(C.muted), width: 38, height: 38 }}>
            <CloseCircle size={18} color={C.muted} />
          </button>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: accentColor, letterSpacing: 1.5, display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
              {isLecture ? <Headphone size={13} /> : <Microphone2 size={13} />}
              {isLecture ? 'שלב האזנה' : 'השלמת טקסט'}
            </div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>
              קליפ {currentClipIndex + 1} מתוך {section.clips.length}
            </div>
          </div>
          <button onClick={goToQuestions} style={{ ...circleBtn(C.muted), width: 38, height: 38 }} title="דלג לשאלות">
            <Next size={16} color={C.muted} />
          </button>
        </header>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 20px', gap: 24 }}>
          <h2 style={{ fontSize: 19, fontWeight: 700, color: C.text, textAlign: 'center', margin: 0 }}>{section.title}</h2>

          {/* Visualizer shown during playback/pause — icon circle for other states */}
          {(audioState === 'playing' || audioState === 'paused') ? (
            <AudioVisualizer
              audioState={audioState}
              clipIndex={currentClipIndex}
              totalClips={section.clips.length}
              isLecture={isLecture}
              accentColor={accentColor}
            />
          ) : (
            <motion.div
              animate={audioState === 'loading' ? { rotate: 360 } : { scale: 1 }}
              transition={audioState === 'loading' ? { repeat: Infinity, duration: 1, ease: 'linear' } : { duration: 0.3 }}
              style={{
                width: 96, height: 96, borderRadius: RADIUS.full,
                background: audioState === 'done' ? `${C.green}15` : C.glass,
                border: `2px solid ${audioState === 'done' ? `${C.green}40` : C.glassBorder}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.3s, border 0.3s, box-shadow 0.3s',
                boxShadow: audioState === 'done' ? C.shadowGlow(C.green) : 'none',
              }}
            >
              {audioState === 'loading' ? <Refresh size={36} color={C.muted} /> :
               audioState === 'done' ? <TickCircle size={36} color={C.green} /> :
               <Play size={36} color={C.muted} />}
            </motion.div>
          )}

          <p style={{ fontSize: 13, color: C.muted, textAlign: 'center', margin: 0 }} dir="rtl">
            {audioState === 'loading' ? 'טוען אודיו...' : audioState === 'playing' ? 'מאזינים...' : audioState === 'paused' ? 'מושהה — לחץ להמשך' : audioState === 'done' ? 'הקליפ הסתיים' : hasTts ? 'לחץ Play להשמעה' : 'קרא את הטקסט'}
          </p>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
            {audioState === 'idle' && hasTts && <button onClick={replayCurrentClip} style={circleBtn(C.purple)}><Play size={22} color={C.purple} /></button>}
            {audioState === 'loading' && <div style={{ ...circleBtn(C.muted), opacity: 0.5, cursor: 'default' }}><Refresh size={22} color={C.muted} style={{ animation: 'spin 1s linear infinite' }} /></div>}
            {(audioState === 'playing' || audioState === 'paused') && <button onClick={togglePlayPause} style={circleBtn(C.purple)}>{audioState === 'playing' ? <Pause size={22} color={C.purple} /> : <Play size={22} color={C.purple} />}</button>}
            {audioState === 'done' && hasTts && <button onClick={replayCurrentClip} style={circleBtn(C.muted)}><RotateLeft size={20} color={C.muted} /></button>}

            {(audioState === 'done' || !hasTts) && (
              <button onClick={handleNextClip} style={{
                height: 46, padding: '0 22px', borderRadius: RADIUS.full, background: C.gradient,
                border: 'none', cursor: 'pointer', color: 'white', fontSize: 15,
                fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8,
                boxShadow: '0 8px 24px rgba(124,58,237,0.25)'
              }}>
                {!isLecture ? 'בחר המשך' : currentClipIndex < section.clips.length - 1 ? 'קליפ הבא' : 'עבור לשאלות'}
                <ArrowLeft2 size={18} />
              </button>
            )}

            {hasTts && (
              <button onClick={() => setShowText(!showText)} style={{ ...circleBtn(showText ? C.purple : C.muted), width: 40, height: 40 }} title="הצג/הסתר טקסט">
                {showText ? <Eye size={17} color={C.purple} /> : <EyeSlash size={17} color={C.muted} />}
              </button>
            )}
          </div>

          {(showText || !hasTts) && (
            <div style={{ padding: 18, ...GLASS.card, maxWidth: 520, width: '100%', maxHeight: 200, overflowY: 'auto' }} dir="ltr">
              <p style={{ fontSize: 15, lineHeight: 1.7, color: 'rgba(255,255,255,0.85)', margin: 0 }}>
                {clip.text}
                {!isLecture && <span style={{ color: C.orange, fontWeight: 700 }}>...</span>}
              </p>
            </div>
          )}

          <div style={{ display: 'flex', gap: 8 }}>
            {section.clips.map((_, i) => (
              <div key={i} style={{
                width: 8, height: 8, borderRadius: RADIUS.full,
                background: i < currentClipIndex ? C.green : i === currentClipIndex ? accentColor : C.border,
                transition: 'background 0.3s'
              }} />
            ))}
          </div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ─── QUESTIONS PHASE ────────────────────────────────────────
  const question = getCurrentQuestion();
  const options = question.options;
  const isMarked = markedForReview.has(currentIdx);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: C.bg }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', ...GLASS.header }}>
        <button onClick={() => navigate('/')} style={{ ...circleBtn(C.muted), width: 38, height: 38 }}>
          <CloseCircle size={18} color={C.muted} />
        </button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: timeLeft !== null && timeLeft < 60 ? C.red : C.text, fontVariantNumeric: 'tabular-nums', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Timer size={18} /> {formatTime(timeLeft)}
          </div>
          <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>שאלה {currentIdx + 1} מתוך {totalQs}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={toggleMarkForReview} style={{ ...circleBtn(isMarked ? C.orange : C.muted), width: 34, height: 34 }} title="סמן לבדיקה">
            <Flag size={15} color={isMarked ? C.orange : C.muted} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: RADIUS.full, background: C.glass }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: C.green }}>{answers.filter(a => a.isCorrect).length}</span>
            <span style={{ fontSize: 11, color: C.dim }}>/</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: C.red }}>{answers.filter(a => !a.isCorrect).length}</span>
          </div>
        </div>
      </header>

      {isLecture && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, padding: '10px 20px', borderBottom: `1px solid ${C.border}`, overflowX: 'auto', flexWrap: 'nowrap' }}>
          {section.questions.map((_, i) => {
            const isAnswered = answers.some(a => a.questionIndex === i);
            const isCurrent = i === currentQuestionIndex;
            const isReview = markedForReview.has(i);
            return (
              <button key={i} onClick={() => handleJumpToQuestion(i)} style={{
                width: 28, height: 28, minWidth: 28, borderRadius: RADIUS.full,
                background: isCurrent ? C.purple : isAnswered ? 'rgba(34,197,94,0.15)' : C.glass,
                border: `1.5px solid ${isCurrent ? C.purple : isReview ? C.orange : isAnswered ? C.green : C.border}`,
                color: isCurrent ? 'white' : isAnswered ? C.green : C.muted,
                cursor: i <= answers.length ? 'pointer' : 'default',
                fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, opacity: i <= answers.length ? 1 : 0.4
              }}>
                {isReview ? <Flag size={11} /> : i + 1}
              </button>
            );
          })}
        </div>
      )}

      <div style={{ flex: 1, padding: 24, maxWidth: 560, margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column' }} dir="ltr">
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', ...GLASS.button, borderRadius: RADIUS.sm }}>
              {isLecture ? <Headphone size={14} color={accentColor} /> : <Microphone2 size={14} color={accentColor} />}
              <span style={{ fontSize: 12, fontWeight: 600, color: accentColor }}>
                {isLecture ? 'Lecture Questions' : 'Text Continuation'}
              </span>
            </div>
          </div>

          <motion.div
            key={currentIdx}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            style={{ marginBottom: 24 }}
          >
            {isLecture ? (
              <p style={{ fontSize: 18, lineHeight: 1.7, color: 'rgba(255,255,255,0.95)', margin: 0, fontWeight: 500 }}>{question.question}</p>
            ) : (
              <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>Choose the best continuation for what you heard:</p>
            )}
          </motion.div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {options.map((option, i) => {
              const letter = ['A', 'B', 'C', 'D'][i];
              const isSelected = selected === i;
              const isCorrect = i === (question.correctIndex - 1);
              let bg = C.glass, brd = C.glassBorder, textColor = C.text;
              if (answered) {
                if (isCorrect) { bg = 'rgba(34,197,94,0.12)'; brd = `${C.green}50`; textColor = 'white'; }
                else if (isSelected) { bg = 'rgba(239,68,68,0.12)'; brd = `${C.red}50`; }
              } else if (isSelected) { bg = `${C.purple}10`; brd = `${C.purple}40`; }

              return (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.25 }}
                  whileTap={!answered ? { scale: 0.97 } : {}}
                  onClick={() => handleSelect(i)} disabled={answered} style={{
                  display: 'flex', alignItems: 'flex-start', padding: '14px 16px',
                  borderRadius: RADIUS.md, background: bg, border: `1px solid ${brd}`,
                  cursor: answered ? 'default' : 'pointer', textAlign: 'left', transition: 'background 0.2s, border-color 0.2s', gap: 12
                }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: RADIUS.full,
                    border: isSelected ? 'none' : `1.5px solid ${C.dim}40`,
                    background: isSelected ? C.gradient : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2
                  }}>
                    {isSelected && (answered ? (isCorrect ? <TickCircle size={14} color="white" /> : <CloseCircle size={14} color="white" />) : <div style={{ width: 8, height: 8, borderRadius: RADIUS.full, background: 'white' }} />)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: isSelected ? C.purple : C.dim, marginRight: 8 }}>{letter}</span>
                    <span style={{ fontSize: 15, lineHeight: 1.5, color: textColor }}>{option}</span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        <footer style={{ marginTop: 32 }}>
          <button onClick={handleNext} disabled={!answered} style={{
            width: '100%', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            borderRadius: RADIUS.md, background: answered ? C.gradient : C.glass, border: answered ? 'none' : `1px solid ${C.glassBorder}`,
            color: 'white', fontSize: 16, fontWeight: 700, cursor: answered ? 'pointer' : 'default',
            opacity: answered ? 1 : 0.4, boxShadow: answered ? '0 8px 24px rgba(124,58,237,0.25)' : 'none', transition: 'background 0.2s, opacity 0.2s, box-shadow 0.2s'
          }}>
            {answered ? (
              <>
                {(isLecture && currentQuestionIndex >= section.questions.length - 1) || (!isLecture && currentClipIndex >= section.clips.length - 1) ? 'סיום' : 'Continue'}
                <ArrowLeft size={18} />
              </>
            ) : 'Select an answer'}
          </button>
        </footer>
      </div>
    </div>
  );
};

VocalExamSession.propTypes = {
  section: PropTypes.shape({
    id: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['lecture', 'continuation']).isRequired,
    title: PropTypes.string,
    timeLimit: PropTypes.number.isRequired,
    clips: PropTypes.array.isRequired,
    questions: PropTypes.array
  }).isRequired,
  onComplete: PropTypes.func.isRequired
};

export default VocalExamSession;
