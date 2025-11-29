import React, { useEffect, useState } from 'react';
import { Users, TrendingUp, Briefcase } from 'lucide-react';
import Card from '../UI/Card';
import api from '../../services/api';
import styles from './ApplicantDashboard.module.css';

const ApplicantDashboard = () => {
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await api.get('/dashboard/applicant-stats');
            setStats(response.data.data.stats);
        } catch (error) {
            console.error('Failed to fetch applicant stats:', error);
            // Fallback data
            setStats([
                {
                    label: 'Total Employees',
                    value: '0',
                    change: '0%',
                    trend: 'up',
                    color: '#3B82F6',
                    icon: 'users'
                },
                {
                    label: 'Employee Growth',
                    value: '0%',
                    change: 'vs last month',
                    trend: 'up',
                    color: '#10B981',
                    icon: 'trending-up'
                },
                {
                    label: 'Active Recruitments',
                    value: '0',
                    change: '+0 this month',
                    trend: 'up',
                    color: '#F59E0B',
                    icon: 'briefcase'
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const getIcon = (iconName) => {
        switch (iconName) {
            case 'users':
                return <Users size={24} />;
            case 'trending-up':
                return <TrendingUp size={24} />;
            case 'briefcase':
                return <Briefcase size={24} />;
            default:
                return <Users size={24} />;
        }
    };

    if (loading) {
        return <div className={styles.loading}>Loading dashboard...</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Welcome to Zyvra</h1>
                <p className={styles.subtitle}>
                    Explore our company statistics and discover exciting job opportunities
                </p>
            </div>

            <div className={styles.statsGrid}>
                {stats.map((stat, index) => (
                    <Card key={index} className={styles.statCard}>
                        <div className={styles.statContent}>
                            <div className={styles.statIcon} style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                                {getIcon(stat.icon)}
                            </div>
                            <div className={styles.statInfo}>
                                <p className={styles.statLabel}>{stat.label}</p>
                                <h2 className={styles.statValue}>{stat.value}</h2>
                                <p className={`${styles.statChange} ${styles[stat.trend]}`}>
                                    {stat.change}
                                </p>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <Card className={styles.infoCard}>
                <h2 className={styles.infoTitle}>About Your Dashboard</h2>
                <p className={styles.infoText}>
                    As a job applicant, you have access to view our company statistics and explore
                    available job opportunities. Navigate to the <strong>Recruitment</strong> page
                    to see all open positions and apply for roles that match your skills and interests.
                </p>
                <div className={styles.features}>
                    <div className={styles.feature}>
                        <div className={styles.featureIcon}>📊</div>
                        <div>
                            <h3 className={styles.featureTitle}>Company Insights</h3>
                            <p className={styles.featureText}>View our company size and growth trends</p>
                        </div>
                    </div>
                    <div className={styles.feature}>
                        <div className={styles.featureIcon}>💼</div>
                        <div>
                            <h3 className={styles.featureTitle}>Job Opportunities</h3>
                            <p className={styles.featureText}>Browse and apply for open positions</p>
                        </div>
                    </div>
                    <div className={styles.feature}>
                        <div className={styles.featureIcon}>🚀</div>
                        <div>
                            <h3 className={styles.featureTitle}>Career Growth</h3>
                            <p className={styles.featureText}>Join a growing organization</p>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default ApplicantDashboard;
