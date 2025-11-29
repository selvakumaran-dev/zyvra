import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, Lock, Mail, Phone } from 'lucide-react';
import styles from './Login.module.css';

const Register = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        setLoading(true);

        try {
            await register(formData);
            navigate('/'); // Redirect to dashboard after successful registration
        } catch (err) {
            setError(err.response?.data?.error?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.loginWrapper}>
                {/* Left Side - Welcome Section */}
                <div className={styles.leftSide}>
                    <div className={styles.circle1}></div>
                    <div className={styles.circle2}></div>
                    <div className={styles.welcomeText}>
                        <h1 className={styles.welcomeTitle}>JOIN US</h1>
                        <h2 className={styles.welcomeSubtitle}>ZYVRA HRMS</h2>
                        <p className={styles.welcomeDescription}>
                            Create your account to explore job opportunities and apply for positions
                            that match your skills and career goals.
                        </p>
                    </div>
                </div>

                {/* Right Side - Registration Form */}
                <div className={styles.rightSide}>
                    <div className={styles.header}>
                        <h2 className={styles.title}>Create Account</h2>
                        <p className={styles.subtitle}>Sign up to start your journey with us</p>
                    </div>

                    {error && (
                        <div className={styles.error}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.inputGroup}>
                            <User size={18} className={styles.inputIcon} />
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                className={styles.input}
                                placeholder="First Name"
                                required
                                autoFocus
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <User size={18} className={styles.inputIcon} />
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                className={styles.input}
                                placeholder="Last Name"
                                required
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <Mail size={18} className={styles.inputIcon} />
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={styles.input}
                                placeholder="Email Address"
                                required
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <Phone size={18} className={styles.inputIcon} />
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className={styles.input}
                                placeholder="Phone Number (Optional)"
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <Lock size={18} className={styles.inputIcon} />
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className={styles.input}
                                placeholder="Password"
                                required
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <Lock size={18} className={styles.inputIcon} />
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className={styles.input}
                                placeholder="Confirm Password"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className={styles.submitButton}
                            disabled={loading}
                        >
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>

                    <div className={styles.footer}>
                        Already have an account? <Link to="/login" className={styles.signupLink}>Sign in</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
