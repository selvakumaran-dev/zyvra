import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Users, Plus, Trash2 } from 'lucide-react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Badge from '../../components/UI/Badge';
import DataTable from '../../components/UI/DataTable';
import RunPayrollModal from '../../components/Modals/RunPayrollModal';
import api from '../../services/api';
import styles from './Payroll.module.css';

const Payroll = () => {
    const [records, setRecords] = useState([]);
    const [stats, setStats] = useState({ totalPayroll: 0, avgSalary: 0, employeeCount: 0 });
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchData = async () => {
        try {
            const [recordsRes, statsRes] = await Promise.all([
                api.get('/payroll'),
                api.get('/payroll/stats')
            ]);
            setRecords(recordsRes.data.data);
            setStats(statsRes.data.data);
        } catch (error) {
            console.error('Failed to fetch payroll data:', error);
            // Mock data fallback
            setRecords([
                { _id: '1', employee: { firstName: 'Sarah', lastName: 'Chen' }, month: 'November', year: 2025, basicSalary: 8500, earnings: 500, deductions: 200, netSalary: 8800, status: 'Paid' },
                { _id: '2', employee: { firstName: 'Michael', lastName: 'Ross' }, month: 'November', year: 2025, basicSalary: 7200, earnings: 300, deductions: 150, netSalary: 7350, status: 'Paid' },
                { _id: '3', employee: { firstName: 'Jennifer', lastName: 'Adams' }, month: 'November', year: 2025, basicSalary: 9000, earnings: 600, deductions: 250, netSalary: 9350, status: 'Pending' },
            ]);
            setStats({ totalPayroll: 428000, avgSalary: 8500, employeeCount: 50 });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const columns = [
        {
            header: 'Employee',
            accessor: 'employee',
            render: (row) => `${row.employee?.firstName} ${row.employee?.lastName}`
        },
        { header: 'Month', accessor: 'month' },
        { header: 'Year', accessor: 'year' },
        {
            header: 'Basic Salary',
            accessor: 'basicSalary',
            render: (row) => `$${(row.basicSalary || 0).toLocaleString()}`
        },
        {
            header: 'Earnings',
            accessor: 'earnings',
            render: (row) => {
                const totalAllowances = row.allowances ? Object.values(row.allowances).reduce((a, b) => a + b, 0) : 0;
                return `$${(row.basicSalary + totalAllowances).toLocaleString()}`;
            }
        },
        {
            header: 'Deductions',
            accessor: 'deductions',
            render: (row) => {
                const totalDeductions = row.deductions ? Object.values(row.deductions).reduce((a, b) => a + b, 0) : 0;
                return `$${totalDeductions.toLocaleString()}`;
            }
        },
        {
            header: 'Net Salary',
            accessor: 'netSalary',
            render: (row) => `$${(row.netPay || 0).toLocaleString()}`
        },
        {
            header: 'Status',
            accessor: 'status',
            render: (row) => (
                <Badge variant={row.status === 'Paid' ? 'success' : 'warning'}>
                    {row.status}
                </Badge>
            )
        },
        {
            header: 'Actions',
            render: (row) => (
                <button
                    onClick={() => handleDelete(row._id)}
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#EF4444',
                        padding: '4px'
                    }}
                    title="Delete Record"
                >
                    <Trash2 size={18} />
                </button>
            )
        }
    ];

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this payroll record?')) {
            try {
                await api.delete(`/payroll/${id}`);
                fetchData(); // Refresh list
            } catch (error) {
                console.error('Failed to delete record:', error);
                alert('Failed to delete record');
            }
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Payroll</h1>
                    <p className={styles.subtitle}>Manage employee compensation</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)}>
                    <Plus size={18} />
                    Run Payroll
                </Button>
            </div>

            <div className={styles.statsGrid}>
                <Card className={styles.statCard}>
                    <div className={styles.statIcon} style={{ backgroundColor: '#3B82F6' }}>
                        <DollarSign size={24} color="white" />
                    </div>
                    <div className={styles.statInfo}>
                        <div className={styles.statLabel}>Total Payroll</div>
                        <div className={styles.statValue}>${(stats.totalPayroll / 1000).toFixed(1)}K</div>
                    </div>
                </Card>
                <Card className={styles.statCard}>
                    <div className={styles.statIcon} style={{ backgroundColor: '#10B981' }}>
                        <TrendingUp size={24} color="white" />
                    </div>
                    <div className={styles.statInfo}>
                        <div className={styles.statLabel}>Avg. Salary</div>
                        <div className={styles.statValue}>${(stats.avgSalary / 1000).toFixed(1)}K</div>
                    </div>
                </Card>
                <Card className={styles.statCard}>
                    <div className={styles.statIcon} style={{ backgroundColor: '#F59E0B' }}>
                        <Users size={24} color="white" />
                    </div>
                    <div className={styles.statInfo}>
                        <div className={styles.statLabel}>Employees</div>
                        <div className={styles.statValue}>{stats.employeeCount}</div>
                    </div>
                </Card>
            </div>

            <Card title="Payroll Register">
                {loading ? <div>Loading...</div> : <DataTable columns={columns} data={records} />}
            </Card>

            <RunPayrollModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onPayrollRun={fetchData}
            />
        </div>
    );
};

export default Payroll;
