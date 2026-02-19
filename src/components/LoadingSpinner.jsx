import React from 'react';
import { motion } from 'framer-motion';
import { Ring2 } from 'ldrs/react';
import 'ldrs/react/Ring2.css';
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
            <Ring2 size={40} speed={0.8} stroke={4} color="#8B5CF6" bgOpacity={0.1} />
            <span style={{ fontSize: 13, color: C.muted, fontWeight: 500 }}>טוען...</span>
        </motion.div>
    </div>
);

export default LoadingSpinner;
