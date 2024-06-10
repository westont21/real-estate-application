const express = require('express');
const passport = require('passport');
const router = express.Router();

const ensureAuthenticated = (req, res, next) => {
  if (!req.isAuthenticated()) {
    logger.warn('Unauthorized access attempt');
    return res.status(403).json({ message: "Unauthorized" });
  }
  next();
};

router.get('/logout', ensureAuthenticated, (req, res) => {
    req.logout(function(err) {
      if (err) {
        console.error('Logout error:', err);
        return res.status(500).json({ message: 'Logout failed', error: err });
      }
      // Destroy the session and clear the associated cookie
      req.session.destroy((err) => {
        if (err) {
          console.error('Session destruction error:', err);
          return res.status(500).json({ message: 'Failed to destroy session', error: err });
        }
        res.clearCookie('connect.sid', { path: '/' });  // Adjust the cookie name if different
        res.json({ message: 'Successfully logged out' });
      });
    });
  });
  
  // Handle root endpoint
  router.get('/', (req, res) => {
    if (req.isAuthenticated()) {
      res.send(`Welcome ${req.user.displayName}! You are logged in successfully.`);
    } else {
      res.send('Welcome to our application! Please log in.');
    }
  });
  
  // Google OAuth routes
  router.get('/auth/google', 
    passport.authenticate('google', { scope: ['profile', 'email'] })
  );
  router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
    console.log('Google profile data:', req.user); // Assuming req.user contains the OAuth profile data
    res.redirect('https://localhost:3000'); // Adjust according to your frontend URL
  });
  
  // Handle login failures explicitly
  router.get('/login', (req, res) => {
    res.status(401).send('Login Failed. Unable to authenticate with Google.'); // Provide a more informative message or a login page
  });


module.exports = router;