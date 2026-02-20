import React from 'react';
import { motion } from 'framer-motion';
import { C } from '../styles/theme';

const BAR_COUNT = 24;

// Pre-compute deterministic "random" heights and delays for each bar
const barConfigs = Array.from({ length: BAR_COUNT }, (_, i) => {
  const seed = ((i * 7 + 3) % BAR_COUNT) / BAR_COUNT;
  return {
    minHeight: 4 + seed * 6,        // 4–10px when idle
    maxHeight: 12 + seed * 28,       // 12–40px when playing
    delay: (i * 0.04) % 0.8,         // staggered start
    duration: 0.4 + seed * 0.5,      // 0.4–0.9s per cycle
  };
});

let waveGradCounter = 0;
const AudioWaveform = ({ isPlaying = false, isPaused = false, barColor }) => {
  const gradientId = React.useMemo(() => `waveGrad-${++waveGradCounter}`, []);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        height: 48,
        padding: '0 4px',
      }}
    >
      {/* Hidden SVG for gradient definition */}
      <svg width={0} height={0} style={{ position: 'absolute' }}>
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor={C.purple} />
            <stop offset="100%" stopColor={C.pink} />
          </linearGradient>
        </defs>
      </svg>

      {barConfigs.map((cfg, i) => {
        const idleHeight = cfg.minHeight;
        const activeHeights = [
          cfg.maxHeight,
          cfg.minHeight + (cfg.maxHeight - cfg.minHeight) * 0.3,
          cfg.maxHeight * 0.85,
          cfg.minHeight + (cfg.maxHeight - cfg.minHeight) * 0.5,
          cfg.maxHeight,
        ];

        return (
          <motion.div
            key={i}
            initial={{ height: idleHeight }}
            animate={
              isPlaying && !isPaused
                ? {
                    height: activeHeights,
                    transition: {
                      duration: cfg.duration,
                      repeat: Infinity,
                      repeatType: 'mirror',
                      ease: 'easeInOut',
                      delay: cfg.delay,
                    },
                  }
                : isPaused
                ? {
                    height: idleHeight + 4,
                    transition: { duration: 0.4, ease: 'easeOut' },
                  }
                : {
                    height: idleHeight,
                    transition: { duration: 0.5, ease: 'easeOut' },
                  }
            }
            style={{
              width: 3,
              borderRadius: 2,
              background: barColor || `url(#${gradientId})`,
              opacity: isPlaying && !isPaused ? 0.9 : isPaused ? 0.5 : 0.25,
              transition: 'opacity 0.3s ease',
              willChange: 'height',
            }}
          />
        );
      })}
    </div>
  );
};

export default AudioWaveform;
