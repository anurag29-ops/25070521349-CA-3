import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './db.js';
import { seedDatabase } from './seed.js';

import authRoutes from './routes/auth.js';
import gameRoutes from './routes/games.js';
import scoreRoutes from './routes/scores.js';
import reviewRoutes from './routes/reviews.js';
import statusRoutes from './routes/status.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration - allow React client Vite dev server
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

// Root welcome & API summary
app.get('/', (req, res) => {
  res.json({
    name: 'Play Hub Full-Stack API',
    status: 'online',
    version: '1.0.0',
    databaseTarget: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/playhub',
    endpoints: {
      auth: ['POST /api/auth/register', 'POST /api/auth/login', 'GET /api/auth/me', 'GET /api/auth/users'],
      games: ['GET /api/games', 'GET /api/games/:slug', 'POST /api/games/:slug/library'],
      scores: ['GET /api/scores', 'POST /api/scores'],
      reviews: ['GET /api/reviews', 'POST /api/reviews'],
      status: ['GET /api/status', 'POST /api/status/reconnect'],
    },
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/scores', scoreRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/status', statusRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// Start Server immediately and connect to MongoDB
const server = app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 [Play Hub Backend] Server listening on http://localhost:${PORT}`);
  console.log(`📡 [API Health & Mongo Diagnostic] http://localhost:${PORT}/api/status`);
  console.log(`🎮 [Client Ready] http://localhost:5173`);
  console.log(`======================================================\n`);

  // Connect to MongoDB asynchronously
  connectDB().then(() => {
    seedDatabase();
  });
});

export default app;
