import React, { useState } from 'react';
import { User, Menu, Moon, Sun } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext.jsx';
import { useLanguage } from '../../context/LanguageContext';
import NotificationCenter from '../Notifications/NotificationCenter';
import styles from './Header.module.css';

const Header = ({ onMenuClick }) => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const { language, setLanguage, t } = useLanguage();

    return (
        <header className={styles.header}>
            <button className={styles.menuButton} onClick={onMenuClick}>
                <Menu size={24} />
            </button>

            <div className={styles.actions}>
                <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className={styles.langSelect}
                >
                    <option value="en">🇺🇸 EN</option>
                    <option value="es">🇪🇸 ES</option>
                    <option value="fr">🇫🇷 FR</option>
                </select>

                <button onClick={toggleTheme} className={styles.iconButton}>
                    {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                </button>

                <NotificationCenter />

                <div className={styles.profile} onClick={() => navigate('/profile')}>
                    <div className={styles.avatar}>
                        <User size={18} />
                    </div>
                    <div className={styles.profileInfo}>
                        <div className={styles.profileName}>
                            {user?.employee ? `${user.employee.firstName} ${user.employee.lastName}` : user?.email || 'User'}
                        </div>
                        <div className={styles.profileRole}>
                            {user?.role || 'Employee'}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
