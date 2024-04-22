const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    googleId: { type: String, unique: true, sparse: true } // to store Google user ID
});

module.exports = mongoose.model('User', userSchema);