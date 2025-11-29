import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext.jsx';
import styles from './ThemeToggle.module.css';

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            className={styles.toggle}
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
            <div className={`${styles.iconWrapper} ${theme === 'dark' ? styles.dark : ''}`}>
                <Sun className={styles.sunIcon} size={18} />
                <Moon className={styles.moonIcon} size={18} />
            </div>
        </button>
    );
};

export default ThemeToggle;
