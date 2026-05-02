const express = require('express');
const authMiddleware = require('../middleware/auth');
const { database, generateId } = require('../database/db');

const router = express.Router();

// Get all products
router.get('/', authMiddleware, (req, res) => {
  try {
    const { category, sort } = req.query;

    let products = [...database.products];

    // Filter by category
    if (category && category !== 'All') {
      products = products.filter(p => p.category === category);
    }

    // Sort products
    if (sort === 'price_asc') {
      products.sort((a, b) => a.price - b.price);
    } else if (sort === 'price_desc') {
      products.sort((a, b) => b.price - a.price);
    } else if (sort === 'popular') {
      products.sort((a, b) => b.redemptions - a.redemptions);
    } else if (sort === 'rating') {
      products.sort((a, b) => b.rating - a.rating);
    }

    res.json(products);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to get products',
        status: 500
      }
    });
  }
});

// Get single product
router.get('/:id', authMiddleware, (req, res) => {
  try {
    const product = database.products.find(p => p.id === req.params.id);

    if (!product) {
      return res.status(404).json({
        error: {
          message: 'Product not found',
          status: 404
        }
      });
    }

    // Increment view count
    product.views++;

    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to get product',
        status: 500
      }
    });
  }
});

// Redeem product
router.post('/:id/redeem', authMiddleware, (req, res) => {
  try {
    const productId = req.params.id;
    const product = database.products.find(p => p.id === productId);

    if (!product) {
      return res.status(404).json({
        error: {
          message: 'Product not found',
          status: 404
        }
      });
    }

    const user = database.users.find(u => u.id === req.user.id);

    if (!user) {
      return res.status(404).json({
        error: {
          message: 'User not found',
          status: 404
        }
      });
    }

    // Check if user has enough points
    if (user.ecoPoints < product.price) {
      return res.status(400).json({
        error: {
          message: `Insufficient points. You need ${product.price - user.ecoPoints} more points.`,
          status: 400,
          required: product.price,
          current: user.ecoPoints
        }
      });
    }

    // Check stock
    if (product.stock <= 0) {
      return res.status(400).json({
        error: {
          message: 'Product out of stock',
          status: 400
        }
      });
    }

    // Deduct points
    user.ecoPoints -= product.price;

    // Update product
    product.stock--;
    product.redemptions++;

    // Record transaction
    database.pointsTransactions.push({
      id: generateId(),
      userId: user.id,
      amount: -product.price,
      type: 'spent',
      reason: `Redeemed ${product.name}`,
      productId: product.id,
      createdAt: new Date().toISOString()
    });

    res.json({
      message: 'Product redeemed successfully',
      product: {
        id: product.id,
        name: product.name,
        price: product.price
      },
      remainingPoints: user.ecoPoints
    });
  } catch (error) {
    console.error('Redeem product error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to redeem product',
        status: 500
      }
    });
  }
});

// Get featured products
router.get('/featured/list', authMiddleware, (req, res) => {
  try {
    const featured = database.products
      .filter(p => p.popular)
      .sort((a, b) => b.redemptions - a.redemptions)
      .slice(0, 5);

    res.json(featured);
  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to get featured products',
        status: 500
      }
    });
  }
});

module.exports = router;
