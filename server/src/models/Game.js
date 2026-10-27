import mongoose from 'mongoose';

const GameSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    tagline: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      required: true,
      enum: ['Arcade', 'Action', 'RPG', 'Puzzle', 'Sci-Fi', 'Strategy', 'Retro'],
      default: 'Arcade',
    },
    description: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      default: 4.8,
    },
    ratingCount: {
      type: Number,
      default: 120,
    },
    bannerImage: {
      type: String,
      default: '',
    },
    iconImage: {
      type: String,
      default: '',
    },
    accentColor: {
      type: String,
      default: '#8b5cf6',
    },
    badge: {
      type: String,
      default: 'FEATURED',
    },
    tags: [String],
    isPlayableInBrowser: {
      type: Boolean,
      default: false,
    },
    playableType: {
      type: String,
      enum: ['none', 'jump', 'snake', '2048', 'memory'],
      default: 'none',
    },
    playsCount: {
      type: Number,
      default: 0,
    },
    likesCount: {
      type: Number,
      default: 0,
    },
    releaseYear: {
      type: Number,
      default: 2026,
    },
    developer: {
      type: String,
      default: 'Play Hub Studios',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Game || mongoose.model('Game', GameSchema);
