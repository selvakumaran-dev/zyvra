import React from 'react';
import { Toaster } from 'react-hot-toast';

const Toast = () => {
    return (
        <Toaster
            position="top-right"
            reverseOrder={false}
            gutter={8}
            toastOptions={{
                duration: 4000,
                style: {
                    background: 'var(--color-bg-surface)',
                    color: 'var(--color-text-primary)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-lg)',
                    padding: 'var(--space-md)',
                    fontSize: '0.875rem',
                    fontFamily: 'var(--font-sans)',
                },
                success: {
                    iconTheme: {
                        primary: 'var(--color-success)',
                        secondary: 'white',
                    },
                },
                error: {
                    iconTheme: {
                        primary: 'var(--color-error)',
                        secondary: 'white',
                    },
                },
            }}
        />
    );
};

export default Toast;
