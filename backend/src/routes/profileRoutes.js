const express = require('express');
const router = express.Router();
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const ensureAuthenticated = require('./authRoutes');
const { Storage } = require('@google-cloud/storage');
require('dotenv').config();

// Initialize Google Cloud Storage
const storage = new Storage({
    keyFilename: process.env.SERVICE_ACCOUNT_PATH,
    projectId: process.env.PROJECT_ID
});

const bucket = storage.bucket(process.env.BUCKET_NAME);

// Setup multer for in-memory storage to facilitate file upload to GCS
const multerStorage = multer.memoryStorage();
const uploadHandler = multer({
    storage: multerStorage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

router.post('/updateProfile', ensureAuthenticated, uploadHandler.single('profilePicture'), async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { title, bio } = req.body;
        let profilePictureUrl = req.user.profilePicture || ''; // Use existing profile picture if not updating
        // If a new profile picture was uploaded, handle file upload to GCS
        if (req.file) {
            const blob = bucket.file(`${Date.now()}_${req.file.originalname}`);
            const blobStream = blob.createWriteStream({
                metadata: { contentType: req.file.mimetype }
            });

            blobStream.on('error', err => {
                console.error('Blob stream error:', err);
                return res.status(500).send({ message: "Failed to upload the image.", error: err.toString() });
            });

            blobStream.on('finish', async () => {
                // Optionally make the file publicly readable (consider security implications)
                await blob.makePublic();

                const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
                const updatedUser = await User.findByIdAndUpdate(req.user._id, {
                    title, bio, profilePicture: publicUrl
                }, { new: true });

                res.json({ user: updatedUser, message: 'Profile updated successfully', fileUrl: publicUrl });
            });

            blobStream.end(req.file.buffer);
        } else {
            // Update user without changing the profile picture
            const updatedUser = await User.findByIdAndUpdate(req.user._id, { title, bio }, { new: true });
            res.json({ user: updatedUser, message: 'Profile updated successfully' });
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).send({ message: "Error updating profile", error: error.toString() });
    }
});

// Route to fetch user profile data
router.get('/getUserProfile', ensureAuthenticated, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).send({ message: "User not found." });
        }
        res.json({ user, message: 'Profile data fetched successfully' });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).send({ message: "Error fetching user profile", error: error.toString() });
    }
});

module.exports = router;
