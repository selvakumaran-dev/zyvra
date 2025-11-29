import React from 'react';
import { AreaChart as RechartsAreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import styles from './Chart.module.css';

const AreaChart = ({
    data,
    dataKey,
    xAxisKey = 'name',
    title,
    color = '#8B5CF6',
    height = 300,
    showGrid = true,
    showLegend = true
}) => {
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className={styles.tooltip}>
                    <p className={styles.tooltipLabel}>{label}</p>
                    <p className={styles.tooltipValue} style={{ color }}>
                        {payload[0].value}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className={styles.chartContainer}>
            {title && <h3 className={styles.chartTitle}>{title}</h3>}
            <ResponsiveContainer width="100%" height={height}>
                <RechartsAreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <defs>
                        <linearGradient id={`color${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                            <stop offset="95%" stopColor={color} stopOpacity={0.1} />
                        </linearGradient>
                    </defs>
                    {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />}
                    <XAxis
                        dataKey={xAxisKey}
                        stroke="var(--color-text-muted)"
                        style={{ fontSize: '12px' }}
                    />
                    <YAxis
                        stroke="var(--color-text-muted)"
                        style={{ fontSize: '12px' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    {showLegend && <Legend />}
                    <Area
                        type="monotone"
                        dataKey={dataKey}
                        stroke={color}
                        strokeWidth={2}
                        fillOpacity={1}
                        fill={`url(#color${dataKey})`}
                        animationDuration={1000}
                    />
                </RechartsAreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default AreaChart;
