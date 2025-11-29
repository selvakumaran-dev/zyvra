import React, { useState } from 'react';
import Modal from '../UI/Modal';
import Button from '../UI/Button';
import api from '../../services/api';
import { showToast } from '../../utils/toast';

const ApplyLeaveModal = ({ isOpen, onClose, onSuccess, calendarConnected }) => {
    const [formData, setFormData] = useState({
        type: 'Casual Leave',
        startDate: '',
        endDate: '',
        reason: ''
    });
    const [loading, setLoading] = useState(false);
    const [duration, setDuration] = useState(0);

    const calculateDuration = (start, end) => {
        if (!start || !end) return 0;
        const startDate = new Date(start);
        const endDate = new Date(end);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return 0;
        if (endDate < startDate) return 0;

        const diffTime = Math.abs(endDate - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return diffDays;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        const updatedFormData = { ...formData, [name]: value };
        setFormData(updatedFormData);

        if (name === 'startDate' || name === 'endDate') {
            const days = calculateDuration(
                name === 'startDate' ? value : formData.startDate,
                name === 'endDate' ? value : formData.endDate
            );
            setDuration(days);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/leaves', formData);
            showToast.success('Leave application submitted successfully');
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Failed to apply leave', error);
            showToast.error('Failed to submit leave application');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Apply for Leave">
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {calendarConnected && (
                    <div style={{
                        background: '#eff6ff',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        fontSize: '0.875rem',
                        color: '#1e40af',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <span>📅</span>
                        <span>Google Calendar connected. We'll check for conflicts automatically.</span>
                    </div>
                )}

                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Leave Type</label>
                    <select
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
                    >
                        <option value="Casual Leave">Casual Leave</option>
                        <option value="Sick Leave">Sick Leave</option>
                        <option value="Earned Leave">Earned Leave</option>
                        <option value="Unpaid Leave">Unpaid Leave</option>
                    </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Start Date</label>
                        <input
                            type="date"
                            name="startDate"
                            value={formData.startDate}
                            onChange={handleChange}
                            required
                            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>End Date</label>
                        <input
                            type="date"
                            name="endDate"
                            value={formData.endDate}
                            onChange={handleChange}
                            required
                            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
                        />
                    </div>
                </div>

                {duration > 0 && (
                    <div style={{
                        textAlign: 'center',
                        padding: '8px',
                        background: '#f3f4f6',
                        borderRadius: '6px',
                        fontWeight: 500
                    }}>
                        Total Duration: <span style={{ color: '#2563eb' }}>{duration} days</span>
                    </div>
                )}

                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Reason</label>
                    <textarea
                        name="reason"
                        value={formData.reason}
                        onChange={handleChange}
                        required
                        rows="3"
                        style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
                    />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                    <Button variant="secondary" onClick={onClose} type="button">Cancel</Button>
                    <Button type="submit" disabled={loading}>
                        {loading ? 'Submitting...' : 'Submit Application'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default ApplyLeaveModal;
