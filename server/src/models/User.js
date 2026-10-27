import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your full name'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    username: {
      type: String,
      required: [true, 'Please provide a username'],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [24, 'Username cannot exceed 24 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    avatar: {
      type: String,
      default: 'cyber-fox',
    },
    bio: {
      type: String,
      default: 'Ready to play, compete, and conquer on Play Hub!',
      maxlength: [200, 'Bio cannot exceed 200 characters'],
    },
    favGenre: {
      type: String,
      default: 'Cyberpunk & Arcade',
    },
    level: {
      type: Number,
      default: 1,
    },
    xp: {
      type: Number,
      default: 100,
    },
    tokens: {
      type: Number,
      default: 500,
    },
    library: [
      {
        slug: { type: String, required: true },
        title: { type: String, required: true },
        addedAt: { type: Date, default: Date.now },
        playtimeMinutes: { type: Number, default: 0 },
        highScore: { type: Number, default: 0 },
        status: { type: String, enum: ['Playing', 'Completed', 'Wishlist'], default: 'Playing' },
      },
    ],
    achievements: [
      {
        id: String,
        name: String,
        description: String,
        unlockedAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Encrypt password using bcrypt before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Remove password from JSON representation
UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export default mongoose.models.User || mongoose.model('User', UserSchema);
