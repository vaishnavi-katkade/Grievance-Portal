require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/database');

const app = express();

// Use /tmp for serverless environments (Vercel) since the local filesystem is read-only
const isVercel = process.env.VERCEL === '1';
const uploadDir = isVercel ? path.join('/tmp', 'uploads') : path.join(__dirname, 'uploads');
if (!require('fs').existsSync(uploadDir)) {
  require('fs').mkdirSync(uploadDir, { recursive: true });
}

// Connect to MongoDB
connectDB();

// View engine configuration
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Trust proxy for Vercel (required for secure cookies behind reverse proxy)
app.set('trust proxy', 1);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: true,
  credentials: true
}));

// Session configuration
const isProduction = process.env.NODE_ENV === 'production';
app.use(session({
  secret: process.env.SESSION_SECRET || 'grievance-portal-secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    collectionName: 'sessions'
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 24 hours
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax'
  }
}));

// Serve static files
app.use(express.static('public'));
app.use('/uploads', express.static(uploadDir));
app.use(express.static(path.join(__dirname)));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/complaints', require('./routes/complaints'));
app.use('/api/users', require('./routes/users'));
app.use('/admin', require('./routes/admin'));
app.use('/student', require('./routes/student'));

// Serve HTML pages
app.get('/', (req, res) => {
  res.render('auth/login');
});

app.get('/admin-login', (req, res) => {
  res.render('auth/admin-login');
});

app.get('/student.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'student.html'));
});

app.get('/admin.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

app.get('/manage-users.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'manage-users.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server only in non-Vercel environments
if (process.env.VERCEL !== '1') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

// Export for Vercel serverless
module.exports = app;
