import React from 'react';
import { C } from '../styles/theme';

const LoadingSpinner = () => (
    <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: C.bg
    }}>
        <div style={{
            width: 40,
            height: 40,
            border: '3px solid rgba(139,92,246,0.2)',
            borderTopColor: '#8B5CF6',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
        }} />
        <style>{`
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
        `}</style>
    </div>
);

export default LoadingSpinner;
