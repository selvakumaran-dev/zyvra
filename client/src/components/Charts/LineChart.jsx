import React from 'react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import styles from './Chart.module.css';

const LineChart = ({
    data,
    dataKey,
    xAxisKey = 'name',
    title,
    color = '#3B82F6',
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
                <RechartsLineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
                    <Line
                        type="monotone"
                        dataKey={dataKey}
                        stroke={color}
                        strokeWidth={2}
                        dot={{ fill: color, r: 4 }}
                        activeDot={{ r: 6 }}
                        animationDuration={1000}
                    />
                </RechartsLineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default LineChart;
