import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import Modal from '../UI/Modal';
import Button from '../UI/Button';
import api from '../../services/api';
import styles from './ReportIncidentModal.module.css';

const ReportIncidentModal = ({ isOpen, onClose, onIncidentReported }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        severity: 'Medium',
        category: 'Security'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Create an audit log entry for the incident
            await api.post('/compliance/audit-logs', {
                action: `INCIDENT_REPORTED: ${formData.title}`,
                target: `${formData.category} - ${formData.severity}`,
                status: 'Success',
                metadata: {
                    description: formData.description,
                    severity: formData.severity,
                    category: formData.category,
                    reportedAt: new Date()
                }
            });

            // Reset form
            setFormData({
                title: '',
                description: '',
                severity: 'Medium',
                category: 'Security'
            });

            if (onIncidentReported) {
                onIncidentReported();
            }

            onClose();
        } catch (err) {
            setError(err.response?.data?.error?.message || 'Failed to report incident');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Report Incident">
            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.iconHeader}>
                    <AlertTriangle size={48} className={styles.icon} />
                    <p className={styles.description}>
                        Report a security incident, compliance violation, or other critical issue
                    </p>
                </div>

                {error && (
                    <div className={styles.error}>
                        {error}
                    </div>
                )}

                <div className={styles.formGroup}>
                    <label htmlFor="title" className={styles.label}>
                        Incident Title <span className={styles.required}>*</span>
                    </label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className={styles.input}
                        placeholder="Brief description of the incident"
                        required
                    />
                </div>

                <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                        <label htmlFor="category" className={styles.label}>
                            Category <span className={styles.required}>*</span>
                        </label>
                        <select
                            id="category"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className={styles.select}
                            required
                        >
                            <option value="Security">Security</option>
                            <option value="Privacy">Privacy</option>
                            <option value="Data Breach">Data Breach</option>
                            <option value="Policy Violation">Policy Violation</option>
                            <option value="Harassment">Harassment</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="severity" className={styles.label}>
                            Severity <span className={styles.required}>*</span>
                        </label>
                        <select
                            id="severity"
                            name="severity"
                            value={formData.severity}
                            onChange={handleChange}
                            className={styles.select}
                            required
                        >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                            <option value="Critical">Critical</option>
                        </select>
                    </div>
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="description" className={styles.label}>
                        Description <span className={styles.required}>*</span>
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className={styles.textarea}
                        placeholder="Provide detailed information about the incident..."
                        rows="5"
                        required
                    />
                </div>

                <div className={styles.actions}>
                    <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                        {loading ? 'Reporting...' : 'Report Incident'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default ReportIncidentModal;
