import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import styles from './ErrorBoundary.module.css';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.setState({
            error,
            errorInfo
        });

        // You can also log the error to an error reporting service here
        // logErrorToService(error, errorInfo);
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null
        });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className={styles.errorBoundary}>
                    <div className={styles.errorContent}>
                        <div className={styles.iconWrapper}>
                            <AlertTriangle size={48} className={styles.icon} />
                        </div>
                        <h1 className={styles.title}>Oops! Something went wrong</h1>
                        <p className={styles.message}>
                            We're sorry for the inconvenience. An unexpected error has occurred.
                        </p>

                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details className={styles.errorDetails}>
                                <summary className={styles.errorSummary}>Error Details</summary>
                                <div className={styles.errorStack}>
                                    <p className={styles.errorMessage}>
                                        <strong>Error:</strong> {this.state.error.toString()}
                                    </p>
                                    {this.state.errorInfo && (
                                        <pre className={styles.stackTrace}>
                                            {this.state.errorInfo.componentStack}
                                        </pre>
                                    )}
                                </div>
                            </details>
                        )}

                        <div className={styles.actions}>
                            <button
                                onClick={this.handleReset}
                                className={styles.retryButton}
                            >
                                <RefreshCw size={18} />
                                Try Again
                            </button>
                            <button
                                onClick={() => window.location.href = '/'}
                                className={styles.homeButton}
                            >
                                Go to Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
