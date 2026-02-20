import { motion, AnimatePresence } from 'framer-motion';
import { Headphones, Mic, Pause } from 'lucide-react';
import AudioWaveform from './AudioWaveform';
import { C, GLASS, RADIUS } from '../styles/theme';

/**
 * AudioVisualizer — contextual wrapper around AudioWaveform.
 *
 * Props:
 *  - audioState: 'idle' | 'loading' | 'playing' | 'paused' | 'done'
 *  - clipIndex:  current clip number (0-based)
 *  - totalClips: total number of clips in section
 *  - isLecture:  boolean (lecture vs continuation)
 *  - accentColor: theme color for accent highlights
 */
const AudioVisualizer = ({
  audioState,
  clipIndex,
  totalClips,
  isLecture = true,
  accentColor = C.blue,
}) => {
  const isPlaying = audioState === 'playing';
  const isPaused = audioState === 'paused';
  const isActive = isPlaying || isPaused;

  return (
    <AnimatePresence mode="wait">
      {isActive && (
        <motion.div
          key="visualizer"
          initial={{ opacity: 0, scale: 0.92, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: -10 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          style={{
            width: '100%',
            maxWidth: 360,
            padding: '16px 20px',
            borderRadius: RADIUS.lg,
            ...GLASS.card,
            border: `1px solid ${accentColor}20`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Subtle glow background */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: `radial-gradient(ellipse at center, ${accentColor}08 0%, transparent 70%)`,
              pointerEvents: 'none',
            }}
          />

          {/* Status badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              zIndex: 1,
            }}
          >
            <motion.div
              animate={
                isPlaying
                  ? { scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }
                  : { scale: 1, opacity: 0.5 }
              }
              transition={
                isPlaying
                  ? { repeat: Infinity, duration: 1.5, ease: 'easeInOut' }
                  : { duration: 0.3 }
              }
              style={{
                width: 8,
                height: 8,
                borderRadius: RADIUS.full,
                background: isPlaying ? accentColor : C.muted,
              }}
            />
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: isPlaying ? accentColor : C.muted,
                letterSpacing: 0.5,
              }}
            >
              {isPlaying ? (isLecture ? 'מאזינים להרצאה...' : 'מאזינים...') : 'מושהה'}
            </span>

            {isPaused && (
              <Pause size={12} color={C.muted} />
            )}
            {isPlaying && (
              isLecture
                ? <Headphones size={13} color={accentColor} />
                : <Mic size={13} color={accentColor} />
            )}
          </div>

          {/* Waveform */}
          <div style={{ zIndex: 1, width: '100%' }}>
            <AudioWaveform
              isPlaying={isPlaying}
              isPaused={isPaused}
            />
          </div>

          {/* Clip counter */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              zIndex: 1,
            }}
          >
            <span
              style={{
                fontSize: 11,
                color: C.dim,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {clipIndex + 1} / {totalClips}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AudioVisualizer;
