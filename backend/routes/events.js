const express = require('express');
const authMiddleware = require('../middleware/auth');
const { database, generateId } = require('../database/db');

const router = express.Router();

// Get all events
router.get('/', authMiddleware, (req, res) => {
  try {
    const { lat, lng, radius = 50, upcoming = 'true' } = req.query;

    let events = database.events.map(event => {
      const creator = database.users.find(u => u.id === event.creatorId);
      const isParticipant = database.eventParticipants.some(
        ep => ep.eventId === event.id && ep.userId === req.user.id
      );
      
      return {
        ...event,
        creator: {
          name: creator.name,
          avatar: creator.avatar
        },
        isParticipant
      };
    });

    // Filter upcoming events
    if (upcoming === 'true') {
      const now = new Date();
      events = events.filter(event => new Date(event.date) > now);
    }

    // Filter by location if provided
    if (lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      const radiusKm = parseFloat(radius);

      events = events.filter(event => {
        if (!event.coordinates) return false;
        
        const latDiff = Math.abs(event.coordinates.lat - userLat);
        const lngDiff = Math.abs(event.coordinates.lng - userLng);
        const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111;
        
        return distance <= radiusKm;
      });
    }

    // Sort by date
    events.sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json(events);
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to get events',
        status: 500
      }
    });
  }
});

// Create event
router.post('/', authMiddleware, (req, res) => {
  try {
    const { title, description, type, location, coordinates, date, time } = req.body;

    if (!title || !type || !location || !date || !time) {
      return res.status(400).json({
        error: {
          message: 'Title, type, location, date, and time are required',
          status: 400
        }
      });
    }

    const newEvent = {
      id: generateId(),
      title,
      description: description || '',
      type,
      location,
      coordinates: coordinates || { lat: 0, lng: 0 },
      date,
      time,
      participants: 0,
      creatorId: req.user.id,
      createdAt: new Date().toISOString()
    };

    database.events.push(newEvent);

    const creator = database.users.find(u => u.id === req.user.id);
    const eventWithCreator = {
      ...newEvent,
      creator: {
        name: creator.name,
        avatar: creator.avatar
      },
      isParticipant: false
    };

    res.status(201).json(eventWithCreator);
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to create event',
        status: 500
      }
    });
  }
});

// Join event
router.post('/:id/join', authMiddleware, (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user.id;

    const event = database.events.find(e => e.id === eventId);
    if (!event) {
      return res.status(404).json({
        error: {
          message: 'Event not found',
          status: 404
        }
      });
    }

    const existingParticipant = database.eventParticipants.find(
      ep => ep.eventId === eventId && ep.userId === userId
    );

    if (existingParticipant) {
      return res.status(400).json({
        error: {
          message: 'Already joined this event',
          status: 400
        }
      });
    }

    database.eventParticipants.push({
      id: generateId(),
      eventId,
      userId,
      joinedAt: new Date().toISOString()
    });

    event.participants++;

    res.json({ 
      message: 'Joined event successfully',
      participants: event.participants
    });
  } catch (error) {
    console.error('Join event error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to join event',
        status: 500
      }
    });
  }
});

// Leave event
router.delete('/:id/join', authMiddleware, (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user.id;

    const participantIndex = database.eventParticipants.findIndex(
      ep => ep.eventId === eventId && ep.userId === userId
    );

    if (participantIndex === -1) {
      return res.status(400).json({
        error: {
          message: 'Not a participant of this event',
          status: 400
        }
      });
    }

    database.eventParticipants.splice(participantIndex, 1);

    const event = database.events.find(e => e.id === eventId);
    if (event && event.participants > 0) {
      event.participants--;
    }

    res.json({ 
      message: 'Left event successfully',
      participants: event ? event.participants : 0
    });
  } catch (error) {
    console.error('Leave event error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to leave event',
        status: 500
      }
    });
  }
});

// Get trending events
router.get('/trending', authMiddleware, (req, res) => {
  try {
    const trendingEvents = database.events
      .map(event => {
        const creator = database.users.find(u => u.id === event.creatorId);
        return {
          ...event,
          creator: {
            name: creator.name,
            avatar: creator.avatar
          }
        };
      })
      .sort((a, b) => b.participants - a.participants)
      .slice(0, 10);

    res.json(trendingEvents);
  } catch (error) {
    console.error('Get trending events error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to get trending events',
        status: 500
      }
    });
  }
});

// Get single event
router.get('/:id', authMiddleware, (req, res) => {
  try {
    const event = database.events.find(e => e.id === req.params.id);

    if (!event) {
      return res.status(404).json({
        error: {
          message: 'Event not found',
          status: 404
        }
      });
    }

    const creator = database.users.find(u => u.id === event.creatorId);
    const isParticipant = database.eventParticipants.some(
      ep => ep.eventId === event.id && ep.userId === req.user.id
    );

    const eventWithCreator = {
      ...event,
      creator: {
        name: creator.name,
        avatar: creator.avatar
      },
      isParticipant
    };

    res.json(eventWithCreator);
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to get event',
        status: 500
      }
    });
  }
});

module.exports = router;
