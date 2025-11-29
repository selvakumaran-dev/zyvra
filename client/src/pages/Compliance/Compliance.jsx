import React, { useState, useEffect } from 'react';
import { Shield, Activity } from 'lucide-react';
import Card from '../../components/UI/Card';
import Badge from '../../components/UI/Badge';
import DataTable from '../../components/UI/DataTable';
import api from '../../services/api';
import styles from './Compliance.module.css';

const Compliance = () => {
    const [auditLogs, setAuditLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        securityScore: 0,
        activeSessions: 0
    });

    useEffect(() => {
        fetchAuditLogs();
    }, []);

    const fetchAuditLogs = async () => {
        try {
            const response = await api.get('/compliance/audit-logs');
            const logs = response.data.data;
            setAuditLogs(logs);
            calculateStats(logs);
        } catch (error) {
            console.error('Failed to fetch audit logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (logs) => {
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        // Calculate active sessions - count unique users with successful actions in last 24 hours
        const recentSuccessfulActions = logs.filter(log =>
            log.status === 'Success' &&
            new Date(log.createdAt) > oneDayAgo &&
            log.actor && log.actor._id
        );
        const activeSessions = new Set(recentSuccessfulActions.map(log => log.actor._id)).size;

        // Calculate security score based on recent failures and incidents
        const recentFailures = logs.filter(log =>
            log.status === 'Failure' &&
            new Date(log.createdAt) > oneDayAgo
        ).length;

        const recentIncidents = logs.filter(log =>
            log.action && log.action.includes('INCIDENT_REPORTED') &&
            new Date(log.createdAt) > oneDayAgo
        ).length;

        // Deduct 5 points per failure, 10 points per incident
        const deductions = (recentFailures * 5) + (recentIncidents * 10);
        const securityScore = Math.max(50, 100 - deductions);

        setStats({
            securityScore,
            activeSessions
        });
    };

    const auditColumns = [
        { header: 'Action', accessor: 'action' },
        {
            header: 'Actor',
            accessor: 'actor',
            render: (row) => row.actor ? `${row.actor.firstName} ${row.actor.lastName}` : 'System'
        },
        { header: 'Target', accessor: 'target' },
        { header: 'IP Address', accessor: 'ipAddress' },
        {
            header: 'Time',
            accessor: 'createdAt',
            render: (row) => new Date(row.createdAt).toLocaleString()
        },
        {
            header: 'Status',
            accessor: 'status',
            render: (row) => (
                <Badge variant={row.status === 'Success' ? 'success' : 'error'}>
                    {row.status}
                </Badge>
            )
        }
    ];

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Compliance & Audit Logs</h1>
                    <p className={styles.subtitle}>Immutable record of all system activities</p>
                </div>
            </div>

            <div className={styles.statsGrid}>
                <Card className={styles.statCard}>
                    <div className={styles.statIcon}><Shield size={24} /></div>
                    <div className={styles.statInfo}>
                        <div className={styles.statLabel}>Security Score</div>
                        <div className={styles.statValue}>{stats.securityScore}/100</div>
                    </div>
                </Card>
                <Card className={styles.statCard}>
                    <div className={styles.statIcon}><Activity size={24} /></div>
                    <div className={styles.statInfo}>
                        <div className={styles.statLabel}>Active Sessions</div>
                        <div className={styles.statValue}>{stats.activeSessions}</div>
                    </div>
                </Card>
            </div>

            <div className={styles.content}>
                <Card>
                    {loading ? <div>Loading...</div> : <DataTable columns={auditColumns} data={auditLogs} />}
                </Card>
            </div>
        </div>
    );
};

export default Compliance;
