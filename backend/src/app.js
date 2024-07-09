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
const User = require('./models/User');

// Route Imports
const authRoutes = require('./routes/authRoutes.js');
const profileRoutes = require('./routes/profileRoutes');
const contractRoutes = require('./routes/contractRoutes');
const postRoutes = require('./routes/postRoutes');
const messageRoutes = require('./routes/messageRoutes');
const userRoutes = require('./routes/userRoutes');

// Logging with Winston and HTTP request logging with Morgan
const winston = require('winston');
const morgan = require('morgan');
const promClient = require('prom-client');
require('dotenv').config();

/*
  Middleware 
*/
const app = express();
const PORT = process.env.PORT || 5001;
const corsOptions = {
  origin: 'https://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json());
app.use(cookieParser());
app.use(helmet());
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

const collectDefaultMetrics = promClient.collectDefaultMetrics;
collectDefaultMetrics({ timeout: 5000 });

/*
  Logging configuration 
*/
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'user-service' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ],
});
logger.exceptions.handle(
  new winston.transports.File({ filename: 'exceptions.log' })
);
process.on('unhandledRejection', (reason, promise) => {
  throw reason;
});
app.use(morgan('combined', { stream: { write: message => logger.info(message) } }));
logger.info('Info level log');
logger.error('Error level log');

/*
  MongoDB and session configurations 
*/
mongoose.connect(process.env.MONGODB_URI).then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    collectionName: 'sessions'
  }),
  cookie: {
    secure: true,
    sameSite: 'None',
    maxAge: 24 * 60 * 60 * 1000
  }
}));

/*
  Google Strategy 
*/
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "https://localhost:5001/auth/google/callback",
  prompt: 'select_account'
},
  async function (accessToken, refreshToken, profile, cb) {
    try {
      let user = await User.findOne({ googleId: profile.id });
      if (!user) {
        user = new User({
          username: profile.displayName,
          email: profile.emails[0].value,
          googleId: profile.id
        });
        await user.save();
      }
      return cb(null, user);
    } catch (err) {
      return cb(err);
    }
  }));

passport.serializeUser(function (user, done) {
  done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    if (!user) {
      done(new Error('User not found'), null);
    } else {
      done(null, user);
    }
  } catch (err) {
    done(err, null);
  }
});
app.use(passport.initialize());
app.use(passport.session());

/*
  Routes 
*/
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', promClient.register.contentType);
  res.end(await promClient.register.metrics());
});

app.use(authRoutes);
app.use(profileRoutes);
app.use('/api', userRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api', postRoutes);
app.use('/api', messageRoutes);

app.get('/verify', async (req, res) => {
  if (req.isAuthenticated()) {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ isAuthenticated: true, error: 'User not found.' });
      }
      res.json({ isAuthenticated: true, user: { id: user.id, username: user.username, email: user.email } });
    } catch (err) {
      console.error("Database error:", err);
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

https.createServer({
  key: fs.readFileSync('./security/server-key.pem'),
  cert: fs.readFileSync('./security/server.pem')
}, app).listen(PORT, () => {
  logger.info(`HTTPS server running on https://localhost:${PORT}`);
});
