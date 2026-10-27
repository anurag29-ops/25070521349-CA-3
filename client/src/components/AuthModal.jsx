import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { AVATAR_LIST, AvatarBadge } from '../avatars';
import { sound } from '../audio';
import { X, Sparkles, LogIn, UserPlus, AlertCircle, Database, Check, ShieldCheck, KeyRound } from 'lucide-react';

export const AuthModal = () => {
  const { authModalOpen, authMode, setAuthMode, closeAuth, login, register, loading } = useAuth();

  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regAvatar, setRegAvatar] = useState('cyber-fox');
  const [regFavGenre, setRegFavGenre] = useState('Cyberpunk & Arcade');

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!authModalOpen) return null;

  const handleSwitchMode = (mode) => {
    sound.playClick();
    setError('');
    setSuccessMsg('');
    setAuthMode(mode);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    sound.playClick();

    if (!loginIdentifier || !loginPassword) {
      setError('Please provide your username/email and password.');
      return;
    }

    try {
      await login(loginIdentifier, loginPassword);
      sound.playVictory();
    } catch (err) {
      setError(err.message || 'Login failed. Please check credentials.');
      sound.playGameOver();
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    sound.playClick();

    if (!regName || !regUsername || !regEmail || !regPassword) {
      setError('Please fill in all required fields.');
      return;
    }

    if (regPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    try {
      const res = await register({
        name: regName,
        username: regUsername,
        email: regEmail,
        password: regPassword,
        avatar: regAvatar,
        favGenre: regFavGenre,
      });
      sound.playVictory();
      setSuccessMsg(res.message || 'Account successfully created and stored in MongoDB!');
    } catch (err) {
      setError(err.message || 'Registration failed.');
      sound.playGameOver();
    }
  };

  const fillDemoAccount = () => {
    sound.playClick();
    setLoginIdentifier('kiravex');
    setLoginPassword('password123');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#0c1022]/95 backdrop-blur-2xl border border-white/[0.12] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] p-6 md:p-8 text-slate-100 overflow-hidden specular-border">
        {/* Neon top accent line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 shadow-[0_0_12px_rgba(168,85,247,0.8)]" />

        {/* Close button */}
        <button
          onClick={() => {
            sound.playClick();
            closeAuth();
          }}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Segmented Mode Switcher */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-black/40 border border-white/[0.06] mb-6 max-w-xs">
          <button
            onClick={() => handleSwitchMode('login')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-bold text-xs transition-all duration-200 cursor-pointer ${
              authMode === 'login'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.35)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            Sign In
          </button>
          <button
            onClick={() => handleSwitchMode('register')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-bold text-xs transition-all duration-200 cursor-pointer ${
              authMode === 'register'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.35)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            Create Account
          </button>
        </div>

        {/* Error / Success Alerts */}
        {error && (
          <div className="mb-4 flex items-center gap-2.5 p-3.5 text-xs rounded-xl bg-red-950/60 border border-red-500/30 text-red-200 shadow-md">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 flex items-center gap-2.5 p-3.5 text-xs rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-200 shadow-md">
            <Check className="w-4 h-4 flex-shrink-0 text-emerald-400" />
            <span className="font-medium">{successMsg}</span>
          </div>
        )}

        {/* Database target pill */}
        <div className="mb-5 flex items-center justify-between text-xs px-3.5 py-2 rounded-xl bg-white/[0.02] border border-white/[0.05] text-slate-400">
          <span className="flex items-center gap-2 text-[11px]">
            <Database className="w-3.5 h-3.5 text-purple-400" />
            <span>Target: MongoDB Community Server</span>
          </span>
          <span className="text-cyan-300 font-mono text-[11px]">playhub/users</span>
        </div>

        {/* SIGN IN FORM */}
        {authMode === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Username or Email
              </label>
              <input
                type="text"
                required
                value={loginIdentifier}
                onChange={(e) => setLoginIdentifier(e.target.value)}
                placeholder="e.g. kiravex or kira@playhub.gg"
                className="w-full px-4 py-3 rounded-xl glass-input text-white text-sm outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl glass-input text-white text-sm outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-shimmer w-full mt-2 py-3 px-4 rounded-xl font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white shadow-[0_0_25px_rgba(168,85,247,0.4)] transition transform active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-sm"
            >
              {loading ? (
                <span>Authenticating with MongoDB...</span>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Enter Play Hub
                </>
              )}
            </button>

            {/* Quick Demo Helper */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={fillDemoAccount}
                className="text-xs text-purple-400 hover:text-purple-300 underline underline-offset-4 transition cursor-pointer"
              >
                Autofill Quick Demo Account (kiravex)
              </button>
            </div>
          </form>
        ) : (
          /* CREATE ACCOUNT FORM */
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g. Alex Drake"
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-white text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Gamer Tag / Username
                </label>
                <input
                  type="text"
                  required
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  placeholder="e.g. cyber_samurai"
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-white text-xs outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="alex@nexus.gg"
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-white text-xs outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Password (min 6 characters)
              </label>
              <input
                type="password"
                required
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-white text-xs outline-none"
              />
            </div>

            {/* Choose Gamer Avatar */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Choose Gamer Avatar
              </label>
              <div className="grid grid-cols-6 gap-2">
                {AVATAR_LIST.map((av) => (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setRegAvatar(av.id);
                    }}
                    className={`p-1.5 rounded-xl transition-all duration-200 flex flex-col items-center border cursor-pointer ${
                      regAvatar === av.id
                        ? 'border-cyan-400 bg-cyan-500/20 shadow-[0_0_12px_rgba(6,182,212,0.4)] scale-105'
                        : 'border-white/[0.06] bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.05]'
                    }`}
                  >
                    <AvatarBadge avatarId={av.id} size="sm" />
                    <span className="text-[9px] mt-1 text-slate-300 truncate max-w-full font-mono">
                      {av.name.split(' ')[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Favorite Genre */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Favorite Genre
              </label>
              <select
                value={regFavGenre}
                onChange={(e) => setRegFavGenre(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-white text-xs outline-none cursor-pointer"
              >
                <option value="Cyberpunk & Arcade">Cyberpunk & Arcade</option>
                <option value="Action & Combat">Action & Combat</option>
                <option value="Open World MMORPG">Open World MMORPG</option>
                <option value="Puzzle & Strategy">Puzzle & Strategy</option>
                <option value="Retro Classics">Retro Classics</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-shimmer w-full mt-2 py-3 px-4 rounded-xl font-bold bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white shadow-[0_0_25px_rgba(6,182,212,0.4)] transition transform active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-xs tracking-wide"
            >
              {loading ? (
                <span>Writing to MongoDB...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Create Play Hub Account
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
