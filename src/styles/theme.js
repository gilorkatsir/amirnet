// Design System — Liquid Glass inspired
// Apple HIG + glassmorphism + dark mode

export const C = {
    // Backgrounds
    bg: '#0a0a0f',
    surface: 'rgba(255,255,255,0.04)',
    surfaceHover: 'rgba(255,255,255,0.07)',
    surfaceActive: 'rgba(255,255,255,0.10)',

    // Glass
    glass: 'rgba(255,255,255,0.05)',
    glassBorder: 'rgba(255,255,255,0.08)',
    glassHeavy: 'rgba(255,255,255,0.08)',

    // Borders
    border: 'rgba(255,255,255,0.06)',
    borderLight: 'rgba(255,255,255,0.10)',

    // Text
    text: '#f0f0f5',
    muted: '#8e8e9a',
    dim: '#5a5a6a',

    // Accents
    pink: '#ec4899',
    purple: '#8B5CF6',
    blue: '#3b82f6',
    orange: '#fb923c',
    green: '#22c55e',
    red: '#ef4444',
    yellow: '#eab308',
    cyan: '#06b6d4',

    // Gradients
    gradient: 'linear-gradient(135deg, #fb923c, #ec4899, #9333ea)',
    gradientSubtle: 'linear-gradient(135deg, rgba(251,146,60,0.15), rgba(236,72,153,0.15), rgba(147,51,234,0.15))',
    gradientText: {
        background: 'linear-gradient(135deg, #fb923c, #ec4899, #9333ea)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
    },

    // Shadows
    shadowSm: '0 2px 8px rgba(0,0,0,0.3)',
    shadowMd: '0 8px 24px rgba(0,0,0,0.4)',
    shadowLg: '0 16px 48px rgba(0,0,0,0.5)',
    shadowGlow: (color) => `0 0 24px ${color}33`,
};

export const GLASS = {
    card: {
        background: C.glass,
        backdropFilter: 'blur(40px) saturate(180%)',
        WebkitBackdropFilter: 'blur(40px) saturate(180%)',
        border: `1px solid ${C.glassBorder}`,
        borderRadius: 16,
    },
    header: {
        background: 'rgba(10,10,15,0.8)',
        backdropFilter: 'blur(40px) saturate(180%)',
        WebkitBackdropFilter: 'blur(40px) saturate(180%)',
        borderBottom: `1px solid ${C.border}`,
    },
    nav: {
        background: 'rgba(10,10,15,0.75)',
        backdropFilter: 'blur(40px) saturate(180%)',
        WebkitBackdropFilter: 'blur(40px) saturate(180%)',
        borderTop: `1px solid ${C.border}`,
    },
    button: {
        background: C.glass,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid ${C.glassBorder}`,
        borderRadius: 12,
    },
};

export const FONTS = {
    main: 'Rubik, system-ui, sans-serif',
    display: 'Manrope, sans-serif',
    mono: 'monospace'
};

export const SPACING = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
    xxxl: 48,
};

export const RADIUS = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
};

export const TYPE = {
    xs: { fontSize: 11, lineHeight: 1.4 },
    sm: { fontSize: 13, lineHeight: 1.5 },
    base: { fontSize: 15, lineHeight: 1.6 },
    lg: { fontSize: 18, lineHeight: 1.4 },
    xl: { fontSize: 24, lineHeight: 1.3 },
    xxl: { fontSize: 32, lineHeight: 1.2 },
};

export const SURFACE = {
    hero: {
        background: 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(236,72,153,0.06))',
        border: '1px solid rgba(139,92,246,0.12)',
        borderRadius: 20,
    },
    elevated: {
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 20,
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
    },
    subtle: {
        background: 'transparent',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        borderRadius: 0,
    },
    inset: {
        background: 'rgba(0,0,0,0.2)',
        borderRadius: 16,
        border: 'none',
    },
};

export const MOTION = {
    fadeUp: { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } },
    scaleIn: { hidden: { opacity: 0, scale: 0.92 }, visible: { opacity: 1, scale: 1 } },
    slideRight: { hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } },
};

export const HEADING = {
    hero: { fontSize: 28, fontWeight: 700, letterSpacing: -0.5 },
    section: { fontSize: 20, fontWeight: 700, letterSpacing: -0.3 },
    card: { fontSize: 16, fontWeight: 600 },
    label: { fontSize: 12, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: '#8e8e9a' },
};
