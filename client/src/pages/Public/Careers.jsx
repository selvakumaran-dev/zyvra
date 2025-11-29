import React, { useState, useEffect } from 'react';
import { Briefcase, MapPin, Clock, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import ApplyJobModal from '../../components/Modals/ApplyJobModal';
import styles from './Careers.module.css';

const Careers = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedJob, setSelectedJob] = useState(null);
    const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const response = await api.get('/recruitment/public/jobs');
            setJobs(response.data.data);
        } catch (error) {
            console.error('Failed to fetch jobs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApplyClick = (job) => {
        setSelectedJob(job);
        setIsApplyModalOpen(true);
    };

    const handleApplicationSubmitted = () => {
        alert('Application submitted successfully! We will review your application and get back to you soon.');
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <Link to="/login" className={styles.backLink}>
                        <ArrowLeft size={20} />
                        Back to Login
                    </Link>
                    <h1 className={styles.title}>Join Our Team</h1>
                    <p className={styles.subtitle}>Explore exciting opportunities and build your career with us.</p>
                </div>
            </header>

            <main className={styles.main}>
                {loading ? (
                    <div className={styles.loading}>Loading jobs...</div>
                ) : jobs.length === 0 ? (
                    <div className={styles.empty}>
                        <Briefcase size={48} />
                        <p>No open positions at the moment. Please check back later.</p>
                    </div>
                ) : (
                    <div className={styles.grid}>
                        {jobs.map(job => (
                            <div key={job._id} className={styles.card}>
                                <div className={styles.cardHeader}>
                                    <div className={styles.icon}>
                                        <Briefcase size={24} />
                                    </div>
                                    <span className={styles.badge}>{job.type}</span>
                                </div>
                                <h3 className={styles.jobTitle}>{job.title}</h3>
                                <div className={styles.meta}>
                                    <span className={styles.metaItem}>
                                        <Briefcase size={16} />
                                        {job.department}
                                    </span>
                                    <span className={styles.metaItem}>
                                        <MapPin size={16} />
                                        {job.location}
                                    </span>
                                </div>
                                <p className={styles.description}>
                                    {job.description.substring(0, 120)}...
                                </p>
                                <button
                                    className={styles.applyButton}
                                    onClick={() => handleApplyClick(job)}
                                >
                                    Apply Now
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <ApplyJobModal
                isOpen={isApplyModalOpen}
                onClose={() => setIsApplyModalOpen(false)}
                job={selectedJob}
                onApplicationSubmitted={handleApplicationSubmitted}
                isPublic={true}
            />
        </div>
    );
};

export default Careers;
