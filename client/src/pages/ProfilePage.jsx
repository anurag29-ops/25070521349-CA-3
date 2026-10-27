import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { sound } from '../audio';
import { AVATAR_LIST, AvatarBadge } from '../avatars';
import { User, Shield, Coins, Sparkles, Check, Save, LogIn } from 'lucide-react';

export const ProfilePage = () => {
  const { user, openAuth, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatar || 'cyber-fox');
  const [bio, setBio] = useState(user?.bio || '');
  const [favGenre, setFavGenre] = useState(user?.favGenre || 'Cyberpunk & Arcade');

  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');

  if (!user) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center p-8 rounded-3xl glass-panel-heavy specular-border shadow-2xl max-w-lg mx-auto animate-fadeIn relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="w-16 h-16 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-4 shadow-lg shadow-purple-500/20">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">Gamer Identity Profile</h2>
        <p className="text-sm text-gray-300 max-w-sm mb-6 leading-relaxed">
          Sign in or register an account to unlock your personalized gamer card, track high scores, and customize your profile stored in MongoDB.
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              sound.playClick();
              openAuth('login');
            }}
            className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 border border-purple-400/30 btn-shimmer transition-all cursor-pointer"
          >
            Sign In
          </button>
          <button
            onClick={() => {
              sound.playClick();
              openAuth('register');
            }}
            className="px-6 py-2.5 rounded-xl glass-card border-white/15 text-white hover:border-purple-400/40 text-xs font-bold transition-all cursor-pointer"
          >
            Create Account
          </button>
        </div>
      </div>
    );
  }

  const currentXp = user.xp || 150;
  const currentLevel = user.level || 1;
  const nextLevelXp = currentLevel * 250;
  const progressPercent = Math.min(Math.round((currentXp / nextLevelXp) * 100), 100);

  const handleSave = async (e) => {
    e.preventDefault();
    sound.playClick();
    setSaving(true);
    setSavedMsg('');

    try {
      await updateProfile({ name, avatar, bio, favGenre });
      sound.playVictory();
      setSavedMsg('Profile successfully updated and synchronized in MongoDB!');
      setTimeout(() => setSavedMsg(''), 3500);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* Header Profile Badge */}
      <div className="glass-panel-heavy specular-border p-6 sm:p-8 rounded-3xl relative overflow-hidden shadow-2xl flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="absolute top-0 right-0 w-96 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative group">
          <div className="p-1 rounded-3xl bg-gradient-to-tr from-purple-500/30 via-white/20 to-cyan-400/30 shadow-xl">
            <AvatarBadge avatarId={avatar} size="xl" />
          </div>
          <span className="absolute -bottom-2 -right-2 px-3 py-1 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 border border-purple-400/30 text-white text-[11px] font-mono font-bold shadow-lg shadow-purple-600/40">
            LV.{currentLevel}
          </span>
        </div>

        <div className="flex-1 text-center sm:text-left relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-black text-white">{name || user.username}</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full glass-card border-cyan-400/30 text-cyan-300 font-mono w-fit mx-auto sm:mx-0">
              Verified Player
            </span>
          </div>
          <p className="text-xs text-gray-400 font-mono mt-0.5">
            @{user.username} &bull; <span className="text-gray-300">{user.email}</span>
          </p>

          {/* Level Progress Bar */}
          <div className="mt-5 max-w-md">
            <div className="flex items-center justify-between text-xs text-gray-400 font-mono mb-1.5">
              <span className="text-gray-300">EXPERIENCE PROGRESS</span>
              <span className="text-cyan-300 font-bold">{currentXp} / {nextLevelXp} XP ({progressPercent}%)</span>
            </div>
            <div className="w-full h-3 rounded-full bg-black/40 border border-white/10 overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 transition-all duration-700 rounded-full shadow-[0_0_12px_rgba(168,85,247,0.5)]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex sm:flex-col items-center gap-3 relative z-10">
          <div className="p-3.5 rounded-2xl glass-card border-white/10 text-center min-w-[90px] shadow-lg">
            <span className="text-[10px] text-gray-400 block font-mono font-semibold uppercase">TOKENS</span>
            <span className="text-xl font-black text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]">
              {user.tokens || 500}
            </span>
          </div>
          <div className="p-3.5 rounded-2xl glass-card border-white/10 text-center min-w-[90px] shadow-lg">
            <span className="text-[10px] text-gray-400 block font-mono font-semibold uppercase">LIBRARY</span>
            <span className="text-xl font-black text-cyan-400">
              {user.library?.length || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <form onSubmit={handleSave} className="glass-panel-heavy specular-border p-6 sm:p-8 rounded-3xl relative overflow-hidden shadow-2xl space-y-6">
        <div className="absolute bottom-0 left-0 w-80 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex items-center justify-between border-b border-white/10 pb-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              <Sparkles className="w-4 h-4" />
            </span>
            <span>Customize Gamer Profile</span>
          </h3>
          <span className="text-xs text-gray-400 font-mono">
            MongoDB Schema v2.0
          </span>
        </div>

        {/* Avatar Selector */}
        <div className="relative space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">
            Select Gamer Avatar & Persona
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {AVATAR_LIST.map((av) => (
              <button
                key={av.id}
                type="button"
                onClick={() => {
                  sound.playClick();
                  setAvatar(av.id);
                }}
                className={`p-3.5 rounded-2xl border transition-all duration-300 flex flex-col items-center cursor-pointer group relative overflow-hidden ${
                  avatar === av.id
                    ? 'border-cyan-400/80 bg-cyan-950/40 shadow-xl shadow-cyan-500/20 scale-105 ring-1 ring-cyan-400/40'
                    : 'glass-card border-white/10 hover:border-white/25 hover:bg-white/[0.06]'
                }`}
              >
                <div className="transition-transform group-hover:scale-110 duration-200">
                  <AvatarBadge avatarId={av.id} size="md" />
                </div>
                <span className="text-xs font-bold text-white mt-2.5">{av.name}</span>
                <span className="text-[10px] text-cyan-300/80 font-mono mt-0.5">{av.tag}</span>
                {avatar === av.id && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
              Display Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl glass-input text-white text-sm outline-none border-white/15 focus:border-cyan-400/60"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
              Favorite Genre
            </label>
            <select
              value={favGenre}
              onChange={(e) => setFavGenre(e.target.value)}
              className="w-full px-4 py-3 rounded-xl glass-input text-white text-sm outline-none cursor-pointer border-white/15 focus:border-cyan-400/60"
            >
              <option value="Cyberpunk & Arcade" className="bg-slate-900 text-white">Cyberpunk & Arcade</option>
              <option value="Action & Combat" className="bg-slate-900 text-white">Action & Combat</option>
              <option value="Open World MMORPG" className="bg-slate-900 text-white">Open World MMORPG</option>
              <option value="Puzzle & Strategy" className="bg-slate-900 text-white">Puzzle & Strategy</option>
              <option value="Retro Classics" className="bg-slate-900 text-white">Retro Classics</option>
            </select>
          </div>
        </div>

        <div className="relative">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
            Gamer Bio & Quote
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            placeholder="Tell the community about your gaming style, favorite franchises, or high score records..."
            className="w-full px-4 py-3 rounded-2xl glass-input text-white text-sm outline-none resize-none border-white/15 focus:border-cyan-400/60"
          />
        </div>

        {savedMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2.5 backdrop-blur-md animate-fadeIn">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{savedMsg}</span>
          </div>
        )}

        <div className="relative flex items-center justify-between pt-2 border-t border-white/10">
          <span className="text-xs text-gray-400 font-mono">
            Synced with MongoDB server
          </span>

          <button
            type="submit"
            disabled={saving}
            className="px-7 py-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold text-xs shadow-xl shadow-purple-600/30 border border-purple-400/30 btn-shimmer flex items-center gap-2 cursor-pointer transition-all duration-200 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Updating MongoDB...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfilePage;
