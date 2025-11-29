import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import styles from './NotFound.module.css';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <h1 className={styles.errorCode}>404</h1>
                <h2 className={styles.title}>Page Not Found</h2>
                <p className={styles.description}>
                    The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                </p>
                <div className={styles.actions}>
                    <button className={styles.backButton} onClick={() => navigate(-1)}>
                        <ArrowLeft size={18} />
                        Go Back
                    </button>
                    <button className={styles.homeButton} onClick={() => navigate('/')}>
                        <Home size={18} />
                        Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
