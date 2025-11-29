import React, { useState, useEffect } from 'react';
import Modal from '../UI/Modal';
import api from '../../services/api';
import styles from './RecentActivityModal.module.css';
import { Clock, Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const RecentActivityModal = ({ isOpen, onClose }) => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            fetchLogs();
        }
    }, [isOpen]);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const response = await api.get('/compliance/audit-logs/me');
            setLogs(response.data.data);
        } catch (error) {
            console.error('Failed to fetch activity logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const getIcon = (action, status) => {
        if (status === 'Failure') return <AlertTriangle size={16} color="#ef4444" />;
        if (action.includes('LOGIN')) return <Shield size={16} color="#3b82f6" />;
        if (action.includes('DELETE')) return <XCircle size={16} color="#ef4444" />;
        return <CheckCircle size={16} color="#10b981" />;
    };

    const formatAction = (action) => {
        return action.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Recent Security Activity" maxWidth="600px">
            <div className={styles.container}>
                {loading ? (
                    <div className={styles.loading}>Loading activity...</div>
                ) : logs.length === 0 ? (
                    <div className={styles.empty}>No recent activity found.</div>
                ) : (
                    <div className={styles.timeline}>
                        {logs.map((log) => (
                            <div key={log._id} className={styles.timelineItem}>
                                <div className={styles.iconWrapper}>
                                    {getIcon(log.action, log.status)}
                                </div>
                                <div className={styles.content}>
                                    <div className={styles.header}>
                                        <span className={styles.action}>{formatAction(log.action)}</span>
                                        <span className={`
                                            ${styles.status} 
                                            ${log.status === 'Success' ? styles.success : styles.failure}
                                        `}>
                                            {log.status}
                                        </span>
                                    </div>
                                    <div className={styles.meta}>
                                        <div className={styles.time}>
                                            <Clock size={12} />
                                            {new Date(log.createdAt).toLocaleString()}
                                        </div>
                                        {log.ipAddress && (
                                            <div className={styles.ip}>IP: {log.ipAddress}</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default RecentActivityModal;
