import React, { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';
import Modal from '../UI/Modal';
import Button from '../UI/Button';
import api from '../../services/api';
import styles from './ChangePasswordModal.module.css';

const ChangePasswordModal = ({ isOpen, onClose, onPasswordChanged }) => {
    const [formData, setFormData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPasswords, setShowPasswords] = useState({
        old: false,
        new: false,
        confirm: false
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError('');
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validate passwords match
        if (formData.newPassword !== formData.confirmPassword) {
            setError('New passwords do not match');
            return;
        }

        // Validate password length
        if (formData.newPassword.length < 6) {
            setError('New password must be at least 6 characters long');
            return;
        }

        setLoading(true);

        try {
            await api.post('/auth/change-password', {
                oldPassword: formData.oldPassword,
                newPassword: formData.newPassword
            });

            setSuccess(true);

            // Reset form
            setFormData({
                oldPassword: '',
                newPassword: '',
                confirmPassword: ''
            });

            if (onPasswordChanged) {
                onPasswordChanged();
            }

            // Close modal after 2 seconds
            setTimeout(() => {
                setSuccess(false);
                onClose();
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.error?.message || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Change Password">
            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.iconHeader}>
                    <Lock size={48} className={styles.icon} />
                    <p className={styles.description}>
                        Update your password to keep your account secure
                    </p>
                </div>

                {error && (
                    <div className={styles.error}>
                        {error}
                    </div>
                )}

                {success && (
                    <div className={styles.success}>
                        Password changed successfully!
                    </div>
                )}

                <div className={styles.formGroup}>
                    <label htmlFor="oldPassword" className={styles.label}>
                        Current Password <span className={styles.required}>*</span>
                    </label>
                    <div className={styles.passwordInput}>
                        <input
                            type={showPasswords.old ? 'text' : 'password'}
                            id="oldPassword"
                            name="oldPassword"
                            value={formData.oldPassword}
                            onChange={handleChange}
                            className={styles.input}
                            placeholder="Enter current password"
                            required
                            disabled={loading || success}
                        />
                        <button
                            type="button"
                            className={styles.eyeButton}
                            onClick={() => togglePasswordVisibility('old')}
                            tabIndex={-1}
                        >
                            {showPasswords.old ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="newPassword" className={styles.label}>
                        New Password <span className={styles.required}>*</span>
                    </label>
                    <div className={styles.passwordInput}>
                        <input
                            type={showPasswords.new ? 'text' : 'password'}
                            id="newPassword"
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleChange}
                            className={styles.input}
                            placeholder="Enter new password (min 6 characters)"
                            required
                            disabled={loading || success}
                        />
                        <button
                            type="button"
                            className={styles.eyeButton}
                            onClick={() => togglePasswordVisibility('new')}
                            tabIndex={-1}
                        >
                            {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="confirmPassword" className={styles.label}>
                        Confirm New Password <span className={styles.required}>*</span>
                    </label>
                    <div className={styles.passwordInput}>
                        <input
                            type={showPasswords.confirm ? 'text' : 'password'}
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className={styles.input}
                            placeholder="Re-enter new password"
                            required
                            disabled={loading || success}
                        />
                        <button
                            type="button"
                            className={styles.eyeButton}
                            onClick={() => togglePasswordVisibility('confirm')}
                            tabIndex={-1}
                        >
                            {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                <div className={styles.actions}>
                    <Button type="button" variant="ghost" onClick={onClose} disabled={loading || success}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={loading || success}>
                        {loading ? 'Changing...' : success ? 'Success!' : 'Change Password'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default ChangePasswordModal;
