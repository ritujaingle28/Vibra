import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { usePlayer, Track, UserPlaylist } from '../context/PlayerContext';
import { CreatePlaylistModal } from '../components/CreatePlaylistModal';
import { getActualSongImage, handleSongImageError } from '../lib/songImage';

export const LibraryTab = () => {
  const {
    likedSongs,
    recentPlays,
    playlists,
    playTrack,
    isLiked,
    toggleLike,
    shareTrack,
    currentTrack,
    isPlaying,
    togglePlayPause,
    deletePlaylist,
    updatePlaylist,
    removeTrackFromPlaylist,
    addTrackToPlaylist,
    openAddToPlaylistModal,
    showToast,
    addToQueue,
    generatedTracks,
    deleteGeneratedTrack
  } = usePlayer();

  const [activeTab, setActiveTab] = useState<'playlists' | 'aimashups' | 'generated' | 'liked' | 'recent'>('playlists');
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingMoreTracks, setIsAddingMoreTracks] = useState(false);
  const [moreTracksQuery, setMoreTracksQuery] = useState('');
  const [isEditingPlaylist, setIsEditingPlaylist] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');

  // Selected playlist object
  const activePlaylist = playlists.find((p) => p.id === selectedPlaylistId) || null;

  // Filtered playlists
  const filteredCustomPlaylists = playlists.filter((pl) => {
    if (pl.isAIGenerated) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return pl.name.toLowerCase().includes(q) || pl.description.toLowerCase().includes(q);
  });

  const filteredAIPlaylists = playlists.filter((pl) => {
    if (!pl.isAIGenerated) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return pl.name.toLowerCase().includes(q) || pl.description.toLowerCase().includes(q);
  });

  const filteredPlaylists = filteredCustomPlaylists;

  const handlePlayEntirePlaylist = (playlist: UserPlaylist, shuffle = false) => {
    if (!playlist.tracks || playlist.tracks.length === 0) {
      showToast('This playlist is empty. Add some tracks first!', 'info');
      return;
    }
    const tracksToPlay = shuffle ? [...playlist.tracks].sort(() => Math.random() - 0.5) : playlist.tracks;
    playTrack(tracksToPlay[0], tracksToPlay);
    showToast(`Playing "${playlist.name}" ${shuffle ? '(Shuffled)' : ''} 🎶`, 'success');
  };

  const handleStartEdit = (playlist: UserPlaylist) => {
    setEditName(playlist.name);
    setEditDesc(playlist.description);
    setIsEditingPlaylist(true);
  };

  const handleSaveEdit = () => {
    if (!activePlaylist) return;
    if (!editName.trim()) {
      showToast('Playlist name cannot be empty', 'error');
      return;
    }
    updatePlaylist(activePlaylist.id, {
      name: editName.trim(),
      description: editDesc.trim()
    });
    setIsEditingPlaylist(false);
  };

  // Track candidates pool for "Add more tracks"
  const candidateTracksForAdd = React.useMemo(() => {
    const map = new Map<string, Track>();
    likedSongs.forEach(t => map.set(t.id, t));
    recentPlays.forEach(t => map.set(t.id, t));
    return Array.from(map.values());
  }, [likedSongs, recentPlays]);

  const filteredCandidatesForAdd = candidateTracksForAdd.filter(t => {
    if (!moreTracksQuery.trim()) return true;
    const q = moreTracksQuery.toLowerCase();
    return t.title.toLowerCase().includes(q) || t.channel.toLowerCase().includes(q);
  });

  return (
    <div className="px-6 py-8 md:px-12 max-w-6xl mx-auto pb-44">
      {/* If viewing a single playlist detail */}
      {selectedPlaylistId && activePlaylist ? (
        <motion.div
          key="playlist-detail"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Back button */}
          <button
            onClick={() => {
              setSelectedPlaylistId(null);
              setIsAddingMoreTracks(false);
              setIsEditingPlaylist(false);
            }}
            className="flex items-center gap-2 text-muted-grey hover:text-pale-cream font-label text-xs uppercase tracking-wider transition-colors cursor-pointer group"
          >
            <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform">
              arrow_back
            </span>
            Back to Library
          </button>

          {/* Playlist Hero Banner */}
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start md:items-end bg-gradient-to-b from-surface-container-high/80 to-surface-container/40 p-6 md:p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
            <div className="relative w-40 h-40 md:w-56 md:h-56 rounded-2xl overflow-hidden shadow-2xl flex-shrink-0 group">
              <img
                src={getActualSongImage(activePlaylist.tracks[0] || { id: '', thumbnail: activePlaylist.coverUrl })}
                alt={activePlaylist.name}
                onError={(e) => handleSongImageError(e, activePlaylist.tracks[0]?.id)}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => handlePlayEntirePlaylist(activePlaylist)}
                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                title="Play Playlist"
              >
                <div className="w-16 h-16 rounded-full bg-primary-container text-[#3c3c2a] flex items-center justify-center shadow-2xl transform group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    play_arrow
                  </span>
                </div>
              </button>
            </div>

            <div className="flex-1 min-w-0 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-label font-bold tracking-widest text-primary-container">
                  Playlist
                </span>
              </div>

              {isEditingPlaylist ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="font-display text-3xl md:text-4xl text-pale-cream bg-surface-container border border-primary-container/60 rounded-xl px-3 py-1.5 w-full outline-none"
                  />
                  <textarea
                    rows={2}
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    className="font-body text-sm text-pale-cream bg-surface-container border border-white/10 rounded-xl px-3 py-1.5 w-full outline-none resize-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveEdit}
                      className="px-4 py-1.5 bg-primary-container text-[#3c3c2a] rounded-lg font-label text-xs uppercase font-bold cursor-pointer"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setIsEditingPlaylist(false)}
                      className="px-4 py-1.5 bg-surface-container-high text-muted-grey hover:text-pale-cream rounded-lg font-label text-xs uppercase cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="font-display text-3xl md:text-5xl text-pale-cream leading-tight">
                    {activePlaylist.name}
                  </h1>
                  <p className="font-body text-sm md:text-base text-muted-grey line-clamp-2 max-w-2xl">
                    {activePlaylist.description}
                  </p>
                </>
              )}

              {activePlaylist.prompt && (
                <p className="text-xs text-primary-container/80 font-body italic">
                  Prompt: "{activePlaylist.prompt}"
                </p>
              )}

              <div className="flex items-center gap-4 text-xs font-label text-muted-grey uppercase tracking-wider pt-2">
                <span>{activePlaylist.tracks.length} track{activePlaylist.tracks.length === 1 ? '' : 's'}</span>
                <span>•</span>
                <span>Estimated {Math.round(activePlaylist.tracks.length * 3.5)} min</span>
              </div>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4 py-2 border-b border-white/10">
            <div className="flex items-center gap-3">
              <button
                onClick={() => handlePlayEntirePlaylist(activePlaylist)}
                disabled={activePlaylist.tracks.length === 0}
                className={`px-7 py-3 rounded-full font-label text-sm uppercase tracking-wider font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
                  activePlaylist.tracks.length === 0
                    ? 'bg-surface-container-high text-muted-grey cursor-not-allowed'
                    : 'bg-primary-container text-[#3c3c2a] hover:opacity-95 shadow-lg shadow-primary-container/20'
                }`}
              >
                <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  play_arrow
                </span>
                Play All
              </button>

              <button
                onClick={() => handlePlayEntirePlaylist(activePlaylist, true)}
                disabled={activePlaylist.tracks.length === 0}
                className="px-5 py-3 rounded-full bg-surface-container-high/60 hover:bg-surface-container-high text-pale-cream font-label text-xs uppercase tracking-wider font-semibold border border-white/10 flex items-center gap-2 transition-all cursor-pointer"
                title="Shuffle Play"
              >
                <span className="material-symbols-outlined text-lg">shuffle</span>
                Shuffle
              </button>

              <button
                onClick={() => setIsAddingMoreTracks(!isAddingMoreTracks)}
                className={`px-5 py-3 rounded-full font-label text-xs uppercase tracking-wider font-semibold border transition-all cursor-pointer flex items-center gap-2 ${
                  isAddingMoreTracks
                    ? 'bg-primary-container/20 border-primary-container text-primary-container'
                    : 'bg-surface-container-high/60 hover:bg-surface-container-high text-pale-cream border-white/10'
                }`}
              >
                <span className="material-symbols-outlined text-lg">
                  {isAddingMoreTracks ? 'expand_less' : 'add'}
                </span>
                {isAddingMoreTracks ? 'Hide Add Tracks' : 'Add Tracks'}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleStartEdit(activePlaylist)}
                className="w-10 h-10 rounded-full hover:bg-white/10 text-muted-grey hover:text-pale-cream flex items-center justify-center transition-colors cursor-pointer"
                title="Edit Playlist Details"
              >
                <span className="material-symbols-outlined text-xl">edit</span>
              </button>
              <button
                onClick={() => {
                  if (window.confirm(`Are you sure you want to delete "${activePlaylist.name}"?`)) {
                    deletePlaylist(activePlaylist.id);
                    setSelectedPlaylistId(null);
                  }
                }}
                className="w-10 h-10 rounded-full hover:bg-red-500/20 text-muted-grey hover:text-red-400 flex items-center justify-center transition-colors cursor-pointer"
                title="Delete Playlist"
              >
                <span className="material-symbols-outlined text-xl">delete</span>
              </button>
            </div>
          </div>

          {/* Collapsible Add More Tracks Section */}
          <AnimatePresence>
            {isAddingMoreTracks && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden bg-surface-container/60 border border-white/10 rounded-3xl p-6 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg text-pale-cream flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary-container text-xl">
                      library_add
                    </span>
                    Add Songs to {activePlaylist.name}
                  </h3>
                  <span className="text-xs text-muted-grey">
                    Click + to add instantly
                  </span>
                </div>

                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-2.5 text-muted-grey text-lg">
                    search
                  </span>
                  <input
                    type="text"
                    value={moreTracksQuery}
                    onChange={(e) => setMoreTracksQuery(e.target.value)}
                    placeholder="Search from liked songs & recently played..."
                    className="w-full bg-surface-container-high border border-white/10 focus:border-primary-container/80 rounded-xl pl-9 pr-4 py-2.5 text-xs md:text-sm text-pale-cream placeholder-muted-grey/60 outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
                  {filteredCandidatesForAdd.map((track) => {
                    const alreadyIn = activePlaylist.tracks.some((t) => t.id === track.id);

                    return (
                      <div
                        key={track.id}
                        className={`flex items-center justify-between p-2.5 rounded-2xl border transition-colors ${
                          alreadyIn
                            ? 'bg-surface-container-high/40 border-white/5 opacity-60'
                            : 'bg-surface-container-high/80 hover:bg-surface-container-high border-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                          <img
                            src={getActualSongImage(track)}
                            alt={track.title}
                            onError={(e) => handleSongImageError(e, track.id)}
                            className="w-9 h-9 rounded-lg object-cover flex-shrink-0 shadow-sm"
                          />
                          <div className="min-w-0 flex-1">
                            <h5 className="font-display text-xs text-pale-cream truncate">
                              {track.title}
                            </h5>
                            <p className="font-body text-[11px] text-muted-grey truncate">
                              {track.channel}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            if (alreadyIn) {
                              removeTrackFromPlaylist(activePlaylist.id, track.id);
                            } else {
                              addTrackToPlaylist(activePlaylist.id, track);
                            }
                          }}
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                            alreadyIn
                              ? 'bg-primary-container/20 text-primary-container hover:bg-red-500/20 hover:text-red-400'
                              : 'bg-primary-container text-[#3c3c2a] hover:opacity-90'
                          }`}
                          title={alreadyIn ? 'Remove' : 'Add to playlist'}
                        >
                          <span className="material-symbols-outlined text-sm font-bold">
                            {alreadyIn ? 'check' : 'add'}
                          </span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Playlist Track List */}
          {activePlaylist.tracks.length === 0 ? (
            <div className="py-16 text-center space-y-4 bg-surface-container/30 rounded-3xl border border-dashed border-white/10">
              <span className="material-symbols-outlined text-5xl text-muted-grey/40">
                queue_music
              </span>
              <h3 className="font-display text-xl text-pale-cream">
                This playlist has no songs yet
              </h3>
              <p className="font-body text-sm text-muted-grey max-w-sm mx-auto">
                Click "Add Tracks" above to populate this playlist with your favorite songs.
              </p>
              <button
                onClick={() => setIsAddingMoreTracks(true)}
                className="px-6 py-2.5 rounded-full bg-primary-container text-[#3c3c2a] font-label text-xs uppercase tracking-wider font-bold cursor-pointer inline-flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">add</span>
                Add Songs Now
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {activePlaylist.tracks.map((track, index) => {
                const isCurrent = currentTrack?.id === track.id;
                const liked = isLiked(track.id);

                return (
                  <motion.div
                    key={`${track.id}-${index}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    onClick={() => playTrack(track, activePlaylist.tracks)}
                    className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer group transition-all border ${
                      isCurrent
                        ? 'bg-primary-container/20 border-primary-container/50'
                        : 'bg-surface-container/50 hover:bg-surface-container border-transparent hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      {/* Track index / visualizer */}
                      <div className="w-6 text-center font-label text-xs text-muted-grey flex-shrink-0">
                        {isCurrent && isPlaying ? (
                          <span className="material-symbols-outlined text-primary-container text-base animate-pulse">
                            equalizer
                          </span>
                        ) : (
                          <span className="group-hover:hidden">{index + 1}</span>
                        )}
                        <span className="material-symbols-outlined text-pale-cream text-lg hidden group-hover:inline-block">
                          {isCurrent && isPlaying ? 'pause' : 'play_arrow'}
                        </span>
                      </div>

                      {/* Thumbnail */}
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 shadow-md">
                        <img
                          src={getActualSongImage(track)}
                          alt={track.title}
                          onError={(e) => handleSongImageError(e, track.id)}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>

                      {/* Title & Channel */}
                      <div className="flex flex-col min-w-0 flex-1 pr-2">
                        <h4
                          className={`font-display text-sm md:text-base truncate leading-tight mb-0.5 ${
                            isCurrent ? 'text-primary-container font-semibold' : 'text-pale-cream'
                          }`}
                          dangerouslySetInnerHTML={{ __html: track.title }}
                        />
                        <p className="font-body text-xs text-muted-grey truncate uppercase tracking-wider">
                          {track.channel}
                        </p>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          addToQueue(track);
                        }}
                        className="w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer text-muted-grey hover:text-pale-cream"
                        title="Add to queue"
                      >
                        <span className="material-symbols-outlined text-lg">queue_music</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLike(track);
                        }}
                        className="w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
                        title={liked ? 'Unlike' : 'Like'}
                      >
                        <span
                          className={`material-symbols-outlined text-lg transition-all ${
                            liked ? 'text-primary-container scale-110' : 'text-muted-grey hover:text-pale-cream'
                          }`}
                          style={{ fontVariationSettings: liked ? "'FILL' 1" : "'FILL' 0" }}
                        >
                          favorite
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeTrackFromPlaylist(activePlaylist.id, track.id);
                        }}
                        className="w-9 h-9 rounded-full hover:bg-red-500/20 flex items-center justify-center text-muted-grey hover:text-red-400 transition-colors cursor-pointer"
                        title="Remove from playlist"
                      >
                        <span className="material-symbols-outlined text-lg">close</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          shareTrack(track);
                        }}
                        className="w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer text-muted-grey hover:text-pale-cream"
                        title="Share track"
                      >
                        <span className="material-symbols-outlined text-lg">share</span>
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      ) : (
        /* Main Library View */
        <div className="space-y-8">
          <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="font-display text-4xl md:text-5xl text-pale-cream drop-shadow-md">
                Your Library
              </h1>
              <p className="font-body text-sm text-muted-grey mt-1">
                Your personal and AI-curated playlists, liked tracks, and listening history
              </p>
            </div>

            {/* + Create Playlist CTA */}
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-6 py-3 rounded-full bg-gradient-to-r from-primary-container to-amber-400 text-[#3c3c2a] font-label text-sm uppercase tracking-wider font-bold shadow-xl shadow-primary-container/20 hover:opacity-95 flex items-center gap-2 cursor-pointer self-start md:self-auto transition-transform active:scale-95"
            >
              <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                auto_awesome
              </span>
              + Create Playlist
            </button>
          </header>

          {/* Sub-tabs Navigation */}
          <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
            <button
              onClick={() => setActiveTab('playlists')}
              className={`px-6 py-2.5 rounded-full font-label text-xs md:text-sm tracking-wider uppercase transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'playlists'
                  ? 'bg-primary-container text-[#3c3c2a] font-bold shadow-lg shadow-primary-container/20'
                  : 'bg-surface-container-high/60 text-muted-grey hover:text-pale-cream hover:bg-surface-container-high'
              }`}
            >
              <span className="material-symbols-outlined text-base">queue_music</span>
              Custom Playlists ({playlists.filter(p => !p.isAIGenerated).length})
            </button>

            <button
              onClick={() => setActiveTab('aimashups')}
              className={`px-6 py-2.5 rounded-full font-label text-xs md:text-sm tracking-wider uppercase transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'aimashups'
                  ? 'bg-primary-container text-[#3c3c2a] font-bold shadow-lg shadow-primary-container/20'
                  : 'bg-surface-container-high/60 text-muted-grey hover:text-pale-cream hover:bg-surface-container-high'
              }`}
            >
              <span className="material-symbols-outlined text-base">auto_awesome</span>
              AI Mashups ({playlists.filter(p => p.isAIGenerated).length})
            </button>

            <button
              onClick={() => setActiveTab('generated')}
              className={`px-6 py-2.5 rounded-full font-label text-xs md:text-sm tracking-wider uppercase transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'generated'
                  ? 'bg-primary-container text-[#3c3c2a] font-bold shadow-lg shadow-primary-container/20'
                  : 'bg-surface-container-high/60 text-muted-grey hover:text-pale-cream hover:bg-surface-container-high'
              }`}
            >
              <span className="material-symbols-outlined text-base">music_note</span>
              Generated Music ({generatedTracks.length})
            </button>

            <button
              onClick={() => setActiveTab('liked')}
              className={`px-6 py-2.5 rounded-full font-label text-xs md:text-sm tracking-wider uppercase transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'liked'
                  ? 'bg-primary-container text-[#3c3c2a] font-bold shadow-lg shadow-primary-container/20'
                  : 'bg-surface-container-high/60 text-muted-grey hover:text-pale-cream hover:bg-surface-container-high'
              }`}
            >
              <span className="material-symbols-outlined text-base">favorite</span>
              Liked Songs ({likedSongs.length})
            </button>

            <button
              onClick={() => setActiveTab('recent')}
              className={`px-6 py-2.5 rounded-full font-label text-xs md:text-sm tracking-wider uppercase transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'recent'
                  ? 'bg-primary-container text-[#3c3c2a] font-bold shadow-lg shadow-primary-container/20'
                  : 'bg-surface-container-high/60 text-muted-grey hover:text-pale-cream hover:bg-surface-container-high'
              }`}
            >
              <span className="material-symbols-outlined text-base">history</span>
              Recently Played ({recentPlays.length})
            </button>
          </div>

          {/* TAB 1: CUSTOM PLAYLISTS */}
          {activeTab === 'playlists' && (
            <div className="space-y-6">
              {/* Search filter if playlists exist */}
              {playlists.filter(p => !p.isAIGenerated).length > 3 && (
                <div className="relative max-w-md">
                  <span className="material-symbols-outlined absolute left-3.5 top-3 text-muted-grey text-lg">
                    search
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filter your custom playlists..."
                    className="w-full bg-surface-container/60 border border-white/10 focus:border-primary-container/80 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-pale-cream placeholder-muted-grey/60 outline-none"
                  />
                </div>
              )}

              {filteredCustomPlaylists.length === 0 ? (
                <div className="py-16 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-20 h-20 rounded-3xl bg-primary-container/15 flex items-center justify-center text-primary-container mb-2">
                    <span className="material-symbols-outlined text-4xl">queue_music</span>
                  </div>
                  <h3 className="font-display text-2xl text-pale-cream">
                    No custom playlists yet
                  </h3>
                  <p className="font-body text-sm text-muted-grey max-w-md">
                    Create a manual playlist to organize your favorite tracks.
                  </p>
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="px-6 py-3 rounded-full bg-primary-container text-[#3c3c2a] font-label text-xs uppercase tracking-wider font-bold shadow-lg cursor-pointer"
                  >
                    + Create Custom Playlist
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {/* Create New Playlist Card Tile */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsCreateModalOpen(true)}
                    className="h-64 rounded-3xl border border-dashed border-primary-container/40 bg-primary-container/5 hover:bg-primary-container/10 p-6 flex flex-col items-center justify-center text-center cursor-pointer group transition-all"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-primary-container/20 group-hover:bg-primary-container group-hover:text-[#3c3c2a] text-primary-container flex items-center justify-center transition-colors mb-3">
                      <span className="material-symbols-outlined text-3xl">add</span>
                    </div>
                    <h4 className="font-display text-lg text-pale-cream mb-1">
                      Create Playlist
                    </h4>
                    <p className="font-body text-xs text-muted-grey max-w-[200px]">
                      Manual generation
                    </p>
                  </motion.div>

                  {/* Playlist Cards */}
                  {filteredCustomPlaylists.map((pl, idx) => (
                    <motion.div
                      key={pl.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      whileHover={{ y: -4 }}
                      onClick={() => setSelectedPlaylistId(pl.id)}
                      className="group bg-surface-container/60 hover:bg-surface-container border border-white/5 hover:border-white/15 rounded-3xl p-4 flex flex-col justify-between cursor-pointer transition-all shadow-xl hover:shadow-2xl"
                    >
                      {/* Image & Quick Play */}
                      <div className="relative aspect-video rounded-2xl overflow-hidden mb-4 shadow-md bg-surface-container-high">
                        <img
                          src={getActualSongImage(pl.tracks[0] || { id: '', thumbnail: pl.coverUrl })}
                          alt={pl.name}
                          onError={(e) => handleSongImageError(e, pl.tracks[0]?.id)}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>

                        {/* Track Count Pill */}
                        <div className="absolute bottom-3 left-3 text-xs font-label font-medium text-pale-cream/90 bg-black/60 backdrop-blur-md px-2.5 py-0.5 rounded-full">
                          {pl.tracks.length} songs
                        </div>

                        {/* Hover Play Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePlayEntirePlaylist(pl);
                          }}
                          className="absolute bottom-3 right-3 w-11 h-11 rounded-full bg-primary-container text-[#3c3c2a] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg transform group-hover:scale-105 cursor-pointer"
                          title="Play All"
                        >
                          <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                            play_arrow
                          </span>
                        </button>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display text-lg text-pale-cream truncate mb-1 group-hover:text-primary-container transition-colors">
                          {pl.name}
                        </h3>
                        <p className="font-body text-xs text-muted-grey line-clamp-2 leading-relaxed">
                          {pl.description || 'Custom track collection'}
                        </p>
                      </div>

                      {/* Footer actions */}
                      <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/5 text-xs text-muted-grey">
                        <span className="font-label uppercase tracking-wider text-[10px]">
                          {new Date(pl.createdAt).toLocaleDateString()}
                        </span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm(`Delete playlist "${pl.name}"?`)) {
                                deletePlaylist(pl.id);
                              }
                            }}
                            className="w-7 h-7 rounded-full hover:bg-red-500/20 text-muted-grey hover:text-red-400 flex items-center justify-center transition-colors"
                            title="Delete playlist"
                          >
                            <span className="material-symbols-outlined text-base">delete</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 1.5: AI MASHUPS PLAYLISTS */}
          {activeTab === 'aimashups' && (
            <div className="space-y-6">
              {/* Search filter if playlists exist */}
              {playlists.filter(p => p.isAIGenerated).length > 3 && (
                <div className="relative max-w-md">
                  <span className="material-symbols-outlined absolute left-3.5 top-3 text-muted-grey text-lg">
                    search
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filter your AI mashups..."
                    className="w-full bg-surface-container/60 border border-white/10 focus:border-primary-container/80 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-pale-cream placeholder-muted-grey/60 outline-none"
                  />
                </div>
              )}

              {filteredAIPlaylists.length === 0 ? (
                <div className="py-16 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-20 h-20 rounded-3xl bg-primary-container/15 flex items-center justify-center text-primary-container mb-2">
                    <span className="material-symbols-outlined text-4xl">auto_awesome</span>
                  </div>
                  <h3 className="font-display text-2xl text-pale-cream">
                    No AI Mashups yet
                  </h3>
                  <p className="font-body text-sm text-muted-grey max-w-md">
                    Use Gemini AI to generate custom track mixes and mashups tailored to any mood or artist.
                  </p>
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="px-6 py-3 rounded-full bg-primary-container text-[#3c3c2a] font-label text-xs uppercase tracking-wider font-bold shadow-lg cursor-pointer flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-lg">auto_awesome</span>
                    Create AI Mashup
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {/* Create New AI Playlist Card Tile */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsCreateModalOpen(true)}
                    className="h-64 rounded-3xl border border-dashed border-primary-container/40 bg-primary-container/5 hover:bg-primary-container/10 p-6 flex flex-col items-center justify-center text-center cursor-pointer group transition-all"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-primary-container/20 group-hover:bg-primary-container group-hover:text-[#3c3c2a] text-primary-container flex items-center justify-center transition-colors mb-3">
                      <span className="material-symbols-outlined text-3xl">auto_awesome</span>
                    </div>
                    <h4 className="font-display text-lg text-pale-cream mb-1">
                      Create Mashup
                    </h4>
                    <p className="font-body text-xs text-muted-grey max-w-[200px]">
                      AI-assisted generation with Gemini ✨
                    </p>
                  </motion.div>

                  {/* Playlist Cards */}
                  {filteredAIPlaylists.map((pl, idx) => (
                    <motion.div
                      key={pl.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      whileHover={{ y: -4 }}
                      onClick={() => setSelectedPlaylistId(pl.id)}
                      className="group bg-surface-container/60 hover:bg-surface-container border border-white/5 hover:border-white/15 rounded-3xl p-4 flex flex-col justify-between cursor-pointer transition-all shadow-xl hover:shadow-2xl"
                    >
                      {/* Image & Quick Play */}
                      <div className="relative aspect-video rounded-2xl overflow-hidden mb-4 shadow-md bg-surface-container-high">
                        <img
                          src={getActualSongImage(pl.tracks[0] || { id: '', thumbnail: pl.coverUrl })}
                          alt={pl.name}
                          onError={(e) => handleSongImageError(e, pl.tracks[0]?.id)}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>

                        {/* AI badge */}
                        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-primary-container text-[10px] font-label font-bold px-2.5 py-1 rounded-full border border-primary-container/30 flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">auto_awesome</span>
                          AI Curated
                        </div>

                        {/* Track Count Pill */}
                        <div className="absolute bottom-3 left-3 text-xs font-label font-medium text-pale-cream/90 bg-black/60 backdrop-blur-md px-2.5 py-0.5 rounded-full">
                          {pl.tracks.length} songs
                        </div>

                        {/* Hover Play Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePlayEntirePlaylist(pl);
                          }}
                          className="absolute bottom-3 right-3 w-11 h-11 rounded-full bg-primary-container text-[#3c3c2a] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg transform group-hover:scale-105 cursor-pointer"
                          title="Play All"
                        >
                          <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                            play_arrow
                          </span>
                        </button>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display text-lg text-pale-cream truncate mb-1 group-hover:text-primary-container transition-colors">
                          {pl.name}
                        </h3>
                        <p className="font-body text-xs text-muted-grey line-clamp-2 leading-relaxed">
                          {pl.description || 'AI Curated Mashup'}
                        </p>
                      </div>

                      {/* Footer actions */}
                      <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/5 text-xs text-muted-grey">
                        <span className="font-label uppercase tracking-wider text-[10px]">
                          {new Date(pl.createdAt).toLocaleDateString()}
                        </span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm(`Delete playlist "${pl.name}"?`)) {
                                deletePlaylist(pl.id);
                              }
                            }}
                            className="w-7 h-7 rounded-full hover:bg-red-500/20 text-muted-grey hover:text-red-400 flex items-center justify-center transition-colors"
                            title="Delete playlist"
                          >
                            <span className="material-symbols-outlined text-base">delete</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: GENERATED MUSIC (LYRIA 3) */}
          {activeTab === 'generated' && (
            <div className="space-y-6">
              {generatedTracks.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center text-center">
                  <span className="material-symbols-outlined text-[72px] text-primary-container/30 mb-6 drop-shadow-2xl">
                    music_note
                  </span>
                  <h3 className="font-display text-2xl text-pale-cream mb-2">
                    No generated tracks yet
                  </h3>
                  <p className="font-body text-base text-muted-grey max-w-md mb-6">
                    Compose original music using Google Lyria 3 Clip (up to 30s) or Lyria 3 Pro (full tracks).
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {generatedTracks.map((track: Track, index: number) => {
                    const isCurrent = currentTrack?.id === track.id;
                    const liked = isLiked(track.id);

                    return (
                      <motion.div
                        key={`${track.id}-${index}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.02 }}
                        onClick={() => playTrack(track, generatedTracks)}
                        className={`flex items-center justify-between p-3.5 rounded-2xl cursor-pointer group transition-colors border ${
                          isCurrent
                            ? 'bg-primary-container/20 border-primary-container/50'
                            : 'bg-surface-container/50 hover:bg-surface-container border-transparent hover:border-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-4 min-w-0 flex-1">
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 shadow-md">
                            <img
                              src={getActualSongImage(track)}
                              alt={track.title}
                              onError={(e) => handleSongImageError(e, track.id)}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <span
                                className="material-symbols-outlined text-pale-cream text-2xl"
                                style={{ fontVariationSettings: "'FILL' 1" }}
                              >
                                {isCurrent ? 'volume_up' : 'play_arrow'}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col min-w-0 flex-1 pr-2">
                            <div className="flex items-center gap-2 mb-0.5">
                              <h4
                                className={`font-display text-sm md:text-base truncate leading-tight ${
                                  isCurrent ? 'text-primary-container font-semibold' : 'text-pale-cream'
                                }`}
                              >
                                {track.title}
                              </h4>
                              <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded bg-primary-container/20 text-primary-container border border-primary-container/30 uppercase flex-shrink-0">
                                {track.modelUsed === 'lyria-3-pro-preview' ? 'Lyria Pro' : 'Lyria Clip'}
                              </span>
                            </div>
                            <p className="font-body text-xs text-muted-grey truncate">
                              {track.prompt || track.channel}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              addToQueue(track);
                            }}
                            className="w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center text-muted-grey hover:text-pale-cream transition-colors cursor-pointer"
                            title="Add to queue"
                          >
                            <span className="material-symbols-outlined text-lg">queue_music</span>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openAddToPlaylistModal(track);
                            }}
                            className="w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center text-muted-grey hover:text-pale-cream transition-colors cursor-pointer"
                            title="Add to Playlist"
                          >
                            <span className="material-symbols-outlined text-lg">playlist_add</span>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleLike(track);
                            }}
                            className="w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
                            title={liked ? 'Unlike' : 'Like'}
                          >
                            <span
                              className={`material-symbols-outlined text-lg transition-all ${
                                liked ? 'text-primary-container scale-110' : 'text-muted-grey hover:text-pale-cream'
                              }`}
                              style={{ fontVariationSettings: liked ? "'FILL' 1" : "'FILL' 0" }}
                            >
                              favorite
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteGeneratedTrack(track.id);
                            }}
                            className="w-9 h-9 rounded-full hover:bg-rose-500/20 flex items-center justify-center text-muted-grey hover:text-rose-400 transition-colors cursor-pointer"
                            title="Delete track"
                          >
                            <span className="material-symbols-outlined text-lg">delete</span>
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2 & 3: LIKED SONGS & RECENT PLAYS */}
          {(activeTab === 'liked' || activeTab === 'recent') && (
            <div className="space-y-4">
              {(activeTab === 'liked' ? likedSongs : recentPlays).length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center text-center">
                  <span className="material-symbols-outlined text-[72px] text-primary-container/30 mb-6 drop-shadow-2xl">
                    {activeTab === 'liked' ? 'favorite_border' : 'history'}
                  </span>
                  <h3 className="font-display text-2xl text-pale-cream mb-2">
                    {activeTab === 'liked' ? 'No liked songs yet' : 'No recent playback'}
                  </h3>
                  <p className="font-body text-base text-muted-grey max-w-md">
                    {activeTab === 'liked'
                      ? 'Tap the heart icon on any track to save your favorites here.'
                      : 'Songs you play will automatically appear in your recent history.'}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {(activeTab === 'liked' ? likedSongs : recentPlays).map((track: Track, index: number) => {
                    const isCurrent = currentTrack?.id === track.id;
                    const liked = isLiked(track.id);

                    return (
                      <motion.div
                        key={`${track.id}-${index}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.02 }}
                        onClick={() => playTrack(track, activeTab === 'liked' ? likedSongs : recentPlays)}
                        className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer group transition-colors border ${
                          isCurrent
                            ? 'bg-primary-container/20 border-primary-container/50'
                            : 'bg-surface-container/50 hover:bg-surface-container border-transparent hover:border-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-4 min-w-0 flex-1">
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 shadow-md">
                            <img
                              src={getActualSongImage(track)}
                              alt={track.title}
                              onError={(e) => handleSongImageError(e, track.id)}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <span
                                className="material-symbols-outlined text-pale-cream text-2xl"
                                style={{ fontVariationSettings: "'FILL' 1" }}
                              >
                                {isCurrent ? 'volume_up' : 'play_arrow'}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col min-w-0 flex-1 pr-2">
                            <h4
                              className={`font-display text-sm md:text-base truncate leading-tight mb-0.5 ${
                                isCurrent ? 'text-primary-container font-semibold' : 'text-pale-cream'
                              }`}
                              dangerouslySetInnerHTML={{ __html: track.title }}
                            ></h4>
                            <p className="font-body text-xs text-muted-grey truncate uppercase tracking-wider">
                              {track.channel}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              addToQueue(track);
                            }}
                            className="w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center text-muted-grey hover:text-pale-cream transition-colors cursor-pointer"
                            title="Add to queue"
                          >
                            <span className="material-symbols-outlined text-lg">queue_music</span>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openAddToPlaylistModal(track);
                            }}
                            className="w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center text-muted-grey hover:text-pale-cream transition-colors cursor-pointer"
                            title="Add to Playlist"
                          >
                            <span className="material-symbols-outlined text-lg">playlist_add</span>
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleLike(track);
                            }}
                            className="w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
                            title={liked ? 'Unlike' : 'Like'}
                          >
                            <span
                              className={`material-symbols-outlined text-lg transition-all ${
                                liked ? 'text-primary-container scale-110' : 'text-muted-grey hover:text-pale-cream'
                              }`}
                              style={{ fontVariationSettings: liked ? "'FILL' 1" : "'FILL' 0" }}
                            >
                              favorite
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              shareTrack(track);
                            }}
                            className="w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer text-muted-grey hover:text-pale-cream"
                            title="Share track"
                          >
                            <span className="material-symbols-outlined text-lg">share</span>
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Create Playlist Modal */}
      <CreatePlaylistModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onPlaylistCreated={(newId) => {
          setSelectedPlaylistId(newId);
          setActiveTab('playlists');
        }}
      />
    </div>
  );
};
