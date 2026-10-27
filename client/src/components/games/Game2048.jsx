import React, { useState, useEffect } from 'react';
import { sound } from '../../audio';
import { useAuth } from '../../context/AuthContext';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, Zap, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

const SIZE = 4;

const TILE_COLORS = {
  2: 'bg-indigo-900/60 text-cyan-200 border border-indigo-500/30 shadow-[0_0_10px_rgba(99,102,241,0.2)]',
  4: 'bg-indigo-800/70 text-cyan-100 border border-indigo-400/40 shadow-[0_0_12px_rgba(99,102,241,0.3)]',
  8: 'bg-purple-900/70 text-purple-200 border border-purple-500/40 shadow-[0_0_14px_rgba(168,85,247,0.3)]',
  16: 'bg-purple-800/80 text-purple-100 border border-purple-400/50 shadow-[0_0_16px_rgba(168,85,247,0.4)]',
  32: 'bg-pink-900/80 text-pink-200 border border-pink-500/50 shadow-[0_0_18px_rgba(236,72,153,0.4)]',
  64: 'bg-pink-800/90 text-pink-100 border border-pink-400/60 shadow-[0_0_20px_rgba(236,72,153,0.5)]',
  128: 'bg-amber-900/80 text-amber-200 border border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.5)]',
  256: 'bg-amber-800/90 text-amber-100 border border-amber-400/60 shadow-[0_0_22px_rgba(245,158,11,0.6)] font-extrabold',
  512: 'bg-emerald-800/90 text-emerald-100 border border-emerald-400/60 shadow-[0_0_25px_rgba(16,185,129,0.6)] font-extrabold',
  1024: 'bg-cyan-800/90 text-cyan-100 border border-cyan-400/70 shadow-[0_0_25px_rgba(6,182,212,0.7)] font-black',
  2048: 'bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600 text-white border-2 border-white shadow-[0_0_35px_rgba(236,72,153,0.9)] animate-pulse font-black',
};

export const Game2048 = ({ onScoreSubmitted }) => {
  const { user } = useAuth();
  const [board, setBoard] = useState([
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('2048_highscore') || '0', 10);
  });
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitMsg, setSubmitMsg] = useState('');

  const addRandomTile = (currentBoard) => {
    const emptyCells = [];
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (currentBoard[r][c] === 0) emptyCells.push({ r, c });
      }
    }
    if (emptyCells.length === 0) return currentBoard;

    const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const newBoard = currentBoard.map((row) => [...row]);
    newBoard[randomCell.r][randomCell.c] = Math.random() < 0.9 ? 2 : 4;
    return newBoard;
  };

  const initGame = () => {
    sound.playClick();
    let initial = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    initial = addRandomTile(initial);
    initial = addRandomTile(initial);
    setBoard(initial);
    setScore(0);
    setGameOver(false);
    setWon(false);
    setSubmitted(false);
    setSubmitMsg('');

    fetch('/api/games/game-2048/play', { method: 'POST' }).catch(() => {});
  };

  useEffect(() => {
    initGame();
  }, []);

  const slideRow = (row) => {
    let arr = row.filter((val) => val !== 0);
    let earned = 0;
    for (let i = 0; i < arr.length - 1; i++) {
      if (arr[i] === arr[i + 1]) {
        arr[i] *= 2;
        earned += arr[i];
        arr[i + 1] = 0;
      }
    }
    arr = arr.filter((val) => val !== 0);
    while (arr.length < SIZE) {
      arr.push(0);
    }
    return { row: arr, earned };
  };

  const rotate = (matrix) => {
    return matrix[0].map((_, i) => matrix.map((row) => row[i]).reverse());
  };

  const move = (direction) => {
    if (gameOver) return;

    let rotCount = 0;
    if (direction === 'left') rotCount = 0;
    else if (direction === 'down') rotCount = 1;
    else if (direction === 'right') rotCount = 2;
    else if (direction === 'up') rotCount = 3;

    let rotated = board;
    for (let i = 0; i < rotCount; i++) {
      rotated = rotate(rotated);
    }

    let gainedScore = 0;
    let changed = false;
    const newRotated = rotated.map((row) => {
      const res = slideRow(row);
      gainedScore += res.earned;
      if (res.row.some((val, idx) => val !== row[idx])) changed = true;
      return res.row;
    });

    if (!changed) return;

    sound.playClick();
    if (gainedScore > 0) sound.playScore();

    // Rotate back
    let finalBoard = newRotated;
    for (let i = 0; i < (4 - rotCount) % 4; i++) {
      finalBoard = rotate(finalBoard);
    }

    const withNewTile = addRandomTile(finalBoard);
    const updatedScore = score + gainedScore;
    setBoard(withNewTile);
    setScore(updatedScore);

    if (updatedScore > highScore) {
      setHighScore(updatedScore);
      localStorage.setItem('2048_highscore', updatedScore.toString());
    }

    // Check for 2048 win
    if (!won && withNewTile.some((row) => row.some((val) => val === 2048))) {
      setWon(true);
      sound.playVictory();
      try {
        confetti({ particleCount: 100, spread: 80 });
      } catch (e) {}
    }

    // Check for game over
    if (checkGameOver(withNewTile)) {
      setGameOver(true);
      sound.playGameOver();
    }
  };

  const checkGameOver = (b) => {
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (b[r][c] === 0) return false;
        if (c < SIZE - 1 && b[r][c] === b[r][c + 1]) return false;
        if (r < SIZE - 1 && b[r][c] === b[r + 1][c]) return false;
      }
    }
    return true;
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['ArrowLeft', 'KeyA'].includes(e.code)) {
        e.preventDefault();
        move('left');
      } else if (['ArrowRight', 'KeyD'].includes(e.code)) {
        e.preventDefault();
        move('right');
      } else if (['ArrowUp', 'KeyW'].includes(e.code)) {
        e.preventDefault();
        move('up');
      } else if (['ArrowDown', 'KeyS'].includes(e.code)) {
        e.preventDefault();
        move('down');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [board, score, gameOver]);

  // Submit high score
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
          gameSlug: 'game-2048',
          gameTitle: '2048: Cyberpunk Edition',
          score,
          username: user?.username || 'GuestHacker',
          avatar: user?.avatar || 'cyber-fox',
          difficulty: 'Normal',
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
          <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-bold flex items-center gap-1.5 shadow-[0_0_12px_rgba(245,158,11,0.3)]">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            2048 CYBERPUNK
          </span>
          <span className="text-slate-400 text-xs hidden sm:inline">Use Arrow keys or WASD</span>
        </div>

        <div className="flex items-center gap-6 font-mono font-bold">
          <div className="text-slate-400 text-xs">
            BEST: <span className="text-amber-400 text-sm drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]">{highScore}</span>
          </div>
          <div className="text-white text-base">
            SCORE: <span className="text-amber-300 text-lg drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]">{score}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center p-6 sm:p-8 bg-gradient-to-b from-[#080b16] to-[#0d1222]">
        {/* 4x4 Grid Container */}
        <div className="relative p-3.5 rounded-3xl bg-[#080c18] border border-white/[0.08] shadow-[inset_0_0_30px_rgba(0,0,0,0.8)] ring-1 ring-amber-500/20">
          <div className="grid grid-cols-4 gap-2.5 w-[280px] sm:w-[330px] h-[280px] sm:h-[330px]">
            {board.map((row, r) =>
              row.map((val, c) => (
                <div
                  key={`${r}-${c}`}
                  className={`rounded-2xl flex items-center justify-center font-bold text-lg sm:text-2xl transition-all duration-150 ${
                    val === 0
                      ? 'bg-white/[0.02] border border-white/[0.04] text-transparent'
                      : TILE_COLORS[val] || 'bg-purple-950 text-white border-purple-400 shadow-lg'
                  }`}
                >
                  {val !== 0 ? val : ''}
                </div>
              ))
            )}
          </div>

          {/* Game Over / Win Overlay */}
          {gameOver && (
            <div className="absolute inset-0 rounded-3xl flex flex-col items-center justify-center bg-black/85 backdrop-blur-xl p-5 text-center animate-fadeIn">
              <h4 className="text-2xl sm:text-3xl font-black text-amber-400 mb-1 tracking-tight drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]">
                NO MORE MOVES
              </h4>
              <p className="text-xs text-slate-300 mb-4 font-mono">Final Score: {score}</p>

              {submitMsg && (
                <div className="mb-3 text-[11px] px-3 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  {submitMsg}
                </div>
              )}

              <div className="flex flex-col gap-2 w-full max-w-[190px]">
                <button
                  onClick={initGame}
                  className="btn-shimmer py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Restart 2048
                </button>
                {!submitted && (
                  <button
                    onClick={handleSubmitScore}
                    disabled={submitting}
                    className="btn-shimmer py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.3)] disabled:opacity-50"
                  >
                    <Trophy className="w-3.5 h-3.5" />
                    {submitting ? 'Saving...' : 'Save to MongoDB'}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Onscreen Controls for Mobile */}
        <div className="mt-5 flex items-center gap-3">
          <button
            onClick={() => move('left')}
            className="p-3 bg-white/[0.05] hover:bg-white/[0.1] active:bg-amber-600 rounded-xl text-white border border-white/[0.08] transition cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => move('up')}
              className="p-3 bg-white/[0.05] hover:bg-white/[0.1] active:bg-amber-600 rounded-xl text-white border border-white/[0.08] transition cursor-pointer"
            >
              <ArrowUp className="w-5 h-5" />
            </button>
            <button
              onClick={() => move('down')}
              className="p-3 bg-white/[0.05] hover:bg-white/[0.1] active:bg-amber-600 rounded-xl text-white border border-white/[0.08] transition cursor-pointer"
            >
              <ArrowDown className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={() => move('right')}
            className="p-3 bg-white/[0.05] hover:bg-white/[0.1] active:bg-amber-600 rounded-xl text-white border border-white/[0.08] transition cursor-pointer"
          >
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            onClick={initGame}
            className="ml-3 px-3.5 py-2.5 bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 hover:text-white border border-white/[0.08] rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
            title="Reset Board"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Game2048;
