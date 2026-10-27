import React, { useState, useEffect } from 'react';
import { sound } from '../audio';
import { AvatarBadge } from '../avatars';
import { Trophy, Medal, Award, Crown, Zap, RefreshCw, Database, Sparkles, Activity } from 'lucide-react';

const GAMES_FILTER = [
  { slug: '', label: 'All Arcade Games' },
  { slug: 'cyber-dash', label: 'Cyber Dash' },
  { slug: 'neon-snake', label: 'Neon Snake 3000' },
  { slug: 'game-2048', label: '2048 Cyberpunk' },
  { slug: 'memory-matrix', label: 'Memory Matrix' },
];

export const LeaderboardPage = () => {
  const [selectedGame, setSelectedGame] = useState('');
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchScores = () => {
    setLoading(true);
    let url = '/api/scores?limit=30';
    if (selectedGame) url += `&gameSlug=${selectedGame}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setScores(data.scores || []);
        }
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  };

  useEffect(() => {
    fetchScores();
  }, [selectedGame]);

  const handleRefresh = () => {
    sound.playClick();
    setRefreshing(true);
    fetchScores();
  };

  const topThree = scores.slice(0, 3);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Deck */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#14182e]/90 via-[#0d1222]/80 to-[#121830]/90 border border-white/[0.08] shadow-[0_16px_40px_rgba(0,0,0,0.5)] backdrop-blur-2xl specular-border">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-xs font-bold mb-2 shadow-[0_0_12px_rgba(245,158,11,0.25)]">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span className="tracking-wide">GLOBAL LEADERBOARD DECK</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Arcade Hall of Fame
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 font-normal">
            Real-time arcade scores and podium rankings synchronized directly to MongoDB.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-black/40 border border-white/[0.06] text-xs text-slate-300 font-mono">
            <Database className="w-3.5 h-3.5 text-purple-400" />
            <span>MongoDB:</span>
            <code className="text-cyan-300">scores</code>
          </div>

          <button
            onClick={handleRefresh}
            className="p-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white transition cursor-pointer shadow-sm hover:shadow-[0_0_15px_rgba(6,182,212,0.2)]"
            title="Refresh Leaderboard"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter Tabs Bar */}
      <div className="flex flex-wrap items-center gap-2 p-2 rounded-2xl bg-black/30 border border-white/[0.06] backdrop-blur-md">
        {GAMES_FILTER.map((item) => (
          <button
            key={item.slug}
            onClick={() => {
              sound.playClick();
              setSelectedGame(item.slug);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
              selectedGame === item.slug
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-[0_0_15px_rgba(245,158,11,0.4)] border border-amber-400/40'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04] border border-transparent'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-24 text-center text-slate-500 font-mono text-xs">Querying MongoDB records...</div>
      ) : scores.length === 0 ? (
        <div className="py-24 text-center text-slate-400 text-sm">
          No records found for this game yet. Play in the Arcade Hub to claim the #1 spot!
        </div>
      ) : (
        <div className="space-y-8">
          {/* TOP 3 CHAMPIONS PODIUM */}
          {topThree.length >= 1 && (
            <div className="p-6 sm:p-10 rounded-3xl bg-gradient-to-b from-[#14182e]/90 to-[#0b0e1e]/95 border border-amber-500/20 shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-2xl specular-border">
              <div className="text-center mb-8">
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 font-mono">
                  THE CHAMPIONS ENCLAVE
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white mt-1 tracking-tight">
                  Top Contenders
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end justify-center max-w-4xl mx-auto">
                {/* 2nd Place Pedestal */}
                {topThree[1] && (
                  <div className="order-2 md:order-1 flex flex-col items-center p-6 rounded-3xl bg-slate-900/60 border border-slate-600/30 text-center transform hover:-translate-y-1.5 transition-all duration-300 shadow-xl specular-border">
                    <div className="relative mb-3">
                      <AvatarBadge avatarId={topThree[1].avatar} size="lg" />
                      <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-slate-300 text-slate-900 font-black text-xs flex items-center justify-center shadow-lg border border-white">
                        2
                      </span>
                    </div>
                    <div className="font-bold text-white text-sm truncate max-w-[150px]">
                      @{topThree[1].username}
                    </div>
                    <div className="text-xs text-slate-400 truncate max-w-[150px] mt-0.5">
                      {topThree[1].gameTitle}
                    </div>
                    <div className="mt-4 font-mono font-black text-2xl text-slate-200 drop-shadow-[0_0_8px_rgba(203,213,225,0.4)]">
                      {topThree[1].score}
                    </div>
                    <span className="text-[9px] text-slate-400 uppercase tracking-widest font-mono mt-1 px-2.5 py-0.5 rounded-full bg-white/[0.04]">
                      SILVER TIER
                    </span>
                  </div>
                )}

                {/* 1st Place Pedestal (Center Champion) */}
                {topThree[0] && (
                  <div className="order-1 md:order-2 flex flex-col items-center p-7 rounded-3xl bg-gradient-to-b from-amber-950/40 via-amber-900/20 to-slate-900/90 border-2 border-amber-400/80 text-center shadow-[0_0_35px_rgba(245,158,11,0.25)] transform hover:-translate-y-2.5 transition-all duration-300 -mt-6 specular-border">
                    <Crown className="w-8 h-8 text-amber-400 mb-1 animate-bounce drop-shadow-[0_0_12px_rgba(245,158,11,0.8)]" />
                    <div className="relative mb-3">
                      <AvatarBadge avatarId={topThree[0].avatar} size="xl" />
                      <span className="absolute -top-2.5 -right-2.5 w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-950 font-black text-sm flex items-center justify-center shadow-[0_0_12px_rgba(245,158,11,0.8)] border-2 border-white">
                        1
                      </span>
                    </div>
                    <div className="font-black text-white text-base truncate max-w-[170px]">
                      @{topThree[0].username}
                    </div>
                    <div className="text-xs text-amber-300 truncate max-w-[170px] font-semibold mt-0.5">
                      {topThree[0].gameTitle}
                    </div>
                    <div className="mt-4 font-mono font-black text-3xl text-amber-300 drop-shadow-[0_0_15px_rgba(245,158,11,0.8)]">
                      {topThree[0].score}
                    </div>
                    <span className="text-[10px] text-amber-400 uppercase tracking-widest font-black font-mono mt-1.5 px-3 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40">
                      CHAMPION OF THE GRID
                    </span>
                  </div>
                )}

                {/* 3rd Place Pedestal */}
                {topThree[2] && (
                  <div className="order-3 flex flex-col items-center p-6 rounded-3xl bg-slate-900/60 border border-amber-800/30 text-center transform hover:-translate-y-1.5 transition-all duration-300 shadow-xl specular-border">
                    <div className="relative mb-3">
                      <AvatarBadge avatarId={topThree[2].avatar} size="lg" />
                      <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-amber-700 text-white font-black text-xs flex items-center justify-center shadow-lg border border-amber-400/40">
                        3
                      </span>
                    </div>
                    <div className="font-bold text-white text-sm truncate max-w-[150px]">
                      @{topThree[2].username}
                    </div>
                    <div className="text-xs text-slate-400 truncate max-w-[150px] mt-0.5">
                      {topThree[2].gameTitle}
                    </div>
                    <div className="mt-4 font-mono font-black text-2xl text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]">
                      {topThree[2].score}
                    </div>
                    <span className="text-[9px] text-amber-500 uppercase tracking-widest font-mono mt-1 px-2.5 py-0.5 rounded-full bg-white/[0.04]">
                      BRONZE TIER
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Full Rankings Table - Frosted Glass Container */}
          <div className="rounded-3xl overflow-hidden bg-[#0c1022]/85 backdrop-blur-2xl border border-white/[0.08] shadow-[0_16px_40px_rgba(0,0,0,0.5)] specular-border">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-black/40 text-[10px] uppercase tracking-widest text-slate-400 font-mono border-b border-white/[0.06]">
                  <tr>
                    <th className="px-6 py-4">Rank</th>
                    <th className="px-6 py-4">Gamer</th>
                    <th className="px-6 py-4">Game Title</th>
                    <th className="px-6 py-4">Difficulty</th>
                    <th className="px-6 py-4 text-right">High Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {scores.map((sc, index) => (
                    <tr
                      key={sc._id || index}
                      className="hover:bg-white/[0.04] transition-colors duration-150"
                    >
                      <td className="px-6 py-4 font-mono font-bold text-xs text-slate-400">
                        #{index + 1}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <AvatarBadge avatarId={sc.avatar} size="xs" />
                          <span className="font-bold text-white text-xs">@{sc.username}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-200 font-medium">
                        {sc.gameTitle}
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-cyan-300">
                        {sc.difficulty || 'Normal'}
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-black text-amber-400 text-sm drop-shadow-[0_0_6px_rgba(245,158,11,0.4)]">
                        {sc.score}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaderboardPage;
