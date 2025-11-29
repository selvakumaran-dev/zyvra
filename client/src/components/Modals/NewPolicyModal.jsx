import React, { useState } from 'react';
import { FileText, X } from 'lucide-react';
import Modal from '../UI/Modal';
import Button from '../UI/Button';
import api from '../../services/api';
import styles from './NewPolicyModal.module.css';

const NewPolicyModal = ({ isOpen, onClose, onPolicyCreated }) => {
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        version: '1.0',
        status: 'Draft',
        effectiveDate: '',
        requiredAck: true
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await api.post('/compliance/policies', formData);

            // Reset form
            setFormData({
                title: '',
                content: '',
                version: '1.0',
                status: 'Draft',
                effectiveDate: '',
                requiredAck: true
            });

            if (onPolicyCreated) {
                onPolicyCreated();
            }

            onClose();
        } catch (err) {
            setError(err.response?.data?.error?.message || 'Failed to create policy');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create New Policy">
            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.iconHeader}>
                    <FileText size={48} className={styles.icon} />
                    <p className={styles.description}>
                        Create a new company policy for employees to review and acknowledge
                    </p>
                </div>

                {error && (
                    <div className={styles.error}>
                        {error}
                    </div>
                )}

                <div className={styles.formGroup}>
                    <label htmlFor="title" className={styles.label}>
                        Policy Title <span className={styles.required}>*</span>
                    </label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className={styles.input}
                        placeholder="e.g., Remote Work Policy"
                        required
                    />
                </div>

                <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                        <label htmlFor="version" className={styles.label}>
                            Version <span className={styles.required}>*</span>
                        </label>
                        <input
                            type="text"
                            id="version"
                            name="version"
                            value={formData.version}
                            onChange={handleChange}
                            className={styles.input}
                            placeholder="1.0"
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="status" className={styles.label}>
                            Status <span className={styles.required}>*</span>
                        </label>
                        <select
                            id="status"
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className={styles.select}
                            required
                        >
                            <option value="Draft">Draft</option>
                            <option value="Active">Active</option>
                            <option value="Archived">Archived</option>
                        </select>
                    </div>
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="effectiveDate" className={styles.label}>
                        Effective Date <span className={styles.required}>*</span>
                    </label>
                    <input
                        type="date"
                        id="effectiveDate"
                        name="effectiveDate"
                        value={formData.effectiveDate}
                        onChange={handleChange}
                        className={styles.input}
                        required
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="content" className={styles.label}>
                        Policy Content <span className={styles.required}>*</span>
                    </label>
                    <textarea
                        id="content"
                        name="content"
                        value={formData.content}
                        onChange={handleChange}
                        className={styles.textarea}
                        placeholder="Enter the full policy text here..."
                        rows="8"
                        required
                    />
                </div>

                <div className={styles.checkboxGroup}>
                    <input
                        type="checkbox"
                        id="requiredAck"
                        name="requiredAck"
                        checked={formData.requiredAck}
                        onChange={handleChange}
                        className={styles.checkbox}
                    />
                    <label htmlFor="requiredAck" className={styles.checkboxLabel}>
                        Require employee acknowledgement
                    </label>
                </div>

                <div className={styles.actions}>
                    <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                        {loading ? 'Creating...' : 'Create Policy'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default NewPolicyModal;
