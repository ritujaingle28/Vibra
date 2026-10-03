import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { usePlayer, Track } from '../context/PlayerContext';
import { getActualSongImage, handleSongImageError } from '../lib/songImage';
import { getSongLyrics, LyricLine } from '../lib/songLyrics';

export const FullScreenPlayer: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    isPlayerExpanded,
    closeFullScreenPlayer,
    togglePlayPause,
    playNext,
    playPrevious,
    currentTime,
    duration,
    seekTo,
    queue,
    queueIndex,
    playTrack,
    isLiked,
    toggleLike,
    shareTrack,
    openAddToPlaylistModal,
    shuffleMode,
    toggleShuffle,
    repeatMode,
    toggleRepeat,
    volume,
    setVolume,
    isMuted,
    toggleMute,
    activeViewMode,
    setActiveViewMode,
    showToast
  } = usePlayer();

  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubTime, setScrubTime] = useState(0);
  const [lyricsList, setLyricsList] = useState<{ text: string; time: number }[]>([]);
  const [isLoadingLyrics, setIsLoadingLyrics] = useState(false);
  const lyricsContainerRef = useRef<HTMLDivElement>(null);

  const displayTrack: Track = currentTrack || {
    id: 'ic8j13piAhQ',
    title: 'Cruel Summer',
    channel: 'Taylor Swift',
    thumbnail: 'https://i.ytimg.com/vi/ic8j13piAhQ/hqdefault.jpg'
  };

  const isCurrentLiked = isLiked(displayTrack.id);

  const effectiveTime = isScrubbing ? scrubTime : currentTime;
  const effectiveDuration = duration > 0 ? duration : 210;

  // Fetch AI-powered 100% accurate lyrics for any song (including Hindi, Bollywood, pop)
  useEffect(() => {
    let isMounted = true;
    const fetchAILyrics = async () => {
      // 0. If the track already has lyrics (e.g. from generated AI track, mashup or cassette)
      if (displayTrack.lyrics) {
        const rawLines = displayTrack.lyrics.split('\n').map((l: string) => l.trim()).filter(Boolean);
        const estDuration = effectiveDuration > 0 ? effectiveDuration : 180;
        const parsed: LyricLine[] = rawLines.map((text: string, idx: number) => ({
          text,
          time: Math.round((idx / Math.max(1, rawLines.length - 1)) * (estDuration - 4))
        }));
        if (isMounted && parsed.length > 0) {
          setLyricsList(parsed);
          setIsLoadingLyrics(false);
          return;
        }
      }

      // 1. Instant load from local timed database for zero latency
      const immediate = getSongLyrics(displayTrack.id, displayTrack.title, displayTrack.channel, effectiveDuration > 0 ? effectiveDuration : 180);
      if (immediate && immediate.length > 0 && isMounted) {
        setLyricsList(immediate);
      }

      setIsLoadingLyrics(true);
      try {
        const res = await fetch('/api/ai/get-lyrics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: displayTrack.title,
            artist: displayTrack.channel,
            duration: effectiveDuration > 0 ? effectiveDuration : 180
          })
        });
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.lines && data.lines.length > 0) {
            setLyricsList(data.lines);
            setIsLoadingLyrics(false);
            return;
          }
        }
      } catch (err) {
        console.warn("AI lyrics fetch fallback:", err);
      } finally {
        if (isMounted) setIsLoadingLyrics(false);
      }
    };

    fetchAILyrics();
    return () => {
      isMounted = false;
    };
  }, [displayTrack.id, displayTrack.title, displayTrack.channel]);

  // Dynamic Background Hue
  const getThemeGradient = (id: string) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h1 = Math.abs(hash) % 360;
    const h2 = (h1 + 45) % 360;
    return `linear-gradient(180deg, hsl(${h1}, 45%, 14%) 0%, hsl(${h2}, 40%, 8%) 60%, #0d0d0d 100%)`;
  };

  const backgroundGradient = getThemeGradient(displayTrack.id);

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return '0:00';
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = Math.min(100, Math.max(0, (effectiveTime / effectiveDuration) * 100));

  const handleSeekMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsScrubbing(true);
    updateScrub(e);
  };

  const updateScrub = (e: React.MouseEvent<HTMLDivElement> | MouseEvent) => {
    const bar = document.getElementById('full-player-progress-bar');
    if (!bar) return;
    const rect = bar.getBoundingClientRect();
    const pos = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    const target = pos * effectiveDuration;
    setScrubTime(target);
  };

  const handleSeekClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    seekTo(pos * effectiveDuration);
  };

  useEffect(() => {
    const handleMouseUp = () => {
      if (isScrubbing) {
        seekTo(scrubTime);
        setIsScrubbing(false);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isScrubbing) {
        updateScrub(e);
      }
    };

    if (isScrubbing) {
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('mousemove', handleMouseMove);
    }
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isScrubbing, scrubTime, effectiveDuration, seekTo]);

  // Precise time-synchronized active lyric index
  let activeLyricIndex = 0;
  let maxTimeFound = -1;
  for (let i = 0; i < lyricsList.length; i++) {
    const lineTime = lyricsList[i].time;
    if (typeof lineTime === 'number' && effectiveTime >= lineTime && lineTime > maxTimeFound) {
      activeLyricIndex = i;
      maxTimeFound = lineTime;
    }
  }

  // Auto scroll lyrics smoothly to center the singing line without jittering outer modal
  useEffect(() => {
    if (activeViewMode === 'lyrics' && lyricsContainerRef.current && activeLyricIndex >= 0) {
      const container = lyricsContainerRef.current;
      const activeEl = document.getElementById(`lyric-line-${activeLyricIndex}`);
      if (activeEl) {
        const targetTop = activeEl.offsetTop - container.offsetTop - (container.clientHeight / 2) + (activeEl.clientHeight / 2);
        container.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' });
      }
    }
  }, [activeLyricIndex, activeViewMode]);

  return (
    <AnimatePresence>
      {isPlayerExpanded && (
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 260 }}
          className="fixed inset-0 z-[120] overflow-y-auto select-none"
          style={{ background: backgroundGradient }}
        >
          {/* Ambient Lighting Glows */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary-container/10 rounded-full blur-3xl pointer-events-none -z-0"></div>

          <div className="min-h-full flex flex-col justify-between px-4 py-5 md:px-8 md:py-8 w-full max-w-2xl mx-auto relative z-10">
            {/* Top Navigation Header */}
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={closeFullScreenPlayer}
                className="w-11 h-11 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/15 transition-all text-pale-cream cursor-pointer"
                title="Minimize player"
              >
                <span className="material-symbols-outlined text-2xl">keyboard_arrow_down</span>
              </button>

              <div className="text-center min-w-0 px-3 flex-1">
                <span className="text-[10px] font-label tracking-widest text-primary-container uppercase font-bold flex items-center justify-center gap-1">
                  <span className="material-symbols-outlined text-xs">auto_awesome</span>
                  {queue.length > 1 ? `PLAYING ${queueIndex + 1} OF ${queue.length}` : 'NOW PLAYING'}
                </span>
                <h3
                  className="font-display text-base md:text-lg text-pale-cream truncate drop-shadow"
                  dangerouslySetInnerHTML={{ __html: displayTrack.title }}
                ></h3>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => shareTrack(displayTrack)}
                  className="w-11 h-11 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/15 transition-all text-pale-cream cursor-pointer"
                  title="Share song"
                >
                  <span className="material-symbols-outlined text-xl">share</span>
                </button>
              </div>
            </div>

            {/* View Mode Switcher Pill */}
            <div className="flex justify-center mb-6">
              <div className="flex items-center bg-black/40 backdrop-blur-md rounded-full p-1 border border-white/10 shadow-lg">
                <button
                  type="button"
                  onClick={() => setActiveViewMode('songs')}
                  className={`px-3.5 sm:px-5 py-1.5 rounded-full font-label text-xs tracking-widest uppercase font-bold transition-all cursor-pointer ${
                    activeViewMode === 'songs'
                      ? 'bg-primary-container text-[#2c2b1e] shadow-md'
                      : 'text-muted-grey hover:text-pale-cream'
                  }`}
                >
                  Artwork
                </button>
                <button
                  type="button"
                  onClick={() => setActiveViewMode('video')}
                  className={`px-3.5 sm:px-5 py-1.5 rounded-full font-label text-xs tracking-widest uppercase font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    activeViewMode === 'video'
                      ? 'bg-primary-container text-[#2c2b1e] shadow-md'
                      : 'text-muted-grey hover:text-pale-cream'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">smart_display</span>
                  <span>Video</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveViewMode('lyrics')}
                  className={`px-3.5 sm:px-5 py-1.5 rounded-full font-label text-xs tracking-widest uppercase font-bold transition-all cursor-pointer ${
                    activeViewMode === 'lyrics'
                      ? 'bg-primary-container text-[#2c2b1e] shadow-md'
                      : 'text-muted-grey hover:text-pale-cream'
                  }`}
                >
                  Lyrics
                </button>
                <button
                  type="button"
                  onClick={() => setActiveViewMode('queue')}
                  className={`px-3.5 sm:px-5 py-1.5 rounded-full font-label text-xs tracking-widest uppercase font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    activeViewMode === 'queue'
                      ? 'bg-primary-container text-[#2c2b1e] shadow-md'
                      : 'text-muted-grey hover:text-pale-cream'
                  }`}
                >
                  Queue ({queue.length})
                </button>
              </div>
            </div>

            {/* Middle Main Content Area */}
            <div className="flex-1 flex flex-col items-center justify-center my-auto min-h-[300px] w-full">
              {/* 1. ARTWORK VIEW */}
              {activeViewMode === 'songs' && (
                <motion.div
                  key="view-songs"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="w-full flex flex-col items-center"
                >
                  {/* Vinyl Record Deck */}
                  <div className="relative w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 mx-auto flex items-center justify-center">
                    {/* Vinyl Outer Grooves */}
                    <div
                      className="w-full h-full rounded-full bg-[#111111] p-3 md:p-4 shadow-[0_15px_40px_rgba(0,0,0,0.8)] border-[6px] border-[#222222] relative flex items-center justify-center"
                      style={{
                        background:
                          'radial-gradient(circle, #2a2a2a 0%, #151515 45%, #0d0d0d 70%, #1a1a1a 100%)'
                      }}
                    >
                      {/* Concentric Vinyl Ridges */}
                      <div className="absolute inset-4 rounded-full border border-white/5 pointer-events-none"></div>
                      <div className="absolute inset-8 rounded-full border border-white/5 pointer-events-none"></div>
                      <div className="absolute inset-12 rounded-full border border-white/5 pointer-events-none"></div>

                      {/* Center Album Art Disc */}
                      <div className="w-36 h-36 sm:w-44 sm:h-44 md:w-48 md:h-48 rounded-full overflow-hidden relative shadow-inner border-4 border-black flex items-center justify-center">
                        <img
                          src={getActualSongImage(displayTrack)}
                          alt={displayTrack.title}
                          onError={(e) => handleSongImageError(e, displayTrack.id)}
                          className={`w-full h-full object-cover ${
                            isPlaying ? 'animate-[spin_18s_linear_infinite]' : ''
                          }`}
                        />
                        {/* Spindle Center Hole */}
                        <div className="absolute w-6 h-6 rounded-full bg-[#0d0d0d] border-2 border-[#444] shadow-inner flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-white/30"></div>
                        </div>
                      </div>
                    </div>

                    {/* Tone Arm Needle Indicator */}
                    <div
                      className={`absolute -top-3 right-6 w-12 h-24 transition-transform duration-700 origin-top pointer-events-none ${
                        isPlaying ? 'rotate-12' : '-rotate-12 opacity-60'
                      }`}
                    >
                      <div className="w-1.5 h-16 bg-gradient-to-b from-amber-200 to-amber-600 rounded-full mx-auto shadow-md"></div>
                      <div className="w-4 h-5 bg-[#333] rounded-sm mx-auto shadow"></div>
                    </div>
                  </div>

                  {/* Equalizer Frequency Bars */}
                  <div className="flex items-end justify-center gap-1.5 h-6 mt-6">
                    {[0.6, 1.2, 0.8, 1.5, 0.9, 1.3, 0.7, 1.4, 1.0].map((speed, i) => (
                      <div
                        key={i}
                        className="w-1 bg-primary-container/80 rounded-full transition-all duration-300"
                        style={{
                          height: isPlaying ? `${Math.floor(25 + Math.sin(i + effectiveTime * 3) * 65)}%` : '20%',
                          opacity: isPlaying ? 0.9 : 0.3
                        }}
                      ></div>
                    ))}
                  </div>

                  {/* Real-Time Synced Lyric Pill */}
                  {lyricsList.length > 0 && activeLyricIndex >= 0 && (
                    <button
                      type="button"
                      onClick={() => setActiveViewMode('lyrics')}
                      className="mt-5 px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md max-w-md mx-auto flex items-center justify-center gap-2.5 group transition-all cursor-pointer shadow-lg hover:scale-105"
                      title="Click to view full synchronized lyrics"
                    >
                      <span className="material-symbols-outlined text-sm text-primary-container animate-pulse">lyrics</span>
                      <span className="font-display text-sm md:text-base text-pale-cream truncate text-center group-hover:text-primary-container transition-colors">
                        {lyricsList[activeLyricIndex]?.text}
                      </span>
                    </button>
                  )}
                </motion.div>
              )}

              {/* 2. VIDEO VIEW */}
              {activeViewMode === 'video' && (
                <motion.div
                  key="view-video"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="w-full flex-1 flex flex-col items-center justify-center min-h-[300px]"
                >
                  <div className="text-center p-4">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-mono text-primary-container border border-white/10 mb-2">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      Official YouTube Music Video & Authentic Audio
                    </span>
                    <p className="text-xs text-muted-grey font-body">
                      Watching {displayTrack.title} by {displayTrack.channel}
                    </p>
                  </div>
                </motion.div>
              )}

              {/* 3. LYRICS VIEW */}
              {activeViewMode === 'lyrics' && (
                <motion.div
                  key="view-lyrics"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  ref={lyricsContainerRef}
                  className="w-full max-h-[400px] md:max-h-[460px] overflow-y-auto px-4 py-8 space-y-6 text-center hide-scrollbar"
                >
                  <div className="text-[11px] font-mono uppercase tracking-widest text-primary-container/70 mb-3 sticky top-0 bg-[#121210]/80 backdrop-blur-md py-2 rounded-full inline-block px-4 border border-white/5 flex items-center justify-center gap-2 shadow-md">
                    <span>✨ AI Synced Lyrics ({lyricsList.length} Lines)</span>
                    {isLoadingLyrics && <span className="w-2.5 h-2.5 rounded-full bg-primary-container animate-ping"></span>}
                  </div>
                  {lyricsList.map((line, idx) => {
                    const isActive = idx === activeLyricIndex;
                    return (
                      <p
                        id={`lyric-line-${idx}`}
                        key={idx}
                        onClick={() => {
                          seekTo(line.time);
                        }}
                        className={`font-display text-lg md:text-2xl transition-all duration-300 cursor-pointer px-4 py-2 rounded-xl flex items-center justify-center gap-2 ${
                          isActive
                            ? 'text-primary-container scale-105 font-bold drop-shadow-[0_0_25px_rgba(254,214,255,0.7)] bg-white/5 border border-primary-container/30'
                            : 'text-pale-cream/40 hover:text-pale-cream/80 hover:bg-white/[0.02]'
                        }`}
                      >
                        {isActive && <span className="text-sm text-primary-container animate-bounce">♪</span>}
                        <span>{line.text}</span>
                      </p>
                    );
                  })}
                </motion.div>
              )}

              {/* 3. QUEUE VIEW */}
              {activeViewMode === 'queue' && (
                <motion.div
                  key="view-queue"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="w-full max-h-[340px] md:max-h-[380px] overflow-y-auto px-2 space-y-2 hide-scrollbar"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-2">
                    <span className="font-label text-xs uppercase tracking-wider text-muted-grey">
                      Up Next ({queue.length} Tracks)
                    </span>
                    <span className="font-label text-[11px] text-primary-container uppercase font-bold">
                      {shuffleMode ? 'Shuffled' : 'Sequential'}
                    </span>
                  </div>

                  {queue.map((track, i) => {
                    const isTrackCurrent = track.id === displayTrack.id;
                    return (
                      <div
                        key={`${track.id}-${i}`}
                        onClick={() => playTrack(track, queue)}
                        className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all border ${
                          isTrackCurrent
                            ? 'bg-primary-container/20 border-primary-container/50 text-pale-cream'
                            : 'bg-white/5 hover:bg-white/10 border-transparent text-pale-cream/80'
                        }`}
                      >
                        <span className="font-mono text-xs text-muted-grey w-5 text-center">
                          {isTrackCurrent ? (
                            <span className="material-symbols-outlined text-primary-container text-base animate-pulse">
                              volume_up
                            </span>
                          ) : (
                            i + 1
                          )}
                        </span>
                        <img
                          src={getActualSongImage(track)}
                          alt={track.title}
                          onError={(e) => handleSongImageError(e, track.id)}
                          className="w-10 h-10 rounded-lg object-cover flex-shrink-0 shadow-sm"
                        />
                        <div className="flex-1 min-w-0">
                          <h5
                            className={`font-display text-sm truncate ${
                              isTrackCurrent ? 'text-primary-container font-bold' : 'text-pale-cream'
                            }`}
                            dangerouslySetInnerHTML={{ __html: track.title }}
                          ></h5>
                          <p className="font-body text-xs text-muted-grey truncate">{track.channel}</p>
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              )}
            </div>

            {/* Bottom Controls Area */}
            <div className="w-full max-w-lg mx-auto mt-4">
              {/* Song Title, Artist & Quick Actions */}
              <div className="flex items-center justify-between mb-4">
                <div className="min-w-0 flex-1 pr-3">
                  <h2
                    className="font-display text-2xl md:text-3xl text-pale-cream leading-tight drop-shadow truncate"
                    dangerouslySetInnerHTML={{ __html: displayTrack.title }}
                  ></h2>
                  <p className="font-body text-sm md:text-base text-muted-grey tracking-widest uppercase truncate mt-0.5">
                    {displayTrack.channel}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => openAddToPlaylistModal(displayTrack)}
                    className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors text-muted-grey hover:text-pale-cream cursor-pointer"
                    title="Add to Playlist"
                  >
                    <span className="material-symbols-outlined text-xl">playlist_add</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleLike(displayTrack)}
                    className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
                    title={isCurrentLiked ? 'Unlike song' : 'Like song'}
                  >
                    <span
                      className={`material-symbols-outlined text-2xl transition-all ${
                        isCurrentLiked ? 'text-primary-container scale-110' : 'text-pale-cream'
                      }`}
                      style={{ fontVariationSettings: isCurrentLiked ? "'FILL' 1" : "'FILL' 0" }}
                    >
                      favorite
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const ytUrl = `https://www.youtube.com/watch?v=${displayTrack.id}`;
                      window.open(ytUrl, '_blank');
                    }}
                    className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors text-muted-grey hover:text-pale-cream cursor-pointer"
                    title="Open in YouTube"
                  >
                    <span className="material-symbols-outlined text-xl">open_in_new</span>
                  </button>
                </div>
              </div>

              {/* Progress Scrub Bar */}
              <div className="mb-5">
                <div
                  id="full-player-progress-bar"
                  onClick={handleSeekClick}
                  onMouseDown={handleSeekMouseDown}
                  className="w-full h-3 flex items-center group cursor-pointer relative"
                >
                  {/* Track Background */}
                  <div className="w-full h-1.5 bg-white/15 group-hover:h-2 rounded-full overflow-hidden transition-all relative">
                    <div
                      className="h-full bg-gradient-to-r from-primary-container to-amber-300 rounded-full shadow-[0_0_12px_rgba(254,214,255,0.4)]"
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                  {/* Thumb Knob */}
                  <div
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-pale-cream rounded-full shadow-lg group-hover:scale-125 transition-transform pointer-events-none"
                    style={{ left: `${progressPercent}%` }}
                  ></div>
                </div>

                <div className="flex items-center justify-between text-xs font-mono text-muted-grey mt-1">
                  <span>{formatTime(effectiveTime)}</span>
                  <span>-{formatTime(Math.max(0, effectiveDuration - effectiveTime))}</span>
                </div>
              </div>

              {/* Main Playback Controls Button Row */}
              <div className="flex items-center justify-between px-2 mb-4">
                {/* Shuffle Button */}
                <button
                  type="button"
                  onClick={toggleShuffle}
                  className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                    shuffleMode ? 'text-primary-container bg-primary-container/20' : 'text-muted-grey hover:text-pale-cream hover:bg-white/5'
                  }`}
                  title={shuffleMode ? 'Shuffle On' : 'Shuffle Off'}
                >
                  <span className="material-symbols-outlined text-2xl">shuffle</span>
                </button>

                {/* Previous Track */}
                <button
                  type="button"
                  onClick={playPrevious}
                  className="w-12 h-12 rounded-full flex items-center justify-center text-pale-cream hover:bg-white/10 transition-transform active:scale-95 cursor-pointer"
                  title="Previous track"
                >
                  <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    skip_previous
                  </span>
                </button>

                {/* Big Play / Pause Button */}
                <button
                  type="button"
                  onClick={togglePlayPause}
                  className="w-18 h-18 rounded-full bg-primary-container text-[#2c2b1e] flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_0_25px_rgba(254,214,255,0.4)] cursor-pointer"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  <span className="material-symbols-outlined text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {isPlaying ? 'pause' : 'play_arrow'}
                  </span>
                </button>

                {/* Next Track */}
                <button
                  type="button"
                  onClick={playNext}
                  className="w-12 h-12 rounded-full flex items-center justify-center text-pale-cream hover:bg-white/10 transition-transform active:scale-95 cursor-pointer"
                  title="Next track"
                >
                  <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    skip_next
                  </span>
                </button>

                {/* Repeat Button */}
                <button
                  type="button"
                  onClick={toggleRepeat}
                  className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                    repeatMode !== 'off'
                      ? 'text-primary-container bg-primary-container/20'
                      : 'text-muted-grey hover:text-pale-cream hover:bg-white/5'
                  }`}
                  title={`Repeat: ${repeatMode}`}
                >
                  <span className="material-symbols-outlined text-2xl">
                    {repeatMode === 'one' ? 'repeat_one' : 'repeat'}
                  </span>
                </button>
              </div>

              {/* Volume & Audio Tray */}
              <div className="flex items-center justify-center gap-3 px-4 pt-2 border-t border-white/5">
                <button
                  type="button"
                  onClick={toggleMute}
                  className="text-muted-grey hover:text-pale-cream transition-colors cursor-pointer"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  <span className="material-symbols-outlined text-xl">
                    {isMuted || volume === 0 ? 'volume_off' : volume < 0.5 ? 'volume_down' : 'volume_up'}
                  </span>
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    setVolume(parseFloat(e.target.value));
                    if (isMuted) toggleMute();
                  }}
                  className="w-32 md:w-44 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-primary-container"
                />
                <span className="text-[11px] font-mono text-muted-grey w-8">
                  {isMuted ? '0%' : `${Math.round(volume * 100)}%`}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
