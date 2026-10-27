import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import MongoBanner from './components/MongoBanner';
import AuthModal from './components/AuthModal';
import GameModal from './components/GameModal';

import ArcadePage from './pages/ArcadePage';
import CatalogPage from './pages/CatalogPage';
import LibraryPage from './pages/LibraryPage';
import LeaderboardPage from './pages/LeaderboardPage';
import CommunityPage from './pages/CommunityPage';
import ProfilePage from './pages/ProfilePage';

import { Database, Gamepad2, Sparkles, Shield, Cpu, Activity } from 'lucide-react';

function AppContent() {
  const [activeTab, setActiveTab] = useState('arcade');
  const [selectedArcadeGame, setSelectedArcadeGame] = useState('jump');
  const [activeModalGame, setActiveModalGame] = useState(null);

  const handleLaunchPlayable = (playableTypeOrSlug) => {
    let target = 'jump';
    if (playableTypeOrSlug === 'snake' || playableTypeOrSlug === 'neon-snake') target = 'snake';
    else if (playableTypeOrSlug === '2048' || playableTypeOrSlug === 'game-2048') target = '2048';
    else if (playableTypeOrSlug === 'memory' || playableTypeOrSlug === 'memory-matrix') target = 'memory';
    else if (playableTypeOrSlug === 'jump' || playableTypeOrSlug === 'cyber-dash') target = 'jump';

    setSelectedArcadeGame(target);
    setActiveTab('arcade');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-screen bg-[#070913] text-slate-100 flex flex-col selection:bg-purple-600 selection:text-white">
      {/* Dynamic Ambient Glass Lighting Layer (Fixed in Background) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Subtle grid mesh */}
        <div className="absolute inset-0 bg-grid-pattern opacity-60" />

        {/* Ambient Gradient Orbs with soft pulse */}
        <div className="absolute -top-32 left-1/4 w-[550px] h-[550px] rounded-full bg-gradient-to-br from-purple-600/20 to-indigo-600/10 blur-[130px] ambient-orb-1" />
        <div className="absolute top-1/3 -right-32 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-cyan-500/18 to-blue-600/10 blur-[140px] ambient-orb-2" />
        <div className="absolute -bottom-40 left-1/3 w-[650px] h-[650px] rounded-full bg-gradient-to-br from-pink-600/15 to-purple-800/10 blur-[150px] ambient-orb-3" />
        <div className="absolute top-2/3 -left-40 w-[450px] h-[450px] rounded-full bg-gradient-to-br from-emerald-500/10 to-teal-700/5 blur-[120px]" />

        {/* Top subtle vignette */}
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#070913]/80 to-transparent" />
      </div>

      {/* Content wrapper with relative positioning above ambient layer */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Top MongoDB Compass Connection Banner */}
        <MongoBanner />

        {/* Main Floating Glass Navbar */}
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Main View Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-all duration-300">
          {activeTab === 'arcade' && (
            <ArcadePage
              selectedGameId={selectedArcadeGame}
              onSelectGame={setSelectedArcadeGame}
            />
          )}
          {activeTab === 'catalog' && (
            <CatalogPage
              onOpenGame={(game) => setActiveModalGame(game)}
              onLaunchPlayable={handleLaunchPlayable}
            />
          )}
          {activeTab === 'library' && (
            <LibraryPage
              onOpenGame={(game) => setActiveModalGame(game)}
              onLaunchPlayable={handleLaunchPlayable}
              onGoToCatalog={() => setActiveTab('catalog')}
            />
          )}
          {activeTab === 'leaderboard' && <LeaderboardPage />}
          {activeTab === 'community' && <CommunityPage />}
          {activeTab === 'profile' && <ProfilePage />}
        </main>

        {/* Global Modals */}
        <AuthModal />
        {activeModalGame && (
          <GameModal
            game={activeModalGame}
            onClose={() => setActiveModalGame(null)}
            onLaunchPlayable={handleLaunchPlayable}
          />
        )}

        {/* Redesigned Premium Glass Footer */}
        <footer className="mt-auto border-t border-white/5 bg-[#080b18]/70 backdrop-blur-xl py-10 px-4 text-xs text-slate-400 specular-border">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Brand details */}
            <div className="flex items-center gap-3.5">
              <div className="relative p-2.5 rounded-2xl bg-gradient-to-tr from-purple-600/40 via-cyan-500/30 to-purple-600/20 border border-white/10 text-white shadow-lg shadow-purple-500/10">
                <Gamepad2 className="w-5 h-5 text-cyan-300" />
                <div className="absolute inset-0 rounded-2xl bg-cyan-400/20 blur-md pointer-events-none" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm tracking-wide">
                    PLAY HUB
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 text-[10px] font-mono font-semibold">
                    v2.0 GLASS
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Ultra-Fast Gaming Platform &bull; React 19 &bull; Tailwind CSS &bull; Node.js &bull; MongoDB Community Server
                </p>
              </div>
            </div>

            {/* Middle system pills */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/5 text-slate-300">
                <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span className="text-[11px] font-mono">Status: All Systems Operational</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/5 text-slate-300 font-mono text-[11px]">
                <Database className="w-3.5 h-3.5 text-purple-400" />
                <span>Compass:</span>
                <span className="text-cyan-300">27017/playhub</span>
              </div>
            </div>

            {/* Copyright / signature */}
            <div className="text-slate-500 text-center md:text-right text-[11px]">
              <span>&copy; 2026 Play Hub Studios. Engineered for Next-Gen Web Play.</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
