import React, { useRef, useEffect, useCallback, useState } from 'react';
import YouTube, { YouTubeProps } from 'react-youtube';
import { usePlayer, Track } from '../context/PlayerContext';

export const GlobalPlayer: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    setPlayerState,
    playNext,
    updateTime,
    seekRequest,
    clearSeekRequest,
    volume,
    isMuted,
    repeatMode,
    isPlayerExpanded,
    activeViewMode
  } = usePlayer();

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ytPlayerRef = useRef<any>(null);
  const [ytReady, setYtReady] = useState(false);
  const [activeVideoId, setActiveVideoId] = useState<string>(currentTrack?.id || 'ic8j13piAhQ');
  const lastTrackIdRef = useRef<string | null>(null);

  // Determine if active track is an audioUrl track (e.g. custom AI-generated vocal track) or a YouTube track
  const isCustomAudioTrack = Boolean(
    currentTrack?.audioUrl &&
    (!currentTrack?.id || currentTrack.id.startsWith('lyria-') || currentTrack.id.startsWith('audio-'))
  );
  const isYouTubeTrack = !isCustomAudioTrack && Boolean(currentTrack?.id && !currentTrack.id.startsWith('lyria-') && !currentTrack.id.startsWith('audio-'));

  // Sync activeVideoId when currentTrack changes
  useEffect(() => {
    if (!currentTrack || isCustomAudioTrack) return;

    const newVideoId = currentTrack.id;
    if (newVideoId && newVideoId !== lastTrackIdRef.current) {
      lastTrackIdRef.current = newVideoId;
      setActiveVideoId(newVideoId);

      if (ytPlayerRef.current && typeof ytPlayerRef.current.loadVideoById === 'function') {
        try {
          if (isPlaying) {
            ytPlayerRef.current.loadVideoById(newVideoId);
          } else {
            ytPlayerRef.current.cueVideoById(newVideoId);
          }
        } catch (err) {
          console.warn("YouTube loadVideo error:", err);
        }
      }
    }
  }, [currentTrack, isCustomAudioTrack, isPlaying]);

  // Sync isPlaying state with YouTube Player
  useEffect(() => {
    if (!isYouTubeTrack || !ytPlayerRef.current) return;
    try {
      if (isPlaying) {
        ytPlayerRef.current.playVideo();
      } else {
        ytPlayerRef.current.pauseVideo();
      }
    } catch (e) {
      console.warn("YouTube play/pause sync error:", e);
    }
  }, [isPlaying, isYouTubeTrack]);

  // Sync Volume & Mute with YouTube Player and Audio
  useEffect(() => {
    if (isYouTubeTrack && ytPlayerRef.current) {
      try {
        if (isMuted) {
          ytPlayerRef.current.mute();
        } else {
          ytPlayerRef.current.unMute();
          ytPlayerRef.current.setVolume(Math.round(volume * 100));
        }
      } catch (e) {
        console.warn("YouTube volume sync error:", e);
      }
    }
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted, isYouTubeTrack]);

  // Handle Seek Requests
  useEffect(() => {
    if (seekRequest !== null) {
      if (isYouTubeTrack && ytPlayerRef.current && typeof ytPlayerRef.current.seekTo === 'function') {
        try {
          ytPlayerRef.current.seekTo(seekRequest, true);
        } catch {}
      } else if (audioRef.current) {
        audioRef.current.currentTime = seekRequest;
      }
      clearSeekRequest();
    }
  }, [seekRequest, isYouTubeTrack, clearSeekRequest]);

  // High-frequency polling (100ms) for exact lyrics synchronization with YouTube playback
  useEffect(() => {
    if (!isYouTubeTrack || !isPlaying) return;

    const timer = setInterval(() => {
      if (ytPlayerRef.current && typeof ytPlayerRef.current.getCurrentTime === 'function') {
        try {
          const cur = ytPlayerRef.current.getCurrentTime();
          const dur = ytPlayerRef.current.getDuration();
          if (typeof cur === 'number' && !isNaN(cur) && cur >= 0) {
            updateTime(cur, typeof dur === 'number' && dur > 0 ? dur : 180);
          }
        } catch {}
      }
    }, 100);

    return () => clearInterval(timer);
  }, [isYouTubeTrack, isPlaying, updateTime]);

  // High-frequency polling (100ms) for exact lyrics synchronization with HTML5 audio playback
  useEffect(() => {
    if (!isCustomAudioTrack || !isPlaying) return;

    const timer = setInterval(() => {
      if (audioRef.current && !audioRef.current.paused) {
        const cur = audioRef.current.currentTime;
        const dur = audioRef.current.duration;
        if (typeof cur === 'number' && !isNaN(cur) && cur >= 0) {
          updateTime(cur, typeof dur === 'number' && dur > 0 ? dur : 180);
        }
      }
    }, 100);

    return () => clearInterval(timer);
  }, [isCustomAudioTrack, isPlaying, updateTime]);

  // HTML5 Audio playback for custom AI tracks (e.g. Lyria tracks with direct audioUrl)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!isCustomAudioTrack || !currentTrack?.audioUrl) {
      audio.pause();
      return;
    }

    if (audio.src !== currentTrack.audioUrl) {
      audio.src = currentTrack.audioUrl;
      audio.load();
    }

    if (isPlaying) {
      audio.play().catch((err) => {
        console.info("Custom audio play error:", err?.message || err);
      });
    } else {
      audio.pause();
    }
  }, [currentTrack, isPlaying, isCustomAudioTrack]);

  // YouTube Event Handlers
  const handleYTReady: YouTubeProps['onReady'] = (event) => {
    ytPlayerRef.current = event.target;
    setYtReady(true);
    try {
      event.target.setVolume(isMuted ? 0 : Math.round(volume * 100));
      if (isMuted) event.target.mute();
      if (isPlaying) {
        event.target.playVideo();
      }
    } catch {}
  };

  const handleYTStateChange: YouTubeProps['onStateChange'] = (event) => {
    // 1: PLAYING, 2: PAUSED, 0: ENDED, 3: BUFFERING
    if (event.data === 1) {
      setPlayerState(true);
    } else if (event.data === 2) {
      setPlayerState(false);
    } else if (event.data === 0) {
      if (repeatMode === 'one' && ytPlayerRef.current) {
        ytPlayerRef.current.seekTo(0, true);
        ytPlayerRef.current.playVideo();
      } else {
        playNext();
      }
    }
  };

  // Robust error recovery: if a video ID is embed-restricted, fetch alternative playable version of the SAME song
  const handleYTError: YouTubeProps['onError'] = async (err) => {
    console.warn("YouTube player encountered error:", err);
    if (currentTrack) {
      try {
        const res = await fetch(
          `/api/track/fallback-video?title=${encodeURIComponent(currentTrack.title)}&artist=${encodeURIComponent(
            currentTrack.channel
          )}`
        );
        if (res.ok) {
          const data = await res.json();
          if (data?.videoId && data.videoId !== activeVideoId && ytPlayerRef.current) {
            console.log("Switching to alternative playable version of song:", data.videoId);
            setActiveVideoId(data.videoId);
            ytPlayerRef.current.loadVideoById(data.videoId);
          }
        }
      } catch (fallbackErr) {
        console.warn("Fallback track search failed:", fallbackErr);
      }
    }
  };

  const showVideoInFullscreen = isPlayerExpanded && activeViewMode === 'video' && isYouTubeTrack;

  return (
    <>
      {/* HTML5 Audio element for custom generated tracks */}
      {isCustomAudioTrack && (
        <audio
          ref={audioRef}
          loop={repeatMode === 'one'}
          preload="auto"
          onCanPlay={() => {
            if (isPlaying && audioRef.current && audioRef.current.paused) {
              audioRef.current.play().catch(() => {});
            }
          }}
          onPlaying={() => setPlayerState(true)}
          onTimeUpdate={(e) => {
            const target = e.currentTarget;
            if (target.duration > 0) {
              updateTime(target.currentTime, target.duration);
            }
          }}
          onEnded={() => {
            if (repeatMode === 'one') {
              if (audioRef.current) {
                audioRef.current.currentTime = 0;
                audioRef.current.play().catch(() => {});
              }
            } else {
              playNext();
            }
          }}
          onPause={() => setPlayerState(false)}
        />
      )}

      {/* Real YouTube Player: Stably mounted with valid dimensions (never 1x1 or opacity 0) */}
      <div
        id="vibra-youtube-dock"
        className={`transition-all duration-300 ${
          showVideoInFullscreen
            ? 'fixed inset-x-4 top-28 bottom-36 md:inset-x-24 md:top-32 md:bottom-40 z-[90] rounded-3xl overflow-hidden shadow-2xl bg-black border border-white/20'
            : 'fixed -bottom-[999px] -right-[999px] w-[320px] h-[240px] pointer-events-none'
        }`}
      >
        <YouTube
          videoId={activeVideoId}
          opts={{
            height: '100%',
            width: '100%',
            playerVars: {
              autoplay: 1,
              controls: showVideoInFullscreen ? 1 : 0,
              disablekb: showVideoInFullscreen ? 0 : 1,
              fs: showVideoInFullscreen ? 1 : 0,
              modestbranding: 1,
              rel: 0,
              playsinline: 1,
              enablejsapi: 1
            }
          }}
          className="w-full h-full"
          iframeClassName="w-full h-full object-cover rounded-2xl"
          onReady={handleYTReady}
          onStateChange={handleYTStateChange}
          onError={handleYTError}
        />
      </div>
    </>
  );
};
