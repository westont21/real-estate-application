const express = require('express');
const router = express.Router();
const User = require('../models/User');
const ensureAuthenticated = require('./authRoutes');

// Search users by name
router.get('/users/search', ensureAuthenticated, async (req, res) => {
  try {
    const { query } = req.query;
    const users = await User.find({ username: new RegExp(query, 'i') }, 'username profilePicture');
    res.json(users);
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ error: 'Failed to search users' });
  }
});

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
