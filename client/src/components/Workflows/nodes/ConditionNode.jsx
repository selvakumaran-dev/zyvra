import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { GitBranch } from 'lucide-react';
import styles from './ConditionNode.module.css';

const ConditionNode = ({ data }) => {
    return (
        <div className={styles.conditionNode}>
            <Handle type="target" position={Position.Top} className={styles.handle} />

            <div className={styles.content}>
                <GitBranch size={16} className={styles.icon} />
                <div className={styles.label}>{data.label}</div>
            </div>

            <div className={styles.outputs}>
                <div className={styles.outputLabel}>True</div>
                <div className={styles.outputLabel}>False</div>
            </div>

            <Handle
                type="source"
                position={Position.Bottom}
                id="true"
                className={`${styles.handle} ${styles.handleTrue}`}
                style={{ left: '30%' }}
            />
            <Handle
                type="source"
                position={Position.Bottom}
                id="false"
                className={`${styles.handle} ${styles.handleFalse}`}
                style={{ left: '70%' }}
            />
        </div>
    );
};

export default memo(ConditionNode);
