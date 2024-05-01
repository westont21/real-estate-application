const express = require('express');
const session = require('express-session');
const fs = require('fs');
const https = require('https');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const userRoutes = require('./routes/userRoutes');
const User = require('./models/User');
//Logging with Winston and HTTP request logging with Morgan
const winston = require('winston');
const morgan = require('morgan');
//monitoring 
const promClient = require('prom-client');
require('dotenv').config();

/*
  Middleware 
*/
const app = express();
const PORT = process.env.PORT || 5001; // Ensure PORT is correctly defaulted
const corsOptions = {
  origin: 'https://localhost:3000',  // This should match the exact URL of your frontend
  credentials: true,  // This allows cookies/session to be sent
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));//Handel preflight globally

app.use(express.json());
app.use(cookieParser());
// Applying basic security headers with Helmet
app.use(helmet());
// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Monitoring 
const collectDefaultMetrics = promClient.collectDefaultMetrics;
collectDefaultMetrics({ timeout: 5000 }); // Probe every 5 seconds

/*
  Logging configuration 
*/
// Configure Winston
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'user-service' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ],
});
// Morgan setup to use Winston
app.use(morgan('combined', { stream: { write: message => logger.info(message) } }));
// Example of manual logging
logger.info('Info level log');
logger.error('Error level log');

/*
  MongoDB and session configurations 

*/
// MongoDB connection
mongoose.connect(process.env.MONGODB_URI).then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));
// Use existing Mongoose connection for session store
app.use(session({
  secret: 'your_secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    collectionName: 'sessions'
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Only set secure in production
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax', // Adjust for development
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

/*
  Google Strategy 
*/
//Google strategy to handle user creation or retrieval from database
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "https://localhost:5001/auth/google/callback", 
  prompt: 'select_account'  // This often needs to be set in the authentication URL instead
},
  async function (accessToken, refreshToken, profile, cb) {
    try {
      let user = await User.findOne({ googleId: profile.id });
      if (!user) {
        // Create a new user if one doesn't exist
        user = new User({
          username: profile.displayName,
          email: profile.emails[0].value,
          googleId: profile.id
        });
        await user.save();
      }
      return cb(null, user); // Successful authentication, return user
    } catch (err) {
      return cb(err); // Error handling
    }
  }));

passport.serializeUser(function (user, done) {
  
  done(null, user.id); // Serialize user by their id
});
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    if (!user) {
      done(new Error('User not found'), null); // Handle case where user isn't found
    } else {
      done(null, user);
    }
  } catch (err) {
    done(err, null); // Properly handle database or other errors
  }
});
app.use(passport.initialize());
app.use(passport.session());

//Server-Side Session Debugging
// app.use((req, res, next) => {
//   console.log('Session ID:', req.sessionID);
//   console.log('Session data:', req.session);
//   next();
// });

/*
  Routes 
*/
// Expose the metrics at the '/metrics' endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', promClient.register.contentType);
  res.end(await promClient.register.metrics());
});

app.get('/logout', (req, res) => {
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
app.get('/', (req, res) => {
  if (req.isAuthenticated()) {
    res.send(`Welcome ${req.user.displayName}! You are logged in successfully.`);
  } else {
    res.send('Welcome to our application! Please log in.');
  }
});

// Google OAuth routes
app.get('/auth/google', 
  passport.authenticate('google', { scope: ['profile', 'email'] })
);
app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
  console.log('Google profile data:', req.user); // Assuming req.user contains the OAuth profile data
  res.redirect('https://localhost:3000'); // Adjust according to your frontend URL
});

// Handle login failures explicitly
app.get('/login', (req, res) => {
  res.status(401).send('Login Failed. Unable to authenticate with Google.'); // Provide a more informative message or a login page
});

// Setup routes
//app.use('/api/users', userRoutes);

/* 
Route to handle verification of user session.  If the user is authenticated,
it retrieves the user's data from the database and sends it back to the client.
*/
app.get('/verify', async (req, res) => {
  if (req.isAuthenticated()) {
    try {
      // Assuming req.user is populated according to your session and passport configuration
      const user = await User.findById(req.user.id);
      // Check if user was found
      if (!user) {
        return res.status(404).json({ isAuthenticated: true, error: 'User not found.' });
      }
      res.json({ isAuthenticated: true, user: { id: user.id, username: user.username, email: user.email } });
    } catch (err) {
      console.error("Database error:", err); // Log error for debugging
      res.status(500).json({ isAuthenticated: false, error: 'Failed to retrieve user data.' });
    }
  } else {
    res.status(401).json({ isAuthenticated: false });
  }
});


app.use((err, req, res, next) => {
  console.error('An error occurred:', err.stack);
  res.status(500).send('Internal Server Error');
});

const options = {
  key: fs.readFileSync('./security/server-key.pem'),
  cert: fs.readFileSync('./security/server.pem')
};

// HTTPS server setup
https.createServer(options, app).listen(5001, () => {
  console.log('HTTPS server running on https://localhost:5001');
});
