import React, { useState } from 'react';
import Modal from '../UI/Modal';
import DataTable from '../UI/DataTable';
import Badge from '../UI/Badge';
import EmployeeDetailsModal from './EmployeeDetailsModal';
import styles from './RemovedEmployeesModal.module.css';

const RemovedEmployeesModal = ({ isOpen, onClose, employees }) => {
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

    const columns = [
        {
            header: 'Employee',
            accessor: 'firstName',
            render: (row) => (
                <div>
                    <div style={{ fontWeight: '500' }}>{row.firstName} {row.lastName}</div>
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>{row.email}</div>
                </div>
            )
        },
        {
            header: 'Role',
            accessor: 'designation',
            render: (row) => <div>{row.designation}</div>
        },
        {
            header: 'Department',
            accessor: 'department',
            render: (row) => <div>{row.department}</div>
        },
        {
            header: 'Status',
            accessor: 'status',
            render: (row) => <Badge variant="error">{row.status}</Badge>
        },
        {
            header: 'Joined',
            accessor: 'joiningDate',
            render: (row) => new Date(row.joiningDate).toLocaleDateString()
        },
        {
            header: 'Removed',
            accessor: 'updatedAt', // Assuming updated when terminated
            render: (row) => new Date(row.updatedAt).toLocaleDateString()
        }
    ];

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} title="Removed Employees" maxWidth="900px">
                <div className={styles.container}>
                    {employees.length === 0 ? (
                        <div className={styles.empty}>No removed employees found.</div>
                    ) : (
                        <DataTable
                            columns={columns}
                            data={employees}
                            onRowClick={(row) => {
                                setSelectedEmployee(row);
                                setIsDetailsModalOpen(true);
                            }}
                        />
                    )}
                </div>
            </Modal>

            <EmployeeDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={() => {
                    setIsDetailsModalOpen(false);
                    setSelectedEmployee(null);
                }}
                employee={selectedEmployee}
            />
        </>
    );
};

export default RemovedEmployeesModal;
