import React, { useState, useEffect } from 'react';
import { X, Target, TrendingUp } from 'lucide-react';
import Modal from '../UI/Modal';
import Badge from '../UI/Badge';
import Button from '../UI/Button';
import api from '../../services/api';
import styles from './EmployeePerformanceModal.module.css';

const EmployeePerformanceModal = ({ isOpen, onClose, employeeId, employeeName }) => {
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && employeeId) {
            fetchEmployeeGoals();
        }
    }, [isOpen, employeeId]);

    const fetchEmployeeGoals = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/performance/goals/employee/${employeeId}`);
            setGoals(response.data.data);
        } catch (error) {
            console.error('Failed to fetch employee goals:', error);
            setGoals([]);
        } finally {
            setLoading(false);
        }
    };

    const handleProgressUpdate = async (goalId, newProgress, newStatus) => {
        try {
            await api.patch(`/performance/goals/${goalId}/progress`, {
                progress: newProgress,
                status: newStatus
            });
            fetchEmployeeGoals(); // Refresh
        } catch (error) {
            console.error('Failed to update progress:', error);
            alert('Failed to update progress');
        }
    };

    const getStatusVariant = (status) => {
        switch (status) {
            case 'Completed': return 'success';
            case 'At Risk': return 'error';
            case 'In Progress': return 'info';
            default: return 'default';
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Performance - ${employeeName}`}>
            <div className={styles.container}>
                {loading ? (
                    <div className={styles.loading}>Loading goals...</div>
                ) : goals.length === 0 ? (
                    <div className={styles.empty}>
                        <Target size={48} color="#9CA3AF" />
                        <p>No goals assigned yet</p>
                    </div>
                ) : (
                    <div className={styles.goalsList}>
                        {goals.map((goal) => (
                            <div key={goal._id} className={styles.goalCard}>
                                <div className={styles.goalHeader}>
                                    <div className={styles.goalInfo}>
                                        <Badge variant={goal.type === 'Company' ? 'info' : 'default'}>
                                            {goal.type}
                                        </Badge>
                                        <h3 className={styles.goalTitle}>{goal.title}</h3>
                                        {goal.description && (
                                            <p className={styles.goalDescription}>{goal.description}</p>
                                        )}
                                        <div className={styles.goalMeta}>
                                            Due: {new Date(goal.dueDate).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <Badge variant={getStatusVariant(goal.status)}>
                                        {goal.status}
                                    </Badge>
                                </div>

                                <div className={styles.progressSection}>
                                    <div className={styles.progressBar}>
                                        <div
                                            className={styles.progressFill}
                                            style={{
                                                width: `${goal.progress}%`,
                                                backgroundColor: goal.status === 'At Risk' ? '#EF4444' : '#3B82F6'
                                            }}
                                        />
                                    </div>
                                    <span className={styles.progressText}>{goal.progress}%</span>
                                </div>

                                <div className={styles.actions}>
                                    <select
                                        value={goal.progress}
                                        onChange={(e) => {
                                            const newProgress = Number(e.target.value);
                                            const newStatus = newProgress === 100 ? 'Completed' :
                                                newProgress >= 50 ? 'In Progress' : 'At Risk';
                                            handleProgressUpdate(goal._id, newProgress, newStatus);
                                        }}
                                        className={styles.progressSelect}
                                    >
                                        <option value="0">0% - Not Started</option>
                                        <option value="25">25% - Started</option>
                                        <option value="50">50% - Halfway</option>
                                        <option value="75">75% - Almost Done</option>
                                        <option value="100">100% - Completed</option>
                                    </select>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default EmployeePerformanceModal;
