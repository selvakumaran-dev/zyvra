import React from 'react';
import { UserPlus, Mail, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import styles from '../CreateEmployeeAccount.module.css';

const CreateAccountForm = ({
    selectedEmployee,
    formData,
    setFormData,
    handleSubmit,
    message
}) => {
    return (
        <div className={styles.formCard}>
            <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Setup Account</h2>
                <p className={styles.cardSubtitle}>Configure login details for the selected employee</p>
            </div>

            <div className={styles.selectedUserPreview}>
                <div className={styles.previewAvatar}>
                    {selectedEmployee.firstName.charAt(0)}
                </div>
                <div className={styles.previewInfo}>
                    <h3>{selectedEmployee.firstName} {selectedEmployee.lastName}</h3>
                    <p>{selectedEmployee.designation} • {selectedEmployee.department}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
                {message.text && (
                    <div className={`${styles.message} ${styles[message.type]}`}>
                        {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                        {message.text}
                    </div>
                )}

                <div className={styles.formGroup}>
                    <label>Email Address</label>
                    <div className={styles.inputWrapper}>
                        <Mail size={18} className={styles.inputIcon} />
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className={styles.input}
                            required
                        />
                    </div>
                </div>

                <div className={styles.formGroup}>
                    <label>Password</label>
                    <div className={styles.passwordGroup}>
                        <div className={styles.inputWrapper} style={{ flex: 1 }}>
                            <Lock size={18} className={styles.inputIcon} />
                            <input
                                type="text"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className={styles.input}
                                required
                            />
                        </div>
                    </div>
                    <p className={styles.helperText}>
                        Default password set. Securely share this with the employee.
                    </p>
                </div>

                <button type="submit" className={styles.submitBtn}>
                    <UserPlus size={20} />
                    Create Account
                </button>
            </form>
        </div>
    );
};

export default CreateAccountForm;
