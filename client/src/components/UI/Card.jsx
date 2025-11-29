import React from 'react';
import styles from './Card.module.css';

const Card = ({ children, className = '', title, subtitle, action }) => {
    return (
        <div className={`${styles.card} ${className}`}>
            {(title || action) && (
                <div className={styles.header}>
                    <div>
                        {title && <h3 className={styles.title}>{title}</h3>}
                        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
                    </div>
                    {action && <div className={styles.action}>{action}</div>}
                </div>
            )}
            <div className={styles.content}>
                {children}
            </div>
        </div>
    );
};

export default Card;
