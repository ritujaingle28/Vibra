import React from 'react';
import { usePlayer, Track } from '../context/PlayerContext';
import { getActualSongImage, handleSongImageError } from '../lib/songImage';

export const BottomPlayerBar: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    togglePlayPause,
    playNext,
    currentTime,
    duration,
    openFullScreenPlayer,
    isPlayerExpanded,
    isLiked,
    toggleLike
  } = usePlayer();

  if (!currentTrack || isPlayerExpanded) return null;

  const displayTrack: Track = currentTrack;
  const isCurrentLiked = isLiked(displayTrack.id);
  const effectiveDuration = duration > 0 ? duration : 210;
  const progress = Math.min(100, Math.max(0, (currentTime / effectiveDuration) * 100));

  return (
    <div
      onClick={openFullScreenPlayer}
      className="fixed bottom-[72px] md:bottom-4 left-3 right-3 md:left-64 md:right-8 z-40 bg-surface-container-highest/95 backdrop-blur-xl border border-white/10 rounded-2xl p-2.5 shadow-2xl flex items-center justify-between cursor-pointer hover:bg-surface-container-highest transition-all group overflow-hidden"
    >
      {/* Top Thin Progress Line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/10">
        <div
          className="h-full bg-primary-container transition-all duration-300"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Track Details & Artwork */}
      <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
        <div className="relative w-11 h-11 rounded-xl overflow-hidden shadow-md flex-shrink-0 bg-black">
          <img
            src={getActualSongImage(displayTrack)}
            alt={displayTrack.title}
            onError={(e) => handleSongImageError(e, displayTrack.id)}
            className={`w-full h-full object-cover ${isPlaying ? 'animate-[spin_12s_linear_infinite]' : ''}`}
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4
              className="font-display text-sm text-pale-cream truncate group-hover:text-primary-container transition-colors leading-tight"
              dangerouslySetInnerHTML={{ __html: displayTrack.title }}
            ></h4>
            {/* Equalizer Wave Indicator */}
            <div className="flex items-end gap-[2px] h-3 flex-shrink-0">
              <div
                className="w-[2px] bg-primary-container h-full animate-[bounce_1s_infinite]"
                style={{ animationPlayState: isPlaying ? 'running' : 'paused' }}
              ></div>
              <div
                className="w-[2px] bg-primary-container h-2/3 animate-[bounce_0.7s_infinite]"
                style={{ animationPlayState: isPlaying ? 'running' : 'paused' }}
              ></div>
              <div
                className="w-[2px] bg-primary-container h-1/2 animate-[bounce_1.3s_infinite]"
                style={{ animationPlayState: isPlaying ? 'running' : 'paused' }}
              ></div>
            </div>
          </div>
          <p className="font-body text-xs text-muted-grey truncate uppercase tracking-wider">
            {displayTrack.channel}
          </p>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-1.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={() => toggleLike(displayTrack)}
          className="w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
          title={isCurrentLiked ? 'Unlike song' : 'Like song'}
        >
          <span
            className={`material-symbols-outlined text-xl transition-all ${
              isCurrentLiked ? 'text-primary-container scale-110' : 'text-pale-cream'
            }`}
            style={{ fontVariationSettings: isCurrentLiked ? "'FILL' 1" : "'FILL' 0" }}
          >
            favorite
          </span>
        </button>

        <button
          type="button"
          onClick={togglePlayPause}
          className="w-10 h-10 rounded-full bg-primary-container text-[#2c2b1e] flex items-center justify-center hover:scale-105 transition-transform shadow-md cursor-pointer"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            {isPlaying ? 'pause' : 'play_arrow'}
          </span>
        </button>

        <button
          type="button"
          onClick={playNext}
          className="w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center text-pale-cream transition-colors cursor-pointer hidden sm:flex"
          title="Next track"
        >
          <span className="material-symbols-outlined text-2xl">skip_next</span>
        </button>

        <button
          type="button"
          onClick={openFullScreenPlayer}
          className="w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center text-pale-cream transition-colors cursor-pointer"
          title="Open Full Screen Player"
        >
          <span className="material-symbols-outlined text-xl">open_in_full</span>
        </button>
      </div>
    </div>
  );
};
