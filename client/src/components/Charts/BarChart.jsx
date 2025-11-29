import React from 'react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import styles from './Chart.module.css';

const BarChart = ({
    data,
    dataKey,
    xAxisKey = 'name',
    title,
    color = '#10B981',
    height = 300,
    showGrid = true,
    showLegend = true,
    layout = 'vertical'
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
                <RechartsBarChart
                    data={data}
                    layout={layout}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                    {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />}
                    {layout === 'vertical' ? (
                        <>
                            <XAxis type="number" stroke="var(--color-text-muted)" style={{ fontSize: '12px' }} />
                            <YAxis type="category" dataKey={xAxisKey} stroke="var(--color-text-muted)" style={{ fontSize: '12px' }} />
                        </>
                    ) : (
                        <>
                            <XAxis dataKey={xAxisKey} stroke="var(--color-text-muted)" style={{ fontSize: '12px' }} />
                            <YAxis stroke="var(--color-text-muted)" style={{ fontSize: '12px' }} />
                        </>
                    )}
                    <Tooltip content={<CustomTooltip />} />
                    {showLegend && <Legend />}
                    <Bar
                        dataKey={dataKey}
                        fill={color}
                        radius={[4, 4, 0, 0]}
                        animationDuration={1000}
                    />
                </RechartsBarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default BarChart;
