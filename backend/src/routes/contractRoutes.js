// routes/contractRoutes.js
const express = require('express');
const router = express.Router();
const { suggestContract } = require('../controllers/contractController');

// Route for AI-assisted contract suggestions
router.post('/suggest', suggestContract);

module.exports = router;
