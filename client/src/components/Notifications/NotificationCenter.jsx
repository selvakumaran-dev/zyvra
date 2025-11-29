import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, CheckCheck, X, Trash2, AlertCircle, Info, CheckCircle, AlertTriangle } from 'lucide-react';
import api from '../../services/api';
import { showToast } from '../../utils/toast';
import styles from './NotificationCenter.module.css';

const NotificationCenter = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState('all'); // 'all' or 'unread'
    const dropdownRef = useRef(null);

    // Fetch notifications
    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen, filter]);

    // Fetch unread count on mount and periodically
    useEffect(() => {
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 30000); // Every 30 seconds
        return () => clearInterval(interval);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/notifications?unreadOnly=${filter === 'unread'}&limit=20`);
            setNotifications(response.data.data.notifications);
            setUnreadCount(response.data.data.unreadCount);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUnreadCount = async () => {
        try {
            const response = await api.get('/notifications/unread-count');
            setUnreadCount(response.data.data.count);
        } catch (error) {
            console.error('Failed to fetch unread count:', error);
        }
    };

    const handleMarkAsRead = async (notificationId) => {
        try {
            await api.put(`/notifications/${notificationId}/read`);
            setNotifications(prev =>
                prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            showToast.error('Failed to mark as read');
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await api.put('/notifications/mark-all-read');
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
            showToast.success('All notifications marked as read');
        } catch (error) {
            showToast.error('Failed to mark all as read');
        }
    };

    const handleDelete = async (notificationId) => {
        try {
            await api.delete(`/notifications/${notificationId}`);
            setNotifications(prev => prev.filter(n => n._id !== notificationId));
            showToast.success('Notification deleted');
        } catch (error) {
            showToast.error('Failed to delete notification');
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'success':
                return <CheckCircle size={20} className={styles.iconSuccess} />;
            case 'error':
                return <AlertCircle size={20} className={styles.iconError} />;
            case 'warning':
                return <AlertTriangle size={20} className={styles.iconWarning} />;
            default:
                return <Info size={20} className={styles.iconInfo} />;
        }
    };

    const getTimeAgo = (date) => {
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
                    <span className={styles.badge}>{unreadCount > 99 ? '99+' : unreadCount}</span>
                )}
            </button>

            {isOpen && (
                <div className={styles.dropdown}>
                    <div className={styles.header}>
                        <h3 className={styles.title}>Notifications</h3>
                        <div className={styles.headerActions}>
                            <button
                                className={styles.filterButton}
                                onClick={() => setFilter(filter === 'all' ? 'unread' : 'all')}
                            >
                                {filter === 'all' ? 'Unread' : 'All'}
                            </button>
                            {unreadCount > 0 && (
                                <button
                                    className={styles.markAllButton}
                                    onClick={handleMarkAllAsRead}
                                    title="Mark all as read"
                                >
                                    <CheckCheck size={16} />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className={styles.list}>
                        {loading ? (
                            <div className={styles.loading}>Loading...</div>
                        ) : notifications.length === 0 ? (
                            <div className={styles.empty}>
                                <Bell size={32} />
                                <p>No notifications</p>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification._id}
                                    className={`${styles.item} ${!notification.read ? styles.unread : ''}`}
                                >
                                    <div className={styles.iconWrapper}>
                                        {getIcon(notification.type)}
                                    </div>
                                    <div className={styles.content}>
                                        <div className={styles.itemHeader}>
                                            <h4 className={styles.itemTitle}>{notification.title}</h4>
                                            <span className={styles.time}>{getTimeAgo(notification.createdAt)}</span>
                                        </div>
                                        <p className={styles.message}>{notification.message}</p>
                                    </div>
                                    <div className={styles.actions}>
                                        {!notification.read && (
                                            <button
                                                className={styles.actionButton}
                                                onClick={() => handleMarkAsRead(notification._id)}
                                                title="Mark as read"
                                            >
                                                <Check size={14} />
                                            </button>
                                        )}
                                        <button
                                            className={styles.actionButton}
                                            onClick={() => handleDelete(notification._id)}
                                            title="Delete"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {notifications.length > 0 && (
                        <div className={styles.footer}>
                            <button className={styles.viewAllButton}>
                                View all notifications
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationCenter;
