// backend/src/controllers/userController.js
const User = require('../models/User');

// Handle user registration
const registerUser = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const newUser = new User({ username, email, password }); // Add encryption in production
        await newUser.save();
        res.status(201).send("User registered successfully");
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Handle user login
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (user && user.password === password) { // Add proper authentication in production
            res.status(200).json({ message: "Logged in successfully" });
        } else {
            res.status(400).json({ message: "Invalid credentials" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { registerUser, loginUser };
