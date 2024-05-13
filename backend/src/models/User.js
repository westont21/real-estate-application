const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    googleId: String,
    profilePicture: String,  // URL to the image
    title: String,
    bio: String
});

module.exports = mongoose.models.userSchema || mongoose.model('User', userSchema);
