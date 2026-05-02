const express = require('express');
const authMiddleware = require('../middleware/auth');
const { database, generateId } = require('../database/db');

const router = express.Router();

// Get feed posts
router.get('/feed', authMiddleware, (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    // Get all posts with user information
    const postsWithUsers = database.posts
      .map(post => {
        const user = database.users.find(u => u.id === post.userId);
        if (!user) return null;

        // Check if current user liked this post
        const liked = database.likes.some(
          l => l.userId === req.user.id && l.postId === post.id
        );

        return {
          ...post,
          user: {
            name: user.name,
            avatar: user.avatar,
            location: user.location || post.location
          },
          liked
        };
      })
      .filter(post => post !== null)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(skip, skip + parseInt(limit));

    res.json({
      posts: postsWithUsers,
      page: parseInt(page),
      limit: parseInt(limit),
      total: database.posts.length
    });
  } catch (error) {
    console.error('Get feed error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to get feed',
        status: 500
      }
    });
  }
});

// Create post
router.post('/', authMiddleware, (req, res) => {
  try {
    const { caption, location, image } = req.body;

    if (!caption || !image) {
      return res.status(400).json({
        error: {
          message: 'Caption and image are required',
          status: 400
        }
      });
    }

    if (caption.length > 500) {
      return res.status(400).json({
        error: {
          message: 'Caption must be 500 characters or less',
          status: 400
        }
      });
    }

    const newPost = {
      id: generateId(),
      userId: req.user.id,
      image,
      caption,
      location: location || '',
      likes: 0,
      commentsCount: 0,
      createdAt: new Date().toISOString()
    };

    database.posts.unshift(newPost);

    // Update user posts count
    const user = database.users.find(u => u.id === req.user.id);
    if (user) {
      user.postsCount++;
      user.ecoPoints += 10; // Award points for posting
    }

    // Add user info to response
    const postWithUser = {
      ...newPost,
      user: {
        name: user.name,
        avatar: user.avatar,
        location: user.location || location
      },
      liked: false
    };

    res.status(201).json(postWithUser);
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to create post',
        status: 500
      }
    });
  }
});

// Like/Unlike post
router.post('/:id/like', authMiddleware, (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    const post = database.posts.find(p => p.id === postId);
    if (!post) {
      return res.status(404).json({
        error: {
          message: 'Post not found',
          status: 404
        }
      });
    }

    const existingLike = database.likes.find(
      l => l.userId === userId && l.postId === postId
    );

    if (existingLike) {
      // Unlike
      const likeIndex = database.likes.indexOf(existingLike);
      database.likes.splice(likeIndex, 1);
      post.likes = Math.max(0, post.likes - 1);

      res.json({ 
        message: 'Post unliked',
        liked: false,
        likes: post.likes
      });
    } else {
      // Like
      database.likes.push({
        id: generateId(),
        userId,
        postId,
        createdAt: new Date().toISOString()
      });
      post.likes++;

      // Send notification to post owner
      if (post.userId !== userId) {
        const liker = database.users.find(u => u.id === userId);
        database.notifications.push({
          id: generateId(),
          userId: post.userId,
          type: 'like',
          message: `${liker.name} liked your post`,
          postId: postId,
          read: false,
          createdAt: new Date().toISOString()
        });
      }

      res.json({ 
        message: 'Post liked',
        liked: true,
        likes: post.likes
      });
    }
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to like post',
        status: 500
      }
    });
  }
});

// Delete post
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const postId = req.params.id;
    const postIndex = database.posts.findIndex(p => p.id === postId);

    if (postIndex === -1) {
      return res.status(404).json({
        error: {
          message: 'Post not found',
          status: 404
        }
      });
    }

    const post = database.posts[postIndex];

    // Check ownership
    if (post.userId !== req.user.id) {
      return res.status(403).json({
        error: {
          message: 'Not authorized to delete this post',
          status: 403
        }
      });
    }

    // Remove post
    database.posts.splice(postIndex, 1);

    // Remove associated likes
    database.likes = database.likes.filter(l => l.postId !== postId);

    // Remove associated comments
    database.comments = database.comments.filter(c => c.postId !== postId);

    // Update user posts count
    const user = database.users.find(u => u.id === req.user.id);
    if (user && user.postsCount > 0) {
      user.postsCount--;
    }

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to delete post',
        status: 500
      }
    });
  }
});

// Get single post
router.get('/:id', authMiddleware, (req, res) => {
  try {
    const post = database.posts.find(p => p.id === req.params.id);

    if (!post) {
      return res.status(404).json({
        error: {
          message: 'Post not found',
          status: 404
        }
      });
    }

    const user = database.users.find(u => u.id === post.userId);
    const liked = database.likes.some(
      l => l.userId === req.user.id && l.postId === post.id
    );

    const postWithUser = {
      ...post,
      user: {
        name: user.name,
        avatar: user.avatar,
        location: user.location || post.location
      },
      liked
    };

    res.json(postWithUser);
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to get post',
        status: 500
      }
    });
  }
});

module.exports = router;
