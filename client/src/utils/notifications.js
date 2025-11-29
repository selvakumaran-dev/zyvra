import api from '../services/api';

/**
 * Create a notification for a user
 * @param {Object} notification - Notification data
 * @param {string} notification.userId - User ID to send notification to
 * @param {string} notification.type - Notification type (info, success, warning, error, mention, approval, deadline, system)
 * @param {string} notification.title - Notification title
 * @param {string} notification.message - Notification message
 * @param {string} notification.icon - Icon name (optional)
 * @param {string} notification.link - Link to navigate to (optional)
 * @param {string} notification.priority - Priority level (low, medium, high, urgent)
 */
export const createNotification = async (notification) => {
    try {
        const response = await api.post('/notifications', notification);
        return response.data;
    } catch (error) {
        console.error('Failed to create notification:', error);
        throw error;
    }
};

/**
 * Helper functions to create specific types of notifications
 */
export const notificationHelpers = {
    // Success notification
    success: (userId, title, message, link = null) => {
        return createNotification({
            userId,
            type: 'success',
            title,
            message,
            link,
            priority: 'medium'
        });
    },

    // Error notification
    error: (userId, title, message, link = null) => {
        return createNotification({
            userId,
            type: 'error',
            title,
            message,
            link,
            priority: 'high'
        });
    },

    // Warning notification
    warning: (userId, title, message, link = null) => {
        return createNotification({
            userId,
            type: 'warning',
            title,
            message,
            link,
            priority: 'medium'
        });
    },

    // Info notification
    info: (userId, title, message, link = null) => {
        return createNotification({
            userId,
            type: 'info',
            title,
            message,
            link,
            priority: 'low'
        });
    },

    // Mention notification
    mention: (userId, title, message, link = null) => {
        return createNotification({
            userId,
            type: 'mention',
            title,
            message,
            link,
            priority: 'medium'
        });
    },

    // Approval request notification
    approval: (userId, title, message, link = null) => {
        return createNotification({
            userId,
            type: 'approval',
            title,
            message,
            link,
            priority: 'high'
        });
    },

    // Deadline notification
    deadline: (userId, title, message, link = null) => {
        return createNotification({
            userId,
            type: 'deadline',
            title,
            message,
            link,
            priority: 'urgent'
        });
    },

    // System notification
    system: (userId, title, message, link = null) => {
        return createNotification({
            userId,
            type: 'system',
            title,
            message,
            link,
            priority: 'medium'
        });
    }
};

export default {
    create: createNotification,
    ...notificationHelpers
};
