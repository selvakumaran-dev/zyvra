import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import styles from './Breadcrumbs.module.css';

const Breadcrumbs = () => {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter((x) => x);

    // Route name mapping for better display
    const routeNames = {
        'employees': 'Employees',
        'create-account': 'Create Account',
        'recruitment': 'Recruitment',
        'payroll': 'Payroll',
        'performance': 'Performance',
        'compliance': 'Compliance',
        'attendance': 'Attendance',
        'leave': 'Leave',
        'profile': 'Profile',
        'org-chart': 'Organization Chart',
    };

    const getRouteName = (path) => {
        return routeNames[path] || path.charAt(0).toUpperCase() + path.slice(1);
    };

    if (pathnames.length === 0) {
        return null; // Don't show breadcrumbs on dashboard
    }

    return (
        <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
            <ol className={styles.list}>
                <li className={styles.item}>
                    <Link to="/" className={styles.link}>
                        <Home size={16} />
                        <span>Dashboard</span>
                    </Link>
                </li>
                {pathnames.map((path, index) => {
                    const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
                    const isLast = index === pathnames.length - 1;

                    return (
                        <React.Fragment key={routeTo}>
                            <li className={styles.separator}>
                                <ChevronRight size={16} />
                            </li>
                            <li className={styles.item}>
                                {isLast ? (
                                    <span className={styles.current}>{getRouteName(path)}</span>
                                ) : (
                                    <Link to={routeTo} className={styles.link}>
                                        {getRouteName(path)}
                                    </Link>
                                )}
                            </li>
                        </React.Fragment>
                    );
                })}
            </ol>
        </nav>
    );
};

export default Breadcrumbs;
