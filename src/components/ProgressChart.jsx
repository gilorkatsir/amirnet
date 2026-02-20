import React from 'react';
import PropTypes from 'prop-types';
import { C } from '../styles/theme';

/**
 * ProgressChart - Pure CSS/SVG line chart for showing progress over time
 */
const ProgressChart = ({ data, type = 'daily', height = 180 }) => {
    const validData = data.filter(d => d.accuracy !== null);
    const maxValue = 100;
    const chartWidth = 100; // percentage
    const chartHeight = height - 50; // padding for labels

    // Generate path for the line
    const generatePath = () => {
        if (validData.length === 0) return '';

        const points = data.map((d, i) => {
            const x = (i / (data.length - 1)) * 100;
            const y = d.accuracy !== null
                ? chartHeight - ((d.accuracy / maxValue) * chartHeight)
                : null;
            return { x, y, accuracy: d.accuracy };
        }).filter(p => p.y !== null);

        if (points.length < 2) return '';

        let path = `M ${points[0].x} ${points[0].y}`;
        for (let i = 1; i < points.length; i++) {
            path += ` L ${points[i].x} ${points[i].y}`;
        }
        return path;
    };

    // Get color based on trend
    const getTrendColor = () => {
        if (validData.length < 2) return C.purple;
        const first = validData[0].accuracy;
        const last = validData[validData.length - 1].accuracy;
        if (last > first) return C.green;
        if (last < first) return C.orange;
        return C.purple;
    };

    const trendColor = getTrendColor();
    const path = generatePath();

    // Calculate trend
    const calculateTrend = () => {
        if (validData.length < 2) return null;
        const first = validData[0].accuracy;
        const last = validData[validData.length - 1].accuracy;
        return last - first;
    };

    const trend = calculateTrend();

    return (
        <div style={{
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: 12,
            padding: 16,
            marginBottom: 16
        }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: C.text }}>
                    {type === 'daily' ? 'דיוק - 7 ימים אחרונים' : 'דיוק - 4 שבועות אחרונים'}
                </h3>
                {trend !== null && (
                    <span style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: trend > 0 ? C.green : trend < 0 ? C.red : C.muted,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                    }}>
                        {trend > 0 ? '↑' : trend < 0 ? '↓' : '→'}
                        {Math.abs(trend)}%
                    </span>
                )}
            </div>

            {validData.length === 0 ? (
                <div style={{
                    height: chartHeight,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: C.muted,
                    fontSize: 13
                }}>
                    אין נתונים להצגה עדיין
                </div>
            ) : (
                <>
                    {/* Chart */}
                    <div style={{ position: 'relative', height: chartHeight }}>
                        {/* Y-axis labels */}
                        <div style={{
                            position: 'absolute',
                            left: -5,
                            top: 0,
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            pointerEvents: 'none'
                        }}>
                            {[100, 75, 50, 25, 0].map(v => (
                                <span key={v} style={{ fontSize: 10, color: C.muted }}>{v}%</span>
                            ))}
                        </div>

                        {/* Grid lines */}
                        <svg width="100%" height={chartHeight} style={{ position: 'absolute', left: 20 }}>
                            {[0, 25, 50, 75, 100].map(v => (
                                <line
                                    key={v}
                                    x1="0"
                                    y1={chartHeight - (v / 100) * chartHeight}
                                    x2="100%"
                                    y2={chartHeight - (v / 100) * chartHeight}
                                    stroke={C.border}
                                    strokeDasharray="4 4"
                                />
                            ))}
                        </svg>

                        {/* Line chart */}
                        <svg
                            width="calc(100% - 20px)"
                            height={chartHeight}
                            viewBox={`0 0 100 ${chartHeight}`}
                            preserveAspectRatio="none"
                            style={{ position: 'absolute', left: 20 }}
                        >
                            {/* Gradient fill under line */}
                            <defs>
                                <linearGradient id={`gradient-${type}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={trendColor} stopOpacity="0.3" />
                                    <stop offset="100%" stopColor={trendColor} stopOpacity="0" />
                                </linearGradient>
                            </defs>

                            {/* Fill area */}
                            {path && (
                                <path
                                    d={`${path} L 100 ${chartHeight} L 0 ${chartHeight} Z`}
                                    fill={`url(#gradient-${type})`}
                                />
                            )}

                            {/* Line */}
                            {path && (
                                <path
                                    d={path}
                                    fill="none"
                                    stroke={trendColor}
                                    strokeWidth="2"
                                    vectorEffect="non-scaling-stroke"
                                />
                            )}

                            {/* Data points */}
                            {data.map((d, i) => {
                                if (d.accuracy === null) return null;
                                const x = (i / (data.length - 1)) * 100;
                                const y = chartHeight - ((d.accuracy / maxValue) * chartHeight);
                                return (
                                    <circle
                                        key={i}
                                        cx={x}
                                        cy={y}
                                        r="4"
                                        fill={C.bg}
                                        stroke={trendColor}
                                        strokeWidth="2"
                                        vectorEffect="non-scaling-stroke"
                                    />
                                );
                            })}
                        </svg>
                    </div>

                    {/* X-axis labels */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginTop: 8,
                        paddingLeft: 20
                    }}>
                        {data.map((d, i) => (
                            <span key={i} style={{ fontSize: 10, color: C.muted }}>
                                {type === 'daily' ? d.dayName : d.weekLabel}
                            </span>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

ProgressChart.propTypes = {
    data: PropTypes.arrayOf(PropTypes.shape({
        accuracy: PropTypes.number,
        dayName: PropTypes.string,
        weekLabel: PropTypes.string
    })).isRequired,
    type: PropTypes.oneOf(['daily', 'weekly']),
    height: PropTypes.number
};

export default ProgressChart;
