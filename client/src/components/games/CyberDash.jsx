import React, { useState, useEffect, useRef } from 'react';
import { sound } from '../../audio';
import { useAuth } from '../../context/AuthContext';
import confetti from 'canvas-confetti';
import { Play, RotateCcw, Trophy, Award, Zap, Volume2, Shield, Activity } from 'lucide-react';

export const CyberDash = ({ onScoreSubmitted }) => {
  const { user } = useAuth();
  const canvasRef = useRef(null);

  const [gameState, setGameState] = useState('ready'); // ready, playing, gameover
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('cyberdash_highscore') || '0', 10);
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  // Game variables stored in refs for loop performance
  const stateRef = useRef({
    playerY: 220,
    playerVY: 0,
    isJumping: false,
    obstacles: [],
    crystals: [],
    speed: 4.5,
    distance: 0,
    currentScore: 0,
    animationId: null,
  });

  const startGame = () => {
    sound.playClick();
    setSubmitted(false);
    setSubmitMessage('');
    setScore(0);
    setGameState('playing');

    stateRef.current = {
      playerY: 220,
      playerVY: 0,
      isJumping: false,
      obstacles: [],
      crystals: [],
      speed: 4.5,
      distance: 0,
      currentScore: 0,
      animationId: null,
    };

    // Increment backend plays count
    fetch('/api/games/cyber-dash/play', { method: 'POST' }).catch(() => {});
  };

  const jump = () => {
    if (gameState !== 'playing') return;
    if (!stateRef.current.isJumping) {
      stateRef.current.playerVY = -12.5;
      stateRef.current.isJumping = true;
      sound.playJump();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        if (gameState === 'ready' || gameState === 'gameover') {
          startGame();
        } else if (gameState === 'playing') {
          jump();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  // Main Canvas animation loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const groundY = 250;
    let spawnTimer = 0;
    let crystalTimer = 0;

    const loop = () => {
      const state = stateRef.current;

      // Update Physics
      state.playerVY += 0.65; // gravity
      state.playerY += state.playerVY;

      if (state.playerY >= groundY) {
        state.playerY = groundY;
        state.playerVY = 0;
        state.isJumping = false;
      }

      state.distance += 1;
      state.speed = 4.5 + Math.min(state.distance * 0.002, 6);

      // Score increment
      if (state.distance % 5 === 0) {
        state.currentScore += 1;
        setScore(state.currentScore);
      }

      // Spawn Obstacles
      spawnTimer++;
      if (spawnTimer > Math.max(50, 100 - Math.floor(state.speed * 4))) {
        spawnTimer = 0;
        const height = 30 + Math.random() * 35;
        state.obstacles.push({
          x: canvas.width + 20,
          y: groundY + 20 - height,
          width: 22,
          height: height,
          type: Math.random() > 0.5 ? 'laser' : 'barrier',
        });
      }

      // Spawn Data Crystals
      crystalTimer++;
      if (crystalTimer > 80) {
        crystalTimer = 0;
        state.crystals.push({
          x: canvas.width + 30,
          y: groundY - 40 - Math.random() * 50,
          radius: 8,
          collected: false,
        });
      }

      // Move & filter obstacles
      for (let i = state.obstacles.length - 1; i >= 0; i--) {
        const obs = state.obstacles[i];
        obs.x -= state.speed;

        // Collision detection with player (player box: x: 70, y: playerY, w: 28, h: 28)
        const playerX = 70;
        const playerW = 28;
        const playerH = 28;

        if (
          playerX < obs.x + obs.width &&
          playerX + playerW > obs.x &&
          state.playerY < obs.y + obs.height &&
          state.playerY + playerH > obs.y
        ) {
          // HIT! GAME OVER
          sound.playGameOver();
          setGameState('gameover');
          if (state.currentScore > highScore) {
            setHighScore(state.currentScore);
            localStorage.setItem('cyberdash_highscore', state.currentScore.toString());
            try {
              confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
            } catch (e) {}
          }
          return;
        }

        if (obs.x < -30) {
          state.obstacles.splice(i, 1);
        }
      }

      // Move crystals & collection detection
      for (let i = state.crystals.length - 1; i >= 0; i--) {
        const c = state.crystals[i];
        c.x -= state.speed;

        const dist = Math.hypot(70 + 14 - c.x, state.playerY + 14 - c.y);
        if (dist < 26 && !c.collected) {
          c.collected = true;
          state.currentScore += 15;
          setScore(state.currentScore);
          sound.playScore();
          state.crystals.splice(i, 1);
          continue;
        }

        if (c.x < -20) {
          state.crystals.splice(i, 1);
        }
      }

      // RENDER
      // Background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bgGrad.addColorStop(0, '#0a0d1a');
      bgGrad.addColorStop(1, '#13192f');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Cyber Grid Horizon Lines
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.15)';
      ctx.lineWidth = 1;
      for (let y = 50; y < groundY + 20; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Ground plane
      const groundGrad = ctx.createLinearGradient(0, groundY + 20, 0, canvas.height);
      groundGrad.addColorStop(0, '#1c1335');
      groundGrad.addColorStop(1, '#090514');
      ctx.fillStyle = groundGrad;
      ctx.fillRect(0, groundY + 20, canvas.width, canvas.height - (groundY + 20));

      // Neon ground strip
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#06b6d4';
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(0, groundY + 20, canvas.width, 3);
      ctx.shadowBlur = 0;

      // Draw Crystals
      state.crystals.forEach((c) => {
        ctx.save();
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#f59e0b';
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Draw Obstacles
      state.obstacles.forEach((obs) => {
        ctx.save();
        ctx.shadowBlur = 15;
        if (obs.type === 'laser') {
          ctx.shadowColor = '#ef4444';
          ctx.fillStyle = '#f87171';
        } else {
          ctx.shadowColor = '#a855f7';
          ctx.fillStyle = '#c084fc';
        }
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        // Core glow line
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(obs.x + obs.width / 2 - 2, obs.y, 4, obs.height);
        ctx.restore();
      });

      // Draw Player (Cyber Vehicle)
      ctx.save();
      ctx.shadowBlur = 16;
      ctx.shadowColor = '#38bdf8';

      // Thruster trail
      ctx.fillStyle = 'rgba(236, 72, 153, 0.8)';
      ctx.fillRect(52, state.playerY + 8, 14, 10);

      // Body
      const pGrad = ctx.createLinearGradient(70, state.playerY, 98, state.playerY + 28);
      pGrad.addColorStop(0, '#38bdf8');
      pGrad.addColorStop(1, '#818cf8');
      ctx.fillStyle = pGrad;
      ctx.beginPath();
      ctx.roundRect(70, state.playerY, 28, 24, 6);
      ctx.fill();

      // Cockpit visor
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(84, state.playerY + 4, 10, 6);
      ctx.restore();

      state.animationId = requestAnimationFrame(loop);
    };

    stateRef.current.animationId = requestAnimationFrame(loop);

    return () => {
      if (stateRef.current.animationId) {
        cancelAnimationFrame(stateRef.current.animationId);
      }
    };
  }, [gameState, highScore]);

  // Submit high score to MongoDB Leaderboard
  const handleSubmitScore = async () => {
    sound.playClick();
    setSubmitting(true);
    setSubmitMessage('');

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
          gameSlug: 'cyber-dash',
          gameTitle: 'Cyber Dash',
          score,
          username: user?.username || 'GuestRacer',
          avatar: user?.avatar || 'cyber-fox',
          difficulty: 'Normal',
        }),
      });

      const data = await res.json();
      if (data.success) {
        sound.playVictory();
        setSubmitted(true);
        setSubmitMessage(`Score of ${score} saved to MongoDB Leaderboard! (+${data.xpGained || 50} XP)`);
        if (onScoreSubmitted) onScoreSubmitted();
      } else {
        setSubmitMessage(data.message || 'Failed to submit score');
      }
    } catch (e) {
      setSubmitMessage('Network error submitting score');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative rounded-3xl overflow-hidden bg-[#0c1022]/90 backdrop-blur-2xl border border-white/[0.1] shadow-[0_20px_50px_rgba(0,0,0,0.6)] specular-border">
      {/* Game HUD Bar */}
      <div className="flex items-center justify-between px-6 py-3.5 bg-black/40 border-b border-white/[0.06] text-sm">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 text-xs font-bold flex items-center gap-1.5 shadow-[0_0_12px_rgba(6,182,212,0.3)]">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            CYBER DASH
          </span>
          <span className="text-slate-400 text-xs hidden sm:inline">
            Press <kbd className="px-2 py-0.5 bg-white/[0.06] rounded-md text-slate-200 border border-white/[0.1] font-mono text-[11px]">Space</kbd> or Click to Jump
          </span>
        </div>

        <div className="flex items-center gap-6 font-mono font-bold">
          <div className="text-slate-400 text-xs">
            BEST: <span className="text-amber-400 text-sm drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]">{highScore}</span>
          </div>
          <div className="text-white text-base">
            SCORE: <span className="text-cyan-300 text-lg drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]">{score}</span>
          </div>
        </div>
      </div>

      {/* Canvas container */}
      <div
        className="relative cursor-pointer select-none"
        onClick={() => {
          if (gameState === 'ready' || gameState === 'gameover') {
            startGame();
          } else {
            jump();
          }
        }}
      >
        <canvas
          ref={canvasRef}
          width={720}
          height={320}
          className="w-full h-[280px] sm:h-[340px] block"
        />

        {/* Start Overlay */}
        {gameState === 'ready' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md p-6 text-center animate-fadeIn">
            <h3 className="text-3xl sm:text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-300 to-pink-400 mb-2 drop-shadow-[0_0_20px_rgba(6,182,212,0.5)]">
              CYBER DASH
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm max-w-md mb-6 leading-relaxed">
              Dodge supersonic barrier gates, collect gold energy data, and climb the live Play Hub leaderboard.
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                startGame();
              }}
              className="btn-shimmer px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-sm shadow-[0_0_25px_rgba(6,182,212,0.4)] transform hover:scale-105 transition active:scale-95 flex items-center gap-2.5 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              LAUNCH MISSION
            </button>
          </div>
        )}

        {/* Game Over Overlay */}
        {gameState === 'gameover' && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-xl p-6 text-center animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-[11px] uppercase tracking-widest font-mono text-red-400 font-bold mb-1">
              SYSTEM COLLISION DETECTED
            </div>
            <h3 className="text-3xl sm:text-4xl font-black text-white mb-2 tracking-tight">GAME OVER</h3>

            <div className="flex items-center gap-8 my-4 p-4 rounded-2xl bg-black/50 border border-white/[0.08] backdrop-blur-md">
              <div>
                <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">YOUR SCORE</div>
                <div className="text-3xl font-black text-cyan-300 font-mono drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]">{score}</div>
              </div>
              <div className="h-10 w-px bg-white/[0.08]" />
              <div>
                <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">ALL-TIME BEST</div>
                <div className="text-3xl font-black text-amber-400 font-mono drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]">{highScore}</div>
              </div>
            </div>

            {submitMessage && (
              <div className="mb-4 text-xs font-semibold px-4 py-2 rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                {submitMessage}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={startGame}
                className="btn-shimmer px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-[0_0_20px_rgba(168,85,247,0.3)] transition flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Play Again
              </button>

              {!submitted && (
                <button
                  onClick={handleSubmitScore}
                  disabled={submitting}
                  className="btn-shimmer px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-[0_0_20px_rgba(6,182,212,0.3)] transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Trophy className="w-3.5 h-3.5 text-amber-300" />
                  {submitting ? 'Saving to MongoDB...' : 'Save to Leaderboard'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CyberDash;
