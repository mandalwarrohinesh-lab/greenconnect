const express = require('express');
const authMiddleware = require('../middleware/auth');
const { database, generateId } = require('../database/db');

const router = express.Router();

// Get user notifications
router.get('/', authMiddleware, (req, res) => {
  try {
    const { page = 1, limit = 20, unread = 'false' } = req.query;
    const skip = (page - 1) * limit;

    let notifications = database.notifications
      .filter(n => n.userId === req.user.id);

    // Filter unread only
    if (unread === 'true') {
      notifications = notifications.filter(n => !n.read);
    }

    const paginatedNotifications = notifications
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(skip, skip + parseInt(limit));

    const unreadCount = database.notifications.filter(
      n => n.userId === req.user.id && !n.read
    ).length;

    res.json({
      notifications: paginatedNotifications,
      unreadCount,
      page: parseInt(page),
      limit: parseInt(limit),
      total: notifications.length
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to get notifications',
        status: 500
      }
    });
  }
});

// Mark notification as read
router.patch('/:id/read', authMiddleware, (req, res) => {
  try {
    const notification = database.notifications.find(n => n.id === req.params.id);

    if (!notification) {
      return res.status(404).json({
        error: {
          message: 'Notification not found',
          status: 404
        }
      });
    }

    if (notification.userId !== req.user.id) {
      return res.status(403).json({
        error: {
          message: 'Not authorized',
          status: 403
        }
      });
    }

    notification.read = true;
    notification.readAt = new Date().toISOString();

    res.json(notification);
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to mark notification as read',
        status: 500
      }
    });
  }
});

// Mark all notifications as read
router.patch('/read-all', authMiddleware, (req, res) => {
  try {
    const userNotifications = database.notifications.filter(
      n => n.userId === req.user.id && !n.read
    );

    const now = new Date().toISOString();
    userNotifications.forEach(notification => {
      notification.read = true;
      notification.readAt = now;
    });

    res.json({ 
      message: 'All notifications marked as read',
      count: userNotifications.length
    });
  } catch (error) {
    console.error('Mark all read error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to mark all notifications as read',
        status: 500
      }
    });
  }
});

// Delete notification
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const notificationIndex = database.notifications.findIndex(
      n => n.id === req.params.id
    );

    if (notificationIndex === -1) {
      return res.status(404).json({
        error: {
          message: 'Notification not found',
          status: 404
        }
      });
    }

    const notification = database.notifications[notificationIndex];

    if (notification.userId !== req.user.id) {
      return res.status(403).json({
        error: {
          message: 'Not authorized',
          status: 403
        }
      });
    }

    database.notifications.splice(notificationIndex, 1);

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to delete notification',
        status: 500
      }
    });
  }
});

// Get unread count
router.get('/unread/count', authMiddleware, (req, res) => {
  try {
    const unreadCount = database.notifications.filter(
      n => n.userId === req.user.id && !n.read
    ).length;

    res.json({ count: unreadCount });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to get unread count',
        status: 500
      }
    });
  }
});

module.exports = router;
