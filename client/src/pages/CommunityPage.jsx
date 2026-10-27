import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { sound } from '../audio';
import { AvatarBadge } from '../avatars';
import {
  MessageSquare,
  Star,
  Heart,
  Send,
  Users,
  Database,
  Sparkles,
  ShieldCheck,
  Check,
} from 'lucide-react';

export const CommunityPage = () => {
  const { user, openAuth } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);

  // New review form
  const [gameSlug, setGameSlug] = useState('cyber-dash');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [posting, setPosting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const gameOptions = [
    { slug: 'cyber-dash', title: 'Cyber Dash' },
    { slug: 'neon-snake', title: 'Neon Snake 3000' },
    { slug: 'game-2048', title: '2048: Cyberpunk Edition' },
    { slug: 'memory-matrix', title: 'Memory Matrix' },
    { slug: 'chrono-odyssey', title: 'Chrono Odyssey: Valhalla' },
    { slug: 'synthwave-racer', title: 'Synthwave Drift 84' },
    { slug: 'mecha-strike', title: 'Mecha Strike: Zero' },
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const [revRes, usersRes] = await Promise.all([
        fetch('/api/reviews?limit=30'),
        fetch('/api/auth/users'),
      ]);

      const revData = await revRes.json();
      const uData = await usersRes.json();

      if (revData.success) setReviews(revData.reviews || []);
      if (uData.success) setUsersList(uData.users || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePostReview = async (e) => {
    e.preventDefault();
    sound.playClick();
    if (!user) {
      openAuth('login');
      return;
    }

    if (!comment.trim()) return;

    setPosting(true);
    setSuccessMsg('');

    try {
      const selectedGameObj = gameOptions.find((g) => g.slug === gameSlug);
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('playhub_token')}`,
        },
        body: JSON.stringify({
          gameSlug,
          gameTitle: selectedGameObj?.title || gameSlug,
          rating,
          comment,
          username: user.username,
          avatar: user.avatar,
        }),
      });

      const data = await res.json();
      if (data.success && data.review) {
        sound.playVictory();
        setReviews([data.review, ...reviews]);
        setComment('');
        setSuccessMsg('Review recorded in MongoDB!');
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setPosting(false);
    }
  };

  const handleLike = async (id) => {
    sound.playClick();
    try {
      const res = await fetch(`/api/reviews/${id}/like`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setReviews(
          reviews.map((r) => (r._id === id ? { ...r, likes: data.likes } : r))
        );
      }
    } catch (e) {}
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-card border-pink-500/30 text-pink-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-pink-400" />
            <span>Player Impressions & Hub Network</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-gradient-to-br from-pink-500/20 to-purple-500/10 border border-pink-500/30 shadow-lg shadow-pink-500/10 text-pink-400">
              <MessageSquare className="w-7 h-7" />
            </span>
            <span>Community Feed</span>
          </h1>
          <p className="text-sm text-gray-300 mt-2 max-w-xl">
            Player reviews, ratings, and live registered member accounts synchronized in MongoDB.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-card text-xs font-mono text-gray-300 border-white/10">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
            <span>MongoDB Live Stream</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Main Feed: Post Review + List (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Create Review Card */}
          <div className="glass-panel-heavy specular-border p-6 sm:p-7 rounded-3xl relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-80 h-40 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-white flex items-center gap-2.5">
                <span className="p-1.5 rounded-xl bg-pink-500/20 text-pink-400 border border-pink-500/30">
                  <Sparkles className="w-4 h-4" />
                </span>
                <span>Post a Game Review</span>
              </h3>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full glass-card border-white/10 font-mono text-gray-400">
                MongoDB Verified
              </span>
            </div>

            <form onSubmit={handlePostReview} className="relative space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                    Select Game
                  </label>
                  <select
                    value={gameSlug}
                    onChange={(e) => setGameSlug(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-white outline-none cursor-pointer border-white/15 focus:border-pink-500/60"
                  >
                    {gameOptions.map((g) => (
                      <option key={g.slug} value={g.slug} className="bg-slate-900 text-white">
                        {g.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                    Rating (1 to 5 Stars)
                  </label>
                  <div className="flex items-center gap-2 pt-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          setRating(s);
                        }}
                        className="cursor-pointer transition-transform hover:scale-125 focus:outline-none"
                      >
                        <Star
                          className={`w-6 h-6 transition-all duration-200 ${
                            s <= rating
                              ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                              : 'text-gray-600 hover:text-gray-400'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ml-2 px-2.5 py-0.5 rounded-full glass-card border-amber-500/30 font-bold text-amber-300 text-xs">
                      {rating}.0 / 5.0
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                  Your Impressions & Review
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={
                    user
                      ? 'Share your experience, gameplay mechanics, difficulty level, or recommendations...'
                      : 'Please sign in or create an account to post a review to MongoDB.'
                  }
                  rows={3}
                  className="w-full px-4 py-3 rounded-2xl glass-input text-white text-xs placeholder-gray-500 resize-none border-white/15 focus:border-pink-500/60"
                />
              </div>

              {successMsg && (
                <div className="flex items-center gap-2.5 text-xs font-semibold text-emerald-300 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/30 backdrop-blur-md animate-fadeIn">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>{successMsg}</span>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <span className="text-[11px] text-gray-400 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-purple-400" />
                  <span>Stored in MongoDB <code className="text-cyan-300 font-mono">reviews</code> collection</span>
                </span>

                <button
                  type="submit"
                  disabled={posting || !comment.trim()}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-pink-600/30 border border-pink-400/30 btn-shimmer transition-all duration-200 cursor-pointer disabled:opacity-40"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{posting ? 'Saving to MongoDB...' : 'Publish Review'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Reviews Stream */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white flex items-center gap-2.5">
                <span>Community Reviews</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full glass-card border-white/10 text-cyan-300 font-mono">
                  {reviews.length} Total
                </span>
              </h3>
            </div>

            {loading ? (
              <div className="py-16 text-center text-gray-400 glass-card rounded-2xl border-white/10">
                <div className="w-8 h-8 mx-auto mb-3 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-medium">Fetching verified community reviews...</p>
              </div>
            ) : reviews.length === 0 ? (
              <div className="py-16 text-center text-gray-400 glass-card rounded-2xl border-white/10">
                <p className="text-sm font-medium">No reviews yet. Be the first player to submit a review!</p>
              </div>
            ) : (
              reviews.map((rev) => (
                <div
                  key={rev._id}
                  className="glass-card specular-border p-5 rounded-2xl hover:border-pink-500/30 transition-all duration-300 space-y-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <AvatarBadge avatarId={rev.avatar} size="sm" />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-white text-sm">@{rev.username}</span>
                          <span className="text-xs text-gray-500 font-mono">&bull;</span>
                          <span className="text-xs font-semibold text-cyan-300 bg-cyan-950/40 px-2 py-0.5 rounded-md border border-cyan-500/20">
                            {rev.gameTitle}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-amber-400 mt-1">
                          {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.4)]" />
                          ))}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleLike(rev._id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-card border-white/10 hover:border-pink-500/50 text-gray-400 hover:text-pink-300 transition-all duration-200 cursor-pointer text-xs group"
                    >
                      <Heart className="w-3.5 h-3.5 transition-transform group-hover:scale-125 text-pink-400 fill-pink-500/30" />
                      <span className="font-mono">{rev.likes || 0}</span>
                    </button>
                  </div>

                  <p className="text-sm text-gray-200 leading-relaxed pl-11">
                    {rev.comment}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sidebar: Registered MongoDB Players (1 col) */}
        <div className="glass-panel-heavy specular-border p-6 rounded-3xl space-y-5 sticky top-24 shadow-2xl">
          <div className="border-b border-white/10 pb-4">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  <Users className="w-4 h-4" />
                </span>
                <span>Registered Players</span>
              </h3>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#34d399]" />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Live records queried from MongoDB <code className="text-purple-300 font-mono">users</code> collection
            </p>
          </div>

          <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
            {usersList.length === 0 ? (
              <p className="text-xs text-gray-500 py-6 text-center">No registered users found yet.</p>
            ) : (
              usersList.map((u) => (
                <div
                  key={u._id}
                  className="flex items-center justify-between p-3 rounded-2xl glass-card border-white/10 hover:border-purple-500/30 hover:bg-white/[0.06] transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <AvatarBadge avatarId={u.avatar} size="sm" />
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>{u.name || u.username}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-purple-900/60 text-purple-300 font-mono border border-purple-500/30">
                          LV.{u.level || 1}
                        </span>
                      </div>
                      <div className="text-[11px] text-cyan-400 font-mono">@{u.username}</div>
                    </div>
                  </div>

                  <span className="text-[10px] text-gray-400 font-mono px-2 py-0.5 rounded-full bg-black/30 border border-white/5">
                    {u.library?.length || 0} Games
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="pt-4 border-t border-white/10 text-center">
            <p className="text-xs text-gray-400 mb-3 leading-relaxed">
              Create an account to see your gamer identity synchronize immediately into MongoDB!
            </p>
            {!user && (
              <button
                onClick={() => {
                  sound.playClick();
                  openAuth('register');
                }}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 border border-purple-400/30 btn-shimmer transition-all cursor-pointer"
              >
                Join Play Hub Community
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityPage;
