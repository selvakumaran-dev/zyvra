import React, { useState, useEffect } from 'react';
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import {
    TrendingUp,
    Users,
    DollarSign,
    UserMinus,
    Activity,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';
import api from '../../services/api';
import styles from './AnalyticsDashboard.module.css';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1'];

const AnalyticsDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, [activeTab]);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const endpoint = activeTab === 'overview' ? '/analytics/overview' :
                activeTab === 'performance' ? '/analytics/performance' :
                    '/analytics/attrition';

            const response = await api.get(endpoint);
            setData(response.data.data);
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderOverview = () => {
        if (!data) return null;
        const { employees, payroll, recruitment } = data;

        return (
            <div className={styles.grid}>
                {/* KPI Cards */}
                <div className={styles.kpiCard}>
                    <div className={styles.kpiHeader}>
                        <span className={styles.kpiTitle}>Total Employees</span>
                        <div className={`${styles.iconWrapper} ${styles.blue}`}>
                            <Users size={20} />
                        </div>
                    </div>
                    <div className={styles.kpiValue}>{employees.total}</div>
                    <div className={styles.kpiTrend}>
                        <span className={styles.trendUp}>
                            <ArrowUpRight size={14} /> +{employees.newHires}
                        </span>
                        <span className={styles.trendLabel}>new hires this month</span>
                    </div>
                </div>

                <div className={styles.kpiCard}>
                    <div className={styles.kpiHeader}>
                        <span className={styles.kpiTitle}>Payroll Cost</span>
                        <div className={`${styles.iconWrapper} ${styles.green}`}>
                            <DollarSign size={20} />
                        </div>
                    </div>
                    <div className={styles.kpiValue}>
                        ${payroll.trends[payroll.trends.length - 1]?.totalAmount.toLocaleString() || 0}
                    </div>
                    <div className={styles.kpiTrend}>
                        <span className={styles.trendUp}>
                            <ArrowUpRight size={14} /> +5.2%
                        </span>
                        <span className={styles.trendLabel}>vs last month</span>
                    </div>
                </div>

                <div className={styles.kpiCard}>
                    <div className={styles.kpiHeader}>
                        <span className={styles.kpiTitle}>Attrition Rate</span>
                        <div className={`${styles.iconWrapper} ${styles.red}`}>
                            <UserMinus size={20} />
                        </div>
                    </div>
                    <div className={styles.kpiValue}>2.5%</div>
                    <div className={styles.kpiTrend}>
                        <span className={styles.trendDown}>
                            <ArrowDownRight size={14} /> -0.5%
                        </span>
                        <span className={styles.trendLabel}>vs last month</span>
                    </div>
                </div>

                <div className={styles.kpiCard}>
                    <div className={styles.kpiHeader}>
                        <span className={styles.kpiTitle}>Avg Performance</span>
                        <div className={`${styles.iconWrapper} ${styles.purple}`}>
                            <Activity size={20} />
                        </div>
                    </div>
                    <div className={styles.kpiValue}>4.2</div>
                    <div className={styles.kpiTrend}>
                        <span className={styles.trendUp}>
                            <ArrowUpRight size={14} /> +0.2
                        </span>
                        <span className={styles.trendLabel}>out of 5.0</span>
                    </div>
                </div>

                {/* Charts */}
                <div className={`${styles.chartCard} ${styles.colSpan2}`}>
                    <h3>Payroll Trends</h3>
                    <div className={styles.chartContainer}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={payroll.trends}>
                                <defs>
                                    <linearGradient id="colorPayroll" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis dataKey="_id.month" />
                                <YAxis />
                                <Tooltip />
                                <Area type="monotone" dataKey="totalAmount" stroke="#10b981" fillOpacity={1} fill="url(#colorPayroll)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className={styles.chartCard}>
                    <h3>Department Distribution</h3>
                    <div className={styles.chartContainer}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={employees.departmentDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="count"
                                    nameKey="_id"
                                >
                                    {employees.departmentDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        );
    };

    const renderPerformance = () => {
        if (!data) return null;
        const { distribution, byDepartment } = data;

        return (
            <div className={styles.grid}>
                <div className={`${styles.chartCard} ${styles.colSpan2}`}>
                    <h3>Performance by Department</h3>
                    <div className={styles.chartContainer}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={byDepartment}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis dataKey="_id" />
                                <YAxis domain={[0, 5]} />
                                <Tooltip />
                                <Bar dataKey="avgRating" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className={styles.chartCard}>
                    <h3>Rating Distribution</h3>
                    <div className={styles.chartContainer}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={distribution}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    dataKey="count"
                                    nameKey="_id"
                                    label
                                >
                                    {distribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        );
    };

    const renderAttrition = () => {
        if (!data) return null;
        const { trend, byDepartment } = data;

        return (
            <div className={styles.grid}>
                <div className={`${styles.chartCard} ${styles.colSpan2}`}>
                    <h3>Attrition Trend</h3>
                    <div className={styles.chartContainer}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trend}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Line type="monotone" dataKey="rate" stroke="#ef4444" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className={styles.chartCard}>
                    <h3>Attrition by Department</h3>
                    <div className={styles.chartContainer}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={byDepartment} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                                <XAxis type="number" />
                                <YAxis dataKey="department" type="category" width={100} />
                                <Tooltip />
                                <Bar dataKey="count" fill="#ef4444" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        );
    };

    const renderPredictions = () => {
        if (!data) return null;
        const { payroll, attrition } = data;

        // Simple linear regression for Payroll
        const payrollData = payroll.trends.map((t, i) => ({ x: i, y: t.totalAmount }));
        const n = payrollData.length;
        const sumX = payrollData.reduce((a, b) => a + b.x, 0);
        const sumY = payrollData.reduce((a, b) => a + b.y, 0);
        const sumXY = payrollData.reduce((a, b) => a + b.x * b.y, 0);
        const sumXX = payrollData.reduce((a, b) => a + b.x * b.x, 0);
        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        const nextMonthIndex = n;
        const predictedPayroll = slope * nextMonthIndex + intercept;

        return (
            <div className={styles.grid}>
                <div className={`${styles.chartCard} ${styles.colSpan2}`}>
                    <h3>Payroll Forecast (Next Month)</h3>
                    <div className={styles.predictionValue}>
                        ${predictedPayroll.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        <span className={styles.predictionLabel}>Predicted Spend</span>
                    </div>
                    <p className={styles.predictionDesc}>
                        Based on the last 6 months trend, your payroll cost is expected to
                        {slope > 0 ? ' increase' : ' decrease'} by approximately ${Math.abs(slope).toFixed(0)}.
                    </p>
                </div>
            </div>
        );
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.tabs}>
                    <button
                        className={`${styles.tab} ${activeTab === 'overview' ? styles.active : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        Overview
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'performance' ? styles.active : ''}`}
                        onClick={() => setActiveTab('performance')}
                    >
                        Performance
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'attrition' ? styles.active : ''}`}
                        onClick={() => setActiveTab('attrition')}
                    >
                        Attrition
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'predictions' ? styles.active : ''}`}
                        onClick={() => setActiveTab('predictions')}
                    >
                        Predictions 🔮
                    </button>
                </div>
                <div className={styles.actions}>
                    <button className={styles.exportButton}>
                        Export Report
                    </button>
                </div>
            </div>

            <div className={styles.content}>
                {loading ? (
                    <div className={styles.loading}>Loading analytics...</div>
                ) : (
                    <>
                        {activeTab === 'overview' && renderOverview()}
                        {activeTab === 'performance' && renderPerformance()}
                        {activeTab === 'attrition' && renderAttrition()}
                        {activeTab === 'predictions' && renderPredictions()}
                    </>
                )}
            </div>
        </div>
    );
};

export default AnalyticsDashboard;
