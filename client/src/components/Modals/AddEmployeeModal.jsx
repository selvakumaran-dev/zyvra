import React, { useState } from 'react';
import Modal from '../UI/Modal';
import Button from '../UI/Button';
import styles from './AddEmployeeModal.module.css';
import api from '../../services/api';

const AddEmployeeModal = ({ isOpen, onClose, onEmployeeAdded }) => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        address: '',
        designation: '',
        department: '',
        type: 'Full-Time',
        salary: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData(prev => {
            const updated = { ...prev, [name]: value };

            // Auto-generate email when firstName changes
            if (name === 'firstName' && value) {
                updated.email = `${value.toLowerCase()}@zyvra.com`;
            }

            return updated;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await api.post('/employees', formData);
            onEmployeeAdded();
            onClose();
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                phoneNumber: '',
                address: '',
                designation: '',
                department: '',
                type: 'Full-Time',
                salary: ''
            });
        } catch (err) {
            setError(err.response?.data?.error?.message || 'Failed to add employee');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add New Employee">
            <form onSubmit={handleSubmit} className={styles.form}>
                {error && <div className={styles.error}>{error}</div>}

                <div className={styles.row}>
                    <div className={styles.group}>
                        <label className={styles.label}>First Name</label>
                        <input
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            required
                            className={styles.input}
                        />
                    </div>
                    <div className={styles.group}>
                        <label className={styles.label}>Last Name</label>
                        <input
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            required
                            className={styles.input}
                        />
                    </div>
                </div>

                <div className={styles.group}>
                    <label className={styles.label}>Email</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className={styles.input}
                        placeholder="Auto-generated from first name"
                        readOnly
                        style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed' }}
                    />
                </div>

                <div className={styles.row}>
                    <div className={styles.group}>
                        <label className={styles.label}>Phone Number</label>
                        <input
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            className={styles.input}
                            placeholder="+91 234 567 8900"
                        />
                    </div>
                    <div className={styles.group}>
                        <label className={styles.label}>Address</label>
                        <input
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            className={styles.input}
                            placeholder="123 Main St, City"
                        />
                    </div>
                </div>

                <div className={styles.row}>
                    <div className={styles.group}>
                        <label className={styles.label}>Designation</label>
                        <input
                            name="designation"
                            value={formData.designation}
                            onChange={handleChange}
                            required
                            className={styles.input}
                        />
                    </div>
                    <div className={styles.group}>
                        <label className={styles.label}>Department</label>
                        <select
                            name="department"
                            value={formData.department}
                            onChange={handleChange}
                            required
                            className={styles.select}
                        >
                            <option value="">Select Department</option>
                            <option value="Engineering">Engineering</option>
                            <option value="Sales">Sales</option>
                            <option value="Marketing">Marketing</option>
                            <option value="HR">HR</option>
                            <option value="Product">Product</option>
                        </select>
                    </div>
                </div>

                <div className={styles.row}>
                    <div className={styles.group}>
                        <label className={styles.label}>Employment Type</label>
                        <select
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            className={styles.select}
                        >
                            <option value="Full-Time">Full-Time</option>
                            <option value="Part-Time">Part-Time</option>
                            <option value="Contract">Contract</option>
                            <option value="Intern">Intern</option>
                        </select>
                    </div>
                    <div className={styles.group}>
                        <label className={styles.label}>Base Salary</label>
                        <input
                            type="number"
                            name="salary"
                            value={formData.salary}
                            onChange={handleChange}
                            className={styles.input}
                        />
                    </div>
                </div>

                <div className={styles.actions}>
                    <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button type="submit" disabled={loading}>
                        {loading ? 'Adding...' : 'Add Employee'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default AddEmployeeModal;
