import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
        console.error("Uncaught error:", error, errorInfo);
    }

    handleReload = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100vh',
                    backgroundColor: '#f8fafc',
                    color: '#1e293b',
                    padding: '20px',
                    textAlign: 'center'
                }}>
                    <div style={{
                        backgroundColor: '#fee2e2',
                        padding: '24px',
                        borderRadius: '50%',
                        marginBottom: '24px',
                        color: '#dc2626'
                    }}>
                        <AlertTriangle size={48} />
                    </div>
                    <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '12px' }}>
                        Something went wrong
                    </h1>
                    <p style={{ color: '#64748b', marginBottom: '32px', maxWidth: '400px' }}>
                        We apologize for the inconvenience. The application has encountered an unexpected error.
                    </p>
                    <button
                        onClick={this.handleReload}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '12px 24px',
                            backgroundColor: '#2563eb',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                    >
                        <RefreshCw size={20} />
                        Reload Application
                    </button>
                    {process.env.NODE_ENV === 'development' && this.state.error && (
                        <details style={{ marginTop: '40px', textAlign: 'left', maxWidth: '800px', width: '100%' }}>
                            <summary style={{ cursor: 'pointer', color: '#64748b' }}>Error Details</summary>
                            <pre style={{
                                marginTop: '10px',
                                padding: '16px',
                                backgroundColor: '#1e293b',
                                color: '#f1f5f9',
                                borderRadius: '8px',
                                overflow: 'auto',
                                fontSize: '12px'
                            }}>
                                {this.state.error && this.state.error.toString()}
                                <br />
                                {this.state.errorInfo && this.state.errorInfo.componentStack}
                            </pre>
                        </details>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
