import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { usePlayer, Track } from '../context/PlayerContext';
import { CreatePlaylistModal } from './CreatePlaylistModal';
import { getActualSongImage, handleSongImageError } from '../lib/songImage';

export const AddToPlaylistModal: React.FC = () => {
  const {
    isAddToPlaylistModalOpen,
    trackToAddToPlaylist,
    closeAddToPlaylistModal,
    playlists,
    addTrackToPlaylist,
    removeTrackFromPlaylist,
    showToast
  } = usePlayer();

  const [isCreatingNew, setIsCreatingNew] = useState(false);

  if (!isAddToPlaylistModalOpen || !trackToAddToPlaylist) return null;

  return (
    <>
      <AnimatePresence>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="bg-surface-container border border-white/10 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden my-auto"
          >
            {/* Header */}
            <div className="p-5 border-b border-white/10 flex items-center justify-between bg-surface/50">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <img
                  src={getActualSongImage(trackToAddToPlaylist)}
                  alt={trackToAddToPlaylist.title}
                  onError={(e) => handleSongImageError(e, trackToAddToPlaylist.id)}
                  className="w-11 h-11 rounded-xl object-cover shadow-md flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-base text-pale-cream truncate">
                    {trackToAddToPlaylist.title}
                  </h3>
                  <p className="font-body text-xs text-muted-grey truncate">
                    Add to Playlist
                  </p>
                </div>
              </div>
              <button
                onClick={closeAddToPlaylistModal}
                className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-muted-grey hover:text-pale-cream transition-colors cursor-pointer flex-shrink-0"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {/* List of user playlists */}
            <div className="p-4 max-h-72 overflow-y-auto space-y-2">
              {/* Shortcut to create new playlist */}
              <button
                type="button"
                onClick={() => setIsCreatingNew(true)}
                className="w-full flex items-center gap-3 p-3 rounded-2xl bg-primary-container/15 hover:bg-primary-container/25 border border-primary-container/40 text-primary-container font-label text-xs uppercase tracking-wider font-bold transition-all cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-primary-container/30 flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">add</span>
                </div>
                <div className="text-left flex-1">
                  <div>+ New Playlist</div>
                  <div className="text-[11px] font-normal opacity-80 lowercase">Create manual or AI playlist</div>
                </div>
              </button>

              {playlists.map((playlist) => {
                const containsTrack = playlist.tracks.some((t) => t.id === trackToAddToPlaylist.id);

                return (
                  <div
                    key={playlist.id}
                    onClick={() => {
                      if (containsTrack) {
                        removeTrackFromPlaylist(playlist.id, trackToAddToPlaylist.id);
                      } else {
                        addTrackToPlaylist(playlist.id, trackToAddToPlaylist);
                      }
                    }}
                    className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all border ${
                      containsTrack
                        ? 'bg-surface-container-high border-primary-container/50'
                        : 'bg-surface/40 hover:bg-surface-container-high border-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <img
                        src={getActualSongImage(playlist.tracks[0] || { id: '', thumbnail: playlist.coverUrl || trackToAddToPlaylist.thumbnail })}
                        alt={playlist.name}
                        onError={(e) => handleSongImageError(e, playlist.tracks[0]?.id)}
                        className="w-11 h-11 rounded-xl object-cover flex-shrink-0 shadow-sm"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-display text-sm text-pale-cream truncate">
                            {playlist.name}
                          </h4>
                          {playlist.isAIGenerated && (
                            <span className="bg-primary-container/20 text-primary-container text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase flex-shrink-0">
                              AI
                            </span>
                          )}
                        </div>
                        <p className="font-body text-xs text-muted-grey">
                          {playlist.tracks.length} songs
                        </p>
                      </div>
                    </div>

                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                        containsTrack
                          ? 'bg-primary-container text-[#3c3c2a]'
                          : 'border border-white/20 text-transparent hover:border-white/40'
                      }`}
                    >
                      <span className="material-symbols-outlined text-sm font-bold">
                        check
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Done button */}
            <div className="p-4 border-t border-white/10 bg-surface/30">
              <button
                type="button"
                onClick={closeAddToPlaylistModal}
                className="w-full py-2.5 rounded-xl bg-surface-container-high hover:bg-white/10 text-pale-cream font-label text-xs uppercase tracking-wider font-semibold transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>

      {/* Embedded Create Modal when user clicks + New Playlist */}
      <CreatePlaylistModal
        isOpen={isCreatingNew}
        onClose={() => setIsCreatingNew(false)}
        initialTrack={trackToAddToPlaylist}
        onPlaylistCreated={(id) => {
          setIsCreatingNew(false);
          closeAddToPlaylistModal();
        }}
      />
    </>
  );
};
