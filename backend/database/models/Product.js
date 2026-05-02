const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    default: 0
  },
  popular: {
    type: Boolean,
    default: false
  },
  stock: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  redemptions: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
productSchema.index({ category: 1 });
productSchema.index({ popular: 1, rating: -1 });

module.exports = mongoose.model('Product', productSchema);
