import React from 'react';
import { Gamepad2, Shield, Zap, Sparkles, Compass, Ghost, Terminal, Skull } from 'lucide-react';

export const AVATAR_LIST = [
  {
    id: 'cyber-fox',
    name: 'Cyber Fox',
    bgColor: 'from-amber-500 to-orange-600',
    borderColor: 'border-orange-400',
    textColor: 'text-orange-400',
    icon: Zap,
    tag: 'AGILITY',
  },
  {
    id: 'neon-ninja',
    name: 'Neon Ninja',
    bgColor: 'from-purple-600 to-indigo-700',
    borderColor: 'border-purple-400',
    textColor: 'text-purple-400',
    icon: Skull,
    tag: 'STEALTH',
  },
  {
    id: 'pixel-knight',
    name: 'Pixel Knight',
    bgColor: 'from-blue-600 to-cyan-600',
    borderColor: 'border-cyan-400',
    textColor: 'text-cyan-400',
    icon: Shield,
    tag: 'DEFENSE',
  },
  {
    id: 'space-pilot',
    name: 'Space Pilot',
    bgColor: 'from-emerald-500 to-teal-700',
    borderColor: 'border-emerald-400',
    textColor: 'text-emerald-400',
    icon: Compass,
    tag: 'EXPLORER',
  },
  {
    id: 'glitch-ghost',
    name: 'Glitch Ghost',
    bgColor: 'from-pink-500 to-rose-600',
    borderColor: 'border-pink-400',
    textColor: 'text-pink-400',
    icon: Ghost,
    tag: 'PHANTOM',
  },
  {
    id: 'code-breaker',
    name: 'Code Breaker',
    bgColor: 'from-cyan-500 to-blue-700',
    borderColor: 'border-cyan-300',
    textColor: 'text-cyan-300',
    icon: Terminal,
    tag: 'HACKER',
  },
];

export const AvatarBadge = ({ avatarId, size = 'md', className = '' }) => {
  const avatar = AVATAR_LIST.find((a) => a.id === avatarId) || AVATAR_LIST[0];
  const IconComponent = avatar.icon;

  const sizeMap = {
    xs: 'w-6 h-6 p-1 text-xs rounded-lg',
    sm: 'w-8 h-8 p-1.5 text-sm rounded-xl',
    md: 'w-10 h-10 p-2 text-base rounded-2xl',
    lg: 'w-14 h-14 p-3.5 text-xl rounded-2xl',
    xl: 'w-20 h-20 p-5 text-3xl rounded-3xl',
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center bg-gradient-to-br ${avatar.bgColor} shadow-lg shadow-black/50 border border-white/25 ring-1 ring-white/15 text-white ${sizeMap[size] || sizeMap.md} ${className}`}
      title={avatar.name}
    >
      <div className="absolute inset-0 rounded-[inherit] bg-gradient-to-t from-transparent via-white/10 to-white/30 pointer-events-none" />
      <IconComponent className="relative z-10 w-full h-full drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]" />
    </div>
  );
};

