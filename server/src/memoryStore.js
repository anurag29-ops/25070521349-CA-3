import bcrypt from 'bcryptjs';

// In-memory / fast fallback store when MongoDB server is not running yet
export const fallbackStore = {
  users: [
    {
      _id: 'user_default_kira',
      name: 'Kira Vex',
      username: 'kiravex',
      email: 'kira@playhub.gg',
      password: '', // will be hashed
      avatar: 'neon-ninja',
      favGenre: 'Cyberpunk & Arcade',
      bio: 'Neon speed enthusiast and arcade champion.',
      level: 4,
      xp: 850,
      tokens: 1200,
      library: [
        { slug: 'cyber-dash', title: 'Cyber Dash', status: 'Playing', highScore: 320, playtimeMinutes: 90 },
        { slug: 'neon-snake', title: 'Neon Snake 3000', status: 'Playing', highScore: 145, playtimeMinutes: 45 },
      ],
      achievements: [
        { id: 'welcome-hub', name: 'Welcome to the Grid', description: 'Joined Play Hub network.' },
        { id: 'speed-demon', name: 'Speed Demon', description: 'Surpassed 300 score in Cyber Dash.' },
      ],
      createdAt: new Date(),
    },
  ],
  games: [],
  scores: [
    { _id: 's1', gameSlug: 'cyber-dash', gameTitle: 'Cyber Dash', username: 'KiraVex', avatar: 'neon-ninja', score: 320, difficulty: 'Hard', createdAt: new Date() },
    { _id: 's2', gameSlug: 'cyber-dash', gameTitle: 'Cyber Dash', username: 'ZeroCool', avatar: 'pixel-knight', score: 260, difficulty: 'Normal', createdAt: new Date() },
    { _id: 's3', gameSlug: 'cyber-dash', gameTitle: 'Cyber Dash', username: 'AuraBlaze', avatar: 'cyber-fox', score: 195, difficulty: 'Normal', createdAt: new Date() },
    { _id: 's4', gameSlug: 'neon-snake', gameTitle: 'Neon Snake 3000', username: 'PixelMaster', avatar: 'space-pilot', score: 145, difficulty: 'Normal', createdAt: new Date() },
    { _id: 's5', gameSlug: 'neon-snake', gameTitle: 'Neon Snake 3000', username: 'GlitchRider', avatar: 'cyber-fox', score: 110, difficulty: 'Normal', createdAt: new Date() },
    { _id: 's6', gameSlug: 'game-2048', gameTitle: '2048: Cyberpunk Edition', username: 'QuantumMind', avatar: 'neon-ninja', score: 4096, difficulty: 'Expert', createdAt: new Date() },
    { _id: 's7', gameSlug: 'game-2048', gameTitle: '2048: Cyberpunk Edition', username: 'Synapse', avatar: 'space-pilot', score: 2048, difficulty: 'Normal', createdAt: new Date() },
    { _id: 's8', gameSlug: 'memory-matrix', gameTitle: 'Memory Matrix', username: 'BrainHacker', avatar: 'pixel-knight', score: 18, difficulty: 'Master', createdAt: new Date() },
    { _id: 's9', gameSlug: 'memory-matrix', gameTitle: 'Memory Matrix', username: 'EchoZero', avatar: 'cyber-fox', score: 14, difficulty: 'Normal', createdAt: new Date() },
  ],
  reviews: [
    {
      _id: 'r1',
      gameSlug: 'cyber-dash',
      gameTitle: 'Cyber Dash',
      username: 'KiraVex',
      avatar: 'neon-ninja',
      rating: 5,
      comment: 'The reflex pacing and neon speed in Cyber Dash is genuinely addictive! Got top 1 on the leaderboard.',
      likes: 19,
      createdAt: new Date(),
    },
    {
      _id: 'r2',
      gameSlug: 'neon-snake',
      gameTitle: 'Neon Snake 3000',
      username: 'PixelMaster',
      avatar: 'space-pilot',
      rating: 5,
      comment: 'Love the glowing particle effects when eating plasma bits. Smooth 60fps controls.',
      likes: 14,
      createdAt: new Date(),
    },
    {
      _id: 'r3',
      gameSlug: 'game-2048',
      gameTitle: '2048: Cyberpunk Edition',
      username: 'Synapse',
      avatar: 'cyber-fox',
      rating: 4,
      comment: 'Super slick take on 2048. The animations and cyberpunk vibes make it 10x better than the original.',
      likes: 8,
      createdAt: new Date(),
    },
  ],
};

// Hash default user password
(async () => {
  const salt = await bcrypt.genSalt(10);
  fallbackStore.users[0].password = await bcrypt.hash('password123', salt);
})();
