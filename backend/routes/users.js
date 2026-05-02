const express = require('express');
const authMiddleware = require('../middleware/auth');
const { database, generateId } = require('../database/db');

const router = express.Router();

// Get current user profile
router.get('/me', authMiddleware, (req, res) => {
  try {
    const user = database.users.find(u => u.id === req.user.id);
    
    if (!user) {
      return res.status(404).json({
        error: {
          message: 'User not found',
          status: 404
        }
      });
    }

    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to get profile',
        status: 500
      }
    });
  }
});

// Update user profile
router.put('/me', authMiddleware, (req, res) => {
  try {
    const { name, bio, avatar, location, theme } = req.body;
    const userIndex = database.users.findIndex(u => u.id === req.user.id);
    
    if (userIndex === -1) {
      return res.status(404).json({
        error: {
          message: 'User not found',
          status: 404
        }
      });
    }

    // Update fields if provided
    if (name) database.users[userIndex].name = name;
    if (bio !== undefined) database.users[userIndex].bio = bio;
    if (avatar !== undefined) database.users[userIndex].avatar = avatar;
    if (location !== undefined) database.users[userIndex].location = location;
    if (theme) database.users[userIndex].theme = theme;

    const { password, ...userWithoutPassword } = database.users[userIndex];
    
    res.json({
      success: true,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to update profile',
        status: 500
      }
    });
  }
});

// Search users
router.get('/search', authMiddleware, (req, res) => {
  try {
    const { q } = req.query;
    
    let users = database.users;
    
    if (q) {
      const query = q.toLowerCase();
      users = users.filter(u => 
        u.name.toLowerCase().includes(query) || 
        (u.bio && u.bio.toLowerCase().includes(query))
      );
    }

    const results = users.slice(0, 50).map(u => ({
      id: u.id,
      name: u.name,
      avatar: u.avatar,
      bio: u.bio,
      followers: u.followers
    }));

    res.json(results);
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      error: {
        message: 'Search failed',
        status: 500
      }
    });
  }
});

// Get user by ID
router.get('/:id', authMiddleware, (req, res) => {
  try {
    const user = database.users.find(u => u.id === req.params.id);
    
    if (!user) {
      return res.status(404).json({
        error: {
          message: 'User not found',
          status: 404
        }
      });
    }

    const { password, email, ...publicProfile } = user;
    res.json(publicProfile);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to get user',
        status: 500
      }
    });
  }
});

// Follow user
router.post('/:id/follow', authMiddleware, (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user.id;

    if (targetUserId === currentUserId) {
      return res.status(400).json({
        error: {
          message: 'Cannot follow yourself',
          status: 400
        }
      });
    }

    const existingFollow = database.follows.find(
      f => f.followerId === currentUserId && f.followingId === targetUserId
    );

    if (existingFollow) {
      return res.status(400).json({
        error: {
          message: 'Already following this user',
          status: 400
        }
      });
    }

    database.follows.push({
      id: generateId(),
      followerId: currentUserId,
      followingId: targetUserId,
      createdAt: new Date().toISOString()
    });

    // Update counts
    const currentUser = database.users.find(u => u.id === currentUserId);
    const targetUser = database.users.find(u => u.id === targetUserId);
    
    if (currentUser) currentUser.following++;
    if (targetUser) targetUser.followers++;

    res.json({ message: 'User followed successfully' });
  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to follow user',
        status: 500
      }
    });
  }
});

// Unfollow user
router.delete('/:id/follow', authMiddleware, (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user.id;

    const followIndex = database.follows.findIndex(
      f => f.followerId === currentUserId && f.followingId === targetUserId
    );

    if (followIndex === -1) {
      return res.status(400).json({
        error: {
          message: 'Not following this user',
          status: 400
        }
      });
    }

    database.follows.splice(followIndex, 1);

    // Update counts
    const currentUser = database.users.find(u => u.id === currentUserId);
    const targetUser = database.users.find(u => u.id === targetUserId);
    
    if (currentUser && currentUser.following > 0) currentUser.following--;
    if (targetUser && targetUser.followers > 0) targetUser.followers--;

    res.json({ message: 'User unfollowed successfully' });
  } catch (error) {
    console.error('Unfollow user error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to unfollow user',
        status: 500
      }
    });
  }
});

module.exports = router;
