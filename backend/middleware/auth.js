const jwt = require('jsonwebtoken');
const { database } = require('../database/db');

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: {
          message: 'No token provided',
          status: 401
        }
      });
    }

    const token = authHeader.substring(7);
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = database.users.find(u => u.id === decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        error: {
          message: 'User not found',
          status: 401
        }
      });
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name
    };
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: {
          message: 'Invalid token',
          status: 401
        }
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: {
          message: 'Token expired',
          status: 401
        }
      });
    }
    
    return res.status(500).json({
      error: {
        message: 'Authentication error',
        status: 500
      }
    });
  }
};

module.exports = authMiddleware;
