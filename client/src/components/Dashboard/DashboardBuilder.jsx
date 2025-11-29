import React, { useState, useEffect } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { Users, DollarSign, Briefcase, TrendingUp, Save, Layout } from 'lucide-react';
import StatCard from './widgets/StatCard';
import ChartWidget from './widgets/ChartWidget';
import { showToast } from '../../utils/toast';
import api from '../../services/api';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import styles from './DashboardBuilder.module.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

const DashboardBuilder = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [employeeGrowthData, setEmployeeGrowthData] = useState([]);
    const [departmentData, setDepartmentData] = useState([]);
    const [attendanceData, setAttendanceData] = useState([]);

    const [layouts, setLayouts] = useState({
        lg: [
            { i: 'stat1', x: 0, y: 0, w: 3, h: 2 },
            { i: 'stat2', x: 3, y: 0, w: 3, h: 2 },
            { i: 'stat3', x: 6, y: 0, w: 3, h: 2 },
            { i: 'stat4', x: 9, y: 0, w: 3, h: 2 },
            { i: 'chart1', x: 0, y: 2, w: 8, h: 4 },
            { i: 'chart2', x: 8, y: 2, w: 4, h: 4 },
            { i: 'chart3', x: 0, y: 6, w: 6, h: 4 },
        ]
    });

    // Fetch dashboard data from API
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);

                // Fetch all data in parallel
                const [statsRes, growthRes, deptRes, attendanceRes] = await Promise.all([
                    api.get('/dashboard/stats'),
                    api.get('/dashboard/charts/employee-growth'),
                    api.get('/dashboard/charts/department-distribution'),
                    api.get('/dashboard/charts/attendance-overview')
                ]);

                setStats(statsRes.data.data.stats);
                setEmployeeGrowthData(growthRes.data.data);
                setDepartmentData(deptRes.data.data);
                setAttendanceData(attendanceRes.data.data);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                showToast.error('Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // Load saved layout
    useEffect(() => {
        const saved = localStorage.getItem('dashboardLayout');
        if (saved) {
            setLayouts(JSON.parse(saved));
        }
    }, []);

    const onLayoutChange = (currentLayout, allLayouts) => {
        setLayouts(allLayouts);
    };

    const saveLayout = () => {
        localStorage.setItem('dashboardLayout', JSON.stringify(layouts));
        setIsEditing(false);
        showToast.success('Dashboard layout saved');
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>Loading dashboard...</div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className={styles.container}>
                <div className={styles.error}>Failed to load dashboard data</div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.toolbar}>
                <h1 className={styles.pageTitle}>Dashboard</h1>
                <div className={styles.actions}>
                    {isEditing ? (
                        <>
                            <button className={styles.button} onClick={() => setIsEditing(false)}>
                                Cancel
                            </button>
                            <button className={`${styles.button} ${styles.primary}`} onClick={saveLayout}>
                                <Save size={16} />
                                Save Layout
                            </button>
                        </>
                    ) : (
                        <button className={styles.button} onClick={() => setIsEditing(true)}>
                            <Layout size={16} />
                            Customize
                        </button>
                    )}
                </div>
            </div>

            <ResponsiveGridLayout
                className={styles.grid}
                layouts={layouts}
                breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                rowHeight={60}
                isDraggable={isEditing}
                isResizable={isEditing}
                onLayoutChange={onLayoutChange}
                margin={[16, 16]}
            >
                <div key="stat1">
                    <StatCard
                        title={stats[0]?.label || 'Total Employees'}
                        value={stats[0]?.value || '0'}
                        change={stats[0]?.change || '0%'}
                        trend={stats[0]?.trend || 'up'}
                        icon={Users}
                        color={stats[0]?.color || '#3b82f6'}
                    />
                </div>
                <div key="stat2">
                    <StatCard
                        title={stats[3]?.label || 'Total Payroll'}
                        value={stats[3]?.value || '$0'}
                        change={stats[3]?.change || '0%'}
                        trend={stats[3]?.trend || 'up'}
                        icon={DollarSign}
                        color={stats[3]?.color || '#10b981'}
                    />
                </div>
                <div key="stat3">
                    <StatCard
                        title={stats[1]?.label || 'Open Jobs'}
                        value={stats[1]?.value || '0'}
                        change={stats[1]?.change || '0'}
                        trend={stats[1]?.trend || 'up'}
                        icon={Briefcase}
                        color={stats[1]?.color || '#f59e0b'}
                    />
                </div>
                <div key="stat4">
                    <StatCard
                        title={stats[2]?.label || 'Attrition Rate'}
                        value={stats[2]?.value || '0%'}
                        change={stats[2]?.change || '0%'}
                        trend={stats[2]?.trend || 'down'}
                        icon={TrendingUp}
                        color={stats[2]?.color || '#8b5cf6'}
                    />
                </div>

                <div key="chart1">
                    <ChartWidget
                        title="Employee Growth"
                        type="line"
                        data={employeeGrowthData}
                        dataKey="employees"
                        color="#3b82f6"
                    />
                </div>

                <div key="chart2">
                    <ChartWidget
                        title="Department Distribution"
                        type="pie"
                        data={departmentData}
                    />
                </div>

                <div key="chart3">
                    <ChartWidget
                        title="Attendance Overview"
                        type="bar"
                        data={attendanceData}
                        dataKey="present"
                        color="#10b981"
                    />
                </div>


            </ResponsiveGridLayout>
        </div>
    );
};

export default DashboardBuilder;
