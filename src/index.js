// Load dotenv only if .env file exists (not needed on Vercel)
try { require('dotenv').config(); } catch(e) {}

const express = require('express');
const cors = require('cors');
const profileRoutes = require('./routes/profileRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root route - redirect to API docs
app.get('/', (req, res) => {
  res.json({
    name: 'Profile Intelligence Service',
    description: 'Enrich names with gender, age, and nationality data',
    docs: '/api',
    version: '1.0.0'
  });
});

// API routes
app.use('/api', profileRoutes);

// Error handling
app.use(errorHandler);

module.exports = app;
