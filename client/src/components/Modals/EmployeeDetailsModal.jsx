import React from 'react';
import { Mail, Phone, MapPin, Briefcase, Calendar, DollarSign, User } from 'lucide-react';
import Modal from '../UI/Modal';
import Badge from '../UI/Badge';
import styles from './EmployeeDetailsModal.module.css';

const EmployeeDetailsModal = ({ isOpen, onClose, employee }) => {
    if (!employee) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Employee Details" maxWidth="600px">
            <div className={styles.container}>
                <div className={styles.header}>
                    {employee.avatar ? (
                        <img
                            src={`http://localhost:5000${employee.avatar}`}
                            alt={`${employee.firstName} ${employee.lastName}`}
                            className={styles.avatarImage}
                        />
                    ) : (
                        <div className={styles.avatar}>
                            {employee.firstName.charAt(0)}
                        </div>
                    )}
                    <div className={styles.headerInfo}>
                        <h2 className={styles.name}>{employee.firstName} {employee.lastName}</h2>
                        <div className={styles.role}>{employee.designation}</div>
                        <Badge variant={employee.status === 'Active' ? 'success' : 'error'}>
                            {employee.status}
                        </Badge>
                    </div>
                </div>

                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>Contact Information</h3>
                    <div className={styles.grid}>
                        <div className={styles.item}>
                            <Mail size={18} className={styles.icon} />
                            <div>
                                <div className={styles.label}>Email</div>
                                <div className={styles.value}>{employee.email}</div>
                            </div>
                        </div>
                        <div className={styles.item}>
                            <Phone size={18} className={styles.icon} />
                            <div>
                                <div className={styles.label}>Phone</div>
                                <div className={styles.value}>{employee.phoneNumber || 'N/A'}</div>
                            </div>
                        </div>
                        <div className={styles.item}>
                            <MapPin size={18} className={styles.icon} />
                            <div>
                                <div className={styles.label}>Address</div>
                                <div className={styles.value}>{employee.address || 'N/A'}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>Employment Details</h3>
                    <div className={styles.grid}>
                        <div className={styles.item}>
                            <Briefcase size={18} className={styles.icon} />
                            <div>
                                <div className={styles.label}>Department</div>
                                <div className={styles.value}>{employee.department}</div>
                            </div>
                        </div>
                        <div className={styles.item}>
                            <User size={18} className={styles.icon} />
                            <div>
                                <div className={styles.label}>Type</div>
                                <div className={styles.value}>{employee.type}</div>
                            </div>
                        </div>
                        <div className={styles.item}>
                            <Calendar size={18} className={styles.icon} />
                            <div>
                                <div className={styles.label}>Joining Date</div>
                                <div className={styles.value}>{new Date(employee.joiningDate).toLocaleDateString()}</div>
                            </div>
                        </div>
                        <div className={styles.item}>
                            <DollarSign size={18} className={styles.icon} />
                            <div>
                                <div className={styles.label}>Salary</div>
                                <div className={styles.value}>${employee.salary?.toLocaleString() || 'N/A'}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default EmployeeDetailsModal;
