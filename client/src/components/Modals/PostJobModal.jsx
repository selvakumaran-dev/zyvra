import React, { useState } from 'react';
import Modal from '../UI/Modal';
import Button from '../UI/Button';
import styles from './PostJobModal.module.css';
import api from '../../services/api';

const PostJobModal = ({ isOpen, onClose, onJobPosted }) => {
    const [formData, setFormData] = useState({
        title: '',
        department: '',
        location: '',
        type: 'Full-Time',
        description: '',
        salaryMin: '',
        salaryMax: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const payload = {
                ...formData,
                salaryRange: {
                    min: Number(formData.salaryMin),
                    max: Number(formData.salaryMax)
                }
            };

            await api.post('/recruitment/jobs', payload);
            onJobPosted();
            onClose();
            setFormData({
                title: '',
                department: '',
                location: '',
                type: 'Full-Time',
                description: '',
                salaryMin: '',
                salaryMax: ''
            });
        } catch (err) {
            setError(err.response?.data?.error?.message || 'Failed to post job');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Post New Job">
            <form onSubmit={handleSubmit} className={styles.form}>
                {error && <div className={styles.error}>{error}</div>}

                <div className={styles.group}>
                    <label className={styles.label}>Job Title</label>
                    <input
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        className={styles.input}
                        placeholder="e.g. Senior Frontend Engineer"
                    />
                </div>

                <div className={styles.row}>
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
                            <option value="Design">Design</option>
                        </select>
                    </div>
                    <div className={styles.group}>
                        <label className={styles.label}>Location</label>
                        <input
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            required
                            className={styles.input}
                            placeholder="e.g. New York / Remote"
                        />
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
                        </select>
                    </div>
                </div>

                <div className={styles.row}>
                    <div className={styles.group}>
                        <label className={styles.label}>Salary Min</label>
                        <input
                            type="number"
                            name="salaryMin"
                            value={formData.salaryMin}
                            onChange={handleChange}
                            className={styles.input}
                        />
                    </div>
                    <div className={styles.group}>
                        <label className={styles.label}>Salary Max</label>
                        <input
                            type="number"
                            name="salaryMax"
                            value={formData.salaryMax}
                            onChange={handleChange}
                            className={styles.input}
                        />
                    </div>
                </div>

                <div className={styles.group}>
                    <label className={styles.label}>Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className={styles.textarea}
                        rows={4}
                    />
                </div>

                <div className={styles.actions}>
                    <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button type="submit" disabled={loading}>
                        {loading ? 'Posting...' : 'Post Job'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default PostJobModal;
