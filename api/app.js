// Import required modules
const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const redis = require('redis');
const bcrypt = require('bcrypt');
const User = require('./models/Profile'); // Correct path to your model

// Load environment variables
dotenv.config();
if (!process.env.MONGO_URI || !process.env.SESSION_SECRET) {
  console.error('Required environment variables are missing. Check your .env file.');
  process.exit(1);
}

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/profileDB';
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log(`Connected to MongoDB at ${MONGO_URI}`);
  })
  .catch((err) => {
    console.error('MongoDB Connection Failed:', err);
    console.error('Check your MONGO_URI or database credentials.');
    process.exit(1);
  });


// Configure Redis Client
const redisClient = redis.createClient({
  socket: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT || 6379,
  },
});

redisClient.on('error', (err) => console.error('Redis error:', err));
redisClient
  .connect()
  .then(() => console.log('Redis connected successfully!'))
  .catch((err) => {
    console.error('Redis connection error:', err);
    process.exit(1);
  });

// Initialize Express app
const app = express();

// Session management with MongoDB
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: MONGO_URI }),
    cookie: {
      secure: process.env.NODE_ENV === 'production', // Use HTTPS in production
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24, // 1-day session expiration
    },
  })
);

// Middleware for parsing JSON and URL-encoded data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Serve static files
app.use('/css', express.static(path.join(__dirname, 'public/css')));
app.use('/js', express.static(path.join(__dirname, 'public/js')));
app.use('/php', express.static(path.join(__dirname, 'php')));

// Route: Home
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Route: Login
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/login.html'));
});

// Route: Register
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/register.html'));
});
// Route: Profile (HTML)
app.get('/profile', async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login'); // Redirect to login if not authenticated
  }

  try {
    const profile = await User.findOne({ email: req.session.user.email });
    if (!profile) {
      return res.status(404).send('<h1>Profile not found</h1>'); // Display an error in HTML
    }

    // Render the profile page dynamically with user data
    res.send(`
      <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="css/style.css">
  <title>Profile Page</title>
  <style>
    /* Basic Reset */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f9;
      color: #333;
      height: 100vh;
    }

    .profile-container {
      position: absolute;
      top: 20px;
      right: 20px;
      width: 300px;
      padding: 20px;
      background-color: #fff;
      border-radius: 10px;
      box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
      border: 1px solid #ccc;
    }

    h1 {
      font-size: 24px;
      color: darkgreen;
      margin-bottom: 20px;
      text-align: center;
    }

    p {
      font-size: 18px;
      color: darkgreen;
      margin-bottom: 10px;
    }

    .back-button {
      display: block;
      margin: 20px auto 0;
      background-color: #006400; /* Dark green background */
      color: white;
      border: none;
      border-radius: 6px;
      padding: 10px 20px;
      font-size: 16px;
      cursor: pointer;
      transition: background-color 0.3s ease;
    }

    .back-button:hover {
      background-color: #004d00; /* Slightly darker green */
    }

    .back-button:focus {
      outline: none;
    }
  </style>
</head>
<body>
  <div class="profile-container">
    <h1>Profile</h1>
    <p>Welcome, ${profile.username}!</p>
    <p><strong>Email:</strong> ${profile.email}</p>
    <a href="/">
      <button type="button" class="back-button">Back</button>
    </a>
  </div>
</body>
</html>

    `);
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).send('<h1>Internal Server Error</h1>');
  }
});



// Route: Register (API)
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already in use.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ success: true, message: 'Registration successful', username });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});
// Route: Login (API)
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    // Fetch user from MongoDB
    const user = await User.findOne({ email });

    // Check if user exists
    if (!user) {
      return res.status(400).json({ success: false, message: 'User not found.' });
    }

    // Compare entered password with stored hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Incorrect password.' });
    }

    // Store session data
    req.session.user = { email: user.email, username: user.username };

    // Send successful response
    res.status(200).json({
      success: true,
      message: 'Login successful!! Wait',
      redirectTo: '/profile', // Redirect to the profile page
    });
    
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// 404 Error handler
app.use((req, res) => {
  res.status(404).json({ error: 'File Not Found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message });
});

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server started on http://127.0.0.1:${PORT}`);
});
