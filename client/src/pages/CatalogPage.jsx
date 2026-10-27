import React, { useState, useEffect } from 'react';
import { sound } from '../audio';
import { Search, Filter, Star, Play, Sparkles, Compass, Eye, Heart, Layers, ArrowUpDown } from 'lucide-react';

const CATEGORIES = ['All', 'Arcade', 'Action', 'RPG', 'Puzzle', 'Sci-Fi', 'Strategy', 'Retro'];

export const CatalogPage = ({ onOpenGame, onLaunchPlayable }) => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [playableOnly, setPlayableOnly] = useState(false);
  const [sortBy, setSortBy] = useState('rating'); // rating, plays

  const fetchGames = () => {
    setLoading(true);
    let url = `/api/games?`;
    if (selectedCategory !== 'All') url += `category=${encodeURIComponent(selectedCategory)}&`;
    if (searchQuery.trim()) url += `search=${encodeURIComponent(searchQuery)}&`;
    if (playableOnly) url += `playable=true&`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          let list = data.games || [];
          if (sortBy === 'plays') {
            list.sort((a, b) => (b.playsCount || 0) - (a.playsCount || 0));
          } else {
            list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
          }
          setGames(list);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const timer = setTimeout(fetchGames, 200);
    return () => clearTimeout(timer);
  }, [selectedCategory, searchQuery, playableOnly, sortBy]);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#12162a]/90 via-[#0d1020]/80 to-[#10172e]/90 border border-white/[0.08] shadow-[0_16px_40px_rgba(0,0,0,0.5)] backdrop-blur-2xl specular-border">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 text-xs font-bold mb-2 shadow-[0_0_12px_rgba(6,182,212,0.25)]">
            <Compass className="w-3.5 h-3.5" />
            <span className="tracking-wide">STORE & DISCOVERY HUB</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Curated Game Catalog
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 font-normal">
            Explore AAA titles, indie arcade retro revivals, and community favorites with real-time ratings.
          </p>
        </div>

        {/* Search & Sort Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, tag, genre..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl glass-input text-white text-xs outline-none"
            />
          </div>

          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2.5 rounded-2xl glass-input text-xs text-slate-200 outline-none cursor-pointer pr-8 font-medium appearance-none"
            >
              <option value="rating">Top Rated ⭐</option>
              <option value="plays">Most Played 🚀</option>
            </select>
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Category Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-black/30 border border-white/[0.06] backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-1.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                sound.playClick();
                setSelectedCategory(cat);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)] border border-cyan-400/40'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04] border border-transparent'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none px-3 py-1.5 rounded-xl hover:bg-white/[0.04] transition">
          <input
            type="checkbox"
            checked={playableOnly}
            onChange={(e) => {
              sound.playClick();
              setPlayableOnly(e.target.checked);
            }}
            className="w-4 h-4 rounded bg-slate-900 border-white/20 text-cyan-500 focus:ring-cyan-500 cursor-pointer"
          />
          <span className="font-semibold text-slate-200">Playable in Browser</span>
        </label>
      </div>

      {/* Games Catalog Grid */}
      {loading ? (
        <div className="py-24 text-center text-slate-500 text-xs font-mono">
          Querying MongoDB catalog records...
        </div>
      ) : games.length === 0 ? (
        <div className="py-24 text-center text-slate-400 text-sm">
          No games found matching your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {games.map((game) => (
            <div
              key={game.slug}
              className="glass-card group rounded-3xl border border-white/[0.08] flex flex-col overflow-hidden specular-border"
            >
              {/* Card Header Art */}
              <div
                className="relative h-48 p-4 flex flex-col justify-between overflow-hidden cursor-pointer"
                onClick={() => {
                  sound.playClick();
                  onOpenGame(game);
                }}
                style={{
                  background: `radial-gradient(circle at 85% 15%, ${game.accentColor || '#8b5cf6'}35 0%, transparent 65%), linear-gradient(to bottom, #161c36, #0e1224)`,
                }}
              >
                <div className="flex items-center justify-between z-10">
                  <span
                    className="text-[10px] font-black tracking-wider uppercase px-2.5 py-0.5 rounded-full border text-white shadow-sm"
                    style={{
                      backgroundColor: `${game.accentColor || '#8b5cf6'}25`,
                      borderColor: `${game.accentColor || '#8b5cf6'}70`,
                    }}
                  >
                    {game.badge || 'GAME'}
                  </span>
                  <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-black/60 text-slate-300 backdrop-blur-md border border-white/[0.08]">
                    {game.category}
                  </span>
                </div>

                <div className="z-10">
                  <h3 className="text-lg font-black text-white group-hover:text-cyan-300 transition-colors drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                    {game.title}
                  </h3>
                  <p className="text-xs text-slate-300/90 line-clamp-1 mt-0.5 font-medium">{game.tagline}</p>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {game.description}
                </p>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-white/[0.06]">
                  <div className="flex items-center gap-1.5 text-amber-400">
                    <Star className="w-3.5 h-3.5 fill-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.5)]" />
                    <span className="font-bold text-white text-xs">{game.rating || 4.8}</span>
                    <span className="text-[10px] text-slate-500">({game.ratingCount || 100})</span>
                  </div>
                  <div className="font-mono text-[11px] text-cyan-300 font-semibold">
                    {game.playsCount || 0} PLAYS
                  </div>
                </div>

                {/* Card Actions */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => {
                      sound.playClick();
                      onOpenGame(game);
                    }}
                    className="py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-200 hover:text-white border border-white/[0.08] text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Details</span>
                  </button>

                  {game.isPlayableInBrowser ? (
                    <button
                      onClick={() => {
                        sound.playVictory();
                        onLaunchPlayable(game.playableType || game.slug);
                      }}
                      className="btn-shimmer py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-black transition shadow-[0_0_15px_rgba(6,182,212,0.3)] flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Play Now</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        sound.playClick();
                        onOpenGame(game);
                      }}
                      className="py-2.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Overview</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CatalogPage;
