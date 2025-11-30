import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import styles from './ResetConfirmModal.module.css';

const ResetConfirmModal = ({ isOpen, onClose, onConfirm, loading }) => {
    if (!isOpen) return null;

    return (
        <div
            className={styles.overlay}
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="reset-modal-title"
            aria-describedby="reset-modal-desc"
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
                    <AlertTriangle size={48} />
                </div>

                <h2 id="reset-modal-title" className={styles.title}>Reset Database</h2>
                <p className={styles.subtitle}>This action cannot be undone</p>

                <div id="reset-modal-desc" className={styles.warningBox}>
                    <h3>⚠️ Warning: Permanent Data Deletion</h3>
                    <p>This will permanently delete ALL data from the database except HR admin accounts.</p>
                </div>

                <div className={styles.deleteList}>
                    <h4>The following will be deleted:</h4>
                    <ul>
                        <li>All employees and user accounts</li>
                        <li>All attendance records</li>
                        <li>All leave applications</li>
                        <li>All payroll data</li>
                        <li>All performance reviews</li>
                        <li>All recruitment data (jobs, applicants)</li>
                        <li>All compliance records and policies</li>
                        <li>All documents and notifications</li>
                    </ul>
                </div>

                <div className={styles.preserveBox}>
                    <h4>✓ Will be preserved:</h4>
                    <p>HR admin account credentials only</p>
                </div>

                <div className={styles.actions}>
                    <button
                        className={styles.cancelButton}
                        onClick={onClose}
                        disabled={loading}
                        aria-label="Cancel reset"
                    >
                        Cancel
                    </button>
                    <button
                        className={styles.confirmButton}
                        onClick={onConfirm}
                        disabled={loading}
                        aria-label="Confirm database reset"
                    >
                        {loading ? 'Resetting...' : 'Yes, Reset Database'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResetConfirmModal;
