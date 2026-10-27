import mongoose from 'mongoose';

const ScoreSchema = new mongoose.Schema(
  {
    gameSlug: {
      type: String,
      required: true,
      index: true,
    },
    gameTitle: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    username: {
      type: String,
      required: true,
      trim: true,
    },
    avatar: {
      type: String,
      default: 'cyber-fox',
    },
    score: {
      type: Number,
      required: true,
      index: true,
    },
    difficulty: {
      type: String,
      default: 'Normal',
    },
    extraData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to quickly fetch top scores for a game
ScoreSchema.index({ gameSlug: 1, score: -1 });

export default mongoose.models.Score || mongoose.model('Score', ScoreSchema);
