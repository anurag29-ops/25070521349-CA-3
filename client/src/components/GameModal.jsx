import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { sound } from '../audio';
import { AvatarBadge } from '../avatars';
import {
  X,
  Star,
  Play,
  Bookmark,
  BookmarkCheck,
  Heart,
  Send,
  Calendar,
  Layers,
  Sparkles,
  Users,
  Check,
  Zap,
} from 'lucide-react';

export const GameModal = ({ game, onClose, onLaunchPlayable, onLibraryChange }) => {
  const { user, openAuth } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [newRating, setNewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [postingReview, setPostingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [inLibrary, setInLibrary] = useState(false);
  const [libraryLoading, setLibraryLoading] = useState(false);

  useEffect(() => {
    if (!game) return;

    // Check if user has this game in library
    if (user?.library) {
      setInLibrary(user.library.some((item) => item.slug === game.slug));
    }

    // Fetch game reviews
    fetch(`/api/reviews?gameSlug=${game.slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setReviews(data.reviews || []);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingReviews(false));
  }, [game, user]);

  if (!game) return null;

  const handleToggleLibrary = async () => {
    sound.playClick();
    if (!user) {
      openAuth('login');
      return;
    }

    setLibraryLoading(true);
    try {
      const res = await fetch(`/api/games/${game.slug}/library`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('playhub_token')}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setInLibrary(data.action === 'added');
        if (onLibraryChange) onLibraryChange();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLibraryLoading(false);
    }
  };

  const handlePostReview = async (e) => {
    e.preventDefault();
    sound.playClick();
    if (!user) {
      openAuth('login');
      return;
    }

    if (!newComment.trim()) return;

    setPostingReview(true);
    setReviewSuccess('');

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('playhub_token')}`,
        },
        body: JSON.stringify({
          gameSlug: game.slug,
          gameTitle: game.title,
          rating: newRating,
          comment: newComment,
          username: user.username,
          avatar: user.avatar,
        }),
      });

      const data = await res.json();
      if (data.success && data.review) {
        sound.playVictory();
        setReviews([data.review, ...reviews]);
        setNewComment('');
        setReviewSuccess('Review saved to MongoDB!');
        setTimeout(() => setReviewSuccess(''), 3500);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setPostingReview(false);
    }
  };

  const handleLikeReview = async (reviewId) => {
    sound.playClick();
    try {
      const res = await fetch(`/api/reviews/${reviewId}/like`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setReviews(
          reviews.map((r) => (r._id === reviewId ? { ...r, likes: data.likes } : r))
        );
      }
    } catch (e) {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fadeIn">
      <div className="relative w-full max-w-3xl rounded-3xl bg-[#0c1022]/95 backdrop-blur-2xl border border-white/[0.12] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] text-slate-100 max-h-[92vh] overflow-y-auto specular-border">
        {/* Close Button */}
        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="absolute top-5 right-5 z-20 p-2.5 text-slate-400 hover:text-white rounded-full bg-black/60 hover:bg-black/90 border border-white/[0.08] transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Artwork Header with Layered Depth */}
        <div
          className="relative h-60 sm:h-72 p-6 sm:p-8 flex flex-col justify-end overflow-hidden"
          style={{
            background: `radial-gradient(circle at 80% 20%, ${game.accentColor || '#8b5cf6'}40 0%, transparent 60%), linear-gradient(to bottom, #161c36, #0c1022)`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c1022] via-[#0c1022]/40 to-transparent" />

          {/* Badges */}
          <div className="relative z-10 flex flex-wrap items-center gap-2 mb-2.5">
            <span
              className="text-xs font-black tracking-wider uppercase px-3 py-1 rounded-full border text-white shadow-lg"
              style={{
                backgroundColor: `${game.accentColor || '#8b5cf6'}30`,
                borderColor: `${game.accentColor || '#8b5cf6'}80`,
                boxShadow: `0 0 15px ${game.accentColor || '#8b5cf6'}40`,
              }}
            >
              {game.badge || 'FEATURED'}
            </span>
            <span className="text-xs px-3 py-1 rounded-full bg-black/60 text-slate-300 border border-white/[0.08] backdrop-blur-md">
              {game.category}
            </span>
            {game.isPlayableInBrowser && (
              <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 font-semibold shadow-sm shadow-emerald-500/30 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                Browser Playable
              </span>
            )}
          </div>

          <h2 className="relative z-10 text-3xl sm:text-4xl font-black text-white tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
            {game.title}
          </h2>
          <p className="relative z-10 text-xs sm:text-sm text-slate-300 mt-1 max-w-xl font-medium">
            {game.tagline}
          </p>
        </div>

        {/* Body Content */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-md">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-1.5">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                <span className="text-lg font-black text-white">{game.rating || 4.8}</span>
                <span className="text-xs text-slate-400">({game.ratingCount || 100}+ reviews)</span>
              </div>
              <div className="text-xs text-slate-400 font-mono">
                PLAYS: <span className="text-cyan-400 font-bold">{game.playsCount || 0}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleToggleLibrary}
                disabled={libraryLoading}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-2 cursor-pointer border ${
                  inLibrary
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/50 hover:bg-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.25)]'
                    : 'bg-white/[0.05] hover:bg-white/[0.1] text-slate-200 border-white/[0.08]'
                }`}
              >
                {inLibrary ? <BookmarkCheck className="w-4 h-4 text-purple-400" /> : <Bookmark className="w-4 h-4" />}
                <span>{inLibrary ? 'In My Hub' : 'Add to My Hub'}</span>
              </button>

              {game.isPlayableInBrowser && (
                <button
                  onClick={() => {
                    sound.playVictory();
                    onClose();
                    onLaunchPlayable(game.playableType || game.slug);
                  }}
                  className="btn-shimmer px-6 py-2.5 rounded-xl text-xs font-black text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-[0_0_20px_rgba(6,182,212,0.4)] transition flex items-center gap-2 cursor-pointer transform hover:scale-105 active:scale-95"
                >
                  <Play className="w-4 h-4 fill-current" />
                  PLAY NOW
                </button>
              )}
            </div>
          </div>

          {/* Description & Details */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 font-mono">
              About the Game
            </h4>
            <p className="text-sm text-slate-300 leading-relaxed font-normal">{game.description}</p>
          </div>

          {/* Metadata Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
              <span className="text-slate-400 block mb-0.5 font-mono text-[10px] uppercase">Developer</span>
              <span className="font-semibold text-white">{game.developer || 'Play Hub Studios'}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
              <span className="text-slate-400 block mb-0.5 font-mono text-[10px] uppercase">Release Year</span>
              <span className="font-semibold text-white">{game.releaseYear || 2026}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.05] col-span-2 sm:col-span-1">
              <span className="text-slate-400 block mb-0.5 font-mono text-[10px] uppercase">Tags</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {(game.tags || []).map((t) => (
                  <span key={t} className="px-2 py-0.5 rounded-md bg-white/[0.04] text-slate-300 text-[10px] font-mono border border-white/[0.05]">
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Player Reviews & Discussions */}
          <div className="border-t border-white/[0.08] pt-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-base font-bold text-white flex items-center gap-2 tracking-tight">
                <Users className="w-4 h-4 text-purple-400" />
                Player Reviews ({reviews.length})
              </h4>
            </div>

            {/* Write Review Form */}
            <form onSubmit={handlePostReview} className="mb-6 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-300">Rate your experience:</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => {
                        sound.playClick();
                        setNewRating(star);
                      }}
                      className="p-1 text-amber-400 hover:scale-115 transition cursor-pointer"
                    >
                      <Star
                        className={`w-4 h-4 transition ${
                          star <= (hoverRating || newRating)
                            ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                            : 'text-slate-600'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={
                  user
                    ? 'Write your feedback on mechanics, graphics, or tips for other players...'
                    : 'Sign in to write and post a review into MongoDB!'
                }
                rows={2}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-white text-xs mb-3 resize-none outline-none"
              />

              {reviewSuccess && (
                <div className="mb-2 text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />
                  <span>{reviewSuccess}</span>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={postingReview || !newComment.trim()}
                  className="btn-shimmer px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer disabled:opacity-40 shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                >
                  <Send className="w-3 h-3" />
                  <span>{postingReview ? 'Saving to Mongo...' : 'Post Review'}</span>
                </button>
              </div>
            </form>

            {/* Reviews List */}
            {loadingReviews ? (
              <p className="text-xs text-slate-500">Loading reviews...</p>
            ) : reviews.length === 0 ? (
              <p className="text-xs text-slate-500">No reviews yet. Be the first player to review {game.title}!</p>
            ) : (
              <div className="space-y-3">
                {reviews.map((rev) => (
                  <div key={rev._id} className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] transition">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <AvatarBadge avatarId={rev.avatar} size="xs" />
                        <span className="text-xs font-bold text-white">@{rev.username}</span>
                        <div className="flex items-center text-amber-400">
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-amber-400" />
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={() => handleLikeReview(rev._id)}
                        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-pink-400 transition cursor-pointer px-2 py-0.5 rounded-lg hover:bg-white/[0.04]"
                      >
                        <Heart className="w-3.5 h-3.5" />
                        <span>{rev.likes || 0}</span>
                      </button>
                    </div>
                    <p className="text-xs text-slate-300 pl-8 leading-relaxed">{rev.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameModal;
