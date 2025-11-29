import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext.jsx';
import { useLanguage } from '../../context/LanguageContext';
import { Moon, Sun, Globe, Bell, Shield, User } from 'lucide-react';
import styles from './Settings.module.css';
import Button from '../../components/UI/Button';
import ChangePasswordModal from '../../components/Modals/ChangePasswordModal';
import RecentActivityModal from '../../components/Modals/RecentActivityModal';

const Settings = () => {
    const { theme, toggleTheme } = useTheme();
    const { language, setLanguage, t } = useLanguage();
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);

    const handlePasswordChanged = () => {
        // Could show a success notification here
        console.log('Password changed successfully');
    };

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h1 className={styles.title}>{t('settings')}</h1>
                <p className={styles.subtitle}>Manage your application preferences</p>
            </div>

            <div className={styles.grid}>
                {/* Appearance Section */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <div className={styles.iconWrapper}>
                            {theme === 'light' ? <Sun size={20} /> : <Moon size={20} />}
                        </div>
                        <h2 className={styles.cardTitle}>Appearance</h2>
                    </div>
                    <div className={styles.cardContent}>
                        <p className={styles.description}>Customize the look and feel of the application.</p>
                        <div className={styles.settingRow}>
                            <span>Theme</span>
                            <div className={styles.toggleWrapper}>
                                <button
                                    className={`${styles.themeBtn} ${theme === 'light' ? styles.active : ''}`}
                                    onClick={() => theme === 'dark' && toggleTheme()}
                                >
                                    Light
                                </button>
                                <button
                                    className={`${styles.themeBtn} ${theme === 'dark' ? styles.active : ''}`}
                                    onClick={() => theme === 'light' && toggleTheme()}
                                >
                                    Dark
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Language Section */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <div className={styles.iconWrapper}>
                            <Globe size={20} />
                        </div>
                        <h2 className={styles.cardTitle}>{t('language')}</h2>
                    </div>
                    <div className={styles.cardContent}>
                        <p className={styles.description}>Select your preferred language.</p>
                        <div className={styles.settingRow}>
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className={styles.select}
                            >
                                <option value="en">English (US)</option>
                                <option value="es">Español</option>
                                <option value="fr">Français</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Notifications Section */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <div className={styles.iconWrapper}>
                            <Bell size={20} />
                        </div>
                        <h2 className={styles.cardTitle}>Notifications</h2>
                    </div>
                    <div className={styles.cardContent}>
                        <p className={styles.description}>Manage how you receive notifications.</p>
                        <div className={styles.settingRow}>
                            <span>Email Notifications</span>
                            <label className={styles.switch}>
                                <input type="checkbox" defaultChecked />
                                <span className={styles.slider}></span>
                            </label>
                        </div>
                        <div className={styles.settingRow}>
                            <span>Push Notifications</span>
                            <label className={styles.switch}>
                                <input type="checkbox" defaultChecked />
                                <span className={styles.slider}></span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Account Section */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <div className={styles.iconWrapper}>
                            <Shield size={20} />
                        </div>
                        <h2 className={styles.cardTitle}>Security</h2>
                    </div>
                    <div className={styles.cardContent}>
                        <p className={styles.description}>Manage your account security settings.</p>
                        <div className={styles.actionRow} style={{ display: 'flex', gap: '10px' }}>
                            <Button
                                variant="secondary"
                                size="small"
                                onClick={() => setIsPasswordModalOpen(true)}
                            >
                                Change Password
                            </Button>
                            <Button
                                variant="outline"
                                size="small"
                                onClick={() => setIsActivityModalOpen(true)}
                            >
                                Recent Activity
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <ChangePasswordModal
                isOpen={isPasswordModalOpen}
                onClose={() => setIsPasswordModalOpen(false)}
                onPasswordChanged={handlePasswordChanged}
            />

            <RecentActivityModal
                isOpen={isActivityModalOpen}
                onClose={() => setIsActivityModalOpen(false)}
            />
        </div>
    );
};

export default Settings;
