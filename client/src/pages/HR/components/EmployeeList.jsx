import React from 'react';
import { Search, CheckCircle } from 'lucide-react';
import styles from '../CreateEmployeeAccount.module.css';

const EmployeeList = ({
    loading,
    searchTerm,
    setSearchTerm,
    filteredEmployees,
    selectedEmployee,
    onSelectEmployee,
    getAccountStatus
}) => {
    const getAccountStatusBadge = (employeeId) => {
        const user = getAccountStatus(employeeId);
        if (!user) return null;

        const isActive = user.isActive !== false;
        return (
            <span style={{
                fontSize: '10px',
                marginLeft: '6px',
                background: isActive ? '#e0f2fe' : '#fee2e2',
                color: isActive ? '#0284c7' : '#991b1b',
                padding: '2px 6px',
                borderRadius: '4px'
            }}>
                {isActive ? 'Active' : 'Inactive'}
            </span>
        );
    };

    return (
        <div className={styles.leftPanel}>
            <div className={styles.searchBox}>
                <div className={styles.searchWrapper}>
                    <Search size={18} className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>
            </div>
            <div className={styles.employeeList}>
                {loading ? (
                    <div className={styles.loading}>Loading employees...</div>
                ) : filteredEmployees.length > 0 ? (
                    filteredEmployees.map(emp => {
                        const hasAccount = getAccountStatus(emp._id);
                        return (
                            <div
                                key={emp._id}
                                className={`${styles.employeeItem} ${selectedEmployee?._id === emp._id ? styles.selected : ''} ${hasAccount ? styles.hasAccount : ''}`}
                                onClick={() => onSelectEmployee(emp)}
                                style={{ opacity: hasAccount ? 0.7 : 1 }}
                            >
                                <div className={styles.avatar}>
                                    {emp.firstName.charAt(0)}
                                </div>
                                <div className={styles.empInfo}>
                                    <div className={styles.empName}>
                                        {emp.firstName} {emp.lastName}
                                        {getAccountStatusBadge(emp._id)}
                                    </div>
                                    <div className={styles.empRole}>{emp.designation}</div>
                                </div>
                                {selectedEmployee?._id === emp._id && (
                                    <CheckCircle size={18} className={styles.statusIcon} />
                                )}
                                {hasAccount && !selectedEmployee && (
                                    <CheckCircle size={16} color="#10b981" />
                                )}
                            </div>
                        );
                    })
                ) : (
                    <div className={styles.loading}>No employees found</div>
                )}
            </div>
        </div>
    );
};

export default EmployeeList;
