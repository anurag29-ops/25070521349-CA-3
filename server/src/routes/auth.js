import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { fallbackStore } from '../memoryStore.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'playhub_ultra_secure_jwt_secret_2026_xyz';

const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' });
};

/**
 * @route   POST /api/auth/register
 * @desc    Create new user account (Persists to MongoDB)
 * @access  Public
 */
router.post('/register', async (req, res) => {
  try {
    const { name, username, email, password, avatar, favGenre, bio } = req.body;

    if (!name || !username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: Name, Username, Email, and Password.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    const cleanUsername = username.toLowerCase().trim();
    const cleanEmail = email.toLowerCase().trim();
    const cleanName = name.trim();

    const isMongoReady = mongoose.connection.readyState === 1;

    if (isMongoReady) {
      const existingUser = await User.findOne({
        $or: [{ email: cleanEmail }, { username: cleanUsername }],
      });

      if (existingUser) {
        const field = existingUser.email === cleanEmail ? 'Email' : 'Username';
        return res.status(400).json({
          success: false,
          message: `${field} "${field === 'Email' ? cleanEmail : cleanUsername}" is already registered. Please login instead.`,
        });
      }

      const user = await User.create({
        name: cleanName,
        username: cleanUsername,
        email: cleanEmail,
        password, // hashed by mongoose pre-save hook
        avatar: avatar || 'cyber-fox',
        favGenre: favGenre || 'Cyberpunk & Arcade',
        bio: bio || 'Ready to play, compete, and conquer on Play Hub!',
        library: [
          { slug: 'cyber-dash', title: 'Cyber Dash', status: 'Playing', highScore: 120, playtimeMinutes: 15 },
          { slug: 'neon-snake', title: 'Neon Snake 3000', status: 'Playing', highScore: 80, playtimeMinutes: 25 },
        ],
        achievements: [
          { id: 'welcome-hub', name: 'Welcome to the Grid', description: 'Created your official Play Hub account.' },
        ],
      });

      // Keep backup in fallbackStore for instant memory sync
      fallbackStore.users.push(user.toJSON());

      const token = generateToken(user._id.toString());

      return res.status(201).json({
        success: true,
        message: 'Account created successfully in MongoDB!',
        storage: 'MongoDB Community Server',
        token,
        user: user.toJSON(),
      });
    } else {
      // High-availability fallback store
      const existingUser = fallbackStore.users.find(
        (u) => u.email === cleanEmail || u.username === cleanUsername
      );

      if (existingUser) {
        const field = existingUser.email === cleanEmail ? 'Email' : 'Username';
        return res.status(400).json({
          success: false,
          message: `${field} is already registered. Please login instead.`,
        });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = {
        _id: 'user_' + Date.now(),
        name: cleanName,
        username: cleanUsername,
        email: cleanEmail,
        password: hashedPassword,
        avatar: avatar || 'cyber-fox',
        favGenre: favGenre || 'Cyberpunk & Arcade',
        bio: bio || 'Ready to play, compete, and conquer on Play Hub!',
        level: 1,
        xp: 150,
        tokens: 500,
        library: [
          { slug: 'cyber-dash', title: 'Cyber Dash', status: 'Playing', highScore: 120, playtimeMinutes: 15 },
          { slug: 'neon-snake', title: 'Neon Snake 3000', status: 'Playing', highScore: 80, playtimeMinutes: 25 },
        ],
        achievements: [
          { id: 'welcome-hub', name: 'Welcome to the Grid', description: 'Created your official Play Hub account.' },
        ],
        createdAt: new Date(),
      };

      fallbackStore.users.push(newUser);

      const token = generateToken(newUser._id);
      const safeUser = { ...newUser };
      delete safeUser.password;

      return res.status(201).json({
        success: true,
        message: 'Account created successfully! (Synchronizing with MongoDB)',
        storage: 'High-Availability Store (Auto-syncs to MongoDB on start)',
        token,
        user: safeUser,
      });
    }
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error processing registration',
    });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & return token
 * @access  Public
 */
router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email/username and password',
      });
    }

    const cleanIdentifier = identifier.toLowerCase().trim();
    const isMongoReady = mongoose.connection.readyState === 1;

    let user = null;
    let isMatch = false;

    if (isMongoReady) {
      user = await User.findOne({
        $or: [{ email: cleanIdentifier }, { username: cleanIdentifier }],
      });
      if (user) {
        isMatch = await user.matchPassword(password);
      }
    }

    // Check fallbackStore if not found in Mongo or if Mongo is disconnected
    if (!user) {
      const fallbackUser = fallbackStore.users.find(
        (u) => u.email === cleanIdentifier || u.username === cleanIdentifier
      );
      if (fallbackUser) {
        isMatch = await bcrypt.compare(password, fallbackUser.password);
        if (isMatch) {
          user = fallbackUser;
        }
      }
    }

    if (!user || !isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your username/email and password.',
      });
    }

    const token = generateToken(user._id.toString());
    const safeUser = typeof user.toJSON === 'function' ? user.toJSON() : { ...user };
    delete safeUser.password;

    return res.json({
      success: true,
      message: `Welcome back, ${safeUser.username}!`,
      token,
      user: safeUser,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error processing login',
    });
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged in user
 * @access  Private
 */
router.get('/me', protect, async (req, res) => {
  return res.json({
    success: true,
    user: req.user,
  });
});

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', protect, async (req, res) => {
  try {
    const { avatar, bio, favGenre, name } = req.body;
    const isMongoReady = mongoose.connection.readyState === 1;

    let updatedUser = null;

    if (isMongoReady) {
      const u = await User.findById(req.user._id);
      if (u) {
        if (avatar) u.avatar = avatar;
        if (bio !== undefined) u.bio = bio;
        if (favGenre) u.favGenre = favGenre;
        if (name) u.name = name;
        await u.save();
        updatedUser = u.toJSON();
      }
    }

    // Also update fallbackStore
    const fIdx = fallbackStore.users.findIndex((u) => u._id.toString() === req.user._id.toString());
    if (fIdx > -1) {
      if (avatar) fallbackStore.users[fIdx].avatar = avatar;
      if (bio !== undefined) fallbackStore.users[fIdx].bio = bio;
      if (favGenre) fallbackStore.users[fIdx].favGenre = favGenre;
      if (name) fallbackStore.users[fIdx].name = name;
      if (!updatedUser) updatedUser = { ...fallbackStore.users[fIdx] };
      delete updatedUser.password;
    }

    return res.json({
      success: true,
      message: 'Profile updated successfully!',
      user: updatedUser || req.user,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/auth/users
 * @desc    List registered players (for community & Compass verification)
 * @access  Public
 */
router.get('/users', async (req, res) => {
  try {
    const isMongoReady = mongoose.connection.readyState === 1;
    let users = [];

    if (isMongoReady) {
      users = await User.find({}).select('-password').sort({ createdAt: -1 });
    }

    if (users.length === 0) {
      users = fallbackStore.users.map((u) => {
        const copy = { ...u };
        delete copy.password;
        return copy;
      });
    }

    return res.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
