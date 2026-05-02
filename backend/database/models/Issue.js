const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  coordinates: {
    lat: Number,
    lng: Number
  },
  image: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['reported', 'in-progress', 'resolved'],
    default: 'reported'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  upvotes: {
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

// Index for geospatial queries
issueSchema.index({ 'coordinates.lat': 1, 'coordinates.lng': 1 });
issueSchema.index({ userId: 1, createdAt: -1 });
issueSchema.index({ status: 1 });

module.exports = mongoose.model('Issue', issueSchema);
