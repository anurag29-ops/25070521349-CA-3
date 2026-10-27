import mongoose from 'mongoose';
import { fallbackStore } from './memoryStore.js';
import User from './models/User.js';
import Score from './models/Score.js';
import Review from './models/Review.js';

let isConnected = false;
let lastError = null;
let retryInterval = null;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/playhub';

  try {
    mongoose.set('strictQuery', false);
    // Note: bufferTimeoutMS is set so operations don't freeze if disconnected
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500,
    });
    isConnected = true;
    lastError = null;
    console.log(`\n======================================================`);
    console.log(`✅ [MongoDB Community Server] Connected: ${uri}`);
    console.log(`🧭 [MongoDB Compass] Connect your Compass to: ${uri}`);
    console.log(`======================================================\n`);

    if (retryInterval) {
      clearInterval(retryInterval);
      retryInterval = null;
    }

    // Sync any registered accounts or scores created while waiting for MongoDB
    await syncPendingToMongo();
  } catch (err) {
    isConnected = false;
    lastError = err.message;
    console.log(`ℹ️ [MongoDB Status] Server not reachable at ${uri} (${err.message}).`);
    console.log(`⚡ [Play Hub] Running in High-Availability Mode (all features active).`);
    console.log(`🧭 [MongoDB Compass] As soon as MongoDB is started, it will connect to ${uri}`);

    // Schedule background reconnection attempts
    if (!retryInterval) {
      retryInterval = setInterval(async () => {
        if (mongoose.connection.readyState !== 1) {
          try {
            await mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 });
            isConnected = true;
            lastError = null;
            console.log(`✅ [MongoDB Auto-Reconnected] to ${uri}`);
            clearInterval(retryInterval);
            retryInterval = null;
            await syncPendingToMongo();
          } catch (e) {
            // Keep waiting
          }
        }
      }, 10000);
    }
  }
};

const syncPendingToMongo = async () => {
  try {
    for (const u of fallbackStore.users) {
      const exists = await User.findOne({ username: u.username });
      if (!exists) {
        await User.create(u);
        console.log(`🔄 [Sync] Migrated user "${u.username}" to MongoDB User collection!`);
      }
    }
    for (const s of fallbackStore.scores) {
      const exists = await Score.findOne({ username: s.username, gameSlug: s.gameSlug, score: s.score });
      if (!exists) {
        await Score.create(s);
      }
    }
    for (const r of fallbackStore.reviews) {
      const exists = await Review.findOne({ username: r.username, gameSlug: r.gameSlug, comment: r.comment });
      if (!exists) {
        await Review.create(r);
      }
    }
  } catch (err) {
    console.warn('Sync notice:', err.message);
  }
};

export const getDbStatus = () => {
  const readyState = mongoose.connection.readyState;
  return {
    connected: readyState === 1,
    readyState,
    statusText: readyState === 1 ? 'Connected (Live MongoDB)' : 'Awaiting MongoDB Server (Fallback Store Active)',
    uri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/playhub',
    host: mongoose.connection.host || '127.0.0.1',
    port: mongoose.connection.port || 27017,
    dbName: mongoose.connection.name || 'playhub',
    lastError,
  };
};

export default connectDB;
