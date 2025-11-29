import React, { useState, useEffect } from 'react';
import Modal from '../UI/Modal';
import Button from '../UI/Button';
import styles from './CreateGoalModal.module.css';
import api from '../../services/api';

const CreateGoalModal = ({ isOpen, onClose, onGoalCreated }) => {
    const [employees, setEmployees] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        employees: [],
        type: 'Individual',
        dueDate: '',
        status: 'Not Started'
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
            // Filter out terminated employees
            const activeEmployees = response.data.data.filter(emp => emp.status !== 'Terminated');
            setEmployees(activeEmployees);
        } catch (error) {
            console.error('Failed to fetch employees', error);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleEmployeeChange = (e) => {
        const options = e.target.options;
        const selected = [];
        for (let i = 0; i < options.length; i++) {
            if (options[i].selected) {
                selected.push(options[i].value);
            }
        }
        setFormData({ ...formData, employees: selected });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // For Team goals, create one goal per employee with shared teamId
            if (formData.type === 'Team' && formData.employees.length > 0) {
                const teamId = `team_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                await Promise.all(
                    formData.employees.map(employeeId =>
                        api.post('/performance/goals', {
                            ...formData,
                            employee: employeeId,
                            teamId
                        })
                    )
                );
            } else if (formData.employees.length > 0) {
                // Individual goal - use first selected employee
                await api.post('/performance/goals', {
                    ...formData,
                    employee: formData.employees[0]
                });
            }
            onGoalCreated();
            onClose();
            setFormData({
                title: '',
                description: '',
                employees: [],
                type: 'Individual',
                dueDate: '',
                status: 'Not Started'
            });
        } catch (err) {
            setError(err.response?.data?.error?.message || 'Failed to create goal');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create New Goal">
            <form onSubmit={handleSubmit} className={styles.form}>
                {error && <div className={styles.error}>{error}</div>}

                <div className={styles.group}>
                    <label className={styles.label}>Goal Title</label>
                    <input
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        className={styles.input}
                        placeholder="e.g. Complete Cloud Certification"
                    />
                </div>

                <div className={styles.row}>
                    <div className={styles.group}>
                        <label className={styles.label}>
                            {formData.type === 'Team' ? 'Team Members (Hold Ctrl/Cmd to select multiple)' : 'Owner (Employee)'}
                        </label>
                        <select
                            name="employees"
                            value={formData.employees}
                            onChange={handleEmployeeChange}
                            required
                            multiple={formData.type === 'Team'}
                            className={styles.select}
                            style={{ height: formData.type === 'Team' ? '120px' : 'auto' }}
                        >
                            {employees.map(emp => (
                                <option key={emp._id} value={emp._id}>
                                    {emp.firstName} {emp.lastName}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className={styles.group}>
                        <label className={styles.label}>Type</label>
                        <select
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            className={styles.select}
                        >
                            <option value="Individual">Individual</option>
                            <option value="Team">Team</option>
                        </select>
                    </div>
                </div>

                <div className={styles.row}>
                    <div className={styles.group}>
                        <label className={styles.label}>Due Date</label>
                        <input
                            type="date"
                            name="dueDate"
                            value={formData.dueDate}
                            onChange={handleChange}
                            required
                            className={styles.input}
                        />
                    </div>
                    <div className={styles.group}>
                        <label className={styles.label}>Status</label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className={styles.select}
                        >
                            <option value="Not Started">Not Started</option>
                            <option value="In Progress">In Progress</option>
                            <option value="At Risk">At Risk</option>
                            <option value="Completed">Completed</option>
                        </select>
                    </div>
                </div>

                <div className={styles.group}>
                    <label className={styles.label}>Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className={styles.textarea}
                        rows={3}
                    />
                </div>

                <div className={styles.actions}>
                    <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button type="submit" disabled={loading}>
                        {loading ? 'Creating...' : 'Create Goal'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default CreateGoalModal;
