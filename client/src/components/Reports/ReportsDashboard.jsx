import React, { useState, useEffect } from 'react';
import { Users, DollarSign, Briefcase, Target, TrendingUp, TrendingDown } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../../services/api';
import Card from '../UI/Card';
import styles from './ReportsDashboard.module.css';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const ReportsDashboard = () => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const response = await api.get('/reports/analytics/dashboard');
            setAnalytics(response.data.data);
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className={styles.loading}>Loading analytics...</div>;
    }

    if (!analytics) {
        return <div className={styles.error}>Failed to load analytics</div>;
    }

    const departmentData = analytics.employees.byDepartment.map(d => ({
        name: d._id || 'Unknown',
        value: d.count
    }));

    const monthlyPayrollData = analytics.payroll.monthly.map(m => ({
        name: `${m._id.month}/${m._id.year}`,
        amount: m.total,
        count: m.count
    })).reverse();

    const recruitmentData = analytics.recruitment.byStatus.map(s => ({
        name: s._id || 'Unknown',
        value: s.count
    }));

    return (
        <div className={styles.dashboard}>
            {/* Metrics Cards */}
            <div className={styles.metricsGrid}>
                <Card className={styles.metricCard}>
                    <div className={styles.metricIcon} style={{ backgroundColor: '#3B82F6' }}>
                        <Users size={24} color="white" />
                    </div>
                    <div className={styles.metricContent}>
                        <div className={styles.metricLabel}>Total Employees</div>
                        <div className={styles.metricValue}>{analytics.employees.total}</div>
                        <div className={styles.metricSubtext}>
                            {analytics.employees.active} active
                        </div>
                    </div>
                </Card>

                <Card className={styles.metricCard}>
                    <div className={styles.metricIcon} style={{ backgroundColor: '#10B981' }}>
                        <DollarSign size={24} color="white" />
                    </div>
                    <div className={styles.metricContent}>
                        <div className={styles.metricLabel}>Total Payroll</div>
                        <div className={styles.metricValue}>
                            ${analytics.payroll.total.toLocaleString()}
                        </div>
                        <div className={styles.metricSubtext}>
                            Avg: ${Math.round(analytics.payroll.average).toLocaleString()}
                        </div>
                    </div>
                </Card>

                <Card className={styles.metricCard}>
                    <div className={styles.metricIcon} style={{ backgroundColor: '#F59E0B' }}>
                        <Briefcase size={24} color="white" />
                    </div>
                    <div className={styles.metricContent}>
                        <div className={styles.metricLabel}>Recruitment</div>
                        <div className={styles.metricValue}>{analytics.recruitment.totalCandidates}</div>
                        <div className={styles.metricSubtext}>
                            {analytics.recruitment.activeJobs} active jobs
                        </div>
                    </div>
                </Card>

                <Card className={styles.metricCard}>
                    <div className={styles.metricIcon} style={{ backgroundColor: '#8B5CF6' }}>
                        <Target size={24} color="white" />
                    </div>
                    <div className={styles.metricContent}>
                        <div className={styles.metricLabel}>Goals</div>
                        <div className={styles.metricValue}>{analytics.performance.totalGoals}</div>
                        <div className={styles.metricSubtext}>
                            {analytics.performance.completionRate}% completion rate
                        </div>
                    </div>
                </Card>
            </div>

            {/* Charts */}
            <div className={styles.chartsGrid}>
                {/* Employee Distribution */}
                <Card className={styles.chartCard}>
                    <h3 className={styles.chartTitle}>Employees by Department</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={departmentData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {departmentData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </Card>

                {/* Payroll Trends */}
                <Card className={styles.chartCard}>
                    <h3 className={styles.chartTitle}>Payroll Trends (Last 6 Months)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={monthlyPayrollData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                            <Legend />
                            <Line type="monotone" dataKey="amount" stroke="#3B82F6" strokeWidth={2} name="Total Amount" />
                        </LineChart>
                    </ResponsiveContainer>
                </Card>



                {/* Performance Overview */}
                <Card className={styles.chartCard}>
                    <h3 className={styles.chartTitle}>Performance Overview</h3>
                    <div className={styles.performanceStats}>
                        <div className={styles.statRow}>
                            <span>Total Goals</span>
                            <span className={styles.statValue}>{analytics.performance.totalGoals}</span>
                        </div>
                        <div className={styles.statRow}>
                            <span>Completed</span>
                            <span className={styles.statValue} style={{ color: '#10B981' }}>
                                {analytics.performance.completedGoals}
                            </span>
                        </div>
                        <div className={styles.statRow}>
                            <span>Average Progress</span>
                            <span className={styles.statValue}>
                                {Math.round(analytics.performance.avgProgress)}%
                            </span>
                        </div>
                        <div className={styles.progressBar}>
                            <div
                                className={styles.progressFill}
                                style={{ width: `${analytics.performance.completionRate}%` }}
                            />
                        </div>
                        <div className={styles.progressLabel}>
                            {analytics.performance.completionRate}% Completion Rate
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default ReportsDashboard;
