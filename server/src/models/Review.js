import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema(
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
    },
    avatar: {
      type: String,
      default: 'cyber-fox',
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
    likes: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Review || mongoose.model('Review', ReviewSchema);
