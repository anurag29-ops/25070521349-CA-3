import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { sound } from '../audio';
import { AvatarBadge } from '../avatars';
import {
  Gamepad2,
  Compass,
  Library,
  Trophy,
  MessageSquare,
  User,
  LogIn,
  UserPlus,
  Volume2,
  VolumeX,
  Sparkles,
  Coins,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Zap,
} from 'lucide-react';

export const Navbar = ({ activeTab, setActiveTab }) => {
  const { user, openAuth, logout } = useAuth();
  const [muted, setMuted] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleSound = () => {
    const isMuted = sound.toggleMute();
    setMuted(isMuted);
    if (!isMuted) sound.playClick();
  };

  const navItems = [
    { id: 'arcade', label: 'Arcade Hub', icon: Gamepad2, badge: 'PLAY' },
    { id: 'catalog', label: 'Discover', icon: Compass },
    { id: 'library', label: 'My Hub', icon: Library },
    { id: 'leaderboard', label: 'Leaderboards', icon: Trophy },
    { id: 'community', label: 'Community', icon: MessageSquare },
  ];

  const handleNavClick = (tabId) => {
    sound.playClick();
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-40 bg-[#090c1a]/70 backdrop-blur-2xl border-b border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.4)] specular-border transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Brand Logo with Ambient Glow */}
          <div
            onClick={() => handleNavClick('arcade')}
            className="flex items-center gap-3 cursor-pointer group select-none py-1"
          >
            <div className="relative p-2.5 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 text-white shadow-lg shadow-purple-600/25 group-hover:shadow-purple-500/40 group-hover:scale-105 transition-all duration-300">
              <Gamepad2 className="w-5 h-5 drop-shadow" />
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-purple-500 to-cyan-500 opacity-20 blur-md group-hover:opacity-60 transition duration-500" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-wider bg-gradient-to-r from-white via-cyan-100 to-purple-200 bg-clip-text text-transparent">
                  PLAY
                </span>
                <span className="text-xl font-black tracking-wider text-purple-400 drop-shadow-[0_0_12px_rgba(168,85,247,0.4)]">
                  HUB
                </span>
              </div>
              <p className="text-[10px] tracking-widest text-cyan-400/90 uppercase font-mono leading-none">
                PREMIUM ARCADE
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1.5 p-1 rounded-2xl bg-black/20 border border-white/[0.05] backdrop-blur-md">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-600/30 via-indigo-600/20 to-cyan-500/20 text-white border border-purple-400/40 shadow-[0_4px_20px_rgba(168,85,247,0.2)]'
                      : 'text-slate-300 hover:text-white hover:bg-white/[0.04] border border-transparent'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 transition-transform duration-200 ${
                      isActive ? 'text-cyan-400 scale-110' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[9px] uppercase font-black tracking-widest px-1.5 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm shadow-cyan-500/30">
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 left-4 right-4 h-[2px] bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-500 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Right actions: Audio Mute, Auth / Profile */}
          <div className="hidden md:flex items-center gap-3">
            {/* Audio Toggle with Frosted Glass styling */}
            <button
              onClick={toggleSound}
              className={`p-2.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                muted
                  ? 'border-white/[0.06] bg-white/[0.02] text-slate-500 hover:text-slate-300 hover:border-white/10'
                  : 'border-purple-500/30 bg-purple-950/30 text-purple-300 hover:bg-purple-900/40 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
              }`}
              title={muted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
            >
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Auth State */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => {
                    sound.playClick();
                    setUserDropdown(!userDropdown);
                  }}
                  className="flex items-center gap-2.5 p-1.5 pr-3 rounded-2xl bg-slate-900/60 hover:bg-slate-800/80 border border-white/[0.08] hover:border-purple-500/40 transition-all duration-200 cursor-pointer shadow-lg shadow-black/30"
                >
                  <AvatarBadge avatarId={user.avatar} size="xs" />
                  <div className="text-left leading-tight">
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>{user.name || user.username}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-300 font-mono font-bold border border-purple-500/30">
                        LV.{user.level || 1}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Coins className="w-3 h-3 text-amber-400" />
                      <span className="font-mono text-amber-300/90">{user.tokens || 500} PT</span>
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
                </button>

                {/* Dropdown Menu - Studio Glassmorphism */}
                {userDropdown && (
                  <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-[#0e1224]/90 backdrop-blur-2xl border border-white/[0.12] shadow-[0_20px_50px_rgba(0,0,0,0.8)] py-2 z-50 text-sm specular-border animate-fadeIn">
                    <div className="px-4 py-2.5 border-b border-white/[0.06]">
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Gamer Account</p>
                      <p className="font-bold text-white truncate text-sm">@{user.username}</p>
                      <p className="text-xs text-cyan-400 truncate">{user.email}</p>
                    </div>

                    <div className="p-1.5 space-y-1">
                      <button
                        onClick={() => {
                          handleNavClick('profile');
                          setUserDropdown(false);
                        }}
                        className="w-full px-3 py-2 rounded-xl text-left flex items-center gap-2.5 hover:bg-white/[0.06] text-slate-200 hover:text-white transition cursor-pointer text-xs font-medium"
                      >
                        <User className="w-4 h-4 text-purple-400" />
                        <span>Profile & Badges</span>
                      </button>

                      <button
                        onClick={() => {
                          handleNavClick('library');
                          setUserDropdown(false);
                        }}
                        className="w-full px-3 py-2 rounded-xl text-left flex items-center gap-2.5 hover:bg-white/[0.06] text-slate-200 hover:text-white transition cursor-pointer text-xs font-medium"
                      >
                        <Library className="w-4 h-4 text-cyan-400" />
                        <span>My Game Shelf ({user.library?.length || 0})</span>
                      </button>
                    </div>

                    <div className="border-t border-white/[0.06] my-1" />

                    <div className="p-1.5">
                      <button
                        onClick={() => {
                          sound.playClick();
                          logout();
                          setUserDropdown(false);
                        }}
                        className="w-full px-3 py-2 rounded-xl text-left flex items-center gap-2.5 hover:bg-red-950/40 text-red-400 hover:text-red-300 transition cursor-pointer text-xs font-medium"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    sound.playClick();
                    openAuth('login');
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-white/[0.06] border border-white/[0.08] transition-all duration-200 flex items-center gap-1.5 cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Sign In
                </button>
                <button
                  onClick={() => {
                    sound.playClick();
                    openAuth('register');
                  }}
                  className="btn-shimmer px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 shadow-[0_0_20px_rgba(168,85,247,0.35)] transition-all duration-200 flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Create Account
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleSound}
              className="p-2 rounded-xl border border-white/[0.08] bg-white/[0.02] text-slate-400"
            >
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-300 hover:text-white bg-slate-900/60 border border-white/[0.08]"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0c0f20]/95 backdrop-blur-2xl border-b border-white/[0.08] px-4 pt-2 pb-5 space-y-2 animate-fadeIn">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition ${
                  isActive
                    ? 'bg-purple-900/50 text-white border border-purple-500/40'
                    : 'text-slate-300 hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-cyan-400" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-3 border-t border-white/[0.08]">
            {user ? (
              <div className="space-y-2">
                <button
                  onClick={() => handleNavClick('profile')}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-slate-900/70 border border-white/[0.08] text-sm font-bold text-white"
                >
                  <AvatarBadge avatarId={user.avatar} size="xs" />
                  <span>Profile: @{user.username} (LV.{user.level || 1})</span>
                </button>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 text-center text-xs text-red-400 hover:bg-red-950/20 rounded-xl transition"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => {
                    openAuth('login');
                    setMobileMenuOpen(false);
                  }}
                  className="py-2.5 rounded-xl bg-slate-900/80 border border-white/[0.08] text-xs font-bold text-center text-white"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    openAuth('register');
                    setMobileMenuOpen(false);
                  }}
                  className="py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-xs font-bold text-center text-white shadow-lg shadow-purple-600/30"
                >
                  Create Account
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
