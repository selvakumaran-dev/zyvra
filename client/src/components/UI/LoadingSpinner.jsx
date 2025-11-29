import React from 'react';
import { Loader2 } from 'lucide-react';
import styles from './LoadingSpinner.module.css';

const LoadingSpinner = ({ size = 'medium', text = 'Loading...' }) => {
    return (
        <div className={styles.container}>
            <Loader2 className={`${styles.spinner} ${styles[size]}`} />
            {text && <p className={styles.text}>{text}</p>}
        </div>
    );
};

export default LoadingSpinner;
