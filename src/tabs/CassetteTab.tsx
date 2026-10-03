import React, { useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { Cassette } from '../types';
import { CassetteTape } from '../components/CassetteTape';
import { CassetteLoveLetter } from '../components/CassetteLoveLetter';
import { CreateCassetteModal } from '../components/CreateCassetteModal';
import { SendCassetteModal } from '../components/SendCassetteModal';

export const CassetteTab: React.FC = () => {
  const {
    cassettes,
    playCassette,
    currentTrack,
    isPlaying,
    togglePlayPause,
    playNext,
    playPrevious,
    deleteCassette,
    playTrack,
    showToast
  } = usePlayer();

  const [activeCassette, setActiveCassette] = useState<Cassette | null>(() => {
    return cassettes.length > 0 ? cassettes[0] : null;
  });

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCassette, setEditingCassette] = useState<Cassette | null>(null);
  const [sendingCassette, setSendingCassette] = useState<Cassette | null>(null);
  const [activeSide, setActiveSide] = useState<'A' | 'B'>('A');

  // Check if the current playing track belongs to the active cassette
  const isCassettePlaying =
    isPlaying &&
    activeCassette !== null &&
    activeCassette.tracks.some((t) => t.id === currentTrack?.id);

  const handleSelectCassette = (cassette: Cassette) => {
    setActiveCassette(cassette);
  };

  const handlePlayActive = () => {
    if (!activeCassette) return;
    if (isCassettePlaying) {
      togglePlayPause();
    } else {
      playCassette(activeCassette, 0);
    }
  };

  const handleEdit = (cassette: Cassette) => {
    setEditingCassette(cassette);
    setIsCreateModalOpen(true);
  };

  const handleDelete = async (cassette: Cassette, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${cassette.title}"?`)) {
      await deleteCassette(cassette.id);
      if (activeCassette?.id === cassette.id) {
        const remaining = cassettes.filter((c) => c.id !== cassette.id);
        setActiveCassette(remaining[0] || null);
      }
    }
  };

  // Divide tracks into Side A and Side B for retro cassette feel
  const midPoint = activeCassette ? Math.ceil(activeCassette.tracks.length / 2) : 0;
  const sideATracks = activeCassette ? activeCassette.tracks.slice(0, midPoint) : [];
  const sideBTracks = activeCassette ? activeCassette.tracks.slice(midPoint) : [];
  const currentSideTracks = activeSide === 'A' ? sideATracks : sideBTracks;

  return (
    <div className="w-full px-4 sm:px-8 py-6 pb-24 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Tab Hero Banner */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-rose-950/40 via-stone-900/60 to-purple-950/30 border border-white/10 shadow-xl overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold">
              <span>📼</span>
              <span>Retro Mixtape Studio</span>
            </div>
            <h1 className="font-display text-2xl sm:text-4xl text-pale-cream tracking-tight">
              Custom Song Cassettes for Loved Ones
            </h1>
            <p className="text-sm text-muted-grey leading-relaxed">
              Craft a personalized vintage cassette tape with meaningful songs, attach a heartfelt handwritten note, and send it directly to someone you care about.
            </p>
          </div>

          <button
            onClick={() => {
              setEditingCassette(null);
              setIsCreateModalOpen(true);
            }}
            className="flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 active:scale-95 text-white font-bold text-sm transition-all shadow-[0_4px_20px_rgba(244,63,94,0.35)] cursor-pointer flex-shrink-0"
          >
            <span className="material-symbols-outlined text-xl">favorite</span>
            <span>Craft a New Cassette 📼</span>
          </button>
        </div>
      </div>

      {/* Main Feature: Active Cassette Deck & Love Letter View */}
      {activeCassette ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-pastel-lavender">radio</span>
              <h2 className="font-display text-lg sm:text-xl text-pale-cream">
                Cassette Deck & Letter
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setSendingCassette(activeCassette)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-semibold transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">send</span>
                <span>Send to {activeCassette.recipientName.split(' ')[0]}</span>
              </button>

              <button
                onClick={() => handleEdit(activeCassette)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-muted-grey hover:text-white text-xs font-medium transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">edit</span>
                <span>Edit</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Vintage Tape & Player Deck Controls (7 cols) */}
            <div className="lg:col-span-6 flex flex-col items-center gap-6">
              {/* Cassette Graphic */}
              <div className="w-full flex justify-center">
                <CassetteTape
                  cassette={activeCassette}
                  isPlaying={isCassettePlaying}
                  className="mx-auto"
                />
              </div>

              {/* Tape Deck Control Console */}
              <div className="w-full rounded-2xl bg-surface-container-high/60 border border-white/5 p-4 sm:p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-muted-grey block">
                      Currently Loaded
                    </span>
                    <h3 className="font-display text-base text-pale-cream truncate">
                      {activeCassette.title}
                    </h3>
                  </div>

                  {/* Tape Side Selector */}
                  <div className="flex items-center gap-1 bg-surface-container-lowest p-1 rounded-xl border border-white/5">
                    <button
                      onClick={() => setActiveSide('A')}
                      className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                        activeSide === 'A'
                          ? 'bg-primary-container text-on-primary-container shadow-xs'
                          : 'text-muted-grey hover:text-pale-cream'
                      }`}
                    >
                      SIDE A ({sideATracks.length})
                    </button>
                    <button
                      onClick={() => setActiveSide('B')}
                      className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                        activeSide === 'B'
                          ? 'bg-primary-container text-on-primary-container shadow-xs'
                          : 'text-muted-grey hover:text-pale-cream'
                      }`}
                    >
                      SIDE B ({sideBTracks.length})
                    </button>
                  </div>
                </div>

                {/* Hardware Push-Buttons Controls (Play, Pause, Fast Forward, Rewind, Eject) */}
                <div className="grid grid-cols-5 gap-2 pt-1">
                  <button
                    onClick={playPrevious}
                    title="Previous Song"
                    className="flex flex-col items-center justify-center py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-highest border border-white/5 text-muted-grey hover:text-white transition-all active:translate-y-0.5 cursor-pointer shadow-xs"
                  >
                    <span className="material-symbols-outlined text-lg">fast_rewind</span>
                    <span className="text-[9px] font-mono uppercase mt-0.5">REW</span>
                  </button>

                  <button
                    onClick={handlePlayActive}
                    title={isCassettePlaying ? 'Pause Tape' : 'Play Tape'}
                    className={`col-span-2 flex flex-col items-center justify-center py-2.5 rounded-xl border transition-all active:translate-y-0.5 cursor-pointer shadow-md ${
                      isCassettePlaying
                        ? 'bg-rose-500 text-white border-rose-400'
                        : 'bg-primary-container text-on-primary-container border-primary-container/40 hover:opacity-95'
                    }`}
                  >
                    <span className="material-symbols-outlined text-xl">
                      {isCassettePlaying ? 'pause' : 'play_arrow'}
                    </span>
                    <span className="text-[9px] font-mono uppercase font-bold mt-0.5">
                      {isCassettePlaying ? 'PAUSE' : 'PLAY TAPE'}
                    </span>
                  </button>

                  <button
                    onClick={playNext}
                    title="Next Song"
                    className="flex flex-col items-center justify-center py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-highest border border-white/5 text-muted-grey hover:text-white transition-all active:translate-y-0.5 cursor-pointer shadow-xs"
                  >
                    <span className="material-symbols-outlined text-lg">fast_forward</span>
                    <span className="text-[9px] font-mono uppercase mt-0.5">FFWD</span>
                  </button>

                  <button
                    onClick={() => setSendingCassette(activeCassette)}
                    title="Send Cassette to Loved One"
                    className="flex flex-col items-center justify-center py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-highest border border-white/5 text-rose-400 hover:text-rose-300 transition-all active:translate-y-0.5 cursor-pointer shadow-xs"
                  >
                    <span className="material-symbols-outlined text-lg">send</span>
                    <span className="text-[9px] font-mono uppercase mt-0.5">SEND</span>
                  </button>
                </div>

                {/* Tracklist on this Side */}
                <div className="space-y-1.5 pt-2">
                  <div className="text-[11px] font-mono uppercase text-muted-grey flex justify-between px-1">
                    <span>Tape Side {activeSide} Tracks</span>
                    <span>{currentSideTracks.length} Songs</span>
                  </div>

                  {currentSideTracks.length === 0 ? (
                    <p className="text-xs text-muted-grey/60 text-center py-4 italic">
                      No tracks on Side {activeSide}. Add more tracks to your mixtape!
                    </p>
                  ) : (
                    <div className="space-y-1 max-h-52 overflow-y-auto pr-1">
                      {currentSideTracks.map((track, idx) => {
                        const isCurrentTrack = currentTrack?.id === track.id;
                        const globalIndex =
                          activeSide === 'A' ? idx + 1 : midPoint + idx + 1;
                        return (
                          <div
                            key={track.id}
                            onClick={() => playTrack(track, activeCassette.tracks)}
                            className={`flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer group ${
                              isCurrentTrack
                                ? 'bg-primary-container/20 border border-primary-container/40 text-primary-container'
                                : 'hover:bg-surface-container-highest/60 text-pale-cream border border-transparent'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="text-xs font-mono font-bold text-muted-grey w-5 text-center">
                                {globalIndex}
                              </span>
                              <img
                                src={track.thumbnail}
                                alt=""
                                className="w-8 h-8 rounded-lg object-cover border border-white/10"
                              />
                              <div className="min-w-0">
                                <p className="text-xs font-medium truncate group-hover:text-primary-container transition-colors">
                                  {track.title}
                                </p>
                                <p className="text-[11px] text-muted-grey truncate">
                                  {track.channel}
                                </p>
                              </div>
                            </div>

                            <span className="material-symbols-outlined text-base text-muted-grey group-hover:text-white">
                              {isCurrentTrack && isPlaying ? 'equalizer' : 'play_arrow'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Authentic Love Letter Stationery (6 cols) */}
            <div className="lg:col-span-6">
              <CassetteLoveLetter
                cassette={activeCassette}
                isPlaying={isCassettePlaying}
                onPlay={handlePlayActive}
                onSend={() => setSendingCassette(activeCassette)}
                onEdit={() => handleEdit(activeCassette)}
              />
            </div>
          </div>
        </div>
      ) : null}

      {/* Mixtape Collection Shelf */}
      <div className="space-y-4 pt-4 border-t border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-pastel-lavender">album</span>
            <h2 className="font-display text-lg sm:text-xl text-pale-cream">
              Your Cassette Rack ({cassettes.length})
            </h2>
          </div>

          <button
            onClick={() => {
              setEditingCassette(null);
              setIsCreateModalOpen(true);
            }}
            className="flex items-center gap-1.5 text-xs text-pastel-lavender hover:underline cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">add_circle</span>
            <span>New Cassette</span>
          </button>
        </div>

        {cassettes.length === 0 ? (
          <div className="p-8 rounded-3xl border border-dashed border-white/10 text-center bg-surface-container-high/30">
            <span className="material-symbols-outlined text-4xl text-muted-grey mb-3">
              album
            </span>
            <h3 className="font-display text-base text-pale-cream">No cassettes crafted yet</h3>
            <p className="text-xs text-muted-grey mt-1 max-w-sm mx-auto">
              Create a custom vintage cassette with songs and a heartfelt note to surprise your loved ones!
            </p>
            <button
              onClick={() => {
                setEditingCassette(null);
                setIsCreateModalOpen(true);
              }}
              className="mt-4 px-5 py-2.5 rounded-xl bg-primary-container text-on-primary-container font-bold text-xs hover:opacity-90 active:scale-95 transition-all cursor-pointer"
            >
              Craft Your First Cassette 📼
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cassettes.map((c) => {
              const isSelected = activeCassette?.id === c.id;
              const isCurrentlyPlaying =
                isPlaying && c.tracks.some((t) => t.id === currentTrack?.id);

              return (
                <div
                  key={c.id}
                  onClick={() => handleSelectCassette(c)}
                  className={`group relative rounded-2xl p-4 bg-surface-container-high/60 border transition-all duration-300 hover:scale-[1.01] cursor-pointer flex flex-col justify-between gap-4 ${
                    isSelected
                      ? 'border-primary-container/80 ring-2 ring-primary-container/30 bg-surface-container-high'
                      : 'border-white/5 hover:border-white/15'
                  }`}
                >
                  {/* Cassette Mini Preview */}
                  <CassetteTape cassette={c} isPlaying={isCurrentlyPlaying} isCompact={true} />

                  {/* Note snippet */}
                  <p className="text-xs text-muted-grey line-clamp-2 italic font-serif pl-2 border-l-2 border-rose-500/30">
                    "{c.note || 'No note written yet...'}"
                  </p>

                  {/* Card Bottom Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs text-muted-grey">
                    <span className="text-[11px] font-mono">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSendingCassette(c);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 text-[11px] font-semibold transition-colors cursor-pointer"
                      >
                        Send 💌
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(c);
                        }}
                        className="w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
                        title="Edit"
                      >
                        <span className="material-symbols-outlined text-sm">edit</span>
                      </button>

                      <button
                        onClick={(e) => handleDelete(c, e)}
                        className="w-7 h-7 rounded-lg hover:bg-rose-500/10 hover:text-rose-400 flex items-center justify-center transition-colors cursor-pointer"
                        title="Delete"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateCassetteModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingCassette(null);
        }}
        editCassette={editingCassette}
      />

      <SendCassetteModal
        isOpen={sendingCassette !== null}
        onClose={() => setSendingCassette(null)}
        cassette={sendingCassette}
        onPlay={() => {
          if (sendingCassette) {
            playCassette(sendingCassette, 0);
          }
        }}
      />
    </div>
  );
};
