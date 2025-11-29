import React from 'react';
import styles from './Skeleton.module.css';

export const SkeletonCard = ({ height = '100px', width = '100%' }) => (
    <div className={styles.skeleton} style={{ height, width }}>
        <div className={styles.shimmer}></div>
    </div>
);

export const SkeletonText = ({ lines = 3, width = '100%' }) => (
    <div className={styles.skeletonText} style={{ width }}>
        {Array.from({ length: lines }).map((_, i) => (
            <div
                key={i}
                className={styles.skeletonLine}
                style={{ width: i === lines - 1 ? '60%' : '100%' }}
            >
                <div className={styles.shimmer}></div>
            </div>
        ))}
    </div>
);

export const SkeletonTable = ({ rows = 5, columns = 4 }) => (
    <div className={styles.skeletonTable}>
        <div className={styles.skeletonTableHeader}>
            {Array.from({ length: columns }).map((_, i) => (
                <div key={i} className={styles.skeletonTableCell}>
                    <div className={styles.skeleton} style={{ height: '20px' }}>
                        <div className={styles.shimmer}></div>
                    </div>
                </div>
            ))}
        </div>
        {Array.from({ length: rows }).map((_, rowIndex) => (
            <div key={rowIndex} className={styles.skeletonTableRow}>
                {Array.from({ length: columns }).map((_, colIndex) => (
                    <div key={colIndex} className={styles.skeletonTableCell}>
                        <div className={styles.skeleton} style={{ height: '16px' }}>
                            <div className={styles.shimmer}></div>
                        </div>
                    </div>
                ))}
            </div>
        ))}
    </div>
);

export const SkeletonAvatar = ({ size = '40px' }) => (
    <div
        className={`${styles.skeleton} ${styles.skeletonAvatar}`}
        style={{ width: size, height: size }}
    >
        <div className={styles.shimmer}></div>
    </div>
);

export const SkeletonList = ({ items = 5 }) => (
    <div className={styles.skeletonList}>
        {Array.from({ length: items }).map((_, i) => (
            <div key={i} className={styles.skeletonListItem}>
                <SkeletonAvatar size="48px" />
                <div className={styles.skeletonListContent}>
                    <div className={styles.skeleton} style={{ height: '16px', width: '60%', marginBottom: '8px' }}>
                        <div className={styles.shimmer}></div>
                    </div>
                    <div className={styles.skeleton} style={{ height: '14px', width: '40%' }}>
                        <div className={styles.shimmer}></div>
                    </div>
                </div>
            </div>
        ))}
    </div>
);

export const SkeletonDashboard = () => (
    <div className={styles.skeletonDashboard}>
        <div className={styles.skeletonStats}>
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className={styles.skeletonStatCard}>
                    <div className={styles.skeleton} style={{ height: '80px' }}>
                        <div className={styles.shimmer}></div>
                    </div>
                </div>
            ))}
        </div>
        <div className={styles.skeletonCharts}>
            <div className={styles.skeletonChart}>
                <div className={styles.skeleton} style={{ height: '300px' }}>
                    <div className={styles.shimmer}></div>
                </div>
            </div>
            <div className={styles.skeletonChart}>
                <div className={styles.skeleton} style={{ height: '300px' }}>
                    <div className={styles.shimmer}></div>
                </div>
            </div>
        </div>
    </div>
);

const Skeleton = {
    Card: SkeletonCard,
    Text: SkeletonText,
    Table: SkeletonTable,
    Avatar: SkeletonAvatar,
    List: SkeletonList,
    Dashboard: SkeletonDashboard
};

export default Skeleton;
