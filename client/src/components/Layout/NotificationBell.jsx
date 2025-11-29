import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import styles from './NotificationBell.module.css';

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 30000); // Poll every 30 seconds
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchUnreadCount = async () => {
        try {
            const response = await api.get('/notifications/unread-count');
            setUnreadCount(response.data.data.count);
        } catch (error) {
            console.error('Failed to fetch unread count:', error);
        }
    };

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await api.get('/notifications?limit=5');
            setNotifications(response.data.data.notifications || []);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (id, e) => {
        e.stopPropagation();
        try {
            await api.patch(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
            fetchUnreadCount();
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const handleNotificationClick = async (notification) => {
        if (!notification.read) {
            await handleMarkAsRead(notification._id, { stopPropagation: () => { } });
        }
        setIsOpen(false);
        if (notification.link) {
            navigate(notification.link);
        }
    };

    const handleViewAll = () => {
        setIsOpen(false);
        navigate('/notifications');
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'success':
                return <Check size={18} className={styles.iconSuccess} />;
            case 'warning':
            case 'error':
                return <X size={18} className={styles.iconError} />;
            default:
                return <Bell size={18} className={styles.iconInfo} />;
        }
    };

    const formatTimeAgo = (date) => {
        const now = new Date();
        const diff = now - new Date(date);
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    };

    return (
        <div className={styles.container} ref={dropdownRef}>
            <button
                className={styles.bellButton}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Notifications"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className={styles.badge}>{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
            </button>

            {isOpen && (
                <div className={styles.dropdown}>
                    <div className={styles.header}>
                        <h3>Notifications</h3>
                        {unreadCount > 0 && (
                            <span className={styles.unreadText}>{unreadCount} unread</span>
                        )}
                    </div>

                    <div className={styles.list}>
                        {loading ? (
                            <div className={styles.loading}>Loading...</div>
                        ) : notifications.length === 0 ? (
                            <div className={styles.empty}>No notifications</div>
                        ) : (
                            notifications.map(notification => (
                                <div
                                    key={notification._id}
                                    className={`${styles.item} ${!notification.read ? styles.unread : ''}`}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <div className={styles.iconWrapper}>
                                        {getNotificationIcon(notification.type)}
                                    </div>
                                    <div className={styles.content}>
                                        <div className={styles.title}>{notification.title}</div>
                                        <div className={styles.message}>{notification.message}</div>
                                        <div className={styles.time}>{formatTimeAgo(notification.createdAt)}</div>
                                    </div>
                                    {!notification.read && (
                                        <button
                                            className={styles.markReadBtn}
                                            onClick={(e) => handleMarkAsRead(notification._id, e)}
                                            title="Mark as read"
                                        >
                                            <Check size={14} />
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    {notifications.length > 0 && (
                        <div className={styles.footer}>
                            <button onClick={handleViewAll} className={styles.viewAllBtn}>
                                View all notifications
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
