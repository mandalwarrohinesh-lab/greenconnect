const express = require('express');
const authMiddleware = require('../middleware/auth');
const { database, generateId } = require('../database/db');

const router = express.Router();

// Get all active stories
router.get('/', authMiddleware, (req, res) => {
  try {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Filter stories created within last 24 hours
    const activeStories = database.stories
      .filter(story => new Date(story.createdAt) > twentyFourHoursAgo)
      .map(story => {
        const user = database.users.find(u => u.id === story.userId);
        return {
          ...story,
          user: {
            name: user.name,
            avatar: user.avatar
          }
        };
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(activeStories);
  } catch (error) {
    console.error('Get stories error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to get stories',
        status: 500
      }
    });
  }
});

// Create story
router.post('/', authMiddleware, (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({
        error: {
          message: 'Image is required',
          status: 400
        }
      });
    }

    const newStory = {
      id: generateId(),
      userId: req.user.id,
      image,
      views: 0,
      viewers: [],
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };

    database.stories.push(newStory);

    const user = database.users.find(u => u.id === req.user.id);
    const storyWithUser = {
      ...newStory,
      user: {
        name: user.name,
        avatar: user.avatar
      }
    };

    res.status(201).json(storyWithUser);
  } catch (error) {
    console.error('Create story error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to create story',
        status: 500
      }
    });
  }
});

// View story
router.post('/:id/view', authMiddleware, (req, res) => {
  try {
    const story = database.stories.find(s => s.id === req.params.id);

    if (!story) {
      return res.status(404).json({
        error: {
          message: 'Story not found',
          status: 404
        }
      });
    }

    // Add viewer if not already viewed
    if (!story.viewers.includes(req.user.id)) {
      story.viewers.push(req.user.id);
      story.views++;
    }

    res.json({ message: 'Story viewed', views: story.views });
  } catch (error) {
    console.error('View story error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to view story',
        status: 500
      }
    });
  }
});

// Delete story
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const storyIndex = database.stories.findIndex(s => s.id === req.params.id);

    if (storyIndex === -1) {
      return res.status(404).json({
        error: {
          message: 'Story not found',
          status: 404
        }
      });
    }

    const story = database.stories[storyIndex];

    if (story.userId !== req.user.id) {
      return res.status(403).json({
        error: {
          message: 'Not authorized to delete this story',
          status: 403
        }
      });
    }

    database.stories.splice(storyIndex, 1);
    res.json({ message: 'Story deleted successfully' });
  } catch (error) {
    console.error('Delete story error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to delete story',
        status: 500
      }
    });
  }
});

module.exports = router;
