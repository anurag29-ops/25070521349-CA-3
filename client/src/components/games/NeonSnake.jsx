import React, { useState, useEffect, useRef } from 'react';
import { sound } from '../../audio';
import { useAuth } from '../../context/AuthContext';
import confetti from 'canvas-confetti';
import { Play, RotateCcw, Trophy, Zap, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

const GRID_SIZE = 20;

export const NeonSnake = ({ onScoreSubmitted }) => {
  const { user } = useAuth();
  const [snake, setSnake] = useState([
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ]);
  const [food, setFood] = useState({ x: 15, y: 10 });
  const [dir, setDir] = useState({ x: 1, y: 0 });
  const [nextDir, setNextDir] = useState({ x: 1, y: 0 });
  const [gameState, setGameState] = useState('ready'); // ready, playing, gameover
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('neonsnake_highscore') || '0', 10);
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const generateFood = (currentSnake) => {
    let newFood;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      const onSnake = currentSnake.some((s) => s.x === newFood.x && s.y === newFood.y);
      if (!onSnake) break;
    }
    return newFood;
  };

  const startGame = () => {
    sound.playClick();
    const initialSnake = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 },
    ];
    setSnake(initialSnake);
    setFood(generateFood(initialSnake));
    setDir({ x: 1, y: 0 });
    setNextDir({ x: 1, y: 0 });
    setScore(0);
    setSubmitted(false);
    setSubmitMessage('');
    setGameState('playing');

    fetch('/api/games/neon-snake/play', { method: 'POST' }).catch(() => {});
  };

  const handleDirection = (dx, dy) => {
    if (gameState !== 'playing') return;
    // Prevent 180-degree immediate reversal
    if (dx !== 0 && dir.x === -dx) return;
    if (dy !== 0 && dir.y === -dy) return;
    setNextDir({ x: dx, y: dy });
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e) => {
      if (['ArrowUp', 'KeyW'].includes(e.code)) {
        e.preventDefault();
        handleDirection(0, -1);
      } else if (['ArrowDown', 'KeyS'].includes(e.code)) {
        e.preventDefault();
        handleDirection(0, 1);
      } else if (['ArrowLeft', 'KeyA'].includes(e.code)) {
        e.preventDefault();
        handleDirection(-1, 0);
      } else if (['ArrowRight', 'KeyD'].includes(e.code)) {
        e.preventDefault();
        handleDirection(1, 0);
      } else if (e.code === 'Space') {
        if (gameState !== 'playing') startGame();
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [dir, gameState]);

  // Main game tick interval
  useEffect(() => {
    if (gameState !== 'playing') return;

    const intervalSpeed = Math.max(80, 140 - Math.floor(score * 1.5));
    const timer = setInterval(() => {
      setDir(nextDir);
      setSnake((prevSnake) => {
        const head = { x: prevSnake[0].x + nextDir.x, y: prevSnake[0].y + nextDir.y };

        // Wall collision check
        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
          sound.playGameOver();
          setGameState('gameover');
          if (score > highScore) {
            setHighScore(score);
            localStorage.setItem('neonsnake_highscore', score.toString());
            try {
              confetti({ particleCount: 80, spread: 60 });
            } catch (e) {}
          }
          return prevSnake;
        }

        // Self collision check
        if (prevSnake.some((segment) => segment.x === head.x && segment.y === head.y)) {
          sound.playGameOver();
          setGameState('gameover');
          if (score > highScore) {
            setHighScore(score);
            localStorage.setItem('neonsnake_highscore', score.toString());
          }
          return prevSnake;
        }

        const newSnake = [head, ...prevSnake];

        // Eat food check
        if (head.x === food.x && head.y === food.y) {
          sound.playScore();
          const newScore = score + 10;
          setScore(newScore);
          setFood(generateFood(newSnake));
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    }, intervalSpeed);

    return () => clearInterval(timer);
  }, [gameState, nextDir, food, score, highScore]);

  // Submit Score to MongoDB
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
          gameSlug: 'neon-snake',
          gameTitle: 'Neon Snake 3000',
          score,
          username: user?.username || 'GuestPlayer',
          avatar: user?.avatar || 'cyber-fox',
          difficulty: 'Normal',
        }),
      });

      const data = await res.json();
      if (data.success) {
        sound.playVictory();
        setSubmitted(true);
        setSubmitMessage(`Score of ${score} saved to MongoDB! (+${data.xpGained || 50} XP)`);
        if (onScoreSubmitted) onScoreSubmitted();
      }
    } catch (e) {
      setSubmitMessage('Failed to save score');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative rounded-3xl overflow-hidden bg-[#0c1022]/90 backdrop-blur-2xl border border-white/[0.1] shadow-[0_20px_50px_rgba(0,0,0,0.6)] specular-border">
      {/* Header HUD */}
      <div className="flex items-center justify-between px-6 py-3.5 bg-black/40 border-b border-white/[0.06] text-sm">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold flex items-center gap-1.5 shadow-[0_0_12px_rgba(16,185,129,0.3)]">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            NEON SNAKE 3000
          </span>
          <span className="text-slate-400 text-xs hidden sm:inline">Use Arrow keys or WASD</span>
        </div>

        <div className="flex items-center gap-6 font-mono font-bold">
          <div className="text-slate-400 text-xs">
            BEST: <span className="text-amber-400 text-sm drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]">{highScore}</span>
          </div>
          <div className="text-white text-base">
            SCORE: <span className="text-emerald-300 text-lg drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]">{score}</span>
          </div>
        </div>
      </div>

      {/* Game Board Grid Container */}
      <div className="relative flex flex-col items-center justify-center p-6 bg-gradient-to-b from-[#080b16] to-[#0d1222]">
        <div
          className="relative grid bg-[#080c18] border border-white/[0.08] rounded-2xl overflow-hidden shadow-[inset_0_0_30px_rgba(0,0,0,0.8)] ring-1 ring-emerald-500/20"
          style={{
            width: '320px',
            height: '320px',
            gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
          }}
        >
          {/* Render Snake */}
          {snake.map((segment, index) => {
            const isHead = index === 0;
            return (
              <div
                key={`${segment.x}-${segment.y}-${index}`}
                className={`rounded-sm transition-all duration-75 ${
                  isHead
                    ? 'bg-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.9)] ring-1 ring-white'
                    : 'bg-emerald-500/80 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                }`}
                style={{
                  gridColumnStart: segment.x + 1,
                  gridRowStart: segment.y + 1,
                }}
              />
            );
          })}

          {/* Render Food */}
          <div
            className="rounded-full bg-pink-400 shadow-[0_0_14px_rgba(236,72,153,1)] animate-pulse border border-white"
            style={{
              gridColumnStart: food.x + 1,
              gridRowStart: food.y + 1,
            }}
          />

          {/* Ready Overlay */}
          {gameState === 'ready' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 backdrop-blur-md p-6 text-center animate-fadeIn">
              <h4 className="text-2xl font-black text-emerald-300 mb-1 tracking-tight drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                READY TO SLITHER?
              </h4>
              <p className="text-xs text-slate-300 mb-5 font-normal">Collect glowing plasma nodes to expand your circuit.</p>
              <button
                onClick={startGame}
                className="btn-shimmer px-7 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-xs shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:scale-105 transition flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Play className="w-4 h-4 fill-current" />
                START GAME
              </button>
            </div>
          )}

          {/* Game Over Overlay */}
          {gameState === 'gameover' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 backdrop-blur-xl p-5 text-center animate-fadeIn">
              <h4 className="text-3xl font-black text-red-400 mb-1 tracking-tight">GAME OVER</h4>
              <div className="font-mono text-xs text-slate-300 mb-4">
                Score: <span className="text-emerald-300 font-bold text-base drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]">{score}</span> | Best: {highScore}
              </div>

              {submitMessage && (
                <div className="mb-3 text-[11px] px-3 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  {submitMessage}
                </div>
              )}

              <div className="flex flex-col gap-2 w-full max-w-[200px]">
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
                    className="btn-shimmer py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-50"
                  >
                    <Trophy className="w-3.5 h-3.5" />
                    {submitting ? 'Saving...' : 'Save to MongoDB'}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Mobile / Screen Directional Controls */}
        <div className="mt-5 flex flex-col items-center gap-1.5 sm:hidden">
          <button
            onClick={() => handleDirection(0, -1)}
            className="p-3 bg-white/[0.06] hover:bg-white/[0.1] active:bg-emerald-600 rounded-xl text-white border border-white/[0.08]"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleDirection(-1, 0)}
              className="p-3 bg-white/[0.06] hover:bg-white/[0.1] active:bg-emerald-600 rounded-xl text-white border border-white/[0.08]"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleDirection(0, 1)}
              className="p-3 bg-white/[0.06] hover:bg-white/[0.1] active:bg-emerald-600 rounded-xl text-white border border-white/[0.08]"
            >
              <ArrowDown className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleDirection(1, 0)}
              className="p-3 bg-white/[0.06] hover:bg-white/[0.1] active:bg-emerald-600 rounded-xl text-white border border-white/[0.08]"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NeonSnake;
