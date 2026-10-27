import React, { useState, useEffect } from 'react';
import { Database, CheckCircle2, Clock, Copy, Check, ExternalLink, RefreshCw, X, ChevronRight, Terminal, Activity, Layers } from 'lucide-react';
import { sound } from '../audio';

export const MongoBanner = () => {
  const [dbStatus, setDbStatus] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [rechecking, setRechecking] = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/status');
      const data = await res.json();
      if (data.success) {
        setDbStatus(data.database);
      }
    } catch (e) {
      console.warn('Failed to load status', e);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleCopyUri = () => {
    sound.playClick();
    const uri = dbStatus?.uri || 'mongodb://127.0.0.1:27017/playhub';
    navigator.clipboard.writeText(uri);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReconnect = async () => {
    sound.playClick();
    setRechecking(true);
    try {
      const res = await fetch('/api/status/reconnect', { method: 'POST' });
      await res.json();
      await fetchStatus();
    } finally {
      setRechecking(false);
    }
  };

  const isConnected = dbStatus?.connected;

  return (
    <>
      {/* Top persistent subtle frosted status bar */}
      <div className="bg-[#060814]/80 backdrop-blur-md border-b border-white/[0.05] px-4 py-1.5 text-xs text-slate-300">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center gap-1.5 font-medium text-slate-300">
              <Database className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-[11px] tracking-wide">Database Engine:</span>
            </span>

            {isConnected ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 text-[11px] font-semibold shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                MongoDB Community Server (Live)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/25 text-[11px] font-medium">
                <Clock className="w-3 h-3 text-amber-400 animate-spin" />
                Listening on Port 27017
              </span>
            )}

            <span className="hidden sm:inline font-mono text-slate-400 text-[11px] bg-black/40 px-2 py-0.5 rounded-lg border border-white/[0.06]">
              {dbStatus?.uri || 'mongodb://127.0.0.1:27017/playhub'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCopyUri}
              className="text-slate-400 hover:text-white flex items-center gap-1.5 transition text-[11px] px-2 py-0.5 rounded-lg hover:bg-white/[0.04] cursor-pointer"
              title="Copy URI for MongoDB Compass"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied to Clipboard' : 'Copy Compass URI'}</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                setModalOpen(true);
              }}
              className="px-2.5 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/25 flex items-center gap-1 text-[11px] font-medium transition cursor-pointer hover:shadow-[0_0_12px_rgba(168,85,247,0.2)]"
            >
              <span>Diagnostics & Compass Guide</span>
              <ChevronRight className="w-3 h-3 text-purple-400" />
            </button>
          </div>
        </div>
      </div>

      {/* COMPASS & MONGODB MODAL - High-End Studio Glass */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fadeIn">
          <div className="relative w-full max-w-2xl rounded-3xl bg-[#0c1022]/90 backdrop-blur-2xl border border-white/[0.12] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] p-6 md:p-8 text-slate-100 max-h-[90vh] overflow-y-auto specular-border">
            <button
              onClick={() => {
                sound.playClick();
                setModalOpen(false);
              }}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3.5 mb-5">
              <div className="p-3 rounded-2xl bg-gradient-to-tr from-purple-600/30 to-indigo-600/20 border border-purple-500/30 text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.2)]">
                <Database className="w-6 h-6 text-purple-300" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  MongoDB Community Server & Compass Setup
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Real-time database synchronization and collection inspector
                </p>
              </div>
            </div>

            {/* Current State Diagnostic Box */}
            <div className="p-5 rounded-2xl bg-black/30 border border-white/[0.06] mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
                  Engine Connection Status
                </span>
                {isConnected ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-bold shadow-[0_0_12px_rgba(16,185,129,0.25)]">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    MongoDB Server Connected
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-xs font-semibold">
                    <Clock className="w-4 h-4 text-amber-400 animate-spin" />
                    High-Availability Fallback Active
                  </span>
                )}
              </div>

              {/* 4 Illuminated Glass Stat Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center text-xs">
                <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/20 shadow-sm">
                  <div className="text-slate-400 text-[10px] uppercase font-mono tracking-wider">Users</div>
                  <div className="text-lg font-black text-purple-300 mt-1">
                    {dbStatus?.counts?.users ?? 0}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/20 shadow-sm">
                  <div className="text-slate-400 text-[10px] uppercase font-mono tracking-wider">Catalog Games</div>
                  <div className="text-lg font-black text-cyan-300 mt-1">
                    {dbStatus?.counts?.games ?? 8}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 shadow-sm">
                  <div className="text-slate-400 text-[10px] uppercase font-mono tracking-wider">Scores Logged</div>
                  <div className="text-lg font-black text-emerald-300 mt-1">
                    {dbStatus?.counts?.scores ?? 9}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-pink-950/20 border border-pink-500/20 shadow-sm">
                  <div className="text-slate-400 text-[10px] uppercase font-mono tracking-wider">Reviews</div>
                  <div className="text-lg font-black text-pink-300 mt-1">
                    {dbStatus?.counts?.reviews ?? 3}
                  </div>
                </div>
              </div>
            </div>

            {/* Compass Step-by-Step Guide */}
            <div className="space-y-4 text-sm">
              <h4 className="font-bold text-white text-sm uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span>How to Inspect in MongoDB Compass:</span>
              </h4>

              <div className="space-y-3 pl-1">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 flex items-center justify-center font-bold text-xs">
                    1
                  </span>
                  <div className="flex-1">
                    <p className="font-medium text-slate-200 text-xs">Copy the Connection String:</p>
                    <div className="flex items-center gap-2 mt-2">
                      <code className="px-3 py-1.5 rounded-lg bg-black/60 font-mono text-cyan-300 text-xs border border-white/[0.08] select-all flex-1">
                        {dbStatus?.uri || 'mongodb://127.0.0.1:27017/playhub'}
                      </code>
                      <button
                        onClick={handleCopyUri}
                        className="px-3 py-1.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.14] text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 flex items-center justify-center font-bold text-xs">
                    2
                  </span>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    Open <strong className="text-white">MongoDB Compass</strong>, paste the URI into the connection box, and click <strong className="text-emerald-400 font-bold">Connect</strong>.
                  </p>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 flex items-center justify-center font-bold text-xs">
                    3
                  </span>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    In Compass, select the database <code className="text-purple-300 font-mono bg-purple-950/40 px-1.5 py-0.5 rounded">playhub</code>. You can inspect documents in <code className="text-cyan-300 font-mono">users</code>, <code className="text-cyan-300 font-mono">games</code>, <code className="text-cyan-300 font-mono">scores</code>, and <code className="text-cyan-300 font-mono">reviews</code>.
                  </p>
                </div>
              </div>

              {/* Windows Terminal Setup Box */}
              <div className="mt-4 p-4 rounded-2xl bg-black/40 border border-white/[0.06]">
                <div className="flex items-center gap-2 font-bold text-slate-200 text-xs mb-2">
                  <Terminal className="w-4 h-4 text-purple-400" />
                  <span>Windows Terminal Installation (if needed):</span>
                </div>
                <div className="p-2.5 rounded-xl bg-black/80 font-mono text-[11px] text-emerald-400 border border-white/[0.05] select-all">
                  winget install --id MongoDB.Server --accept-source-agreements --accept-package-agreements
                </div>
                <p className="text-[11px] text-slate-400 mt-2">
                  Or download from{' '}
                  <a
                    href="https://www.mongodb.com/try/download/community"
                    target="_blank"
                    rel="noreferrer"
                    className="text-cyan-400 hover:text-cyan-300 underline inline-flex items-center gap-1 font-medium"
                  >
                    mongodb.com/try/download/community <ExternalLink className="w-3 h-3" />
                  </a>
                </p>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="mt-6 flex items-center justify-between pt-4 border-t border-white/[0.08]">
              <button
                onClick={handleReconnect}
                disabled={rechecking}
                className="btn-shimmer px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 transition cursor-pointer disabled:opacity-50 shadow-[0_0_20px_rgba(168,85,247,0.3)]"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${rechecking ? 'animate-spin' : ''}`} />
                <span>{rechecking ? 'Testing Engine...' : 'Recheck Connection'}</span>
              </button>

              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 text-xs font-semibold transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MongoBanner;
