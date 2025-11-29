import React, { useState, useEffect } from 'react';
import { Clock, MapPin, Calendar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Badge from '../../components/UI/Badge';
import DataTable from '../../components/UI/DataTable';
import { showToast } from '../../utils/toast';
import api from '../../services/api';
import styles from './Attendance.module.css';

const Attendance = () => {
    const { user, isHR } = useAuth();
    const [history, setHistory] = useState([]);
    const [isCheckedIn, setIsCheckedIn] = useState(false);
    const [todayAttendance, setTodayAttendance] = useState(null);
    const [timer, setTimer] = useState(0);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        avgHours: 0,
        onTimePercentage: 0,
        daysPresent: 0
    });

    useEffect(() => {
        fetchHistory();
        checkTodayStatus();
    }, []);

    useEffect(() => {
        let interval;
        if (isCheckedIn && todayAttendance?.checkIn) {
            // Calculate elapsed time from check-in
            const updateTimer = () => {
                const checkInTime = new Date(todayAttendance.checkIn);
                const now = new Date();
                const diff = Math.floor((now - checkInTime) / 1000);
                setTimer(diff);
            };

            updateTimer();
            interval = setInterval(updateTimer, 1000);
        }
        return () => clearInterval(interval);
    }, [isCheckedIn, todayAttendance]);

    const checkTodayStatus = async () => {
        try {
            const response = await api.get('/attendance');
            const allAttendance = response.data.data || [];

            // Find today's attendance
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const employeeId = user?.employee?._id || user?._id;
            const todayRecord = allAttendance.find(record => {
                const recordDate = new Date(record.date);
                recordDate.setHours(0, 0, 0, 0);
                const recordEmployeeId = record.employee?._id || record.employee;

                return recordDate.getTime() === today.getTime() &&
                    recordEmployeeId === employeeId;
            });

            if (todayRecord) {
                setTodayAttendance(todayRecord);
                setIsCheckedIn(!!todayRecord.checkIn && !todayRecord.checkOut);
            }
        } catch (error) {
            console.error('Failed to check today status:', error);
        }
    };

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const response = await api.get('/attendance');
            const allAttendance = response.data.data || [];

            // Filter based on role
            let filteredHistory = allAttendance;
            if (!isHR) {
                const employeeId = user?.employee?._id || user?._id;
                filteredHistory = allAttendance.filter(record => {
                    const recordEmployeeId = record.employee?._id || record.employee;
                    return recordEmployeeId === employeeId;
                });
            }

            setHistory(filteredHistory);

            // Calculate stats for current user
            if (!isHR) {
                calculateStats(filteredHistory);
            }
        } catch (error) {
            console.error('Failed to fetch attendance:', error);
            showToast.error('Failed to load attendance history');
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (attendanceData) => {
        if (attendanceData.length === 0) {
            setStats({ avgHours: 0, onTimePercentage: 0, daysPresent: 0 });
            return;
        }

        // Calculate average hours
        const recordsWithHours = attendanceData.filter(r => r.totalHours);
        const avgHours = recordsWithHours.length > 0
            ? recordsWithHours.reduce((sum, r) => sum + r.totalHours, 0) / recordsWithHours.length
            : 0;

        // Calculate on-time percentage (assuming 9 AM is on-time)
        const onTimeCount = attendanceData.filter(r => {
            if (!r.checkIn) return false;
            const checkInTime = new Date(r.checkIn);
            const hour = checkInTime.getHours();
            return hour < 9 || (hour === 9 && checkInTime.getMinutes() === 0);
        }).length;
        const onTimePercentage = attendanceData.length > 0
            ? (onTimeCount / attendanceData.length) * 100
            : 0;

        // Days present
        const daysPresent = attendanceData.filter(r => r.status === 'Present').length;

        setStats({
            avgHours: avgHours.toFixed(1),
            onTimePercentage: Math.round(onTimePercentage),
            daysPresent
        });
    };

    const handleCheckIn = async () => {
        try {
            await api.post('/attendance/check-in', { location: 'Office' });
            setIsCheckedIn(true);
            showToast.success('Checked in successfully!');
            fetchHistory();
            checkTodayStatus();
        } catch (error) {
            const message = error.response?.data?.error?.message || 'Check-in failed';
            showToast.error(message);
        }
    };

    const handleCheckOut = async () => {
        try {
            await api.post('/attendance/check-out', {});
            setIsCheckedIn(false);
            setTimer(0);
            showToast.success('Checked out successfully!');
            fetchHistory();
            checkTodayStatus();
        } catch (error) {
            const message = error.response?.data?.error?.message || 'Check-out failed';
            showToast.error(message);
        }
    };

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const columns = [
        {
            header: 'Date',
            accessor: 'date',
            render: (row) => new Date(row.date).toLocaleDateString()
        },
        ...(isHR ? [{
            header: 'Employee',
            accessor: 'employee',
            render: (row) => row.employee ? `${row.employee.firstName} ${row.employee.lastName}` : 'Unknown'
        }] : []),
        {
            header: 'Check In',
            accessor: 'checkIn',
            render: (row) => row.checkIn ? new Date(row.checkIn).toLocaleTimeString() : '-'
        },
        {
            header: 'Check Out',
            accessor: 'checkOut',
            render: (row) => row.checkOut ? new Date(row.checkOut).toLocaleTimeString() : '-'
        },
        {
            header: 'Total Hours',
            accessor: 'totalHours',
            render: (row) => row.totalHours ? `${row.totalHours.toFixed(2)} hrs` : '-'
        },
        {
            header: 'Status',
            accessor: 'status',
            render: (row) => <Badge variant={row.status === 'Present' ? 'success' : 'warning'}>{row.status}</Badge>
        }
    ];

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Attendance</h1>
                    <p className={styles.subtitle}>Track work hours and location</p>
                </div>
                <div className={styles.dateDisplay}>
                    <Calendar size={18} />
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </div>

            {!isHR && (
                <div className={styles.grid}>
                    <Card className={styles.timerCard}>
                        <div className={styles.timerHeader}>
                            <div className={styles.timerTitle}>Current Session</div>
                            <Badge variant={isCheckedIn ? 'success' : 'default'}>
                                {isCheckedIn ? 'Online' : 'Offline'}
                            </Badge>
                        </div>
                        <div className={styles.timerDisplay}>
                            {formatTime(timer)}
                        </div>
                        <div className={styles.locationInfo}>
                            <MapPin size={16} />
                            <span>Office</span>
                        </div>
                        <div className={styles.timerActions}>
                            {!isCheckedIn ? (
                                <Button onClick={handleCheckIn} className={styles.checkInBtn}>Check In</Button>
                            ) : (
                                <Button onClick={handleCheckOut} variant="secondary" className={styles.checkOutBtn}>Check Out</Button>
                            )}
                        </div>
                    </Card>

                    <div className={styles.statsRow}>
                        <Card className={styles.statCard}>
                            <div className={styles.statLabel}>Avg. Hours</div>
                            <div className={styles.statValue}>{stats.avgHours}</div>
                        </Card>
                        <Card className={styles.statCard}>
                            <div className={styles.statLabel}>On Time</div>
                            <div className={styles.statValue}>{stats.onTimePercentage}%</div>
                        </Card>
                        <Card className={styles.statCard}>
                            <div className={styles.statLabel}>Days Present</div>
                            <div className={styles.statValue}>{stats.daysPresent}</div>
                        </Card>
                    </div>
                </div>
            )}

            <Card title="Attendance History">
                {loading ? <div>Loading...</div> : <DataTable columns={columns} data={history} />}
            </Card>
        </div>
    );
};

export default Attendance;
