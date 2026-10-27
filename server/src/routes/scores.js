import express from 'express';
import mongoose from 'mongoose';
import Score from '../models/Score.js';
import User from '../models/User.js';
import { fallbackStore } from '../memoryStore.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   GET /api/scores
 * @desc    Get top scores (optionally filtered by gameSlug)
 */
router.get('/', async (req, res) => {
  try {
    const { gameSlug, limit = 20 } = req.query;
    const isMongoReady = mongoose.connection.readyState === 1;
    let scores = [];

    if (isMongoReady) {
      let query = {};
      if (gameSlug) query.gameSlug = gameSlug.toLowerCase();
      scores = await Score.find(query)
        .sort({ score: -1, createdAt: 1 })
        .limit(parseInt(limit, 10));
    }

    if (scores.length === 0) {
      let filtered = [...fallbackStore.scores];
      if (gameSlug) {
        filtered = filtered.filter((s) => s.gameSlug === gameSlug.toLowerCase());
      }
      filtered.sort((a, b) => b.score - a.score);
      scores = filtered.slice(0, parseInt(limit, 10));
    }

    return res.json({ success: true, count: scores.length, scores });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   POST /api/scores
 * @desc    Submit score for a game
 */
router.post('/', optionalAuth, async (req, res) => {
  try {
    const { gameSlug, gameTitle, score, username, avatar, difficulty } = req.body;

    if (!gameSlug || score === undefined) {
      return res.status(400).json({ success: false, message: 'Game slug and score are required' });
    }

    const finalUsername = req.user ? req.user.username : (username || 'GuestPlayer');
    const finalAvatar = req.user ? req.user.avatar : (avatar || 'cyber-fox');
    const numericScore = Number(score);
    const isMongoReady = mongoose.connection.readyState === 1;

    let createdScore = null;

    if (isMongoReady) {
      createdScore = await Score.create({
        gameSlug: gameSlug.toLowerCase(),
        gameTitle: gameTitle || gameSlug,
        userId: req.user ? req.user._id : null,
        username: finalUsername,
        avatar: finalAvatar,
        score: numericScore,
        difficulty: difficulty || 'Normal',
      });
    }

    // Always record into fallbackStore
    const fallbackEntry = {
      _id: 's_' + Date.now(),
      gameSlug: gameSlug.toLowerCase(),
      gameTitle: gameTitle || gameSlug,
      userId: req.user ? req.user._id : null,
      username: finalUsername,
      avatar: finalAvatar,
      score: numericScore,
      difficulty: difficulty || 'Normal',
      createdAt: new Date(),
    };
    fallbackStore.scores.push(fallbackEntry);

    const xpGained = Math.min(Math.floor(numericScore / 10), 500) + 50;
    let levelUp = false;

    // Update user stats
    if (req.user) {
      if (isMongoReady) {
        const user = await User.findById(req.user._id);
        if (user) {
          user.xp += xpGained;
          user.tokens += Math.floor(xpGained / 2);
          if (user.xp >= user.level * 250) {
            user.level += 1;
            levelUp = true;
          }
          const libEntry = user.library.find((item) => item.slug === gameSlug.toLowerCase());
          if (libEntry) {
            if (numericScore > libEntry.highScore) libEntry.highScore = numericScore;
            libEntry.playtimeMinutes += 5;
          }
          await user.save();
        }
      }

      const fUser = fallbackStore.users.find((u) => u._id.toString() === req.user._id.toString());
      if (fUser) {
        fUser.xp = (fUser.xp || 150) + xpGained;
        fUser.tokens = (fUser.tokens || 500) + Math.floor(xpGained / 2);
        if (fUser.xp >= (fUser.level || 1) * 250) {
          fUser.level = (fUser.level || 1) + 1;
          levelUp = true;
        }
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Score recorded to leaderboards!',
      score: createdScore || fallbackEntry,
      xpGained,
      levelUp,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
