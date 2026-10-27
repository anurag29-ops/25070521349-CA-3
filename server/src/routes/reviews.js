import express from 'express';
import mongoose from 'mongoose';
import Review from '../models/Review.js';
import Game from '../models/Game.js';
import { fallbackStore } from '../memoryStore.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   GET /api/reviews
 * @desc    Get all reviews or filtered by gameSlug
 */
router.get('/', async (req, res) => {
  try {
    const { gameSlug, limit = 30 } = req.query;
    const isMongoReady = mongoose.connection.readyState === 1;
    let reviews = [];

    if (isMongoReady) {
      let query = {};
      if (gameSlug) query.gameSlug = gameSlug.toLowerCase();
      reviews = await Review.find(query)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit, 10));
    }

    if (reviews.length === 0) {
      let filtered = [...fallbackStore.reviews];
      if (gameSlug) {
        filtered = filtered.filter((r) => r.gameSlug === gameSlug.toLowerCase());
      }
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      reviews = filtered.slice(0, parseInt(limit, 10));
    }

    return res.json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   POST /api/reviews
 * @desc    Post a new review
 */
router.post('/', optionalAuth, async (req, res) => {
  try {
    const { gameSlug, gameTitle, rating, comment, username, avatar } = req.body;

    if (!gameSlug || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Game slug, rating (1-5), and comment are required',
      });
    }

    const finalUsername = req.user ? req.user.username : (username || 'AnonymousGamer');
    const finalAvatar = req.user ? req.user.avatar : (avatar || 'cyber-fox');
    const isMongoReady = mongoose.connection.readyState === 1;

    let review = null;

    if (isMongoReady) {
      review = await Review.create({
        gameSlug: gameSlug.toLowerCase(),
        gameTitle: gameTitle || gameSlug,
        userId: req.user ? req.user._id : null,
        username: finalUsername,
        avatar: finalAvatar,
        rating: Number(rating),
        comment: comment.trim(),
      });

      const allReviews = await Review.find({ gameSlug: gameSlug.toLowerCase() });
      const avg = allReviews.reduce((acc, curr) => acc + curr.rating, 0) / allReviews.length;
      await Game.findOneAndUpdate(
        { slug: gameSlug.toLowerCase() },
        { rating: parseFloat(avg.toFixed(1)), ratingCount: allReviews.length }
      );
    }

    const fallbackEntry = {
      _id: 'r_' + Date.now(),
      gameSlug: gameSlug.toLowerCase(),
      gameTitle: gameTitle || gameSlug,
      userId: req.user ? req.user._id : null,
      username: finalUsername,
      avatar: finalAvatar,
      rating: Number(rating),
      comment: comment.trim(),
      likes: 0,
      createdAt: new Date(),
    };
    fallbackStore.reviews.unshift(fallbackEntry);

    return res.status(201).json({
      success: true,
      message: 'Review posted successfully to Play Hub!',
      review: review || fallbackEntry,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   POST /api/reviews/:id/like
 * @desc    Like a review
 */
router.post('/:id/like', async (req, res) => {
  try {
    const isMongoReady = mongoose.connection.readyState === 1;
    let likes = 0;

    if (isMongoReady) {
      const review = await Review.findByIdAndUpdate(
        req.params.id,
        { $inc: { likes: 1 } },
        { new: true }
      );
      if (review) likes = review.likes;
    }

    const fRev = fallbackStore.reviews.find((r) => r._id.toString() === req.params.id.toString());
    if (fRev) {
      fRev.likes = (fRev.likes || 0) + 1;
      if (!likes) likes = fRev.likes;
    }

    return res.json({ success: true, likes });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
