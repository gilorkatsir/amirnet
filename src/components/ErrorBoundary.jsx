import React from 'react';
import PropTypes from 'prop-types';
import { C } from '../styles/theme';
import { AlertCircle, RotateCcw } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
    }

    handleReload = () => {
        window.location.reload();
    };

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    minHeight: '100vh',
                    background: C.bg,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 24,
                    textAlign: 'center',
                    direction: 'rtl'
                }}>
                    <div style={{
                        width: 80,
                        height: 80,
                        borderRadius: 20,
                        background: 'rgba(239,68,68,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 24
                    }}>
                        <AlertCircle size={40} color={C.red} />
                    </div>

                    <h1 style={{ fontSize: 24, fontWeight: 700, color: C.text, margin: '0 0 12px' }}>
                        משהו השתבש 😕
                    </h1>

                    <p style={{ color: C.muted, fontSize: 14, marginBottom: 32, maxWidth: 300 }}>
                        אירעה שגיאה בלתי צפויה. אנא נסה לרענן את הדף או לחזור למסך הבית.
                    </p>

                    <div style={{ display: 'flex', gap: 12 }}>
                        <button
                            onClick={this.handleReload}
                            style={{
                                padding: '12px 24px',
                                borderRadius: 12,
                                border: 'none',
                                background: C.gradient,
                                color: 'white',
                                fontSize: 14,
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8
                            }}
                        >
                            <RotateCcw size={18} />
                            רענן דף
                        </button>

                        <button
                            onClick={this.handleReset}
                            style={{
                                padding: '12px 24px',
                                borderRadius: 12,
                                border: `1px solid ${C.border}`,
                                background: 'transparent',
                                color: C.muted,
                                fontSize: 14,
                                fontWeight: 600,
                                cursor: 'pointer'
                            }}
                        >
                            נסה שוב
                        </button>
                    </div>

                    {process.env.NODE_ENV === 'development' && this.state.error && (
                        <pre style={{
                            marginTop: 32,
                            padding: 16,
                            background: C.surface,
                            borderRadius: 8,
                            color: C.red,
                            fontSize: 12,
                            textAlign: 'left',
                            direction: 'ltr',
                            maxWidth: '100%',
                            overflow: 'auto'
                        }}>
                            {this.state.error.toString()}
                        </pre>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}

ErrorBoundary.propTypes = {
    children: PropTypes.node.isRequired
};

export default ErrorBoundary;
