import React from 'react';
import { Inbox, Search, FileX, Users, AlertCircle } from 'lucide-react';
import Button from './Button';
import styles from './EmptyState.module.css';

const EmptyState = ({
    icon: CustomIcon,
    title,
    description,
    action,
    actionLabel,
    variant = 'default'
}) => {
    // Default icons based on variant
    const variantIcons = {
        default: Inbox,
        search: Search,
        error: AlertCircle,
        noData: FileX,
        noUsers: Users,
    };

    const Icon = CustomIcon || variantIcons[variant] || Inbox;

    return (
        <div className={styles.container}>
            <div className={styles.iconWrapper}>
                <Icon size={48} className={styles.icon} />
            </div>
            <h3 className={styles.title}>{title}</h3>
            {description && <p className={styles.description}>{description}</p>}
            {action && actionLabel && (
                <div className={styles.action}>
                    <Button onClick={action}>{actionLabel}</Button>
                </div>
            )}
        </div>
    );
};

export default EmptyState;
