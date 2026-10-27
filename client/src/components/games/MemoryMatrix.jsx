import React, { useState, useEffect } from 'react';
import { sound } from '../../audio';
import { useAuth } from '../../context/AuthContext';
import confetti from 'canvas-confetti';
import { Play, RotateCcw, Trophy, Zap, Terminal, ShieldAlert } from 'lucide-react';

const PADS = [
  { id: 0, color: 'from-cyan-500 to-blue-600', activeGlow: 'bg-cyan-400 shadow-[0_0_25px_rgba(6,182,212,1)]', label: 'NODE-01' },
  { id: 1, color: 'from-purple-500 to-indigo-600', activeGlow: 'bg-purple-400 shadow-[0_0_25px_rgba(168,85,247,1)]', label: 'NODE-02' },
  { id: 2, color: 'from-pink-500 to-rose-600', activeGlow: 'bg-pink-400 shadow-[0_0_25px_rgba(236,72,153,1)]', label: 'NODE-03' },
  { id: 3, color: 'from-emerald-500 to-teal-600', activeGlow: 'bg-emerald-400 shadow-[0_0_25px_rgba(16,185,129,1)]', label: 'NODE-04' },
  { id: 4, color: 'from-amber-500 to-orange-600', activeGlow: 'bg-amber-400 shadow-[0_0_25px_rgba(245,158,11,1)]', label: 'CORE-05' },
  { id: 5, color: 'from-red-500 to-rose-700', activeGlow: 'bg-red-400 shadow-[0_0_25px_rgba(239,68,68,1)]', label: 'NODE-06' },
  { id: 6, color: 'from-blue-600 to-indigo-800', activeGlow: 'bg-blue-400 shadow-[0_0_25px_rgba(59,130,246,1)]', label: 'NODE-07' },
  { id: 7, color: 'from-fuchsia-600 to-pink-700', activeGlow: 'bg-fuchsia-400 shadow-[0_0_25px_rgba(217,70,239,1)]', label: 'NODE-08' },
  { id: 8, color: 'from-teal-500 to-emerald-700', activeGlow: 'bg-teal-400 shadow-[0_0_25px_rgba(20,184,166,1)]', label: 'NODE-09' },
];

export const MemoryMatrix = ({ onScoreSubmitted }) => {
  const { user } = useAuth();
  const [sequence, setSequence] = useState([]);
  const [userStep, setUserStep] = useState(0);
  const [activePad, setActivePad] = useState(null);
  const [isPlayingSeq, setIsPlayingSeq] = useState(false);
  const [gameState, setGameState] = useState('ready'); // ready, playing, gameover
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('memory_highscore') || '0', 10);
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitMsg, setSubmitMsg] = useState('');

  const startGame = () => {
    sound.playClick();
    setGameState('playing');
    setSubmitted(false);
    setSubmitMsg('');
    setScore(0);
    const firstSeq = [Math.floor(Math.random() * 9)];
    setSequence(firstSeq);
    setUserStep(0);
    playSequence(firstSeq);

    fetch('/api/games/memory-matrix/play', { method: 'POST' }).catch(() => {});
  };

  const playSequence = async (seq) => {
    setIsPlayingSeq(true);
    await new Promise((r) => setTimeout(r, 600));

    for (let i = 0; i < seq.length; i++) {
      const padId = seq[i];
      setActivePad(padId);
      sound.playJump();
      await new Promise((r) => setTimeout(r, 450));
      setActivePad(null);
      await new Promise((r) => setTimeout(r, 180));
    }

    setIsPlayingSeq(false);
  };

  const handlePadClick = (id) => {
    if (gameState !== 'playing' || isPlayingSeq) return;

    sound.playClick();
    setActivePad(id);
    setTimeout(() => setActivePad(null), 200);

    if (id === sequence[userStep]) {
      // Correct pad!
      const nextStep = userStep + 1;
      if (nextStep === sequence.length) {
        // Completed this round!
        const newScore = score + 1;
        setScore(newScore);
        sound.playScore();

        if (newScore > highScore) {
          setHighScore(newScore);
          localStorage.setItem('memory_highscore', newScore.toString());
        }

        const newSeq = [...sequence, Math.floor(Math.random() * 9)];
        setSequence(newSeq);
        setUserStep(0);
        setTimeout(() => {
          playSequence(newSeq);
        }, 600);
      } else {
        setUserStep(nextStep);
      }
    } else {
      // WRONG! GAME OVER
      sound.playGameOver();
      setGameState('gameover');
      if (score > 10) {
        try {
          confetti({ particleCount: 70 });
        } catch (e) {}
      }
    }
  };

  const handleSubmitScore = async () => {
    sound.playClick();
    setSubmitting(true);
    try {
      const res = await fetch('/api/scores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('playhub_token')
            ? { Authorization: `Bearer ${localStorage.getItem('playhub_token')}` }
            : {}),
        },
        body: JSON.stringify({
          gameSlug: 'memory-matrix',
          gameTitle: 'Memory Matrix',
          score,
          username: user?.username || 'CyberAgent',
          avatar: user?.avatar || 'cyber-fox',
          difficulty: 'Master',
        }),
      });

      const data = await res.json();
      if (data.success) {
        sound.playVictory();
        setSubmitted(true);
        setSubmitMsg(`Score saved to MongoDB! (+${data.xpGained || 50} XP)`);
        if (onScoreSubmitted) onScoreSubmitted();
      }
    } catch (e) {
      setSubmitMsg('Error saving score');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative rounded-3xl overflow-hidden bg-[#0c1022]/90 backdrop-blur-2xl border border-white/[0.1] shadow-[0_20px_50px_rgba(0,0,0,0.6)] specular-border">
      {/* HUD Bar */}
      <div className="flex items-center justify-between px-6 py-3.5 bg-black/40 border-b border-white/[0.06] text-sm">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 border border-pink-400/30 text-xs font-bold flex items-center gap-1.5 shadow-[0_0_12px_rgba(236,72,153,0.3)]">
            <Zap className="w-3.5 h-3.5 text-pink-400" />
            MEMORY MATRIX
          </span>
          <span className="text-slate-400 text-xs hidden sm:inline">
            {isPlayingSeq ? 'Observe mainframe sequence...' : 'Repeat sequence nodes!'}
          </span>
        </div>

        <div className="flex items-center gap-6 font-mono font-bold">
          <div className="text-slate-400 text-xs">
            BEST: <span className="text-amber-400 text-sm drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]">{highScore}</span>
          </div>
          <div className="text-white text-base">
            STREAK: <span className="text-pink-300 text-lg drop-shadow-[0_0_8px_rgba(236,72,153,0.5)]">{score}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center p-6 sm:p-8 bg-gradient-to-b from-[#080b16] to-[#0d1222]">
        {/* 3x3 Matrix Grid */}
        <div className="relative p-3.5 rounded-3xl bg-[#080c18] border border-white/[0.08] shadow-[inset_0_0_30px_rgba(0,0,0,0.8)] ring-1 ring-pink-500/20">
          <div className="grid grid-cols-3 gap-3 w-[270px] sm:w-[310px] h-[270px] sm:h-[310px]">
            {PADS.map((pad) => {
              const isActive = activePad === pad.id;
              return (
                <button
                  key={pad.id}
                  onClick={() => handlePadClick(pad.id)}
                  disabled={isPlayingSeq || gameState !== 'playing'}
                  className={`relative rounded-2xl border transition-all duration-150 flex flex-col items-center justify-center cursor-pointer select-none ${
                    isActive
                      ? `${pad.activeGlow} scale-105 ring-2 ring-white border-white`
                      : 'bg-white/[0.02] border-white/[0.06] hover:border-white/20 hover:bg-white/[0.05]'
                  }`}
                >
                  <span
                    className={`text-[9px] font-mono tracking-widest ${
                      isActive ? 'text-black font-black' : 'text-slate-400'
                    }`}
                  >
                    {pad.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Ready Overlay */}
          {gameState === 'ready' && (
            <div className="absolute inset-0 rounded-3xl flex flex-col items-center justify-center bg-black/80 backdrop-blur-md p-6 text-center animate-fadeIn">
              <Terminal className="w-8 h-8 text-pink-400 mb-2 animate-bounce drop-shadow-[0_0_10px_rgba(236,72,153,0.6)]" />
              <h4 className="text-2xl font-black text-pink-300 mb-1 tracking-tight">MEMORY CIPHER</h4>
              <p className="text-xs text-slate-300 mb-5 max-w-[210px] leading-relaxed font-normal">
                Observe the flashing pattern sequence and unlock system security nodes.
              </p>
              <button
                onClick={startGame}
                className="btn-shimmer px-7 py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-600 text-white font-black text-xs shadow-[0_0_20px_rgba(236,72,153,0.4)] hover:scale-105 transition flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Play className="w-4 h-4 fill-current" />
                COMMENCE HACK
              </button>
            </div>
          )}

          {/* Game Over Overlay */}
          {gameState === 'gameover' && (
            <div className="absolute inset-0 rounded-3xl flex flex-col items-center justify-center bg-black/85 backdrop-blur-xl p-5 text-center animate-fadeIn">
              <ShieldAlert className="w-8 h-8 text-red-400 mb-1" />
              <h4 className="text-2xl font-black text-red-400 mb-1 tracking-tight">CIPHER BREACH FAILED</h4>
              <p className="text-xs text-slate-300 mb-4 font-mono">
                Streak: <span className="text-pink-300 font-bold text-sm drop-shadow-[0_0_8px_rgba(236,72,153,0.5)]">{score}</span> | Best: {highScore}
              </p>

              {submitMsg && (
                <div className="mb-3 text-[11px] px-3 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  {submitMsg}
                </div>
              )}

              <div className="flex flex-col gap-2 w-full max-w-[190px]">
                <button
                  onClick={startGame}
                  className="btn-shimmer py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Try Again
                </button>
                {!submitted && (
                  <button
                    onClick={handleSubmitScore}
                    disabled={submitting}
                    className="btn-shimmer py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(236,72,153,0.3)] disabled:opacity-50"
                  >
                    <Trophy className="w-3.5 h-3.5" />
                    {submitting ? 'Saving...' : 'Save to MongoDB'}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemoryMatrix;
