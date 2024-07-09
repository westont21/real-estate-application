const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const ensureAuthenticated = require('./authRoutes');

// Create a new message
router.post('/messages', ensureAuthenticated, async (req, res) => {
  const { receiverId, message } = req.body;

  console.log('Received payload:', req.body);

  if (!receiverId || !message) {
    console.log('Validation failed:', { receiverId, message });
    return res.status(400).json({ error: 'Receiver ID and message are required.' });
  }

  try {
    const newMessage = new Message({
      sender: req.user.id,
      receiver: receiverId,
      message: message
    });

    const savedMessage = await newMessage.save();
    res.status(201).json(savedMessage);
  } catch (error) {
    console.error('Error creating message:', error);
    res.status(500).json({ error: 'Failed to create message' });
  }
});

// Get all messages for the authenticated user
router.get('/messages', ensureAuthenticated, async (req, res) => {
  try {
    const messages = await Message.find({ 
      $or: [
        { sender: req.user.id },
        { receiver: req.user.id }
      ] 
    }).populate('sender receiver', 'username profilePicture');

    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

module.exports = router;
