import React from 'react';
import { CheckCircle, Copy, Download, ArrowRight } from 'lucide-react';
import styles from '../CreateEmployeeAccount.module.css';

const AccountSuccessView = ({ createdAccount, onDone }) => {
    const handleCopyCredentials = () => {
        const text = `Zyvra HRMS Login\nName: ${createdAccount.name}\nEmail: ${createdAccount.email}\nPassword: ${createdAccount.password}`;
        navigator.clipboard.writeText(text);
        alert('Credentials copied to clipboard!');
    };

    const handleDownloadCredentials = () => {
        const text = `Zyvra HRMS Login Credentials\n\nName: ${createdAccount.name}\nEmail: ${createdAccount.email}\nPassword: ${createdAccount.password}\n\nPlease change your password after your first login.`;
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `credentials-${createdAccount.name.replace(/\s+/g, '-').toLowerCase()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className={styles.successCard}>
            <div className={styles.successHeader}>
                <div className={styles.successIcon}>
                    <CheckCircle size={48} />
                </div>
                <h2 className={styles.successTitle}>Account Created!</h2>
                <p className={styles.successSubtitle}>
                    Login credentials for <strong>{createdAccount.name}</strong> have been generated.
                </p>
            </div>

            <div className={styles.credentialsBox}>
                <div className={styles.credentialRow}>
                    <span className={styles.credentialLabel}>Email</span>
                    <span className={styles.credentialValue}>{createdAccount.email}</span>
                </div>
                <div className={styles.credentialRow}>
                    <span className={styles.credentialLabel}>Password</span>
                    <span className={styles.credentialValuePassword}>{createdAccount.password}</span>
                </div>
            </div>

            <div className={styles.actionButtons}>
                <button onClick={handleCopyCredentials} className={styles.actionBtn}>
                    <Copy size={18} /> Copy
                </button>
                <button onClick={handleDownloadCredentials} className={styles.actionBtn}>
                    <Download size={18} /> Download
                </button>
            </div>

            <button onClick={onDone} className={styles.doneBtn}>
                Done & Create Another <ArrowRight size={18} />
            </button>
        </div>
    );
};

export default AccountSuccessView;
