import React, { useState, useEffect } from 'react';
import { Target } from 'lucide-react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Badge from '../../components/UI/Badge';
import CreateGoalModal from '../../components/Modals/CreateGoalModal';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import styles from './Performance.module.css';

const Performance = () => {
    const { isHR, user } = useAuth();
    const [goals, setGoals] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchData = async () => {
        try {
            // HR sees all goals, employees see only their own
            let goalsEndpoint = '/performance/goals';

            // Use employee ID, not user ID
            // user object structure: { _id: "USER_ID", employee: { _id: "EMPLOYEE_ID", ... } }
            const employeeId = user?.employee?._id || user?.employee;

            if (!isHR && employeeId) {
                goalsEndpoint = `/performance/goals/employee/${employeeId}`;
            }

            console.log('Performance Page - Fetching goals from:', goalsEndpoint);
            console.log('Performance Page - User object:', user);
            console.log('Performance Page - Employee ID:', employeeId);

            const [goalsRes, reviewsRes] = await Promise.all([
                api.get(goalsEndpoint),
                api.get('/performance/reviews')
            ]);

            console.log('Performance Page - Goals received:', goalsRes.data.data);

            setGoals(goalsRes.data.data || []);
            setReviews(reviewsRes.data.data || []);
        } catch (error) {
            console.error('Failed to fetch performance data:', error);
            console.error('User ID:', user?._id);
            console.error('Is HR:', isHR);
            setGoals([]);
            setReviews([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user || isHR) {
            fetchData();
        }
    }, [user, isHR]);

    const handleProgressUpdate = async (goalId, newProgress) => {
        const newStatus = newProgress === 100 ? 'Completed' :
            newProgress >= 50 ? 'In Progress' : 'At Risk';

        try {
            await api.patch(`/performance/goals/${goalId}/progress`, {
                progress: newProgress,
                status: newStatus
            });
            fetchData(); // Refresh the list
        } catch (error) {
            console.error('Failed to update progress:', error);
            alert('Failed to update progress');
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Performance</h1>
                    <p className={styles.subtitle}>Goals (OKRs) and Reviews</p>
                </div>
                <div className={styles.actions}>
                    <Button onClick={() => setIsModalOpen(true)}>
                        <Target size={18} />
                        New Goal
                    </Button>
                </div>
            </div>

            <div className={styles.grid}>
                <div className={styles.mainColumn}>
                    <h2 className={styles.sectionTitle}>Active Goals</h2>
                    <div className={styles.goalsList}>
                        {loading ? <div>Loading...</div> : goals.length === 0 ? <div>No active goals found.</div> : goals.map((goal) => (
                            <Card key={goal._id} className={styles.goalCard}>
                                <div className={styles.goalHeader}>
                                    <div className={styles.goalInfo}>
                                        <Badge variant={goal.type === 'Company' ? 'info' : 'default'}>{goal.type}</Badge>
                                        <h3 className={styles.goalTitle}>{goal.title}</h3>
                                        <div className={styles.goalMeta}>
                                            Owned by {goal.employee?.firstName} {goal.employee?.lastName} • Due {new Date(goal.dueDate).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div className={styles.goalStatus}>
                                        <Badge variant={
                                            goal.status === 'Completed' ? 'success' :
                                                goal.status === 'At Risk' || goal.status === 'Failed' ? 'error' :
                                                    'success'
                                        }>
                                            {goal.status}
                                        </Badge>
                                    </div>
                                </div>
                                <div className={styles.progressContainer}>
                                    <div className={styles.progressBar}>
                                        <div
                                            className={styles.progressFill}
                                            style={{ width: `${goal.progress}%`, backgroundColor: goal.status === 'At Risk' ? '#EF4444' : '#3B82F6' }}
                                        ></div>
                                    </div>
                                    <span className={styles.progressText}>{goal.progress}%</span>
                                </div>

                                {!isHR && (
                                    <div className={styles.goalActions}>
                                        <label className={styles.updateLabel}>Update Progress:</label>
                                        <select
                                            value={goal.progress}
                                            onChange={(e) => handleProgressUpdate(goal._id, Number(e.target.value))}
                                            className={styles.progressSelect}
                                        >
                                            <option value="0">0% - Not Started</option>
                                            <option value="25">25% - Started</option>
                                            <option value="50">50% - Halfway</option>
                                            <option value="75">75% - Almost Done</option>
                                            <option value="100">100% - Completed</option>
                                        </select>
                                    </div>
                                )}
                            </Card>
                        ))}
                    </div>
                </div>

                <div className={styles.sideColumn}>
                    {isHR && reviews.length > 0 && (
                        <Card title="Active Reviews">
                            <div className={styles.reviewStats}>
                                <div className={styles.statItem}>
                                    <div className={styles.statValue}>
                                        {reviews.filter(r => r.status === 'Submitted').length}
                                    </div>
                                    <div className={styles.statLabel}>Submitted</div>
                                </div>
                                <div className={styles.statItem}>
                                    <div className={styles.statValue}>
                                        {reviews.filter(r => r.status === 'Pending').length}
                                    </div>
                                    <div className={styles.statLabel}>Pending</div>
                                </div>
                            </div>
                            <div className={styles.reviewsList}>
                                {reviews
                                    .filter(r => r.status === 'Pending' || r.status === 'Submitted')
                                    .slice(0, 5)
                                    .map((review) => (
                                        <div key={review._id} className={styles.reviewItem}>
                                            <div className={styles.reviewInfo}>
                                                <div className={styles.reviewName}>
                                                    {review.employee?.firstName} {review.employee?.lastName}
                                                </div>
                                                <div className={styles.reviewType}>
                                                    {review.type} Review • {review.cycle}
                                                </div>
                                                <div className={styles.reviewDate}>
                                                    {new Date(review.createdAt).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </div>
                                            </div>
                                            <Badge variant={review.status === 'Pending' ? 'warning' : 'success'}>
                                                {review.status}
                                            </Badge>
                                        </div>
                                    ))}
                                {reviews.filter(r => r.status === 'Pending' || r.status === 'Submitted').length === 0 && (
                                    <div className={styles.emptyState}>
                                        No active reviews at this time
                                    </div>
                                )}
                            </div>
                            <div className={styles.cardAction}>
                                <Button variant="secondary" size="small" className={styles.fullWidth}>
                                    View All Reviews
                                </Button>
                            </div>
                        </Card>
                    )}
                </div>
            </div>

            <CreateGoalModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onGoalCreated={fetchData}
            />
        </div>
    );
};

export default Performance;
