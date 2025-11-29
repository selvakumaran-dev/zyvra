import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, Lock } from 'lucide-react';
import styles from './Login.module.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error?.message || 'Login failed. Please try again.');
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
                        <h1 className={styles.welcomeTitle}>WELCOME</h1>
                        <h2 className={styles.welcomeSubtitle}>ZYVRA HRMS</h2>
                        <p className={styles.welcomeDescription}>
                            Streamline your workforce management with our comprehensive HR solution.
                            Secure, efficient, and user-friendly.
                        </p>
                    </div>
                </div>

                {/* Right Side - Login Form */}
                <div className={styles.rightSide}>
                    <div className={styles.header}>
                        <h2 className={styles.title}>Sign in</h2>
                        <p className={styles.subtitle}>Enter your credentials to access your account</p>
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
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={styles.input}
                                placeholder="Email Address"
                                required
                                autoFocus
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <Lock size={18} className={styles.inputIcon} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={styles.input}
                                placeholder="Password"
                                required
                            />
                        </div>

                        <div className={styles.formOptions}>
                            <label className={styles.rememberMe}>
                                <input type="checkbox" />
                                <span>Remember me</span>
                            </label>
                            <a href="#" className={styles.forgotPassword} onClick={(e) => e.preventDefault()}>
                                Forgot Password?
                            </a>
                        </div>

                        <button
                            type="submit"
                            className={styles.submitButton}
                            disabled={loading}
                        >
                            {loading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </form>

                    <div className={styles.footer}>
                        <div style={{ marginTop: '12px' }}>
                            <Link to="/careers" style={{ color: '#0066FF', textDecoration: 'none', fontWeight: 500 }}>
                                View Open Positions
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
