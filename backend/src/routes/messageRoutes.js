const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const ensureAuthenticated = require('./authRoutes');

// Create a new message
router.post('/messages', ensureAuthenticated, async (req, res) => {
  const { receiverId, message } = req.body;

  if (!receiverId || !message) {
    return res.status(400).json({ error: 'Receiver and message are required.' });
  }

  try {
    const newPost = new Post({
      sender: req.user.id,
      receiver: receiverId,
      message: message
    });

    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (error) {
    console.error('Error creating message:', error);
    res.status(500).json({ error: 'Failed to create message' });
  }
});

// Get all messages for the authenticated user
router.get('/messages', ensureAuthenticated, async (req, res) => {
  try {
    const messages = await Post.find({ 
      $or: [
        { sender: req.user.id },
        { receiver: req.user.id }
      ] 
    }).populate('sender receiver', 'username email');

    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

module.exports = router;
