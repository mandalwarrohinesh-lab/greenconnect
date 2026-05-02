const express = require('express');
const authMiddleware = require('../middleware/auth');
const { database, generateId } = require('../database/db');

const router = express.Router();

// Simulate AI waste detection
function analyzeWasteImage(imageUrl) {
  // Simulate AI analysis with random results
  const wasteTypes = ['Plastic Waste', 'Illegal Dumping', 'Overflowing Bins', 'Other'];
  const quantities = ['Small', 'Medium', 'Large'];
  const hazardLevels = ['Low', 'Medium', 'High'];
  
  const wasteType = wasteTypes[Math.floor(Math.random() * wasteTypes.length)];
  const confidence = 0.75 + Math.random() * 0.2; // 0.75 to 0.95
  
  return {
    wasteType,
    confidence: parseFloat(confidence.toFixed(2)),
    quantity: quantities[Math.floor(Math.random() * quantities.length)],
    hazardLevel: hazardLevels[Math.floor(Math.random() * hazardLevels.length)]
  };
}

function determinePriority(aiAnalysis) {
  if (aiAnalysis.hazardLevel === 'High' || aiAnalysis.quantity === 'Large') {
    return 'High';
  } else if (aiAnalysis.hazardLevel === 'Medium' || aiAnalysis.quantity === 'Medium') {
    return 'Medium';
  }
  return 'Low';
}

// Get all issues
router.get('/', authMiddleware, (req, res) => {
  try {
    const { lat, lng, radius = 50 } = req.query;

    let issues = database.issues.map(issue => {
      const user = database.users.find(u => u.id === issue.userId);
      return {
        ...issue,
        user: {
          name: user.name,
          avatar: user.avatar
        }
      };
    });

    // Filter by location if provided
    if (lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      const radiusKm = parseFloat(radius);

      issues = issues.filter(issue => {
        if (!issue.coordinates) return false;
        
        // Simple distance calculation (not accurate for large distances)
        const latDiff = Math.abs(issue.coordinates.lat - userLat);
        const lngDiff = Math.abs(issue.coordinates.lng - userLng);
        const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111; // Rough km conversion
        
        return distance <= radiusKm;
      });
    }

    res.json(issues);
  } catch (error) {
    console.error('Get issues error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to get issues',
        status: 500
      }
    });
  }
});

// Report new issue
router.post('/', authMiddleware, (req, res) => {
  try {
    const { title, description, type, location, coordinates, image } = req.body;

    if (!image) {
      return res.status(400).json({
        error: {
          message: 'Image is required',
          status: 400
        }
      });
    }

    // Simulate AI analysis
    const aiAnalysis = analyzeWasteImage(image);
    const priority = determinePriority(aiAnalysis);

    const newIssue = {
      id: generateId(),
      userId: req.user.id,
      title: title || `${aiAnalysis.wasteType} Detected`,
      description: description || '',
      type: type || aiAnalysis.wasteType,
      priority,
      status: 'Open',
      location: location || 'Unknown Location',
      coordinates: coordinates || { lat: 0, lng: 0 },
      image,
      aiAnalysis,
      createdAt: new Date().toISOString()
    };

    database.issues.push(newIssue);

    // Award points for reporting
    const user = database.users.find(u => u.id === req.user.id);
    if (user) {
      user.ecoPoints += 50;
      
      database.pointsTransactions.push({
        id: generateId(),
        userId: user.id,
        amount: 50,
        type: 'earned',
        reason: 'Issue reported',
        issueId: newIssue.id,
        createdAt: new Date().toISOString()
      });
    }

    const issueWithUser = {
      ...newIssue,
      user: {
        name: user.name,
        avatar: user.avatar
      }
    };

    res.status(201).json(issueWithUser);
  } catch (error) {
    console.error('Report issue error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to report issue',
        status: 500
      }
    });
  }
});

// Update issue status
router.patch('/:id/status', authMiddleware, (req, res) => {
  try {
    const { status } = req.body;
    const issue = database.issues.find(i => i.id === req.params.id);

    if (!issue) {
      return res.status(404).json({
        error: {
          message: 'Issue not found',
          status: 404
        }
      });
    }

    if (!['Open', 'In Progress', 'Resolved', 'Closed'].includes(status)) {
      return res.status(400).json({
        error: {
          message: 'Invalid status',
          status: 400
        }
      });
    }

    issue.status = status;
    issue.updatedAt = new Date().toISOString();

    // Notify issue reporter if resolved
    if (status === 'Resolved' && issue.userId !== req.user.id) {
      database.notifications.push({
        id: generateId(),
        userId: issue.userId,
        type: 'issue_resolved',
        message: `Your reported issue "${issue.title}" has been resolved`,
        issueId: issue.id,
        read: false,
        createdAt: new Date().toISOString()
      });
    }

    res.json(issue);
  } catch (error) {
    console.error('Update issue status error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to update issue status',
        status: 500
      }
    });
  }
});

// Get single issue
router.get('/:id', authMiddleware, (req, res) => {
  try {
    const issue = database.issues.find(i => i.id === req.params.id);

    if (!issue) {
      return res.status(404).json({
        error: {
          message: 'Issue not found',
          status: 404
        }
      });
    }

    const user = database.users.find(u => u.id === issue.userId);
    const issueWithUser = {
      ...issue,
      user: {
        name: user.name,
        avatar: user.avatar
      }
    };

    res.json(issueWithUser);
  } catch (error) {
    console.error('Get issue error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to get issue',
        status: 500
      }
    });
  }
});

module.exports = router;
