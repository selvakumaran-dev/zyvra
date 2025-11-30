import React from 'react';
import { CheckCircle, X } from 'lucide-react';
import styles from './ResetSuccessModal.module.css';

const ResetSuccessModal = ({ isOpen, onClose, deletionStats }) => {
    if (!isOpen) return null;

    return (
        <div
            className={styles.overlay}
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="success-modal-title"
        >
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <button
                    className={styles.closeButton}
                    onClick={onClose}
                    aria-label="Close modal"
                >
                    <X size={20} />
                </button>

                <div className={styles.iconWrapper}>
                    <CheckCircle size={48} />
                </div>

                <h2 id="success-modal-title" className={styles.title}>Database Reset Successful!</h2>
                <p className={styles.subtitle}>All data has been permanently deleted</p>

                <div className={styles.statsBox}>
                    <h3>Deletion Summary</h3>
                    <div className={styles.statsGrid}>
                        <div className={styles.statItem}>
                            <span className={styles.statLabel}>Users</span>
                            <span className={styles.statValue}>{deletionStats?.users || 0}</span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statLabel}>Employees</span>
                            <span className={styles.statValue}>{deletionStats?.employees || 0}</span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statLabel}>Attendance</span>
                            <span className={styles.statValue}>{deletionStats?.attendance || 0}</span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statLabel}>Leaves</span>
                            <span className={styles.statValue}>{deletionStats?.leaves || 0}</span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statLabel}>Payroll</span>
                            <span className={styles.statValue}>{deletionStats?.payroll || 0}</span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statLabel}>Reviews</span>
                            <span className={styles.statValue}>{deletionStats?.reviews || 0}</span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statLabel}>Jobs</span>
                            <span className={styles.statValue}>{deletionStats?.jobs || 0}</span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statLabel}>Applicants</span>
                            <span className={styles.statValue}>{deletionStats?.applicants || 0}</span>
                        </div>
                    </div>
                </div>

                <div className={styles.preserveBox}>
                    <p>✓ HR Admin Account Preserved</p>
                </div>

                <button className={styles.closeBtn} onClick={onClose}>
                    Close
                </button>
            </div>
        </div>
    );
};

export default ResetSuccessModal;
