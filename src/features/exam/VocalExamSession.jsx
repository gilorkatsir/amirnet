import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useLocation } from 'wouter';
import Icon from '../../components/Icon';
import { C } from '../../styles/theme';
import { playCorrect, playIncorrect, playTimerComplete, playClick } from '../../utils/sounds';
import { textToSpeech } from '../../services/elevenLabsService';
import { hasElevenLabsKey } from '../../services/apiKeys';

/**
 * Vocal Exam Session — handles both Lecture+Questions and Text Continuation
 */
const VocalExamSession = ({ section, onComplete }) => {
  const [, navigate] = useLocation();
  const isLecture = section.type === 'lecture';
  const hasTts = hasElevenLabsKey();

  // Phases: 'listening' → 'questions'
  const [phase, setPhase] = useState('listening');
  const [currentClipIndex, setCurrentClipIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [audioState, setAudioState] = useState('idle'); // idle | loading | playing | paused | done
  const [timeLeft, setTimeLeft] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [markedForReview, setMarkedForReview] = useState(new Set());
  const [showText, setShowText] = useState(!hasTts); // Show text if no TTS, or user toggles

  const audioRef = useRef(null);
  const audioUrlRef = useRef(null);
  const mountedRef = useRef(true);

  // Track mounted state for async safety
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
      }
    };
  }, []);

  // Timer countdown
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          playTimerComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // Auto-submit when timer hits 0
  useEffect(() => {
    if (timeLeft === 0) {
      const correct = answers.filter(a => a.isCorrect).length;
      const incorrect = answers.filter(a => !a.isCorrect).length;
      onComplete({ correct, incorrect, answers });
    }
  }, [timeLeft]);

  const formatTime = (s) => {
    if (s === null) return '--:--';
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  // ─── AUDIO PLAYBACK ─────────────────────────────────────────
  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
  }, []);

  const playClip = useCallback(async (clipText) => {
    stopAudio();

    if (!hasTts) {
      setAudioState('done');
      return;
    }

    setAudioState('loading');
    try {
      const blob = await textToSpeech(clipText);
      if (!mountedRef.current) return; // Component unmounted during fetch

      const url = URL.createObjectURL(blob);
      audioUrlRef.current = url;
      const audio = new Audio(url);
      audioRef.current = audio;

      audio.addEventListener('ended', () => {
        if (mountedRef.current) setAudioState('done');
      });
      audio.addEventListener('error', () => {
        if (mountedRef.current) setAudioState('done');
      });

      setAudioState('playing');
      await audio.play();
    } catch {
      if (mountedRef.current) setAudioState('done');
    }
  }, [hasTts, stopAudio]);

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    if (audioState === 'playing') {
      audioRef.current.pause();
      setAudioState('paused');
    } else if (audioState === 'paused') {
      audioRef.current.play();
      setAudioState('playing');
    }
  };

  const replayCurrentClip = () => {
    const clip = section.clips[currentClipIndex];
    if (clip) playClip(clip.text);
  };

  // Auto-play clip when entering listening phase or advancing clip
  const prevClipRef = useRef(-1);
  useEffect(() => {
    if (phase !== 'listening') return;
    // Only auto-play when clip index actually changes (prevents StrictMode double-fire)
    if (prevClipRef.current === currentClipIndex) return;
    prevClipRef.current = currentClipIndex;

    const clip = section.clips[currentClipIndex];
    if (clip) playClip(clip.text);
  }, [phase, currentClipIndex, playClip, section.clips]);

  // ─── NAVIGATION ─────────────────────────────────────────────
  const handleNextClip = () => {
    playClick();
    stopAudio();

    if (currentClipIndex < section.clips.length - 1) {
      setAudioState('idle');
      prevClipRef.current = -1; // Allow auto-play for next clip
      setCurrentClipIndex(prev => prev + 1);
    } else {
      // All clips done → move to questions
      goToQuestions();
    }
  };

  const goToQuestions = () => {
    stopAudio();
    setPhase('questions');
    if (isLecture) {
      setCurrentClipIndex(0);
    }
    if (timeLeft === null) {
      setTimeLeft(section.timeLimit);
    }
  };

  // ─── ANSWER HANDLING ────────────────────────────────────────
  const getCurrentQuestion = () => {
    if (isLecture) {
      return section.questions[currentQuestionIndex];
    }
    return section.clips[currentClipIndex];
  };

  const handleSelect = (index) => {
    if (answered) return;
    setSelected(index);
    setAnswered(true);

    const q = getCurrentQuestion();
    const isCorrect = index === (q.correctIndex - 1);

    if (isCorrect) playCorrect();
    else playIncorrect();

    setAnswers(prev => [...prev, {
      questionIndex: isLecture ? currentQuestionIndex : currentClipIndex,
      selected: index,
      isCorrect
    }]);
  };

  const handleNext = () => {
    playClick();
    setSelected(null);
    setAnswered(false);

    if (isLecture) {
      if (currentQuestionIndex < section.questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        // Use callback to get latest answers
        setAnswers(current => {
          const correct = current.filter(a => a.isCorrect).length;
          const incorrect = current.filter(a => !a.isCorrect).length;
          setTimeout(() => onComplete({ correct, incorrect, answers: current }), 0);
          return current;
        });
      }
    } else {
      // Continuation: next clip
      if (currentClipIndex < section.clips.length - 1) {
        prevClipRef.current = -1;
        setCurrentClipIndex(prev => prev + 1);
        setPhase('listening');
        setAudioState('idle');
      } else {
        setAnswers(current => {
          const correct = current.filter(a => a.isCorrect).length;
          const incorrect = current.filter(a => !a.isCorrect).length;
          setTimeout(() => onComplete({ correct, incorrect, answers: current }), 0);
          return current;
        });
      }
    }
  };

  const handleJumpToQuestion = (idx) => {
    if (!isLecture || phase !== 'questions') return;
    if (idx <= answers.length) {
      setCurrentQuestionIndex(idx);
      const existing = answers.find(a => a.questionIndex === idx);
      if (existing) {
        setSelected(existing.selected);
        setAnswered(true);
      } else {
        setSelected(null);
        setAnswered(false);
      }
    }
  };

  const toggleMarkForReview = () => {
    const idx = isLecture ? currentQuestionIndex : currentClipIndex;
    setMarkedForReview(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      const key = e.key.toLowerCase();

      if (phase === 'listening') {
        if (key === ' ' || key === 'enter') {
          e.preventDefault();
          if (audioState === 'done') handleNextClip();
          else if (audioState === 'idle') replayCurrentClip();
          else togglePlayPause();
        }
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

  // ─── RENDER HELPERS ─────────────────────────────────────────

  const totalQs = isLecture ? section.questions.length : section.clips.length;
  const currentIdx = isLecture ? currentQuestionIndex : currentClipIndex;

  const renderAudioControls = () => {
    const clip = section.clips[currentClipIndex];

    return (
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
        {/* Play / Pause / Replay */}
        {audioState === 'idle' && hasTts && (
          <button onClick={replayCurrentClip} style={btnStyle(C.purple)}>
            <Icon name="play_arrow" size={24} />
          </button>
        )}
        {audioState === 'loading' && (
          <div style={{ ...btnStyle(C.border), cursor: 'default', opacity: 0.6 }}>
            <Icon name="hourglass_top" size={24} />
          </div>
        )}
        {(audioState === 'playing' || audioState === 'paused') && (
          <button onClick={togglePlayPause} style={btnStyle(C.purple)}>
            <Icon name={audioState === 'playing' ? 'pause' : 'play_arrow'} size={24} />
          </button>
        )}
        {audioState === 'done' && hasTts && (
          <button onClick={replayCurrentClip} style={btnStyle(C.muted)}>
            <Icon name="replay" size={24} />
          </button>
        )}

        {/* Next clip / Go to questions */}
        {(audioState === 'done' || !hasTts) && (
          <button onClick={handleNextClip} style={{
            height: 48, padding: '0 24px', borderRadius: 24, background: C.gradient,
            border: 'none', cursor: 'pointer', color: 'white', fontSize: 15,
            fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8,
            boxShadow: '0 8px 24px rgba(124,58,237,0.25)'
          }}>
            {currentClipIndex < section.clips.length - 1 ? (isLecture ? 'קליפ הבא' : 'הבא') : (isLecture ? 'עבור לשאלות' : 'בחר המשך')}
            <Icon name="arrow_back" size={20} />
          </button>
        )}

        {/* Toggle text */}
        {hasTts && (
          <button
            onClick={() => setShowText(!showText)}
            style={{
              width: 40, height: 40, borderRadius: '50%', background: showText ? 'rgba(139,92,246,0.2)' : C.surface,
              border: `1px solid ${showText ? C.purple : C.border}`, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: showText ? C.purple : C.muted
            }}
            title="הצג/הסתר טקסט"
          >
            <Icon name={showText ? 'visibility' : 'visibility_off'} size={18} />
          </button>
        )}
      </div>
    );
  };

  const btnStyle = (color) => ({
    width: 48, height: 48, borderRadius: '50%', background: C.surface,
    border: `1px solid ${color}`, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', color
  });

  // ─── LISTENING PHASE ────────────────────────────────────────
  if (phase === 'listening') {
    const clip = section.clips[currentClipIndex];
    const clipNum = currentClipIndex + 1;
    const totalClips = section.clips.length;
    const accentColor = isLecture ? C.orange : '#3b82f6';

    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: C.bg }}>
        <header style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '16px 20px', background: 'rgba(26,26,26,0.95)',
          backdropFilter: 'blur(8px)', borderBottom: `1px solid ${C.border}`
        }}>
          <button onClick={() => navigate('/')} style={{
            width: 40, height: 40, borderRadius: '50%', background: 'transparent',
            border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Icon name="close" size={24} style={{ color: '#d1d5db' }} />
          </button>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: accentColor, textTransform: 'uppercase', letterSpacing: 1.5, display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
              <Icon name={isLecture ? 'headphones' : 'hearing'} size={14} />
              {isLecture ? 'שלב האזנה' : 'השלמת טקסט'}
            </div>
            <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>
              קליפ {clipNum} מתוך {totalClips}
            </div>
          </div>
          {/* Skip to questions */}
          <button onClick={goToQuestions} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: C.muted, fontSize: 12, fontWeight: 600, padding: '8px 4px'
          }} title="דלג לשאלות">
            <Icon name="skip_next" size={20} />
          </button>
        </header>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 20px', gap: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: 'white', textAlign: 'center', margin: 0 }}>
            {section.title}
          </h2>

          {/* Audio circle */}
          <div style={{
            width: 100, height: 100, borderRadius: '50%',
            background: audioState === 'playing' ? `${accentColor}20` : 'rgba(255,255,255,0.05)',
            border: `2px solid ${audioState === 'playing' ? accentColor : C.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.3s',
            animation: audioState === 'playing' ? 'pulse 2s infinite' : 'none'
          }}>
            <Icon
              name={audioState === 'loading' ? 'hourglass_top' : audioState === 'playing' ? 'graphic_eq' : audioState === 'paused' ? 'pause' : audioState === 'done' ? 'check_circle' : 'play_arrow'}
              size={40}
              style={{ color: audioState === 'playing' ? accentColor : audioState === 'done' ? C.green : C.muted }}
            />
          </div>

          {/* Status text */}
          <p style={{ fontSize: 13, color: C.muted, textAlign: 'center', margin: 0 }} dir="rtl">
            {audioState === 'loading' ? 'טוען אודיו...' :
             audioState === 'playing' ? 'מאזינים...' :
             audioState === 'paused' ? 'מושהה — לחץ להמשך' :
             audioState === 'done' ? 'הקליפ הסתיים' :
             hasTts ? 'לחץ Play להשמעה' : 'קרא את הטקסט'}
          </p>

          {/* Controls */}
          {renderAudioControls()}

          {/* Clip text (always shown if no TTS, toggleable if TTS) */}
          {(showText || !hasTts) && (
            <div style={{
              padding: 20, background: 'rgba(255,255,255,0.05)', borderRadius: 12,
              border: `1px solid ${C.border}`, maxWidth: 520, width: '100%',
              maxHeight: 200, overflowY: 'auto'
            }} dir="ltr">
              <p style={{ fontSize: 15, lineHeight: 1.7, color: 'rgba(255,255,255,0.85)', margin: 0 }}>
                {clip.text}
                {!isLecture && <span style={{ color: C.orange, fontWeight: 700 }}>...</span>}
              </p>
            </div>
          )}

          {/* Clip progress dots */}
          <div style={{ display: 'flex', gap: 8 }}>
            {section.clips.map((_, i) => (
              <div key={i} style={{
                width: 8, height: 8, borderRadius: '50%',
                background: i < currentClipIndex ? C.green : i === currentClipIndex ? accentColor : C.border,
                transition: 'background 0.3s'
              }} />
            ))}
          </div>
        </div>

        <style>{`
          @keyframes pulse {
            0%, 100% { box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.3); }
            50% { box-shadow: 0 0 0 20px rgba(139, 92, 246, 0); }
          }
        `}</style>
      </div>
    );
  }

  // ─── QUESTIONS PHASE ────────────────────────────────────────
  const question = getCurrentQuestion();
  const options = question.options;
  const isMarked = markedForReview.has(currentIdx);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: C.bg }}>
      {/* Header */}
      <header style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '16px 20px', background: 'rgba(26,26,26,0.95)',
        backdropFilter: 'blur(8px)', borderBottom: `1px solid ${C.border}`
      }}>
        <button onClick={() => navigate('/')} style={{
          width: 40, height: 40, borderRadius: '50%', background: 'transparent',
          border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Icon name="close" size={24} style={{ color: '#d1d5db' }} />
        </button>

        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: 20, fontWeight: 700,
            color: timeLeft !== null && timeLeft < 60 ? '#ef4444' : 'white',
            fontVariantNumeric: 'tabular-nums',
            display: 'flex', alignItems: 'center', gap: 6
          }}>
            <Icon name="timer" size={20} />
            {formatTime(timeLeft)}
          </div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
            שאלה {currentIdx + 1} מתוך {totalQs}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={toggleMarkForReview} style={{
            width: 36, height: 36, borderRadius: '50%',
            background: isMarked ? 'rgba(251, 146, 60, 0.2)' : C.surface,
            border: `1px solid ${isMarked ? C.orange : C.border}`,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: isMarked ? C.orange : C.muted
          }} title="סמן לבדיקה">
            <Icon name={isMarked ? 'flag' : 'outlined_flag'} size={18} />
          </button>

          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '6px 12px', borderRadius: 20,
            background: answers.some(a => a.isCorrect) ? 'rgba(34,197,94,0.1)' : 'transparent'
          }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: C.green }}>
              {answers.filter(a => a.isCorrect).length}
            </span>
            <span style={{ fontSize: 11, color: C.muted }}>/</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: C.red }}>
              {answers.filter(a => !a.isCorrect).length}
            </span>
          </div>
        </div>
      </header>

      {/* Question navigation dots (lecture only) */}
      {isLecture && (
        <div style={{
          display: 'flex', justifyContent: 'center', gap: 6, padding: '12px 20px',
          borderBottom: `1px solid ${C.border}`
        }}>
          {section.questions.map((_, i) => {
            const isAnswered = answers.some(a => a.questionIndex === i);
            const isCurrent = i === currentQuestionIndex;
            const isReview = markedForReview.has(i);
            return (
              <button
                key={i}
                onClick={() => handleJumpToQuestion(i)}
                style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: isCurrent ? C.purple : isAnswered ? 'rgba(34,197,94,0.2)' : C.surface,
                  border: `1.5px solid ${isCurrent ? C.purple : isReview ? C.orange : isAnswered ? C.green : C.border}`,
                  color: isCurrent ? 'white' : isAnswered ? C.green : C.muted,
                  cursor: i <= answers.length ? 'pointer' : 'default',
                  fontSize: 12, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  opacity: i <= answers.length ? 1 : 0.4
                }}
              >
                {isReview ? <Icon name="flag" size={12} /> : i + 1}
              </button>
            );
          })}
        </div>
      )}

      {/* Question content */}
      <div style={{ flex: 1, padding: 24, maxWidth: 560, margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column' }} dir="ltr">
        <div style={{ flex: 1 }}>
          {/* Question type badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: 8
            }}>
              <Icon
                name={isLecture ? 'headphones' : 'hearing'}
                size={16}
                style={{ color: isLecture ? C.orange : '#3b82f6' }}
              />
              <span style={{ fontSize: 12, fontWeight: 600, color: isLecture ? C.orange : '#3b82f6' }}>
                {isLecture ? 'Lecture Questions' : 'Text Continuation'}
              </span>
            </div>
          </div>

          {/* Question text */}
          <div style={{ marginBottom: 24 }}>
            {isLecture ? (
              <p style={{ fontSize: 18, lineHeight: 1.7, color: 'rgba(255,255,255,0.95)', margin: 0, fontWeight: 500 }}>
                {question.question}
              </p>
            ) : (
              <p style={{ fontSize: 13, color: C.muted, margin: '0 0 8px' }}>
                Choose the best continuation for what you heard:
              </p>
            )}
          </div>

          {/* Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {options.map((option, i) => {
              const letter = ['A', 'B', 'C', 'D'][i];
              const isSelected = selected === i;
              const isCorrect = i === (question.correctIndex - 1);

              let bg = '#232323';
              let brd = '#2f2f2f';
              let textColor = '#e5e5e5';

              if (answered) {
                if (isCorrect) {
                  bg = 'rgba(34,197,94,0.15)';
                  brd = C.green;
                  textColor = 'white';
                } else if (isSelected) {
                  bg = 'rgba(239,68,68,0.15)';
                  brd = C.red;
                }
              } else if (isSelected) {
                bg = '#2a2a2a';
                brd = C.purple;
              }

              return (
                <button
                  key={i}
                  onClick={() => handleSelect(i)}
                  disabled={answered}
                  style={{
                    display: 'flex', alignItems: 'flex-start', padding: '14px 16px',
                    borderRadius: 12, background: bg, border: `1px solid ${brd}`,
                    cursor: answered ? 'default' : 'pointer', textAlign: 'left',
                    transition: 'all 0.2s', gap: 12
                  }}
                >
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%',
                    border: isSelected ? 'none' : '1.5px solid #6b728080',
                    background: isSelected ? C.gradient : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, marginTop: 2
                  }}>
                    {isSelected && (
                      answered ? (
                        <Icon name={isCorrect ? 'check' : 'close'} size={14} style={{ color: 'white' }} />
                      ) : (
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'white' }} />
                      )
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: isSelected ? C.purple : '#6b728080', marginRight: 8 }}>
                      {letter}
                    </span>
                    <span style={{ fontSize: 15, lineHeight: 1.5, color: textColor }}>
                      {option}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Next button */}
        <footer style={{ marginTop: 32 }}>
          <button
            onClick={handleNext}
            disabled={!answered}
            style={{
              width: '100%', height: 56, display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 8, borderRadius: 12,
              background: answered ? C.gradient : '#333', border: 'none',
              color: 'white', fontSize: 16, fontWeight: 700,
              cursor: answered ? 'pointer' : 'default',
              opacity: answered ? 1 : 0.5,
              boxShadow: answered ? '0 8px 24px rgba(124,58,237,0.25)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            {answered ? (
              <>
                {(isLecture && currentQuestionIndex >= section.questions.length - 1) ||
                 (!isLecture && currentClipIndex >= section.clips.length - 1)
                  ? 'סיום' : 'Continue'}
                <Icon name="arrow_forward" size={20} />
              </>
            ) : (
              'Select an answer'
            )}
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
