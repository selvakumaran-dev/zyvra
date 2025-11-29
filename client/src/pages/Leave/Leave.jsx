import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Check, X, Edit2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { showToast } from '../../utils/toast';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Badge from '../../components/UI/Badge';
import DataTable from '../../components/UI/DataTable';
import api from '../../services/api';
import styles from './Leave.module.css';
import ApplyLeaveModal from '../../components/Modals/ApplyLeaveModal';
import EditLeaveModal from '../../components/Modals/EditLeaveModal';
import EditLeaveBalanceModal from '../../components/Modals/EditLeaveBalanceModal';

const Leave = () => {
    const { isHR, user } = useAuth();
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
    const [selectedLeave, setSelectedLeave] = useState(null);
    const [calendarConnected, setCalendarConnected] = useState(false);
    const [leaveBalance, setLeaveBalance] = useState({
        casual: { used: 0, total: 12 },
        sick: { used: 0, total: 10 },
        earned: { used: 0, total: 18 },
        unpaid: { used: 0, total: 0 }
    });

    useEffect(() => {
        fetchLeaves();
        checkIntegrations();
    }, []);

    const checkIntegrations = async () => {
        try {
            const response = await api.get('/integrations');
            const googleCalendar = response.data.data.find(i => i.type === 'google_calendar' && i.isEnabled);
            setCalendarConnected(!!googleCalendar);
        } catch (error) {
            console.error('Failed to check integrations', error);
        }
    };

    const fetchLeaves = async () => {
        try {
            setLoading(true);

            // Fetch global settings for default balance
            let globalSettings = {
                casualLeave: 12,
                sickLeave: 10,
                earnedLeave: 18,
                unpaidLeave: 0
            };

            try {
                const settingsRes = await api.get('/settings');
                console.log('Global Settings Response:', settingsRes.data);
                if (settingsRes.data.data?.leaveSettings) {
                    globalSettings = settingsRes.data.data.leaveSettings;
                    console.log('Applied Global Settings:', globalSettings);
                }
            } catch (error) {
                console.error('Failed to fetch global settings', error);
            }

            // Fetch employee data for balance config
            let employeeBalance = { ...globalSettings }; // Default to global

            if (user?.employee?._id) {
                try {
                    const employeeRes = await api.get(`/employees/${user.employee._id}`);
                    if (employeeRes.data.data?.leaveBalance) {
                        employeeBalance = employeeRes.data.data.leaveBalance;
                    }
                } catch (error) {
                    console.error('Failed to fetch employee config', error);
                }
            }

            // Calculate Used based on Total - Remaining
            // We assume Total is at least what Global Settings says, or if Remaining is higher, then Total is Remaining (custom allocation)

            const calculateType = (typeKey, globalKey) => {
                const remaining = employeeBalance[typeKey] !== undefined ? employeeBalance[typeKey] : globalSettings[globalKey];
                const total = Math.max(globalSettings[globalKey], remaining);
                const used = total - remaining;
                return { used, total };
            };

            const casual = calculateType('casualLeave', 'casualLeave');
            const sick = calculateType('sickLeave', 'sickLeave');
            const earned = calculateType('earnedLeave', 'earnedLeave');
            const unpaid = calculateType('unpaidLeave', 'unpaidLeave');

            setLeaveBalance({
                casual,
                sick,
                earned,
                unpaid
            });

            const response = await api.get('/leaves');
            setLeaves(response.data.data);

        } catch (error) {
            console.error('Failed to fetch leaves:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await api.patch(`/leaves/${id}/status`, { status });
            showToast.success(`Leave ${status.toLowerCase()} successfully`);
            fetchLeaves();
        } catch (error) {
            console.error('Failed to update leave status', error);
            showToast.error('Failed to update leave status');
        }
    };

    const handleEditLeave = (leave) => {
        setSelectedLeave(leave);
        setIsEditModalOpen(true);
    };

    const columns = [
        {
            header: 'Employee',
            accessor: 'employee',
            render: (row) => row.employee ? `${row.employee.firstName} ${row.employee.lastName}` : 'Unknown'
        },
        { header: 'Type', accessor: 'type' },
        {
            header: 'From',
            accessor: 'startDate',
            render: (row) => new Date(row.startDate).toLocaleDateString()
        },
        {
            header: 'To',
            accessor: 'endDate',
            render: (row) => new Date(row.endDate).toLocaleDateString()
        },
        { header: 'Reason', accessor: 'reason' },
        {
            header: 'Status',
            accessor: 'status',
            render: (row) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Badge variant={row.status === 'Approved' ? 'success' : row.status === 'Rejected' ? 'error' : 'warning'}>
                        {row.status}
                    </Badge>
                    {isHR && row.status === 'Pending' && (
                        <div style={{ display: 'flex', gap: '4px' }}>
                            <button
                                onClick={() => handleStatusUpdate(row._id, 'Approved')}
                                style={{
                                    border: 'none',
                                    background: '#dcfce7',
                                    color: '#166534',
                                    borderRadius: '4px',
                                    padding: '4px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                                title="Approve"
                            >
                                <Check size={14} />
                            </button>
                            <button
                                onClick={() => handleStatusUpdate(row._id, 'Rejected')}
                                style={{
                                    border: 'none',
                                    background: '#fee2e2',
                                    color: '#991b1b',
                                    borderRadius: '4px',
                                    padding: '4px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                                title="Reject"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    )}
                </div>
            )
        },
        ...(isHR ? [{
            header: 'Actions',
            accessor: 'actions',
            render: (row) => (
                <button
                    onClick={() => handleEditLeave(row)}
                    style={{
                        border: 'none',
                        background: '#dbeafe',
                        color: '#1e40af',
                        borderRadius: '4px',
                        padding: '4px 8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.875rem'
                    }}
                    title="Edit Leave"
                >
                    <Edit2 size={14} />
                    Edit
                </button>
            )
        }] : [])
    ];

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Leave Management</h1>
                    <p className={styles.subtitle}>Apply for leave and manage approvals</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)}>
                    <Plus size={18} />
                    Apply Leave
                </Button>
            </div>

            {calendarConnected && (
                <Card title="Google Calendar Events" className={styles.calendarCard}>
                    <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                        <Calendar size={48} style={{ marginBottom: '10px', opacity: 0.5 }} />
                        <p>Your Google Calendar is synced. Events will appear here to help you plan your leave.</p>
                        <div style={{ marginTop: '20px', display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px' }}>
                            {/* Mock Events */}
                            {[1, 2, 3].map(i => (
                                <div key={i} style={{
                                    minWidth: '200px',
                                    padding: '10px',
                                    background: 'rgba(59, 130, 246, 0.1)',
                                    borderRadius: '8px',
                                    borderLeft: '4px solid #3B82F6',
                                    textAlign: 'left'
                                }}>
                                    <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Team Meeting</div>
                                    <div style={{ fontSize: '0.8rem', color: '#666' }}>10:00 AM - 11:00 AM</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>
            )}

            <Card title="Leave Requests">
                {loading ? <div>Loading...</div> : <DataTable columns={columns} data={leaves} />}
            </Card>

            <ApplyLeaveModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchLeaves}
                calendarConnected={calendarConnected}
            />

            <EditLeaveModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedLeave(null);
                }}
                onSuccess={fetchLeaves}
                leave={selectedLeave}
            />

            <EditLeaveBalanceModal
                isOpen={isBalanceModalOpen}
                onClose={() => setIsBalanceModalOpen(false)}
                onSuccess={fetchLeaves}
                isGlobal={true}
            />
        </div>
    );
};

export default Leave;
