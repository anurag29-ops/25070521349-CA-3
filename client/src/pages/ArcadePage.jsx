import React, { useState, useEffect } from 'react';
import { sound } from '../audio';
import { AvatarBadge } from '../avatars';
import CyberDash from '../components/games/CyberDash';
import NeonSnake from '../components/games/NeonSnake';
import Game2048 from '../components/games/Game2048';
import MemoryMatrix from '../components/games/MemoryMatrix';
import { Gamepad2, Zap, Trophy, Shield, Sparkles, Award, Play, Activity } from 'lucide-react';

const ARCADE_GAMES = [
  {
    id: 'jump',
    slug: 'cyber-dash',
    title: 'Cyber Dash',
    tagline: 'High-speed neon runner & obstacle dodge',
    accentColor: '#06b6d4',
    accentBorder: 'border-cyan-500/50',
    accentBg: 'bg-cyan-500/20 text-cyan-300',
    glowColor: 'shadow-[0_0_20px_rgba(6,182,212,0.35)]',
    component: CyberDash,
  },
  {
    id: 'snake',
    slug: 'neon-snake',
    title: 'Neon Snake 3000',
    tagline: 'Plasma bit feeder with kinetic glow physics',
    accentColor: '#10b981',
    accentBorder: 'border-emerald-500/50',
    accentBg: 'bg-emerald-500/20 text-emerald-300',
    glowColor: 'shadow-[0_0_20px_rgba(16,185,129,0.35)]',
    component: NeonSnake,
  },
  {
    id: '2048',
    slug: 'game-2048',
    title: '2048: Cyberpunk',
    tagline: 'Quantum node sliding tile fusion',
    accentColor: '#f59e0b',
    accentBorder: 'border-amber-500/50',
    accentBg: 'bg-amber-500/20 text-amber-300',
    glowColor: 'shadow-[0_0_20px_rgba(245,158,11,0.35)]',
    component: Game2048,
  },
  {
    id: 'memory',
    slug: 'memory-matrix',
    title: 'Memory Matrix',
    tagline: 'Mainframe pattern sequence infiltration',
    accentColor: '#ec4899',
    accentBorder: 'border-pink-500/50',
    accentBg: 'bg-pink-500/20 text-pink-300',
    glowColor: 'shadow-[0_0_20px_rgba(236,72,153,0.35)]',
    component: MemoryMatrix,
  },
];

export const ArcadePage = ({ selectedGameId = 'jump', onSelectGame }) => {
  const [activeGameId, setActiveGameId] = useState(selectedGameId);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loadingScores, setLoadingScores] = useState(false);

  useEffect(() => {
    if (selectedGameId) {
      setActiveGameId(selectedGameId);
    }
  }, [selectedGameId]);

  const currentGame = ARCADE_GAMES.find((g) => g.id === activeGameId || g.slug === activeGameId) || ARCADE_GAMES[0];

  const fetchGameScores = () => {
    setLoadingScores(true);
    fetch(`/api/scores?gameSlug=${currentGame.slug}&limit=6`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setLeaderboard(data.scores || []);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingScores(false));
  };

  useEffect(() => {
    fetchGameScores();
  }, [currentGame.slug]);

  const ActiveComponent = currentGame.component;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Studio Glass Hero Arcade Banner */}
      <div className="relative rounded-3xl p-6 sm:p-10 overflow-hidden bg-gradient-to-r from-[#14182e]/90 via-[#0d1224]/80 to-[#0c1626]/90 border border-white/[0.1] shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-2xl specular-border">
        {/* Soft Ambient Light Cones */}
        <div
          className="absolute -top-24 -right-24 w-80 h-80 rounded-full blur-[100px] pointer-events-none transition-all duration-700"
          style={{ backgroundColor: `${currentGame.accentColor}33` }}
        />
        <div className="absolute -bottom-20 left-1/4 w-72 h-72 rounded-full bg-purple-600/15 blur-[90px] pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 text-xs font-bold mb-4 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span className="tracking-wide">PLAY HUB ARCADE DECK</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight mb-3">
            Instant Playable Arcade &{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-300 to-pink-400 drop-shadow-[0_0_20px_rgba(168,85,247,0.35)]">
              Live Leaderboards
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-6 font-normal">
            Immerse yourself in silky 60fps arcade challenges with rich sound synthesis. Every run records your score into MongoDB and updates your personal rank against other players worldwide!
          </p>

          {/* Game Selection Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {ARCADE_GAMES.map((game) => {
              const isSelected = currentGame.id === game.id;
              return (
                <button
                  key={game.id}
                  onClick={() => {
                    sound.playClick();
                    setActiveGameId(game.id);
                    if (onSelectGame) onSelectGame(game.id);
                  }}
                  className={`relative p-3.5 rounded-2xl text-left border transition-all duration-300 cursor-pointer overflow-hidden ${
                    isSelected
                      ? `${game.accentBorder} bg-white/[0.08] ${game.glowColor} ring-1 ring-white/30 scale-[1.02] shadow-xl`
                      : 'border-white/[0.06] bg-black/30 hover:bg-white/[0.04] hover:border-white/15'
                  }`}
                >
                  {/* Subtle top shimmer on active card */}
                  {isSelected && (
                    <div
                      className="absolute top-0 left-0 right-0 h-[2px] opacity-80"
                      style={{ backgroundColor: game.accentColor }}
                    />
                  )}

                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${game.accentBg} border border-current/30`}>
                      ARCADE
                    </span>
                    {isSelected && (
                      <span
                        className="w-2 h-2 rounded-full animate-ping"
                        style={{ backgroundColor: game.accentColor }}
                      />
                    )}
                  </div>
                  <div className="font-bold text-white text-sm truncate">{game.title}</div>
                  <div className="text-[11px] text-slate-400 truncate mt-0.5">{game.tagline}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Game Stage & Leaderboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Playable Game Window (2 cols) */}
        <div className="lg:col-span-2">
          <ActiveComponent onScoreSubmitted={fetchGameScores} />
        </div>

        {/* Live MongoDB Leaderboard Widget (1 col) */}
        <div className="rounded-3xl p-6 bg-[#0c1022]/80 backdrop-blur-2xl border border-white/[0.08] shadow-[0_16px_40px_rgba(0,0,0,0.5)] specular-border">
          <div className="flex items-center justify-between mb-4 border-b border-white/[0.06] pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
                <Trophy className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Live Leaderboard</h3>
                <p className="text-[10px] text-slate-400 font-mono">Top Records</p>
              </div>
            </div>
            <span className="text-[11px] text-cyan-300 font-mono bg-cyan-950/40 px-2 py-0.5 rounded-lg border border-cyan-500/30">
              {currentGame.slug}
            </span>
          </div>

          {loadingScores ? (
            <div className="py-12 text-center text-xs text-slate-500">Querying MongoDB records...</div>
          ) : leaderboard.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No scores yet. Complete a run and claim #1 on MongoDB!
            </div>
          ) : (
            <div className="space-y-2.5">
              {leaderboard.map((item, idx) => {
                const rankStyle =
                  idx === 0
                    ? 'text-amber-400 bg-amber-500/10 border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.15)]'
                    : idx === 1
                    ? 'text-slate-300 bg-slate-500/10 border-slate-400/25'
                    : idx === 2
                    ? 'text-amber-600 bg-amber-700/10 border-amber-600/25'
                    : 'text-slate-400 bg-white/[0.02] border-white/[0.04]';

                return (
                  <div
                    key={item._id || idx}
                    className={`flex items-center justify-between p-2.5 rounded-2xl border ${rankStyle} transition-all duration-200 hover:scale-[1.01]`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-5 font-black font-mono text-center text-xs">
                        #{idx + 1}
                      </span>
                      <AvatarBadge avatarId={item.avatar} size="xs" />
                      <div>
                        <div className="text-xs font-bold text-white truncate max-w-[110px]">
                          @{item.username}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {item.difficulty || 'Normal'}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-mono font-black text-sm text-cyan-300">
                        {item.score}
                      </div>
                      <div className="text-[9px] text-slate-500 font-mono">PTS</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-purple-400" />
              <span>MongoDB Collection:</span>
            </span>
            <code className="text-purple-300 font-mono text-[10px]">scores</code>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArcadePage;
