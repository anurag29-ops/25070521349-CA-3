# 🎮 Play Hub — Full-Stack Gaming & Arcade Platform

A modern, responsive, full-stack gaming application built with **React 19**, **Vite**, **Tailwind CSS**, **Node.js**, **Express**, and **MongoDB Community Server** (100% compatible with **MongoDB Compass**).

---

## 📁 Project Structure

```text
25070521349/
├── client/                     # React frontend (Vite + Tailwind CSS v4)
│   ├── src/
│   │   ├── components/         # Reusable UI & Game components
│   │   │   ├── games/          # 4 Playable Arcade Mini-Games
│   │   │   │   ├── CyberDash.jsx      # Canvas-based 60fps jumping obstacle runner
│   │   │   │   ├── NeonSnake.jsx      # Retro glow snake with particle pickups
│   │   │   │   ├── Game2048.jsx       # Sliding tile cyberpunk puzzle
│   │   │   │   └── MemoryMatrix.jsx   # Hacker pattern sequence cipher
│   │   │   ├── AuthModal.jsx   # Working Login & Create Account modal
│   │   │   ├── MongoBanner.jsx # Real-time MongoDB Compass status & diagnostics
│   │   │   ├── Navbar.jsx      # Top navigation, sound FX toggle & profile controls
│   │   │   └── GameModal.jsx   # Game detail overview and review posting
│   │   ├── context/            # AuthContext (JWT, user state, MongoDB sync)
│   │   ├── pages/              # 6 Complete Working Interfaces
│   │   │   ├── ArcadePage.jsx         # Playable arcade games & live leaderboards
│   │   │   ├── CatalogPage.jsx        # Store & discovery catalog with filters
│   │   │   ├── LibraryPage.jsx        # User shelf, play records, achievements
│   │   │   ├── LeaderboardPage.jsx    # Top 3 Podium & global rankings
│   │   │   ├── CommunityPage.jsx      # Reviews feed & live registered user inspector
│   │   │   └── ProfilePage.jsx        # Gamer profile & 6-avatar customizer
│   │   ├── audio.js            # Web Audio API 8-bit sound synthesizer
│   │   ├── avatars.jsx         # Custom gamer avatar badges
│   │   ├── App.jsx             # Main layout & interface router
│   │   └── index.css           # Tailwind CSS + Cyberpunk glassmorphic styles
│   ├── vite.config.js          # Vite config with React & API proxy
│   └── package.json
│
└── server/                     # Node.js + Express backend
    ├── src/
    │   ├── models/             # Mongoose Models
    │   │   ├── User.js         # User model with bcrypt password hashing
    │   │   ├── Game.js         # Game catalog schema
    │   │   ├── Score.js        # Arcade leaderboards schema
    │   │   └── Review.js       # Game ratings & comments schema
    │   ├── routes/             # RESTful API Endpoints
    │   │   ├── auth.js         # /api/auth (register, login, profile, users)
    │   │   ├── games.js        # /api/games (catalog, play tracking, library)
    │   │   ├── scores.js       # /api/scores (submit arcade score, get leaderboards)
    │   │   ├── reviews.js      # /api/reviews (post review, like review)
    │   │   └── status.js       # /api/status (MongoDB connection diagnostics)
    │   ├── middleware/         # JWT token authentication middleware
    │   ├── memoryStore.js      # High-availability fallback store
    │   ├── db.js               # MongoDB Community Server connector & auto-sync
    │   ├── seed.js             # Initial database seeder
    │   └── server.js           # Express main application
    ├── .env                    # Environment variables
    └── package.json
```

---

## 🗄️ Database Requirements & MongoDB Setup

This application connects to **MongoDB Community Server** and is 100% compatible with **MongoDB Compass**.

### Connection Details
- **Default MongoDB URI**: `mongodb://127.0.0.1:27017/playhub`
- **Compass Target**: Open MongoDB Compass and paste `mongodb://127.0.0.1:27017/playhub`
- **Database Name**: `playhub`
- **Collections Created**:
  1. `users`: Stores registered user accounts (name, username, hashed password, avatar, bio, XP, level, library).
  2. `games`: Full catalog of playable arcade games and discoverable titles.
  3. `scores`: High scores recorded from the browser arcade mini-games.
  4. `reviews`: Community player reviews with star ratings (1–5) and comments.

### If MongoDB is not yet installed on your system:
You can install **MongoDB Community Server** on Windows in two easy ways:

#### Option A: Via Windows Terminal (PowerShell as Administrator)
```powershell
winget install --id MongoDB.Server --accept-source-agreements --accept-package-agreements
```

#### Option B: Official MSI Installer
1. Download MongoDB Community Server from [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community).
2. Run the `.msi` setup, select **Complete**, and ensure **"Install MongoDB as a Service"** is checked.
3. Start the service if not automatically running:
   ```powershell
   net start MongoDB
   ```

### High-Availability Fallback Mode
If MongoDB is not currently running when you launch the server, **the application will NOT crash**. It activates an in-memory high-availability store that lets you immediately register accounts, log in, play games, and submit scores. As soon as MongoDB is started, the server automatically reconnects and synchronizes your data directly into MongoDB!

---

## 🚀 Running the Application

### 1. Start the Backend Server (Express & MongoDB API)
```bash
cd server
npm start
```
The server will run at: **`http://localhost:5000`**
- Health & Database Diagnostics: `http://localhost:5000/api/status`

### 2. Start the Frontend Client (React & Vite)
In a new terminal window:
```bash
cd client
npm run dev
```
The client will run at: **`http://localhost:5173`**

---

## ✨ Features & Interactive Interfaces

### 1. Working Authentication (Login & Create Account)
- **Create Account**:
  - Full Name, Gamer Tag/Username, Email, Password (min 6 characters).
  - Visual **Avatar Selector** (Cyber Fox, Neon Ninja, Pixel Knight, Space Pilot, Glitch Ghost, Code Breaker).
  - Favorite Genre preference.
  - Automatically encrypts passwords using **bcrypt**, generates a secure **JWT token**, and stores user records in MongoDB.
- **Login**:
  - Authenticate using either Email or Username + Password.
  - "Quick Demo Account" shortcut for instant one-click login testing (`kiravex` / `password123`).
  - Persistent session stored in `localStorage` with auto-logout.

### 2. Interface 1: Arcade Hub (4 Playable Games)
- **Cyber Dash**: Canvas-based 60fps high-speed runner. Jump over barriers, collect golden data crystals, and submit scores to MongoDB!
- **Neon Snake 3000**: Retro neon snake with kinetic glowing particle food and speed modifiers.
- **2048: Cyberpunk Edition**: Sliding tile number puzzle with neon tile themes and sound synth effects.
- **Memory Matrix**: Cognitive cyber sequence hacker game. Memorize the glowing node sequence and unlock mainframe security.

### 3. Interface 2: Game Store & Discovery ("Discover")
- Filter by genre: *All, Arcade, Action, RPG, Puzzle, Sci-Fi, Strategy, Retro*.
- Live search bar and "Playable in Browser" filter.
- Game details modal with screenshots, descriptions, player reviews, and one-click launch.

### 4. Interface 3: User Game Shelf ("My Hub")
- Personal game library saved to the user's MongoDB record.
- Track playtime, high scores, and shelf status (*Playing, Completed, Wishlist*).
- Achievement badge system (*Welcome to the Grid, Arcade Rookie, Neon Reflexes, Voice of the Hub*).

### 5. Interface 4: Global Leaderboards
- Top 3 Champions Podium with gold/silver/bronze trophies.
- Live high-score table querying the MongoDB `scores` collection.
- Game filter for each arcade title.

### 6. Interface 5: Community Feed & Reviews
- Interactive review posting: Select game, pick 1–5 star rating, write comments.
- Like review counters.
- **Live Registered Players Inspector**: Shows actual user accounts registered in MongoDB so you can verify new signups in real-time!

### 7. Interface 6: Gamer Profile & Customizer
- Level progression bar with XP calculation.
- Live avatar selector to change profile appearance on the fly.
- Bio editor and favorite genre updater, saved to MongoDB via `PUT /api/auth/profile`.

### 8. Sound Effects & Ambient Audio
- Built-in Web Audio API synthesizer for retro 8-bit sound effects (jump, laser, coin, game over, victory).
- Global Mute / Unmute toggle button in the navigation bar.

---

## 🔍 How to Verify in MongoDB Compass

1. Open **MongoDB Compass**.
2. In the "New Connection" screen, enter:
   ```text
   mongodb://127.0.0.1:27017/playhub
   ```
3. Click **Connect**.
4. You will see the **`playhub`** database with the following collections:
   - `users`: Contains your registered accounts.
   - `games`: Contains catalog games.
   - `scores`: Contains high scores submitted from the arcade.
   - `reviews`: Contains community reviews and star ratings.
