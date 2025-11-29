import React, { useState, useEffect } from 'react';
import Modal from '../UI/Modal';
import Button from '../UI/Button';
import api from '../../services/api';
import { showToast } from '../../utils/toast';

const EditLeaveModal = ({ isOpen, onClose, onSuccess, leave }) => {
    const [formData, setFormData] = useState({
        type: '',
        startDate: '',
        endDate: '',
        reason: '',
        status: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (leave) {
            setFormData({
                type: leave.type || '',
                startDate: leave.startDate ? new Date(leave.startDate).toISOString().split('T')[0] : '',
                endDate: leave.endDate ? new Date(leave.endDate).toISOString().split('T')[0] : '',
                reason: leave.reason || '',
                status: leave.status || 'Pending'
            });
        }
    }, [leave]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.patch(`/leaves/${leave._id}`, formData);
            showToast.success('Leave updated successfully');
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Failed to update leave', error);
            showToast.error('Failed to update leave');
        } finally {
            setLoading(false);
        }
    };

    if (!leave) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Leave Request">
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Employee</label>
                    <input
                        type="text"
                        value={leave.employee ? `${leave.employee.firstName} ${leave.employee.lastName}` : 'Unknown'}
                        disabled
                        style={{
                            width: '100%',
                            padding: '8px',
                            borderRadius: '6px',
                            border: '1px solid #ccc',
                            backgroundColor: '#f5f5f5',
                            color: '#666'
                        }}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Leave Type</label>
                    <select
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        required
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

                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Status</label>
                    <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        required
                        style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
                    >
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                    </select>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                    <Button variant="secondary" onClick={onClose} type="button">Cancel</Button>
                    <Button type="submit" disabled={loading}>
                        {loading ? 'Updating...' : 'Update Leave'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default EditLeaveModal;
