import React, { useState, useEffect } from 'react';
import { UserPlus, Search, Mail, Lock, CheckCircle, AlertCircle, User, Copy, Download, ArrowRight } from 'lucide-react';
import api from '../../services/api';
import styles from './CreateEmployeeAccount.module.css';

const CreateEmployeeAccount = () => {
    const [employees, setEmployees] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [message, setMessage] = useState({ type: '', text: '' });
    const [createdAccount, setCreatedAccount] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [empRes, userRes] = await Promise.all([
                api.get('/employees'),
                api.get('/auth/users')
            ]);
            setEmployees(empRes.data.data);
            setUsers(userRes.data.data);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectEmployee = (employee) => {
        // Check if user already exists
        const existingUser = users.find(u => u.employee?._id === employee._id);
        if (existingUser) {
            alert(`Account already exists for ${employee.firstName} ${employee.lastName} (${existingUser.email})`);
            return;
        }

        setSelectedEmployee(employee);
        setFormData({
            email: employee.email,
            password: 'password123'
        });
        setMessage({ type: '', text: '' });
        setCreatedAccount(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedEmployee) return;

        try {
            await api.post('/auth/register', {
                email: formData.email,
                password: formData.password,
                employeeId: selectedEmployee._id
            });

            // Show success view with credentials
            setCreatedAccount({
                name: `${selectedEmployee.firstName} ${selectedEmployee.lastName}`,
                email: formData.email,
                password: formData.password
            });

            setMessage({ type: '', text: '' });

            // Refresh list
            fetchData();
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.error?.message || 'Failed to create account'
            });
        }
    };

    const handleCopyCredentials = () => {
        if (!createdAccount) return;
        const text = `Zyvra HRMS Login\nName: ${createdAccount.name}\nEmail: ${createdAccount.email}\nPassword: ${createdAccount.password}`;
        navigator.clipboard.writeText(text);
        alert('Credentials copied to clipboard!');
    };

    const handleDownloadCredentials = () => {
        if (!createdAccount) return;
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

    const handleDone = () => {
        setCreatedAccount(null);
        setSelectedEmployee(null);
        setFormData({ email: '', password: '' });
    };

    const filteredEmployees = employees.filter(emp =>
        // Only show active employees (not terminated)
        emp.status !== 'Terminated' &&
        (emp.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const getAccountStatus = (employeeId) => {
        return users.find(u => u.employee?._id === employeeId);
    };

    const getAccountStatusBadge = (employeeId) => {
        const user = getAccountStatus(employeeId);
        if (!user) return null;

        const isActive = user.isActive !== false; // Default to true if undefined
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
        <div className={styles.page}>
            <div className={styles.header}>
                <h1 className={styles.title}>Create Employee Account</h1>
                <p className={styles.subtitle}>Generate secure login credentials for your workforce</p>
            </div>

            <div className={styles.content}>
                {/* Left Panel - Employee List */}
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
                                        onClick={() => handleSelectEmployee(emp)}
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

                {/* Right Panel - Form or Success View */}
                <div className={styles.rightPanel}>
                    {createdAccount ? (
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

                            <button onClick={handleDone} className={styles.doneBtn}>
                                Done & Create Another <ArrowRight size={18} />
                            </button>
                        </div>
                    ) : selectedEmployee ? (
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
                    ) : (
                        <div className={styles.placeholder}>
                            <div className={styles.placeholderIcon}>
                                <User size={40} />
                            </div>
                            <h3>Select an Employee</h3>
                            <p>Choose an employee from the list on the left to generate their login credentials and set up their account access.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreateEmployeeAccount;
