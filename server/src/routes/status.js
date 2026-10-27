import express from 'express';
import mongoose from 'mongoose';
import { getDbStatus, connectDB } from '../db.js';
import User from '../models/User.js';
import Game from '../models/Game.js';
import Score from '../models/Score.js';
import Review from '../models/Review.js';

const router = express.Router();

/**
 * @route   GET /api/status
 * @desc    Get system health, MongoDB connection details & Compass compatibility info
 */
router.get('/', async (req, res) => {
  const dbStatus = getDbStatus();

  let counts = { users: 0, games: 0, scores: 0, reviews: 0 };
  let collections = [];

  if (mongoose.connection.readyState === 1) {
    try {
      counts.users = await User.countDocuments();
      counts.games = await Game.countDocuments();
      counts.scores = await Score.countDocuments();
      counts.reviews = await Review.countDocuments();

      if (mongoose.connection.db) {
        const list = await mongoose.connection.db.listCollections().toArray();
        collections = list.map((c) => c.name);
      }
    } catch (e) {
      console.warn('Error reading counts:', e.message);
    }
  }

  return res.json({
    success: true,
    platform: 'Play Hub Full-Stack API',
    timestamp: new Date().toISOString(),
    database: {
      ...dbStatus,
      collections,
      counts,
      compassInstructions: {
        step1: 'Open MongoDB Compass',
        step2: `Paste connection string: ${dbStatus.uri}`,
        step3: 'Click "Connect"',
        step4: `Explore the "${dbStatus.dbName}" database and collections: [users, games, scores, reviews]`,
      },
    },
  });
});

/**
 * @route   POST /api/status/reconnect
 * @desc    Manually trigger reconnect to MongoDB
 */
router.post('/reconnect', async (req, res) => {
  try {
    await connectDB();
    const status = getDbStatus();
    return res.json({ success: true, status });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
