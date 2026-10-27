import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { sound } from '../audio';
import { AvatarBadge } from '../avatars';
import {
  Library,
  Play,
  Trophy,
  Clock,
  Award,
  Sparkles,
  LogIn,
  CheckCircle2,
  Bookmark,
  ChevronRight,
  Gamepad2,
  Coins,
} from 'lucide-react';

const ACHIEVEMENTS_LIST = [
  { id: 'welcome-hub', name: 'Welcome to the Grid', description: 'Created official Play Hub account on MongoDB.', icon: Sparkles, color: 'text-cyan-300 bg-cyan-500/15 border-cyan-400/30' },
  { id: 'arcade-starter', name: 'Arcade Rookie', description: 'Played first browser mini-game in 60fps.', icon: Play, color: 'text-purple-300 bg-purple-500/15 border-purple-400/30' },
  { id: 'speed-demon', name: 'Neon Reflexes', description: 'Surpassed 100 points in Cyber Dash.', icon: Trophy, color: 'text-amber-300 bg-amber-500/15 border-amber-400/30' },
  { id: 'critic', name: 'Voice of the Hub', description: 'Submitted a review to the community database.', icon: Award, color: 'text-pink-300 bg-pink-500/15 border-pink-400/30' },
];

export const LibraryPage = ({ onOpenGame, onLaunchPlayable, onGoToCatalog }) => {
  const { user, openAuth } = useAuth();
  const [filterStatus, setFilterStatus] = useState('All');

  if (!user) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-center p-8 rounded-3xl bg-[#0c1022]/90 backdrop-blur-2xl border border-white/[0.1] shadow-[0_20px_50px_rgba(0,0,0,0.6)] animate-fadeIn specular-border max-w-xl mx-auto">
        <div className="p-4 rounded-3xl bg-purple-500/15 border border-purple-400/30 text-purple-400 mb-5 shadow-[0_0_20px_rgba(168,85,247,0.3)]">
          <Library className="w-10 h-10 text-purple-300" />
        </div>
        <h2 className="text-3xl font-black text-white tracking-tight mb-2">My Hub Game Shelf</h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-md mb-6 leading-relaxed font-normal">
          Sign in or create an account to curate your personal game library, log playtime, and unlock gamer achievements directly in MongoDB!
        </p>
        <button
          onClick={() => {
            sound.playClick();
            openAuth('login');
          }}
          className="btn-shimmer px-7 py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 text-white font-black text-xs shadow-[0_0_25px_rgba(168,85,247,0.4)] flex items-center gap-2 cursor-pointer transition transform hover:scale-105 active:scale-95"
        >
          <LogIn className="w-4 h-4" />
          <span>Sign In / Create Account</span>
        </button>
      </div>
    );
  }

  const library = user.library || [];
  const filtered =
    filterStatus === 'All'
      ? library
      : library.filter((item) => item.status === filterStatus);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Profile Summary with Luxury Glass Styling */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#14182e]/90 via-[#0d1222]/85 to-[#11192e]/90 border border-white/[0.1] shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl specular-border flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <div className="relative">
            <AvatarBadge avatarId={user.avatar} size="lg" />
            <div className="absolute inset-0 rounded-2xl bg-purple-500/20 blur-md pointer-events-none" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 justify-center sm:justify-start">
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{user.name || user.username}</h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono font-bold border border-purple-500/30">
                LV.{user.level || 1}
              </span>
            </div>
            <p className="text-xs text-cyan-400 font-mono mt-0.5">@{user.username}</p>
            <p className="text-xs text-slate-300 mt-1 max-w-md font-normal leading-relaxed">{user.bio}</p>
          </div>
        </div>

        {/* 3 Metric Stat Capsules */}
        <div className="flex items-center gap-3 text-center">
          <div className="p-3.5 rounded-2xl bg-black/30 border border-white/[0.06] min-w-[95px] shadow-sm">
            <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Games</span>
            <div className="text-xl font-black text-cyan-300 mt-0.5">{library.length}</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-black/30 border border-white/[0.06] min-w-[95px] shadow-sm">
            <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">XP Points</span>
            <div className="text-xl font-black text-purple-300 mt-0.5">{user.xp || 150}</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-black/30 border border-white/[0.06] min-w-[95px] shadow-sm">
            <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Tokens</span>
            <div className="text-xl font-black text-amber-300 mt-0.5">{user.tokens || 500}</div>
          </div>
        </div>
      </div>

      {/* Library Filter Pills */}
      <div className="flex items-center justify-between p-3 rounded-2xl bg-black/30 border border-white/[0.06] backdrop-blur-md">
        <div className="flex items-center gap-2">
          {['All', 'Playing', 'Completed', 'Wishlist'].map((st) => (
            <button
              key={st}
              onClick={() => {
                sound.playClick();
                setFilterStatus(st);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
                filterStatus === st
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.35)] border border-purple-400/40'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04] border border-transparent'
              }`}
            >
              {st} {st === 'All' ? `(${library.length})` : ''}
            </button>
          ))}
        </div>

        <button
          onClick={onGoToCatalog}
          className="text-xs text-cyan-300 hover:text-cyan-200 flex items-center gap-1 font-semibold transition cursor-pointer px-3 py-1.5 rounded-xl hover:bg-white/[0.04]"
        >
          <span>Explore Store</span>
          <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />
        </button>
      </div>

      {/* Game Shelf Cards */}
      {filtered.length === 0 ? (
        <div className="py-20 text-center rounded-3xl bg-[#0c1022]/60 border border-white/[0.06] backdrop-blur-md">
          <Bookmark className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <h4 className="text-base font-bold text-slate-200">No games under "{filterStatus}"</h4>
          <p className="text-xs text-slate-400 mt-1 mb-5">
            Browse the catalog to add games and build your personalized shelf.
          </p>
          <button
            onClick={onGoToCatalog}
            className="btn-shimmer px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-[0_0_15px_rgba(168,85,247,0.3)] cursor-pointer"
          >
            Browse Catalog
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <div
              key={item.slug}
              className="glass-card p-6 rounded-3xl border border-white/[0.08] flex flex-col justify-between specular-border"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                    {item.status || 'Playing'}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    High: <strong className="text-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.5)]">{item.highScore || 0}</strong>
                  </span>
                </div>

                <h3 className="text-lg font-black text-white tracking-tight mb-1">{item.title}</h3>
                <div className="flex items-center gap-4 text-xs text-slate-400 mt-2 font-mono">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>{item.playtimeMinutes || 0} mins logged</span>
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between">
                <button
                  onClick={() => onLaunchPlayable(item.slug)}
                  className="btn-shimmer px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Launch Game</span>
                </button>

                <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Synced</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Gamer Achievements Section */}
      <div className="pt-6 border-t border-white/[0.08]">
        <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-4 tracking-tight">
          <Award className="w-5 h-5 text-amber-400" />
          <span>Gamer Badges & Achievements</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ACHIEVEMENTS_LIST.map((ach) => {
            const Icon = ach.icon;
            return (
              <div
                key={ach.id}
                className="p-5 rounded-3xl bg-[#0c1022]/70 border border-white/[0.08] hover:border-white/20 transition-all duration-200 specular-border shadow-sm"
              >
                <div className={`p-3 rounded-2xl inline-block border mb-3 ${ach.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="font-bold text-white text-sm">{ach.name}</div>
                <div className="text-xs text-slate-400 mt-1 leading-relaxed font-normal">
                  {ach.description}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LibraryPage;
