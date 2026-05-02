const express = require('express');
const authMiddleware = require('../middleware/auth');
const { database, generateId } = require('../database/db');

const router = express.Router();

// Get comments for a post
router.get('/post/:postId', authMiddleware, (req, res) => {
  try {
    const { postId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const postComments = database.comments
      .filter(c => c.postId === postId)
      .map(comment => {
        const user = database.users.find(u => u.id === comment.userId);
        return {
          ...comment,
          user: {
            name: user.name,
            avatar: user.avatar
          }
        };
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(skip, skip + parseInt(limit));

    res.json({
      comments: postComments,
      page: parseInt(page),
      limit: parseInt(limit),
      total: database.comments.filter(c => c.postId === postId).length
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to get comments',
        status: 500
      }
    });
  }
});

// Add comment to post
router.post('/post/:postId', authMiddleware, (req, res) => {
  try {
    const { postId } = req.params;
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        error: {
          message: 'Comment text is required',
          status: 400
        }
      });
    }

    if (text.length > 300) {
      return res.status(400).json({
        error: {
          message: 'Comment must be 300 characters or less',
          status: 400
        }
      });
    }

    const post = database.posts.find(p => p.id === postId);
    if (!post) {
      return res.status(404).json({
        error: {
          message: 'Post not found',
          status: 404
        }
      });
    }

    const newComment = {
      id: generateId(),
      postId,
      userId: req.user.id,
      text: text.trim(),
      createdAt: new Date().toISOString()
    };

    database.comments.push(newComment);
    post.commentsCount++;

    // Notify post owner
    if (post.userId !== req.user.id) {
      const commenter = database.users.find(u => u.id === req.user.id);
      database.notifications.push({
        id: generateId(),
        userId: post.userId,
        type: 'comment',
        message: `${commenter.name} commented on your post`,
        postId: postId,
        commentId: newComment.id,
        read: false,
        createdAt: new Date().toISOString()
      });
    }

    const user = database.users.find(u => u.id === req.user.id);
    const commentWithUser = {
      ...newComment,
      user: {
        name: user.name,
        avatar: user.avatar
      }
    };

    res.status(201).json(commentWithUser);
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to add comment',
        status: 500
      }
    });
  }
});

// Delete comment
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const commentIndex = database.comments.findIndex(c => c.id === req.params.id);

    if (commentIndex === -1) {
      return res.status(404).json({
        error: {
          message: 'Comment not found',
          status: 404
        }
      });
    }

    const comment = database.comments[commentIndex];

    // Check ownership
    if (comment.userId !== req.user.id) {
      return res.status(403).json({
        error: {
          message: 'Not authorized to delete this comment',
          status: 403
        }
      });
    }

    // Remove comment
    database.comments.splice(commentIndex, 1);

    // Update post comment count
    const post = database.posts.find(p => p.id === comment.postId);
    if (post && post.commentsCount > 0) {
      post.commentsCount--;
    }

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to delete comment',
        status: 500
      }
    });
  }
});

module.exports = router;
