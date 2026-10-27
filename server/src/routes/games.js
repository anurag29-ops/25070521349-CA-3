import express from 'express';
import mongoose from 'mongoose';
import Game from '../models/Game.js';
import User from '../models/User.js';
import { fallbackStore } from '../memoryStore.js';
import { defaultGamesList } from '../seed.js';
import { protect, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   GET /api/games
 * @desc    Get all games with category filtering and search
 */
router.get('/', async (req, res) => {
  try {
    const { category, search, playable } = req.query;
    const isMongoReady = mongoose.connection.readyState === 1;

    let games = [];

    if (isMongoReady) {
      let query = {};
      if (category && category !== 'All') {
        query.category = category;
      }
      if (playable === 'true') {
        query.isPlayableInBrowser = true;
      }
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } },
        ];
      }
      games = await Game.find(query).sort({ rating: -1, playsCount: -1 });
    }

    if (!games || games.length === 0) {
      let filtered = fallbackStore.games && fallbackStore.games.length > 0 ? fallbackStore.games : defaultGamesList;
      if (category && category !== 'All') {
        filtered = filtered.filter((g) => g.category.toLowerCase() === category.toLowerCase());
      }
      if (playable === 'true') {
        filtered = filtered.filter((g) => g.isPlayableInBrowser);
      }
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (g) =>
            g.title.toLowerCase().includes(q) ||
            g.description.toLowerCase().includes(q) ||
            (g.tags && g.tags.some((t) => t.toLowerCase().includes(q)))
        );
      }
      games = filtered;
    }

    return res.json({ success: true, count: games.length, games });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/games/:slug
 * @desc    Get single game by slug
 */
router.get('/:slug', async (req, res) => {
  try {
    const slug = req.params.slug.toLowerCase();
    const isMongoReady = mongoose.connection.readyState === 1;
    let game = null;

    if (isMongoReady) {
      game = await Game.findOne({ slug });
    }

    if (!game) {
      const list = fallbackStore.games.length > 0 ? fallbackStore.games : defaultGamesList;
      game = list.find((g) => g.slug === slug);
    }

    if (!game) {
      return res.status(404).json({ success: false, message: 'Game not found' });
    }

    return res.json({ success: true, game });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   POST /api/games/:slug/play
 * @desc    Increment game plays counter
 */
router.post('/:slug/play', optionalAuth, async (req, res) => {
  try {
    const slug = req.params.slug.toLowerCase();
    const isMongoReady = mongoose.connection.readyState === 1;

    let count = 0;
    if (isMongoReady) {
      const game = await Game.findOneAndUpdate(
        { slug },
        { $inc: { playsCount: 1 } },
        { new: true }
      );
      if (game) count = game.playsCount;

      if (req.user && req.user._id) {
        await User.findByIdAndUpdate(req.user._id, { $inc: { xp: 25, tokens: 10 } });
      }
    }

    const fallbackGame = fallbackStore.games.find((g) => g.slug === slug);
    if (fallbackGame) {
      fallbackGame.playsCount = (fallbackGame.playsCount || 0) + 1;
      if (!count) count = fallbackGame.playsCount;
    }

    if (req.user) {
      const fUser = fallbackStore.users.find((u) => u._id.toString() === req.user._id.toString());
      if (fUser) {
        fUser.xp = (fUser.xp || 0) + 25;
        fUser.tokens = (fUser.tokens || 0) + 10;
      }
    }

    return res.json({ success: true, playsCount: count });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   POST /api/games/:slug/library
 * @desc    Add or remove game from user's personal library
 */
router.post('/:slug/library', protect, async (req, res) => {
  try {
    const slug = req.params.slug.toLowerCase();
    const { status = 'Playing' } = req.body;
    const isMongoReady = mongoose.connection.readyState === 1;

    let targetTitle = slug;
    const list = fallbackStore.games.length > 0 ? fallbackStore.games : defaultGamesList;
    const gFound = list.find((g) => g.slug === slug);
    if (gFound) targetTitle = gFound.title;

    let action = 'added';
    let library = [];

    if (isMongoReady) {
      const user = await User.findById(req.user._id);
      if (user) {
        const existingIndex = user.library.findIndex((item) => item.slug === slug);
        if (existingIndex > -1) {
          user.library.splice(existingIndex, 1);
          action = 'removed';
        } else {
          user.library.push({
            slug,
            title: targetTitle,
            status,
            highScore: 0,
            playtimeMinutes: 0,
          });
          action = 'added';
        }
        await user.save();
        library = user.library;
      }
    }

    const fUser = fallbackStore.users.find((u) => u._id.toString() === req.user._id.toString());
    if (fUser) {
      if (!fUser.library) fUser.library = [];
      const fIdx = fUser.library.findIndex((item) => item.slug === slug);
      if (fIdx > -1) {
        fUser.library.splice(fIdx, 1);
        action = 'removed';
      } else {
        fUser.library.push({
          slug,
          title: targetTitle,
          status,
          highScore: 0,
          playtimeMinutes: 0,
        });
        action = 'added';
      }
      if (!library || library.length === 0) library = fUser.library;
    }

    return res.json({
      success: true,
      action,
      message: action === 'added' ? `Added ${targetTitle} to your library!` : `Removed ${targetTitle} from your library`,
      library,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
