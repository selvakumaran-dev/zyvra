import React, { useState, useEffect } from 'react';
import Modal from '../UI/Modal';
import Button from '../UI/Button';
import styles from './RunPayrollModal.module.css';
import api from '../../services/api';

const RunPayrollModal = ({ isOpen, onClose, onPayrollRun }) => {
    const [employees, setEmployees] = useState([]);
    const [formData, setFormData] = useState({
        employee: '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        basicSalary: '',
        hra: '',
        transport: '',
        medical: '',
        tax: '',
        pf: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchEmployees();
        }
    }, [isOpen]);

    const fetchEmployees = async () => {
        try {
            const response = await api.get('/employees');
            setEmployees(response.data.data);
        } catch (error) {
            console.error('Failed to fetch employees', error);
        }
    };

    const calculateComponents = (basic) => {
        const basicSalary = Number(basic) || 0;
        return {
            hra: Math.round(basicSalary * 0.40), // 40% of Basic
            transport: 2000, // Fixed
            medical: 1250, // Fixed
            pf: Math.round(basicSalary * 0.12), // 12% of Basic
            tax: Math.round(basicSalary * 0.05) // 5% estimate
        };
    };

    const handleEmployeeChange = (e) => {
        const empId = e.target.value;
        const employee = employees.find(emp => emp._id === empId);

        if (employee) {
            const basic = employee.salary || 0;
            const components = calculateComponents(basic);

            setFormData(prev => ({
                ...prev,
                employee: empId,
                basicSalary: basic,
                ...components
            }));
        } else {
            setFormData(prev => ({ ...prev, employee: empId }));
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'basicSalary') {
            const components = calculateComponents(value);
            setFormData(prev => ({
                ...prev,
                [name]: value,
                ...components
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const payload = {
                employee: formData.employee,
                month: Number(formData.month),
                year: Number(formData.year),
                basicSalary: Number(formData.basicSalary),
                allowances: {
                    hra: Number(formData.hra || 0),
                    transport: Number(formData.transport || 0),
                    medical: Number(formData.medical || 0)
                },
                deductions: {
                    tax: Number(formData.tax || 0),
                    pf: Number(formData.pf || 0)
                },
                status: 'Paid',
                netPay: 0 // Calculated on backend
            };

            await api.post('/payroll', payload);
            onPayrollRun();
            onClose();
            // Reset form
            setFormData({
                employee: '',
                month: new Date().getMonth() + 1,
                year: new Date().getFullYear(),
                basicSalary: '',
                hra: '',
                transport: '',
                medical: '',
                tax: '',
                pf: ''
            });
        } catch (err) {
            setError(err.response?.data?.error?.message || 'Failed to run payroll');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Run Payroll">
            <form onSubmit={handleSubmit} className={styles.form}>
                {error && <div className={styles.error}>{error}</div>}

                <div className={styles.group}>
                    <label className={styles.label}>Select Employee</label>
                    <select
                        name="employee"
                        value={formData.employee}
                        onChange={handleChange}
                        required
                        className={styles.select}
                    >
                        <option value="">Select Employee</option>
                        {employees.map(emp => (
                            <option key={emp._id} value={emp._id}>
                                {emp.firstName} {emp.lastName} - {emp.designation}
                            </option>
                        ))}
                    </select>
                </div>

                <div className={styles.row}>
                    <div className={styles.group}>
                        <label className={styles.label}>Month</label>
                        <input
                            type="number"
                            name="month"
                            value={formData.month}
                            onChange={handleChange}
                            required
                            min="1"
                            max="12"
                            className={styles.input}
                        />
                    </div>
                    <div className={styles.group}>
                        <label className={styles.label}>Year</label>
                        <input
                            type="number"
                            name="year"
                            value={formData.year}
                            onChange={handleChange}
                            required
                            className={styles.input}
                        />
                    </div>
                </div>

                <div className={styles.sectionTitle}>Earnings</div>
                <div className={styles.row}>
                    <div className={styles.group}>
                        <label className={styles.label}>Basic Salary</label>
                        <input
                            type="number"
                            name="basicSalary"
                            value={formData.basicSalary}
                            onChange={handleChange}
                            required
                            className={styles.input}
                        />
                    </div>
                    <div className={styles.group}>
                        <label className={styles.label}>HRA</label>
                        <input
                            type="number"
                            name="hra"
                            value={formData.hra}
                            onChange={handleChange}
                            className={styles.input}
                        />
                    </div>
                </div>
                <div className={styles.row}>
                    <div className={styles.group}>
                        <label className={styles.label}>Transport</label>
                        <input
                            type="number"
                            name="transport"
                            value={formData.transport}
                            onChange={handleChange}
                            className={styles.input}
                        />
                    </div>
                    <div className={styles.group}>
                        <label className={styles.label}>Medical</label>
                        <input
                            type="number"
                            name="medical"
                            value={formData.medical}
                            onChange={handleChange}
                            className={styles.input}
                        />
                    </div>
                </div>

                <div className={styles.sectionTitle}>Deductions</div>
                <div className={styles.row}>
                    <div className={styles.group}>
                        <label className={styles.label}>Tax</label>
                        <input
                            type="number"
                            name="tax"
                            value={formData.tax}
                            onChange={handleChange}
                            className={styles.input}
                        />
                    </div>
                    <div className={styles.group}>
                        <label className={styles.label}>PF</label>
                        <input
                            type="number"
                            name="pf"
                            value={formData.pf}
                            onChange={handleChange}
                            className={styles.input}
                        />
                    </div>
                </div>

                <div className={styles.actions}>
                    <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button type="submit" disabled={loading}>
                        {loading ? 'Processing...' : 'Process Payroll'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default RunPayrollModal;
