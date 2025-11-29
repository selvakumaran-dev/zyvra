import React from 'react';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import styles from './StatCard.module.css';

const StatCard = ({ title, value, change, trend, icon: Icon, color }) => {
    const getTrendIcon = () => {
        switch (trend) {
            case 'up': return <ArrowUp size={16} />;
            case 'down': return <ArrowDown size={16} />;
            default: return <Minus size={16} />;
        }
    };

    const getTrendClass = () => {
        switch (trend) {
            case 'up': return styles.trendUp;
            case 'down': return styles.trendDown;
            default: return styles.trendNeutral;
        }
    };

    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <span className={styles.title}>{title}</span>
                {Icon && <div className={styles.iconWrapper} style={{ backgroundColor: `${color}20`, color: color }}>
                    <Icon size={20} />
                </div>}
            </div>
            <div className={styles.content}>
                <div className={styles.value}>{value}</div>
                {change && (
                    <div className={`${styles.trend} ${getTrendClass()}`}>
                        {getTrendIcon()}
                        <span>{change}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StatCard;
