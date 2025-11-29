import React, { useState, useEffect } from 'react';
import Modal from '../UI/Modal';
import Button from '../UI/Button';
import api from '../../services/api';
import { showToast } from '../../utils/toast';

const EditLeaveBalanceModal = ({ isOpen, onClose, onSuccess, employee, isGlobal = false }) => {
    const [formData, setFormData] = useState({
        casualLeave: 12,
        sickLeave: 10,
        earnedLeave: 18,
        unpaidLeave: 0
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isGlobal) {
            fetchGlobalSettings();
        } else if (employee) {
            setFormData({
                casualLeave: employee.leaveBalance?.casualLeave || 12,
                sickLeave: employee.leaveBalance?.sickLeave || 10,
                earnedLeave: employee.leaveBalance?.earnedLeave || 18,
                unpaidLeave: employee.leaveBalance?.unpaidLeave || 0
            });
        }
    }, [employee, isGlobal, isOpen]);

    const fetchGlobalSettings = async () => {
        try {
            const response = await api.get('/settings');
            const settings = response.data.data?.leaveSettings;
            if (settings) {
                setFormData({
                    casualLeave: settings.casualLeave || 12,
                    sickLeave: settings.sickLeave || 10,
                    earnedLeave: settings.earnedLeave || 18,
                    unpaidLeave: settings.unpaidLeave || 0
                });
            }
        } catch (error) {
            console.error('Failed to fetch global settings', error);
        }
    };

    const handleChange = (e) => {
        const value = parseInt(e.target.value) || 0;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isGlobal) {
                await api.put('/settings', {
                    leaveSettings: formData
                });
                showToast.success('Global leave settings updated successfully');
            } else {
                await api.put(`/employees/${employee._id}`, {
                    leaveBalance: formData
                });
                showToast.success('Leave balance updated successfully');
            }
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Failed to update leave balance', error);
            showToast.error('Failed to update leave balance');
        } finally {
            setLoading(false);
        }
    };

    if (!isGlobal && !employee) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isGlobal ? "Edit Global Leave Settings" : "Edit Leave Balance"}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {!isGlobal && (
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Employee</label>
                        <input
                            type="text"
                            value={`${employee.firstName} ${employee.lastName}`}
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
                )}

                {isGlobal && (
                    <div style={{
                        padding: '12px',
                        backgroundColor: '#e0f2fe',
                        borderRadius: '6px',
                        color: '#0369a1',
                        fontSize: '0.9rem'
                    }}>
                        Note: Updating these values will set the default leave balance for all employees.
                    </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Casual Leave</label>
                        <input
                            type="number"
                            name="casualLeave"
                            value={formData.casualLeave}
                            onChange={handleChange}
                            min="0"
                            required
                            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Sick Leave</label>
                        <input
                            type="number"
                            name="sickLeave"
                            value={formData.sickLeave}
                            onChange={handleChange}
                            min="0"
                            required
                            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
                        />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Earned Leave</label>
                        <input
                            type="number"
                            name="earnedLeave"
                            value={formData.earnedLeave}
                            onChange={handleChange}
                            min="0"
                            required
                            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Unpaid Leave</label>
                        <input
                            type="number"
                            name="unpaidLeave"
                            value={formData.unpaidLeave}
                            onChange={handleChange}
                            min="0"
                            required
                            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                    <Button variant="secondary" onClick={onClose} type="button">Cancel</Button>
                    <Button type="submit" disabled={loading}>
                        {loading ? 'Updating...' : 'Update Settings'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default EditLeaveBalanceModal;
