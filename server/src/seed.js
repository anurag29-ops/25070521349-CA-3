import Game from './models/Game.js';
import Score from './models/Score.js';
import Review from './models/Review.js';
import { fallbackStore } from './memoryStore.js';
import mongoose from 'mongoose';

export const defaultGamesList = [
  {
    title: 'Cyber Dash',
    slug: 'cyber-dash',
    tagline: 'Dodge supersonic laser barriers in a neon tunnel!',
    category: 'Arcade',
    description: 'An adrenaline-fueled endless runner set in a futuristic cyber corridor. Dodge shifting laser gates, jump over obstacles, collect data crystals, and survive at accelerating speeds. Submit your high score directly to the global leaderboard!',
    rating: 4.9,
    ratingCount: 342,
    accentColor: '#06b6d4',
    badge: 'PLAYABLE NOW',
    tags: ['Arcade', 'Action', 'Neon', 'Fast-Paced'],
    isPlayableInBrowser: true,
    playableType: 'jump',
    playsCount: 1420,
    likesCount: 512,
    releaseYear: 2026,
    developer: 'Neon Pulse Labs',
  },
  {
    title: 'Neon Snake 3000',
    slug: 'neon-snake',
    tagline: 'The timeless arcade classic supercharged with glowing particle physics!',
    category: 'Retro',
    description: 'Guide your cybernetic snake through a hyper-stylized digital arena. Eat plasma bits to grow, activate speed boost bursts, and avoid biting your own tail. Pure arcade nostalgia re-engineered.',
    rating: 4.8,
    ratingCount: 289,
    accentColor: '#10b981',
    badge: 'PLAYABLE NOW',
    tags: ['Retro', 'Arcade', 'Casual', 'Classic'],
    isPlayableInBrowser: true,
    playableType: 'snake',
    playsCount: 980,
    likesCount: 420,
    releaseYear: 2026,
    developer: 'BitForge Interactive',
  },
  {
    title: '2048: Cyberpunk Edition',
    slug: 'game-2048',
    tagline: 'Combine matching neural nodes to breach the 2048 quantum core!',
    category: 'Puzzle',
    description: 'Slide neon data blocks across the 4x4 matrix. Merge matching numbers to double their computing power until you construct the legendary 2048 node. Addictive, satisfying, and strategic.',
    rating: 4.7,
    ratingCount: 215,
    accentColor: '#f59e0b',
    badge: 'PLAYABLE NOW',
    tags: ['Puzzle', 'Strategy', 'Brain', 'Math'],
    isPlayableInBrowser: true,
    playableType: '2048',
    playsCount: 1105,
    likesCount: 388,
    releaseYear: 2026,
    developer: 'LogicByte Studios',
  },
  {
    title: 'Memory Matrix',
    slug: 'memory-matrix',
    tagline: 'Memorize the security access sequence before the countdown expires!',
    category: 'Puzzle',
    description: 'Infiltrate the mainframe by memorizing increasingly complex glowing neural pattern sequences. Sharpens reflexes, cognitive speed, and photographic memory.',
    rating: 4.6,
    ratingCount: 180,
    accentColor: '#ec4899',
    badge: 'PLAYABLE NOW',
    tags: ['Memory', 'Hacking', 'Cognitive', 'Puzzle'],
    isPlayableInBrowser: true,
    playableType: 'memory',
    playsCount: 840,
    likesCount: 290,
    releaseYear: 2026,
    developer: 'CyberMind Technologies',
  },
  {
    title: 'Chrono Odyssey: Valhalla',
    slug: 'chrono-odyssey',
    tagline: 'Manipulate time in a shattered mythological universe.',
    category: 'RPG',
    description: 'A revolutionary open-world action MMORPG featuring next-generation visual fidelity, real-time spatial manipulation, and massive group raid battles against elder gods.',
    rating: 4.9,
    ratingCount: 840,
    accentColor: '#a855f7',
    badge: 'TRENDING',
    tags: ['Open World', 'MMORPG', 'Time Travel', 'Action'],
    isPlayableInBrowser: false,
    playableType: 'none',
    playsCount: 5200,
    likesCount: 1890,
    releaseYear: 2026,
    developer: 'Chronos GameWorks',
  },
  {
    title: 'Synthwave Drift 84',
    slug: 'synthwave-racer',
    tagline: 'High-speed highway pursuit under perpetual sunset skies.',
    category: 'Action',
    description: 'Get behind the wheel of iconic 1980s supercars drifting down infinite neon freeways. Accompanied by an original pulsing darksynth soundtrack and reactive visualizers.',
    rating: 4.8,
    ratingCount: 420,
    accentColor: '#f43f5e',
    badge: 'HOT',
    tags: ['Racing', 'Synthwave', 'Music', 'Drift'],
    isPlayableInBrowser: false,
    playableType: 'none',
    playsCount: 3100,
    likesCount: 1120,
    releaseYear: 2025,
    developer: 'Outrun Audio & Play',
  },
  {
    title: 'Mecha Strike: Zero',
    slug: 'mecha-strike',
    tagline: 'Tactical modular mech combat in zero-gravity orbital arenas.',
    category: 'Sci-Fi',
    description: 'Customize titanium chassis with plasma railguns, kinetic energy shields, and jump thrusters. Engage in 4v4 competitive tactical arena dogfights.',
    rating: 4.7,
    ratingCount: 310,
    accentColor: '#3b82f6',
    badge: 'POPULAR',
    tags: ['Mecha', 'Shooter', 'Sci-Fi', 'Multiplayer'],
    isPlayableInBrowser: false,
    playableType: 'none',
    playsCount: 2400,
    likesCount: 780,
    releaseYear: 2026,
    developer: 'Titan Dynamics',
  },
  {
    title: 'Shadow Crypts',
    slug: 'shadow-crypts',
    tagline: 'Procedurally generated roguelike subterranean dungeon crawler.',
    category: 'Strategy',
    description: 'Delve into ever-shifting depths filled with gothic terrors, cursed artifacts, and branching skill trees. Every death is a permanent lesson in survival.',
    rating: 4.6,
    ratingCount: 195,
    accentColor: '#6366f1',
    badge: 'INDIE GEM',
    tags: ['Roguelike', 'Dungeon Crawler', 'Pixel Art', 'Dark Fantasy'],
    isPlayableInBrowser: false,
    playableType: 'none',
    playsCount: 1800,
    likesCount: 650,
    releaseYear: 2025,
    developer: 'Iron Torch Studio',
  },
];

// Initialize fallback store games
fallbackStore.games = [...defaultGamesList];

export const seedDatabase = async () => {
  if (mongoose.connection.readyState !== 1) {
    return;
  }

  try {
    const gameCount = await Game.countDocuments();
    if (gameCount === 0) {
      console.log('🌱 [Seed] Seeding games into MongoDB...');
      await Game.insertMany(defaultGamesList);
      console.log('✅ [Seed] Games seeded to MongoDB!');
    }

    const scoreCount = await Score.countDocuments();
    if (scoreCount === 0) {
      await Score.insertMany(fallbackStore.scores);
      console.log('✅ [Seed] Leaderboard scores seeded to MongoDB!');
    }

    const reviewCount = await Review.countDocuments();
    if (reviewCount === 0) {
      await Review.insertMany(fallbackStore.reviews);
      console.log('✅ [Seed] Reviews seeded to MongoDB!');
    }
  } catch (err) {
    console.warn('⚠️ [Seed] Seed notice:', err.message);
  }
};
