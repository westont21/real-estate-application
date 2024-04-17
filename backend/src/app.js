// backend/src/app.js
const express = require('express');
const fs = require('fs');
const https = require('https');
const cors = require('cors');
const helmet = require('helmet'); // We'll use this for security headers
const rateLimit = require('express-rate-limit'); // Rate limiting
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');

const userRoutes = require('./routes/userRoutes');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT;

// Applying basic security headers with Helmet
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again after 15 minutes"
});
app.use(limiter);

app.use(cors()); //TD: probably need to allow credentials 
app.use(express.json());
app.use(cookieParser());

//Error handling middleware
//captures errors and logs them on the server while only sending 
//non-revealing error messages to the client.
app.use((err, req, res, next) => {
  if (!err.statusCode) err.statusCode = 500;

  if (err.statusCode === 500) {
      console.error(err.message, err.stack);
      res.status(500).json({message: 'Internal Server Error'});
  } else {
      res.status(err.statusCode).json({message: err.message});
  }
});

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("MongoDB connected"))
.catch(err => console.log(err));


// Routes
app.use('/api/users', userRoutes);

// HTTPS server setup
https.createServer({
  key: fs.readFileSync('security/server.key'),
  cert: fs.readFileSync('security/server.cert')
}, app).on('error', (err) => {
  console.error('HTTPS server setup error:', err);
}).listen(PORT, () => {
  console.log(`Secure server running on https://localhost:${PORT}`);
});
