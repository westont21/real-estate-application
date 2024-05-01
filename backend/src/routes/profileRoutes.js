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

// Makes the bucket publicly readable (not recommended without consideration of content security)
async function makeBucketPublic() {
    await storage.bucket(process.env.BUCKET_NAME).iam.setPolicy({
        bindings: [
            {
                role: 'roles/storage.objectViewer',
                members: ['allUsers']
            }
        ]
    });

    console.log(`Bucket ${process.env.BUCKET_NAME} is now publicly readable`);
}

makeBucketPublic().catch(console.error);

router.post('/updateProfile', ensureAuthenticated, uploadHandler.single('profilePicture'), async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        // Make the file publicly readable
        makeBucketPublic();
        const { title, bio } = req.body;
        let profilePictureUrl = req.user.profilePicture || ''; // Use existing profile picture if not updating

        // If a new profile picture was uploaded, handle file upload to GCS
        if (req.file) {
            const blob = bucket.file(`${Date.now()}_${req.file.originalname}`);
            const blobStream = blob.createWriteStream({
                metadata: {
                    contentType: req.file.mimetype
                }
            });

            blobStream.on('error', err => {
                console.error('Blob stream error:', err);
                return res.status(500).send({ message: "Failed to upload the image.", error: err.toString() });
            });

            blobStream.on('finish', async () => {
                // The public URL can be used to directly access the file via HTTP.
                profilePictureUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;

                // Update user with new profile data and image URL
                const updatedUser = await User.findByIdAndUpdate(req.user._id, {
                    title, bio, profilePicture: profilePictureUrl
                }, { new: true });

                res.json({ user: updatedUser, message: 'Profile updated successfully' });
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

module.exports = router;
