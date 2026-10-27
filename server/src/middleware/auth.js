import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { fallbackStore } from '../memoryStore.js';

const JWT_SECRET = process.env.JWT_SECRET || 'playhub_ultra_secure_jwt_secret_2026_xyz';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);

      let user = null;

      if (mongoose.connection.readyState === 1) {
        user = await User.findById(decoded.id).select('-password');
      }

      if (!user) {
        const found = fallbackStore.users.find(
          (u) => u._id.toString() === decoded.id.toString()
        );
        if (found) {
          user = { ...found };
          delete user.password;
        }
      }

      if (!user) {
        return res.status(401).json({ success: false, message: 'User not found or session expired' });
      }

      req.user = user;
      return next();
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Not authorized, invalid token' });
    }
  }

  return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
};

export const optionalAuth = async (req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);

      let user = null;
      if (mongoose.connection.readyState === 1) {
        user = await User.findById(decoded.id).select('-password');
      }

      if (!user) {
        const found = fallbackStore.users.find(
          (u) => u._id.toString() === decoded.id.toString()
        );
        if (found) {
          user = { ...found };
          delete user.password;
        }
      }

      req.user = user;
    } catch (e) {
      // Ignore token failure for optional endpoints
    }
  }
  next();
};
