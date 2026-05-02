const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
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
  date: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  participants: {
    type: Number,
    default: 0
  },
  maxParticipants: {
    type: Number,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for geospatial queries
eventSchema.index({ 'coordinates.lat': 1, 'coordinates.lng': 1 });
eventSchema.index({ userId: 1, createdAt: -1 });
eventSchema.index({ date: 1 });

module.exports = mongoose.model('Event', eventSchema);
