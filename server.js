const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

// Initialize database tables
require('./backend/models/initDatabase');

// Import routes
const authRoutes = require('./backend/routes/authRoutes');
const decisionRoutes = require('./backend/routes/decisionRoutes');
const sessionRoutes = require('./backend/routes/sessionRoutes');
const opinionRoutes = require('./backend/routes/opinionRoutes');
const dashboardRoutes = require('./backend/routes/dashboardRoutes');

const app = express();
const PORT = process.env.PORT || 5001;

// CORS Configuration
const corsOptions = {
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Middleware
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api', authRoutes);
app.use('/api', decisionRoutes);
app.use('/api', sessionRoutes);
app.use('/api', opinionRoutes);
app.use('/api', dashboardRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 CORS enabled for http://localhost:3000`);
});

module.exports = app;
