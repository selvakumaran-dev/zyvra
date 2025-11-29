const express = require('express');
const router = express.Router();
const {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification
} = require('../controllers/notificationController');
const { auth } = require('../middleware/auth');

// Get all notifications
router.get('/', auth, getNotifications);

// Get unread count
router.get('/unread-count', auth, getUnreadCount);

// Mark notification as read
router.put('/:id/read', auth, markAsRead);

// Mark all as read
router.put('/mark-all-read', auth, markAllAsRead);

// Delete notification
router.delete('/:id', auth, deleteNotification);

// Create notification (for testing)
router.post('/', auth, createNotification);

module.exports = router;
