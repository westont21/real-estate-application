const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const ensureAuthenticated = require('./authRoutes');

// Create a new post
router.post('/posts', ensureAuthenticated, async (req, res) => {
  const { name, description } = req.body;

  if (!name || !description) {
    return res.status(400).json({ error: 'Name and description are required.' });
  }

  try {
    const newPost = new Post({
      user: req.user.id,
      name,
      description
    });

    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Get all posts with optional sorting
router.get('/posts', ensureAuthenticated, async (req, res) => {
  try {
    const { sortBy, sortOrder } = req.query;
    const sort = {};
    if (sortBy) {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    }
    const posts = await Post.find().sort(sort).populate('user', 'username email profilePicture title bio');
    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// Get posts by a specific user
router.get('/posts/user/:userId', ensureAuthenticated, async (req, res) => {
  try {
    const { userId } = req.params;
    const posts = await Post.find({ user: userId }).populate('user', 'username email profilePicture title bio');
    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts by user:', error);
    res.status(500).json({ error: 'Failed to fetch posts by user' });
  }
});

// Search posts by user name
router.get('/posts/search', ensureAuthenticated, async (req, res) => {
  try {
    const { username } = req.query;
    const posts = await Post.find().populate({
      path: 'user',
      match: { username: new RegExp(username, 'i') },
      select: 'username email profilePicture title bio'
    }).exec();

    const filteredPosts = posts.filter(post => post.user);
    res.json(filteredPosts);
  } catch (error) {
    console.error('Error searching posts:', error);
    res.status(500).json({ error: 'Failed to search posts' });
  }
});

module.exports = router;
