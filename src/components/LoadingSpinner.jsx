import React from 'react';
import { motion } from 'framer-motion';
import { C, MOTION } from '../styles/theme';
import ShaderBackground from './ShaderBackground';

const LoadingSpinner = () => (
    <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: C.bg
    }}>
        <ShaderBackground opacity={0.15} />
        <motion.div
            variants={MOTION.scaleIn}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}
        >
            <svg width="48" height="48" viewBox="0 0 48 48" style={{ animation: 'spin 1s linear infinite' }}>
                <defs>
                    <linearGradient id="spinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#8B5CF6" />
                        <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                </defs>
                <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
                <circle cx="24" cy="24" r="20" fill="none" stroke="url(#spinGrad)" strokeWidth="3"
                    strokeDasharray="80 46" strokeLinecap="round" />
            </svg>
            <span style={{ fontSize: 13, color: C.muted, fontWeight: 500 }}>טוען...</span>
        </motion.div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
);

export default LoadingSpinner;
