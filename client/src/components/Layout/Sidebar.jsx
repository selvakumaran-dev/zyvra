import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard,
    Users,
    Briefcase,
    CreditCard,
    TrendingUp,
    ShieldCheck,
    LogOut,
    Clock,
    Calendar,
    User,
    Network,
    UserPlus,
    ChevronUp,
    FileText,
    GitBranch,
    BarChart2,
    Zap,
    Settings
} from 'lucide-react';
import { X } from 'lucide-react';
import styles from './Sidebar.module.css';

const Sidebar = ({ isOpen, onClose }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);

    // Map database roles to sidebar roles
    const userRole = user?.role === 'HR' ? 'ADMIN' :
        user?.role === 'Applicant' ? 'APPLICANT' : 'EMPLOYEE';

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/', roles: ['ADMIN', 'EMPLOYEE', 'APPLICANT'] },
        { icon: User, label: 'My Profile', path: '/profile', roles: ['ADMIN', 'EMPLOYEE'] },
        { icon: Users, label: 'Employees', path: '/employees', roles: ['ADMIN'] },
        { icon: UserPlus, label: 'Create Account', path: '/employees/create-account', roles: ['ADMIN'] },
        { icon: Network, label: 'Org Chart', path: '/org-chart', roles: ['ADMIN'] },
        { icon: Clock, label: 'Attendance', path: '/attendance', roles: ['ADMIN', 'EMPLOYEE'] },
        { icon: Calendar, label: 'Leave', path: '/leave', roles: ['ADMIN', 'EMPLOYEE'] },
        { icon: Briefcase, label: 'Recruitment', path: '/recruitment', roles: ['ADMIN', 'APPLICANT'] },
        { icon: CreditCard, label: 'Payroll', path: '/payroll', roles: ['ADMIN'] },
        { icon: TrendingUp, label: 'Performance', path: '/performance', roles: ['ADMIN', 'EMPLOYEE'] },
        { icon: FileText, label: 'Reports', path: '/reports', roles: ['ADMIN'] },
        { icon: Zap, label: 'Integrations', path: '/integrations', roles: ['ADMIN'] },
        { icon: ShieldCheck, label: 'Security', path: '/security', roles: ['ADMIN'] },
        { icon: ShieldCheck, label: 'Compliance', path: '/compliance', roles: ['ADMIN'] },
        { icon: Settings, label: 'Settings', path: '/settings', roles: ['ADMIN', 'EMPLOYEE'] },
    ];

    const filteredNavItems = navItems.filter(item => item.roles.includes(userRole));

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <>
            {isOpen && <div className={styles.overlay} onClick={onClose} />}
            <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
                <div className={styles.logo}>
                    <div className={styles.logoIcon}>Z</div>
                    <span className={styles.logoText}>Zyvra</span>
                    <button className={styles.closeButton} onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <nav className={styles.nav}>
                    {filteredNavItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `${styles.navItem} ${isActive ? styles.active : ''}`
                            }
                        >
                            <item.icon size={20} />
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className={styles.footer} ref={menuRef}>
                    {isMenuOpen && (
                        <div className={styles.userMenu}>
                            <button className={styles.menuItem} onClick={handleLogout}>
                                <LogOut size={18} />
                                <span>Logout</span>
                            </button>
                        </div>
                    )}

                    <div
                        className={`${styles.userInfo} ${isMenuOpen ? styles.userInfoActive : ''}`}
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        <div className={styles.userAvatar}>
                            {user?.employee?.firstName?.charAt(0) ||
                                user?.applicant?.firstName?.charAt(0) ||
                                user?.email?.charAt(0) || 'U'}
                        </div>
                        <div className={styles.userDetails}>
                            <span className={styles.userName}>
                                {user?.employee ? `${user.employee.firstName} ${user.employee.lastName}` :
                                    user?.applicant ? `${user.applicant.firstName} ${user.applicant.lastName}` :
                                        'User'}
                            </span>
                            <span className={styles.userRole}>{user?.role}</span>
                        </div>
                        <ChevronUp size={16} className={`${styles.chevron} ${isMenuOpen ? styles.chevronOpen : ''}`} />
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
