const express = require('express');
const router = express.Router();
const User = require('../models/User');
const ensureAuthenticated = require('./authRoutes');

// Get user profile by ID
router.get('/users/:id', ensureAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.params.id, 'username email profilePicture');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

module.exports = router;
