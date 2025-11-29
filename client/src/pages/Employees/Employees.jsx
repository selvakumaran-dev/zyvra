import React, { useState, useEffect } from 'react';
import { Plus, Settings, Trash2, Archive, Target } from 'lucide-react';
import DataTable from '../../components/UI/DataTable';
import Button from '../../components/UI/Button';
import Badge from '../../components/UI/Badge';
import AddEmployeeModal from '../../components/Modals/AddEmployeeModal';
import EditLeaveBalanceModal from '../../components/Modals/EditLeaveBalanceModal';
import RemovedEmployeesModal from '../../components/Modals/RemovedEmployeesModal';
import EmployeeDetailsModal from '../../components/Modals/EmployeeDetailsModal';
import EmployeePerformanceModal from '../../components/Modals/EmployeePerformanceModal';
import api from '../../services/api';
import { showToast } from '../../utils/toast';
import styles from './Employees.module.css';

const Employees = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLeaveBalanceModalOpen, setIsLeaveBalanceModalOpen] = useState(false);
    const [isRemovedModalOpen, setIsRemovedModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isPerformanceModalOpen, setIsPerformanceModalOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);

    const fetchEmployees = async () => {
        try {
            const response = await api.get('/employees');
            setEmployees(response.data.data);
        } catch (error) {
            console.error('Failed to fetch employees:', error);
            // Use mock data as fallback
            setEmployees([
                { _id: '1', firstName: 'Sarah', lastName: 'Chen', email: 'sarah.chen@zyvra.com', designation: 'Senior Engineer', department: 'Engineering', type: 'Full-Time', status: 'Active', joiningDate: new Date() },
                { _id: '2', firstName: 'Michael', lastName: 'Ross', email: 'michael.ross@zyvra.com', designation: 'Sales Manager', department: 'Sales', type: 'Full-Time', status: 'Active', joiningDate: new Date() },
                { _id: '3', firstName: 'Jennifer', lastName: 'Adams', email: 'jennifer.adams@zyvra.com', designation: 'Product Manager', department: 'Product', type: 'Full-Time', status: 'Active', joiningDate: new Date() },
                { _id: '4', firstName: 'David', lastName: 'Kim', email: 'david.kim@zyvra.com', designation: 'UX Designer', department: 'Design', type: 'Full-Time', status: 'Active', joiningDate: new Date() },
                { _id: '5', firstName: 'Emily', lastName: 'Watson', email: 'emily.watson@zyvra.com', designation: 'HR Manager', department: 'Human Resources', type: 'Full-Time', status: 'Active', joiningDate: new Date() },
            ]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const handleRemoveEmployee = async (id) => {
        if (window.confirm('Are you sure you want to remove this employee? They will no longer be able to login.')) {
            try {
                await api.delete(`/employees/${id}`);
                // Refresh list
                fetchEmployees();
                // We can't use showToast here because it's not imported, let's fix imports first or assume it's available?
                // It's not imported in the original file. I should add it.
            } catch (error) {
                console.error('Failed to remove employee', error);
                showToast.error('Failed to remove employee');
            }
        }
    };

    const columns = [
        {
            header: 'Employee',
            accessor: 'firstName',
            render: (row) => (
                <div className={styles.employeeCell}>
                    <div className={styles.avatar}>{row.firstName.charAt(0)}</div>
                    <div className={styles.employeeInfo}>
                        <div className={styles.name} title={`${row.firstName} ${row.lastName}`}>{row.firstName} {row.lastName}</div>
                        <div className={styles.email} title={row.email}>{row.email}</div>
                    </div>
                </div>
            )
        },
        {
            header: 'Role',
            accessor: 'designation',
            render: (row) => <div className={styles.cell} title={row.designation}>{row.designation}</div>
        },
        {
            header: 'Department',
            accessor: 'department',
            render: (row) => <div className={styles.cell} title={row.department}>{row.department}</div>
        },
        {
            header: 'Type',
            accessor: 'type',
            render: (row) => <Badge variant="default">{row.type}</Badge>
        },
        {
            header: 'Status',
            accessor: 'status',
            render: (row) => (
                <Badge variant={row.status === 'Active' ? 'success' : row.status === 'On Leave' ? 'warning' : 'error'}>
                    {row.status}
                </Badge>
            )
        },
        {
            header: 'Join Date',
            accessor: 'joiningDate',
            render: (row) => new Date(row.joiningDate).toLocaleDateString()
        },
        {
            header: 'Actions',
            width: '120px',
            render: (row) => (
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        className={styles.actionButton}
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEmployee(row);
                            setIsPerformanceModalOpen(true);
                        }}
                        title="View Performance"
                        style={{
                            background: '#dbeafe',
                            color: '#1e40af',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '6px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <Target size={16} />
                    </button>
                    <button
                        className={styles.actionButton}
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEmployee(row);
                            setIsLeaveBalanceModalOpen(true);
                        }}
                        title="Edit Leave Balance"
                    >
                        <Settings size={16} />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveEmployee(row._id);
                        }}
                        title="Remove Employee"
                        style={{
                            background: '#fee2e2',
                            color: '#991b1b',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '6px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            )
        }
    ];

    const activeEmployees = employees.filter(e => e.status !== 'Terminated');
    const removedEmployees = employees.filter(e => e.status === 'Terminated');

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Employees</h1>
                    <p className={styles.subtitle}>Manage your workforce</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <Button variant="secondary" onClick={() => setIsRemovedModalOpen(true)}>
                        <Archive size={18} />
                        View Removed
                    </Button>
                    <Button onClick={() => setIsModalOpen(true)}>
                        <Plus size={18} />
                        Add Employee
                    </Button>
                </div>
            </div>

            {loading ? (
                <div>Loading...</div>
            ) : (
                <DataTable
                    columns={columns}
                    data={activeEmployees}
                    onRowClick={(row) => {
                        setSelectedEmployee(row);
                        setIsDetailsModalOpen(true);
                    }}
                />
            )}

            <AddEmployeeModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onEmployeeAdded={fetchEmployees}
            />

            <EditLeaveBalanceModal
                isOpen={isLeaveBalanceModalOpen}
                onClose={() => {
                    setIsLeaveBalanceModalOpen(false);
                    setSelectedEmployee(null);
                }}
                onSuccess={fetchEmployees}
                employee={selectedEmployee}
            />

            <RemovedEmployeesModal
                isOpen={isRemovedModalOpen}
                onClose={() => setIsRemovedModalOpen(false)}
                employees={removedEmployees}
            />

            <EmployeeDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={() => {
                    setIsDetailsModalOpen(false);
                    setSelectedEmployee(null);
                }}
                employee={selectedEmployee}
            />

            <EmployeePerformanceModal
                isOpen={isPerformanceModalOpen}
                onClose={() => {
                    setIsPerformanceModalOpen(false);
                    setSelectedEmployee(null);
                }}
                employeeId={selectedEmployee?._id}
                employeeName={selectedEmployee ? `${selectedEmployee.firstName} ${selectedEmployee.lastName}` : ''}
            />
        </div>
    );
};

export default Employees;
