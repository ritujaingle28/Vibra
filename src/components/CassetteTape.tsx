import React from 'react';
import { Cassette } from '../types';

interface CassetteTapeProps {
  cassette: Cassette;
  isPlaying?: boolean;
  isCompact?: boolean;
  className?: string;
  onClick?: () => void;
}

const THEME_STYLES: Record<
  Cassette['themeColor'],
  {
    shellBg: string;
    shellBorder: string;
    labelBg: string;
    labelText: string;
    accent: string;
    glow: string;
    reelColor: string;
  }
> = {
  rose: {
    shellBg: 'from-pink-950/80 via-rose-900/60 to-stone-900/90',
    shellBorder: 'border-pink-500/30',
    labelBg: 'bg-rose-50 text-rose-950',
    labelText: 'text-rose-950',
    accent: 'text-rose-400',
    glow: 'shadow-[0_0_25px_rgba(244,63,94,0.25)]',
    reelColor: 'border-rose-400/40'
  },
  gold: {
    shellBg: 'from-amber-950/80 via-yellow-900/60 to-stone-900/90',
    shellBorder: 'border-amber-500/30',
    labelBg: 'bg-amber-50 text-amber-950',
    labelText: 'text-amber-950',
    accent: 'text-amber-400',
    glow: 'shadow-[0_0_25px_rgba(245,158,11,0.25)]',
    reelColor: 'border-amber-400/40'
  },
  violet: {
    shellBg: 'from-purple-950/80 via-indigo-900/60 to-stone-900/90',
    shellBorder: 'border-purple-500/30',
    labelBg: 'bg-purple-50 text-purple-950',
    labelText: 'text-purple-950',
    accent: 'text-purple-400',
    glow: 'shadow-[0_0_25px_rgba(168,85,247,0.25)]',
    reelColor: 'border-purple-400/40'
  },
  mint: {
    shellBg: 'from-emerald-950/80 via-teal-900/60 to-stone-900/90',
    shellBorder: 'border-emerald-500/30',
    labelBg: 'bg-emerald-50 text-emerald-950',
    labelText: 'text-emerald-950',
    accent: 'text-emerald-400',
    glow: 'shadow-[0_0_25px_rgba(16,185,129,0.25)]',
    reelColor: 'border-emerald-400/40'
  },
  cherry: {
    shellBg: 'from-red-950/80 via-rose-950/60 to-stone-900/90',
    shellBorder: 'border-red-500/30',
    labelBg: 'bg-red-50 text-red-950',
    labelText: 'text-red-950',
    accent: 'text-red-400',
    glow: 'shadow-[0_0_25px_rgba(239,68,68,0.25)]',
    reelColor: 'border-red-400/40'
  },
  midnight: {
    shellBg: 'from-slate-950/90 via-blue-950/70 to-stone-950/95',
    shellBorder: 'border-blue-500/30',
    labelBg: 'bg-slate-100 text-slate-900',
    labelText: 'text-slate-900',
    accent: 'text-cyan-400',
    glow: 'shadow-[0_0_25px_rgba(59,130,246,0.25)]',
    reelColor: 'border-cyan-400/40'
  }
};

export const CassetteTape: React.FC<CassetteTapeProps> = ({
  cassette,
  isPlaying = false,
  isCompact = false,
  className = '',
  onClick
}) => {
  const theme = THEME_STYLES[cassette.themeColor] || THEME_STYLES.rose;

  if (isCompact) {
    return (
      <div
        onClick={onClick}
        className={`relative cursor-pointer group rounded-xl p-3 bg-gradient-to-br ${theme.shellBg} border ${theme.shellBorder} ${theme.glow} transition-all duration-300 hover:scale-[1.02] flex items-center gap-3 overflow-hidden ${className}`}
      >
        {/* Compact Cassette Visual */}
        <div className="w-14 h-10 rounded-md bg-stone-900/90 border border-white/10 relative flex items-center justify-center flex-shrink-0">
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full border-2 ${theme.reelColor} ${
                isPlaying ? 'animate-spin' : ''
              }`}
              style={{ animationDuration: '3s' }}
            />
            <div
              className={`w-3 h-3 rounded-full border-2 ${theme.reelColor} ${
                isPlaying ? 'animate-spin' : ''
              }`}
              style={{ animationDuration: '3s' }}
            />
          </div>
          <span className="absolute -top-1 right-1 text-[8px] font-mono text-white/50">SIDE A</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h4 className="font-display text-sm text-pale-cream truncate group-hover:text-primary-container transition-colors">
              {cassette.title}
            </h4>
            {cassette.sticker && (
              <span className="text-xs flex-shrink-0" title={cassette.sticker}>
                {cassette.sticker.split(' ')[0]}
              </span>
            )}
          </div>
          <p className="text-[11px] text-muted-grey truncate">
            For: <span className="text-pastel-lavender font-medium">{cassette.recipientName}</span> • {cassette.tracks.length} songs
          </p>
        </div>

        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary-container group-hover:text-on-primary-container transition-all">
          <span className="material-symbols-outlined text-base">
            {isPlaying ? 'graphic_eq' : 'play_arrow'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`relative select-none w-full max-w-[480px] aspect-[1.58/1] rounded-2xl p-4 md:p-5 bg-gradient-to-br ${theme.shellBg} border-2 ${theme.shellBorder} ${theme.glow} shadow-2xl transition-all duration-300 ${className}`}
    >
      {/* 4 Corner Screw Rivets */}
      <div className="absolute top-3 left-3 w-3 h-3 rounded-full bg-stone-700/80 border border-white/20 flex items-center justify-center">
        <div className="w-1.5 h-[1px] bg-stone-400 rotate-45" />
      </div>
      <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-stone-700/80 border border-white/20 flex items-center justify-center">
        <div className="w-1.5 h-[1px] bg-stone-400 -rotate-45" />
      </div>
      <div className="absolute bottom-3 left-3 w-3 h-3 rounded-full bg-stone-700/80 border border-white/20 flex items-center justify-center">
        <div className="w-1.5 h-[1px] bg-stone-400 -rotate-12" />
      </div>
      <div className="absolute bottom-3 right-3 w-3 h-3 rounded-full bg-stone-700/80 border border-white/20 flex items-center justify-center">
        <div className="w-1.5 h-[1px] bg-stone-400 rotate-30" />
      </div>

      {/* Top Tape Brand Mark */}
      <div className="flex items-center justify-between text-[10px] tracking-widest text-white/50 uppercase font-mono px-2 mb-2">
        <span className="flex items-center gap-1 font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400/80 animate-pulse" />
          HIGH BIAS 70µs EQ
        </span>
        <span className="font-bold text-white/70">BEATZ C-60</span>
        <span className="bg-white/10 px-1.5 py-0.5 rounded text-[9px] font-bold text-white/90">SIDE A</span>
      </div>

      {/* Retro Paper Label */}
      <div className={`relative rounded-xl p-3 md:p-4 ${theme.labelBg} shadow-inner border border-black/10 flex flex-col justify-between h-[66%]`}>
        {/* Lines for handwritten title */}
        <div className="relative border-b-2 border-dashed border-stone-400/50 pb-1.5">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="font-serif italic text-lg md:text-xl font-bold tracking-tight text-stone-900 truncate">
              {cassette.title}
            </h3>
            <span className="text-[10px] uppercase font-mono tracking-wider text-stone-600 flex-shrink-0">
              {cassette.tracks.length} TRACKS
            </span>
          </div>
          <div className="flex items-center justify-between text-xs font-serif text-stone-700 mt-0.5">
            <span>
              For: <strong className="font-semibold text-stone-900 underline decoration-rose-400/60">{cassette.recipientName}</strong>
            </span>
            <span>
              From: <span className="font-medium text-stone-800">{cassette.senderName}</span>
            </span>
          </div>
        </div>

        {/* Center Tape Window & Spinning Reels */}
        <div className="my-auto py-1">
          <div className="w-full h-14 md:h-16 rounded-lg bg-stone-950/90 border-2 border-stone-800/80 shadow-inner relative flex items-center justify-between px-6 md:px-10 overflow-hidden">
            {/* Dark Magnetic Tape Strip */}
            <div className="absolute inset-y-3 left-10 right-10 bg-gradient-to-r from-amber-950/60 via-stone-800 to-amber-950/60 rounded-sm border-t border-b border-white/5 flex items-center justify-center">
              {/* Tape Ruler Scale */}
              <div className="flex gap-1 items-center opacity-40">
                <span className="w-[1px] h-3 bg-white" />
                <span className="w-[1px] h-1.5 bg-white" />
                <span className="w-[1px] h-1.5 bg-white" />
                <span className="w-[1px] h-1.5 bg-white" />
                <span className="w-[1px] h-3 bg-white" />
                <span className="text-[7px] font-mono text-white/80 mx-1">50</span>
                <span className="w-[1px] h-3 bg-white" />
                <span className="w-[1px] h-1.5 bg-white" />
                <span className="w-[1px] h-1.5 bg-white" />
                <span className="w-[1px] h-1.5 bg-white" />
                <span className="w-[1px] h-3 bg-white" />
              </div>
            </div>

            {/* Left Reel */}
            <div className="relative z-10 w-9 h-9 md:w-11 md:h-11 rounded-full bg-stone-200 border-2 border-stone-400 shadow-md flex items-center justify-center">
              <div
                className={`w-6 h-6 md:w-7 md:h-7 rounded-full border-4 border-dashed border-stone-700 bg-stone-900 flex items-center justify-center ${
                  isPlaying ? 'animate-spin' : ''
                }`}
                style={{ animationDuration: '2.5s' }}
              >
                <div className="w-2 h-2 rounded-full bg-stone-400" />
              </div>
            </div>

            {/* Tape Head Center Marker */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-6 h-3 bg-stone-800 rounded-t border-t border-x border-stone-600 flex items-center justify-center">
                <span className="w-1.5 h-1 bg-amber-400/80 rounded-[1px]" />
              </div>
            </div>

            {/* Right Reel */}
            <div className="relative z-10 w-9 h-9 md:w-11 md:h-11 rounded-full bg-stone-200 border-2 border-stone-400 shadow-md flex items-center justify-center">
              <div
                className={`w-6 h-6 md:w-7 md:h-7 rounded-full border-4 border-dashed border-stone-700 bg-stone-900 flex items-center justify-center ${
                  isPlaying ? 'animate-spin' : ''
                }`}
                style={{ animationDuration: '2.5s' }}
              >
                <div className="w-2 h-2 rounded-full bg-stone-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Sticker / Stamp Badge */}
        <div className="flex items-center justify-between text-[11px] font-sans font-medium text-stone-700 pt-1">
          <div className="flex items-center gap-1.5">
            {cassette.sticker && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/80 border border-stone-300/80 shadow-xs text-stone-800 text-[10px] font-semibold">
                {cassette.sticker}
              </span>
            )}
          </div>
          <span className="font-mono text-[9px] text-stone-500 uppercase tracking-wider">
            DOLBY B-NR • CHROME
          </span>
        </div>
      </div>

      {/* Bottom Trapezoid Cutout for Playhead */}
      <div className="mt-2.5 mx-auto w-40 md:w-52 h-4 md:h-5 bg-stone-900/90 rounded-b-xl border-t border-stone-700/60 flex items-center justify-around px-4">
        <div className="w-2 h-2 rounded-full bg-stone-600/80" />
        <div className="w-8 h-2 bg-stone-700/60 rounded" />
        <div className="w-2 h-2 rounded-full bg-stone-600/80" />
      </div>
    </div>
  );
};
