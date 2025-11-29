import React, { useState, useEffect } from 'react';
import { Briefcase, Plus, Users, User, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Badge from '../../components/UI/Badge';
import PostJobModal from '../../components/Modals/PostJobModal';
import ApplyJobModal from '../../components/Modals/ApplyJobModal';
import JobApplicationsModal from '../../components/Modals/JobApplicationsModal';
import ApplicantProfileModal from '../../components/Modals/ApplicantProfileModal';
import api from '../../services/api';
import styles from './Recruitment.module.css';

const Recruitment = () => {
    const { user } = useAuth();
    const isApplicant = user?.role === 'Applicant';
    const isHR = user?.role === 'HR' || user?.role === 'ADMIN';

    const [isPostJobModalOpen, setIsPostJobModalOpen] = useState(false);
    const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
    const [isApplicationsModalOpen, setIsApplicationsModalOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

    const [selectedJob, setSelectedJob] = useState(null);
    const [selectedApplicantId, setSelectedApplicantId] = useState(null);

    const [jobs, setJobs] = useState([]);
    const [allApplicants, setAllApplicants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [applicationCounts, setApplicationCounts] = useState({});

    useEffect(() => {
        fetchJobs();
        if (isHR) {
            fetchAllApplicants();
        }
    }, [isHR]);

    useEffect(() => {
        if (isHR && jobs.length > 0) {
            fetchApplicationCounts();
        }
    }, [isHR, jobs]);

    const fetchJobs = async () => {
        try {
            const response = await api.get('/recruitment/jobs');
            setJobs(response.data.data);
        } catch (error) {
            console.error('Failed to fetch jobs:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAllApplicants = async () => {
        try {
            const response = await api.get('/recruitment/applicants');
            setAllApplicants(response.data.data);
        } catch (error) {
            console.error('Failed to fetch applicants:', error);
        }
    };

    const fetchApplicationCounts = async () => {
        const counts = {};
        for (const job of jobs) {
            try {
                const response = await api.get(`/recruitment/jobs/${job._id}/applications/count`);
                counts[job._id] = response.data.data.count;
            } catch (error) {
                console.error(`Failed to fetch count for job ${job._id}:`, error);
            }
        }
        setApplicationCounts(counts);
    };

    const handleApplyClick = (job) => {
        setSelectedJob(job);
        setIsApplyModalOpen(true);
    };

    const handleViewApplications = (job) => {
        setSelectedJob(job);
        setIsApplicationsModalOpen(true);
    };

    const handleViewProfile = (applicantId) => {
        setSelectedApplicantId(applicantId);
        setIsProfileModalOpen(true);
    };

    const handleApplicationSubmitted = () => {
        alert('Application submitted successfully!');
        if (isHR) fetchApplicationCounts();
    };

    const handleJobPosted = () => {
        fetchJobs();
    };

    const handleToggleJobStatus = async (jobId, currentStatus) => {
        try {
            const newStatus = currentStatus === 'Open' ? 'Closed' : 'Open';
            await api.put(`/recruitment/jobs/${jobId}`, { status: newStatus });
            fetchJobs();
        } catch (error) {
            console.error('Failed to update job status:', error);
            alert('Failed to update job status. Please try again.');
        }
    };

    const handleDeleteJob = async (jobId, jobTitle) => {
        if (!window.confirm(`Are you sure you want to delete the job "${jobTitle}"? This action cannot be undone.`)) {
            return;
        }

        try {
            await api.delete(`/recruitment/jobs/${jobId}`);
            fetchJobs();
            alert('Job deleted successfully!');
        } catch (error) {
            console.error('Failed to delete job:', error);
            alert('Failed to delete job. Please try again.');
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>
                        {isApplicant ? 'Job Opportunities' : 'Recruitment'}
                    </h1>
                    <p className={styles.subtitle}>
                        {isApplicant
                            ? 'Find your next dream job'
                            : 'Manage job postings and applications'}
                    </p>
                </div>
                {!isApplicant && (
                    <div className={styles.actions}>
                        <Button onClick={() => setIsPostJobModalOpen(true)}>
                            <Plus size={20} />
                            Post Job
                        </Button>
                    </div>
                )}
            </div>

            <div className={styles.jobsList}>
                {loading ? <div>Loading...</div> : jobs.map(job => (
                    <div key={job._id} className={styles.jobCard}>
                        <div className={styles.jobHeader}>
                            <div className={styles.jobIcon}>
                                <Briefcase size={20} />
                            </div>
                            <div className={styles.jobInfo}>
                                <div className={styles.titleRow}>
                                    <h3 className={styles.jobTitle}>{job.title}</h3>
                                    <Badge variant={job.status === 'Open' ? 'success' : 'secondary'}>
                                        {job.status}
                                    </Badge>
                                </div>
                                <p className={styles.jobMeta}>
                                    {job.department} • {job.location}
                                </p>
                            </div>
                        </div>

                        <div className={styles.jobFooter}>
                            {!isApplicant && (
                                <div className={styles.applicationCount}>
                                    <Users size={14} />
                                    <span>
                                        {applicationCounts[job._id] || 0} Applications
                                    </span>
                                </div>
                            )}

                            <div className={styles.actionButtons}>
                                {isApplicant && job.status === 'Open' && (
                                    <Button
                                        size="small"
                                        onClick={() => handleApplyClick(job)}
                                    >
                                        Apply Now
                                    </Button>
                                )}

                                {!isApplicant && (
                                    <>
                                        <Button
                                            size="small"
                                            variant={job.status === 'Open' ? 'ghost' : 'secondary'}
                                            onClick={() => handleToggleJobStatus(job._id, job.status)}
                                        >
                                            {job.status === 'Open' ? 'Close Job' : 'Reopen Job'}
                                        </Button>
                                        <button
                                            className={styles.deleteButton}
                                            onClick={() => handleDeleteJob(job._id, job.title)}
                                            title="Delete Job"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {!isApplicant && (
                <div className={styles.applicantsSection}>
                    <h2 className={styles.sectionTitle}>All Applicants</h2>
                    <div className={styles.applicantsTableContainer}>
                        <table className={styles.applicantsTable}>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Experience</th>
                                    <th>Applications</th>
                                    <th>Latest Application</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allApplicants.map(app => (
                                    <tr key={app._id} onClick={() => handleViewProfile(app._id)} className={styles.applicantRow}>
                                        <td className={styles.nameCell}>
                                            <div className={styles.avatarSmall}>
                                                <User size={16} />
                                            </div>
                                            {app.name}
                                        </td>
                                        <td>{app.email}</td>
                                        <td>{app.phone}</td>
                                        <td>{app.experience} Years</td>
                                        <td>
                                            <Badge variant="secondary">{app.applicationCount}</Badge>
                                        </td>
                                        <td>
                                            {app.latestApplicationDate ? new Date(app.latestApplicationDate).toLocaleDateString() : '-'}
                                        </td>
                                    </tr>
                                ))}
                                {allApplicants.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className={styles.emptyCell}>No applicants found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <PostJobModal
                isOpen={isPostJobModalOpen}
                onClose={() => setIsPostJobModalOpen(false)}
                onJobPosted={handleJobPosted}
            />

            <ApplyJobModal
                isOpen={isApplyModalOpen}
                onClose={() => setIsApplyModalOpen(false)}
                job={selectedJob}
                onApplicationSubmitted={handleApplicationSubmitted}
            />

            <JobApplicationsModal
                isOpen={isApplicationsModalOpen}
                onClose={() => setIsApplicationsModalOpen(false)}
                job={selectedJob}
            />

            <ApplicantProfileModal
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
                applicantId={selectedApplicantId}
                onDelete={fetchAllApplicants}
            />
        </div>
    );
};

export default Recruitment;
