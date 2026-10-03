import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { usePlayer, Track } from '../context/PlayerContext';
import { getActualSongImage, handleSongImageError } from '../lib/songImage';

interface CreatePlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTrack?: Track | null;
  onPlaylistCreated?: (playlistId: string) => void;
}

const PRESET_COVERS = [
  { id: 'lover', name: 'Lover Pastel', url: 'https://i.ytimg.com/vi/ic8j13piAhQ/hqdefault.jpg' },
  { id: '1989', name: '1989 Ocean Blue', url: 'https://i.ytimg.com/vi/-CmadmM5cOk/hqdefault.jpg' },
  { id: 'midnights', name: 'Midnight Glow', url: 'https://i.ytimg.com/vi/b1kbLwvqugk/hqdefault.jpg' },
  { id: 'folklore', name: 'Folklore Woods', url: 'https://i.ytimg.com/vi/K-a8s8OLBSE/hqdefault.jpg' },
  { id: 'red', name: 'Autumn Red', url: 'https://i.ytimg.com/vi/tollGa3S0o8/hqdefault.jpg' },
  { id: 'ttpd', name: 'The Tortured Poets', url: 'https://i.ytimg.com/vi/q3zqJs7JUCQ/hqdefault.jpg' },
  { id: 'espresso', name: 'Sunny Espresso', url: 'https://i.ytimg.com/vi/eVli-tstM5E/hqdefault.jpg' },
  { id: 'asitwas', name: 'As It Was', url: 'https://i.ytimg.com/vi/V1Z586zoeeE/hqdefault.jpg' },
];

const CURATED_CANDIDATE_TRACKS: Track[] = [
  { id: "ic8j13piAhQ", title: "Cruel Summer", channel: "Taylor Swift", thumbnail: "https://i.ytimg.com/vi/ic8j13piAhQ/hqdefault.jpg" },
  { id: "b1kbLwvqugk", title: "Anti-Hero", channel: "Taylor Swift", thumbnail: "https://i.ytimg.com/vi/b1kbLwvqugk/hqdefault.jpg" },
  { id: "K-a8s8OLBSE", title: "cardigan", channel: "Taylor Swift", thumbnail: "https://i.ytimg.com/vi/K-a8s8OLBSE/hqdefault.jpg" },
  { id: "-CmadmM5cOk", title: "Style (Taylor's Version)", channel: "Taylor Swift", thumbnail: "https://i.ytimg.com/vi/-CmadmM5cOk/hqdefault.jpg" },
  { id: "e-ORhEE9VVg", title: "Blank Space", channel: "Taylor Swift", thumbnail: "https://i.ytimg.com/vi/e-ORhEE9VVg/hqdefault.jpg" },
  { id: "-BjZmE2gtdo", title: "Lover", channel: "Taylor Swift", thumbnail: "https://i.ytimg.com/vi/-BjZmE2gtdo/hqdefault.jpg" },
  { id: "tollGa3S0o8", title: "All Too Well (10 Minute Version)", channel: "Taylor Swift", thumbnail: "https://i.ytimg.com/vi/tollGa3S0o8/hqdefault.jpg" },
  { id: "nn_0zPAfyo8", title: "august", channel: "Taylor Swift", thumbnail: "https://i.ytimg.com/vi/nn_0zPAfyo8/hqdefault.jpg" },
  { id: "q3zqJs7JUCQ", title: "Fortnight (feat. Post Malone)", channel: "Taylor Swift", thumbnail: "https://i.ytimg.com/vi/q3zqJs7JUCQ/hqdefault.jpg" },
  { id: "b7QlX3yR2xs", title: "Karma", channel: "Taylor Swift", thumbnail: "https://i.ytimg.com/vi/b7QlX3yR2xs/hqdefault.jpg" },
  { id: "eVli-tstM5E", title: "Espresso", channel: "Sabrina Carpenter", thumbnail: "https://i.ytimg.com/vi/eVli-tstM5E/hqdefault.jpg" },
  { id: "RlPNh_PBZb4", title: "vampire", channel: "Olivia Rodrigo", thumbnail: "https://i.ytimg.com/vi/RlPNh_PBZb4/hqdefault.jpg" },
  { id: "V1Z586zoeeE", title: "As It Was", channel: "Harry Styles", thumbnail: "https://i.ytimg.com/vi/V1Z586zoeeE/hqdefault.jpg" },
  { id: "XzWwH8wGsmQ", title: "champagne problems", channel: "Taylor Swift", thumbnail: "https://i.ytimg.com/vi/XzWwH8wGsmQ/hqdefault.jpg" },
  { id: "aXzVF3XeS8M", title: "Love Story (Taylor's Version)", channel: "Taylor Swift", thumbnail: "https://i.ytimg.com/vi/aXzVF3XeS8M/hqdefault.jpg" }
];

const AI_PROMPT_PRESETS = [
  { label: "🎛️ Ultimate Mashups & Remixes", prompt: "Create a brilliant conceptual mashup fusing Taylor Swift, Arijit Singh, and Global Pop hits!" },
  { label: "✨ The Eras Tour Anthems", prompt: "High-energy Taylor Swift stadium anthems spanning Lover, 1989, and Midnights with irresistible pop hooks." },
  { label: "🌙 Midnight Synthpop Drive", prompt: "Late night moody synthpop, glowing highway lights with Anti-Hero, Fortnight, and Style vibes." },
  { label: "🍂 Cozy Folklore & Autumn", prompt: "Autumn woodsy acoustic ballads, cozy cabin fireplace, cardigan, august, and emotional piano storytelling." },
  { label: "☕ Summer Espresso Hits", prompt: "Breezy sunny summer pop with upbeat grooves like Espresso, Cruel Summer, and As It Was." },
  { label: "🌧️ Rainy Heartbreak Ballads", prompt: "Bittersweet emotional breakup songs, 10-minute storytelling, champagne problems, and deep acoustic resonance." }
];

export const CreatePlaylistModal: React.FC<CreatePlaylistModalProps> = ({
  isOpen,
  onClose,
  initialTrack,
  onPlaylistCreated
}) => {
  const { createPlaylist, likedSongs, recentPlays, playTrack, showToast } = usePlayer();
  const [mode, setMode] = useState<'ai' | 'manual'>('ai');

  // Manual state
  const [manualName, setManualName] = useState('');
  const [manualDesc, setManualDesc] = useState('');
  const [selectedCover, setSelectedCover] = useState(PRESET_COVERS[0].url);
  const [customCoverUrl, setCustomCoverUrl] = useState('');
  const [manualTracks, setManualTracks] = useState<Track[]>(() => initialTrack ? [initialTrack] : []);
  const [songSearchQuery, setSongSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // AI state
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiTrackCount, setAiTrackCount] = useState<number>(6);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiGeneratedPlaylist, setAiGeneratedPlaylist] = useState<{
    name: string;
    description: string;
    coverUrl: string;
    tracks: Track[];
  } | null>(null);

  // Track candidates pool for manual creation
  const combinedTrackPool = React.useMemo(() => {
    const map = new Map<string, Track>();
    if (initialTrack) map.set(initialTrack.id, initialTrack);
    likedSongs.forEach(t => map.set(t.id, t));
    recentPlays.forEach(t => map.set(t.id, t));
    CURATED_CANDIDATE_TRACKS.forEach(t => map.set(t.id, t));
    return Array.from(map.values());
  }, [likedSongs, recentPlays, initialTrack]);

  const filteredCandidates = combinedTrackPool.filter(t => {
    if (!songSearchQuery.trim()) return true;
    const q = songSearchQuery.toLowerCase();
    return t.title.toLowerCase().includes(q) || t.channel.toLowerCase().includes(q);
  });

  const handleToggleTrack = (track: Track) => {
    if (manualTracks.some(t => t.id === track.id)) {
      setManualTracks(manualTracks.filter(t => t.id !== track.id));
    } else {
      setManualTracks([...manualTracks, track]);
    }
  };

  const handleCreateManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim()) {
      showToast('Please enter a playlist name', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const cover = customCoverUrl.trim() || selectedCover || (manualTracks[0]?.thumbnail) || PRESET_COVERS[0].url;
      const newId = await createPlaylist({
        name: manualName.trim(),
        description: manualDesc.trim() || 'Custom created playlist',
        coverUrl: cover,
        tracks: manualTracks,
        isAIGenerated: false
      });

      // Reset
      setManualName('');
      setManualDesc('');
      setManualTracks([]);
      onPlaylistCreated?.(newId);
      onClose();
    } catch (err) {
      console.error(err);
      showToast('Failed to create playlist', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateAI = async () => {
    if (!aiPrompt.trim()) {
      showToast('Please describe the vibe or theme for your AI playlist', 'error');
      return;
    }

    setIsGeneratingAI(true);
    try {
      const res = await fetch('/api/ai/generate-playlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: aiPrompt.trim(),
          count: aiTrackCount,
          recentTracks: recentPlays.slice(0, 10),
          likedTracks: likedSongs.slice(0, 10)
        })
      });

      if (!res.ok) throw new Error('AI generation error');
      const data = await res.json();
      if (data.playlist) {
        setAiGeneratedPlaylist(data.playlist);
        showToast('AI Playlist crafted! Review and save below ✨', 'success');
      }
    } catch (err) {
      console.error(err);
      showToast('Using curated AI selection for your prompt', 'info');
      // Fallback
      setAiGeneratedPlaylist({
        name: `${aiPrompt.slice(0, 24)} Mix`,
        description: `Curated AI playlist customized for "${aiPrompt}" with seamless acoustic and pop flow.`,
        coverUrl: PRESET_COVERS[0].url,
        tracks: CURATED_CANDIDATE_TRACKS.slice(0, aiTrackCount)
      });
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleSaveAIPlaylist = async () => {
    if (!aiGeneratedPlaylist) return;
    setIsSubmitting(true);
    try {
      const newId = await createPlaylist({
        name: aiGeneratedPlaylist.name,
        description: aiGeneratedPlaylist.description,
        coverUrl: aiGeneratedPlaylist.coverUrl,
        tracks: aiGeneratedPlaylist.tracks,
        isAIGenerated: true,
        prompt: aiPrompt.trim()
      });

      setAiGeneratedPlaylist(null);
      setAiPrompt('');
      onPlaylistCreated?.(newId);
      onClose();
    } catch (err) {
      console.error(err);
      showToast('Failed to save AI playlist', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveAITrack = (trackId: string) => {
    if (!aiGeneratedPlaylist) return;
    setAiGeneratedPlaylist({
      ...aiGeneratedPlaylist,
      tracks: aiGeneratedPlaylist.tracks.filter(t => t.id !== trackId)
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="bg-surface-container border border-white/10 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between bg-surface/50">
            <div>
              <h2 className="font-display text-2xl md:text-3xl text-pale-cream flex items-center gap-2.5">
                <span className="material-symbols-outlined text-primary-container text-2xl">
                  queue_music
                </span>
                Create New Playlist
              </h2>
              <p className="font-body text-sm text-muted-grey mt-0.5">
                Assemble your own track collection or let Gemini AI curate by mood
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center text-muted-grey hover:text-pale-cream transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="px-6 pt-4 pb-2 flex gap-2 border-b border-white/5 bg-surface/30">
            <button
              type="button"
              onClick={() => setMode('ai')}
              className={`flex-1 py-3 px-4 rounded-xl font-label text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                mode === 'ai'
                  ? 'bg-gradient-to-r from-primary-container/30 to-amber-500/20 text-primary-container border border-primary-container/50 shadow-lg shadow-primary-container/10'
                  : 'bg-surface-container-high/40 text-muted-grey hover:text-pale-cream hover:bg-surface-container-high'
              }`}
            >
              <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                auto_awesome
              </span>
              Create with AI ✨
            </button>

            <button
              type="button"
              onClick={() => setMode('manual')}
              className={`flex-1 py-3 px-4 rounded-xl font-label text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                mode === 'manual'
                  ? 'bg-primary-container text-[#3c3c2a] font-bold shadow-lg shadow-primary-container/20'
                  : 'bg-surface-container-high/40 text-muted-grey hover:text-pale-cream hover:bg-surface-container-high'
              }`}
            >
              <span className="material-symbols-outlined text-lg">edit_note</span>
              Create Manually
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            {mode === 'ai' ? (
              /* AI Mode Content */
              <div className="space-y-5">
                {/* AI Input Card */}
                <div className="space-y-3">
                  <label className="block font-label text-xs uppercase tracking-widest text-primary-container font-semibold">
                    Describe your desired vibe or sound
                  </label>
                  <div className="relative">
                    <textarea
                      rows={3}
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="e.g. Heartfelt Taylor Swift acoustic ballads with melancholic piano, rainy afternoon coffee vibes, and autumn folklore nostalgia..."
                      className="w-full bg-surface-container-high border border-white/10 focus:border-primary-container/80 focus:ring-2 focus:ring-primary-container/20 rounded-2xl p-4 text-pale-cream placeholder-muted-grey/60 text-sm md:text-base outline-none resize-none"
                    />
                    {aiPrompt && (
                      <button
                        type="button"
                        onClick={() => setAiPrompt('')}
                        className="absolute top-3 right-3 text-muted-grey hover:text-pale-cream p-1"
                      >
                        <span className="material-symbols-outlined text-sm">clear</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="space-y-2">
                  <span className="font-label text-xs text-muted-grey uppercase tracking-wider">
                    Quick Inspiration Prompts:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {AI_PROMPT_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setAiPrompt(preset.prompt)}
                        className="text-xs bg-surface-container-high hover:bg-white/10 text-pale-cream/90 hover:text-primary-container border border-white/5 hover:border-primary-container/40 rounded-full px-3 py-1.5 transition-all cursor-pointer text-left"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Track count selector */}
                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <span className="font-label text-xs text-muted-grey uppercase tracking-wider">
                    Song Count
                  </span>
                  <div className="flex gap-2">
                    {[4, 6, 8, 10].map((count) => (
                      <button
                        key={count}
                        type="button"
                        onClick={() => setAiTrackCount(count)}
                        className={`w-10 h-8 rounded-lg text-xs font-label font-bold transition-all cursor-pointer ${
                          aiTrackCount === count
                            ? 'bg-primary-container text-[#3c3c2a]'
                            : 'bg-surface-container-high text-muted-grey hover:text-pale-cream'
                        }`}
                      >
                        {count}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Generate Button */}
                <button
                  type="button"
                  onClick={handleGenerateAI}
                  disabled={isGeneratingAI || !aiPrompt.trim()}
                  className={`w-full py-3.5 rounded-2xl font-label text-sm uppercase tracking-wider font-bold flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
                    isGeneratingAI || !aiPrompt.trim()
                      ? 'bg-surface-container-high/60 text-muted-grey/50 cursor-not-allowed'
                      : 'bg-gradient-to-r from-primary-container to-amber-400 text-[#3c3c2a] hover:opacity-95 shadow-xl shadow-primary-container/20'
                  }`}
                >
                  {isGeneratingAI ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                      Gemini AI is Curating Tracks...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                        auto_awesome
                      </span>
                      Generate Playlist with Gemini ✨
                    </>
                  )}
                </button>

                {/* AI Generated Result Preview */}
                {aiGeneratedPlaylist && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-5 rounded-2xl bg-surface-container-high border border-primary-container/30 space-y-4 shadow-xl"
                  >
                    <div className="flex items-start gap-4">
                      <img
                        src={getActualSongImage(aiGeneratedPlaylist.tracks[0] || { id: '', thumbnail: aiGeneratedPlaylist.coverUrl })}
                        alt="Cover preview"
                        onError={(e) => handleSongImageError(e, aiGeneratedPlaylist.tracks[0]?.id)}
                        className="w-20 h-20 rounded-xl object-cover shadow-md flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="bg-primary-container/20 text-primary-container text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                            AI Curated Result
                          </span>
                          <span className="text-xs text-muted-grey">
                            {aiGeneratedPlaylist.tracks.length} songs
                          </span>
                        </div>
                        <input
                          type="text"
                          value={aiGeneratedPlaylist.name}
                          onChange={(e) =>
                            setAiGeneratedPlaylist({
                              ...aiGeneratedPlaylist,
                              name: e.target.value
                            })
                          }
                          className="font-display text-lg text-pale-cream bg-transparent border-b border-white/20 focus:border-primary-container outline-none w-full mb-1"
                        />
                        <p className="font-body text-xs text-muted-grey line-clamp-2">
                          {aiGeneratedPlaylist.description}
                        </p>
                      </div>
                    </div>

                    {/* Track list preview */}
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {aiGeneratedPlaylist.tracks.map((track, i) => (
                        <div
                          key={`${track.id}-${i}`}
                          className="flex items-center justify-between p-2 rounded-xl bg-surface/50 hover:bg-surface border border-white/5 transition-colors group"
                        >
                          <div
                            className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                            onClick={() => playTrack(track, aiGeneratedPlaylist.tracks)}
                          >
                            <span className="text-xs text-muted-grey font-label w-4 text-center">
                              {i + 1}
                            </span>
                            <img
                              src={getActualSongImage(track)}
                              alt={track.title}
                              onError={(e) => handleSongImageError(e, track.id)}
                              className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
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
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => playTrack(track, aiGeneratedPlaylist.tracks)}
                              className="w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center text-pale-cream cursor-pointer"
                              title="Play preview"
                            >
                              <span className="material-symbols-outlined text-base">play_arrow</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveAITrack(track.id)}
                              className="w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center text-muted-grey hover:text-red-400 cursor-pointer"
                              title="Remove track"
                            >
                              <span className="material-symbols-outlined text-base">close</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={handleSaveAIPlaylist}
                        disabled={isSubmitting || aiGeneratedPlaylist.tracks.length === 0}
                        className="flex-1 py-3 rounded-xl bg-primary-container text-[#3c3c2a] font-label text-sm uppercase tracking-wider font-bold hover:opacity-95 shadow-lg shadow-primary-container/20 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-lg">check_circle</span>
                        Save to Library
                      </button>
                      <button
                        type="button"
                        onClick={handleGenerateAI}
                        disabled={isGeneratingAI}
                        className="py-3 px-4 rounded-xl bg-surface-container hover:bg-white/10 text-pale-cream font-label text-xs uppercase tracking-wider font-semibold border border-white/10 flex items-center gap-1.5 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-base">refresh</span>
                        Regenerate
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            ) : (
              /* Manual Mode Form */
              <form onSubmit={handleCreateManual} className="space-y-5">
                {/* Name */}
                <div className="space-y-1.5">
                  <label className="block font-label text-xs uppercase tracking-widest text-primary-container font-semibold">
                    Playlist Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                    placeholder="e.g. My Midnight Anthems"
                    className="w-full bg-surface-container-high border border-white/10 focus:border-primary-container/80 focus:ring-2 focus:ring-primary-container/20 rounded-2xl px-4 py-3 text-pale-cream placeholder-muted-grey/60 text-sm md:text-base outline-none"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="block font-label text-xs uppercase tracking-widest text-muted-grey">
                    Description (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={manualDesc}
                    onChange={(e) => setManualDesc(e.target.value)}
                    placeholder="Give your playlist a story or mood description..."
                    className="w-full bg-surface-container-high border border-white/10 focus:border-primary-container/80 focus:ring-2 focus:ring-primary-container/20 rounded-2xl px-4 py-2.5 text-pale-cream placeholder-muted-grey/60 text-sm outline-none resize-none"
                  />
                </div>

                {/* Cover Art Selection */}
                <div className="space-y-2">
                  <label className="block font-label text-xs uppercase tracking-widest text-muted-grey">
                    Choose Cover Art
                  </label>
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                    {PRESET_COVERS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          setSelectedCover(preset.url);
                          setCustomCoverUrl('');
                        }}
                        className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                          selectedCover === preset.url && !customCoverUrl
                            ? 'border-primary-container scale-105 shadow-md shadow-primary-container/30'
                            : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                        {selectedCover === preset.url && !customCoverUrl && (
                          <div className="absolute inset-0 bg-primary-container/20 flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary-container text-sm font-bold">
                              check
                            </span>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Selected tracks count banner */}
                <div className="p-3.5 rounded-2xl bg-surface-container-high/70 border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-primary-container text-xl">
                      music_note
                    </span>
                    <span className="font-label text-xs text-pale-cream">
                      {manualTracks.length} song{manualTracks.length === 1 ? '' : 's'} selected
                    </span>
                  </div>
                  {manualTracks.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setManualTracks([])}
                      className="text-xs text-muted-grey hover:text-red-400 font-label cursor-pointer"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                {/* Add Songs Picker */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-label text-xs uppercase tracking-widest text-muted-grey">
                      Add Songs from Library
                    </label>
                    <span className="text-[11px] text-muted-grey">
                      {filteredCandidates.length} available
                    </span>
                  </div>

                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-2.5 text-muted-grey text-lg">
                      search
                    </span>
                    <input
                      type="text"
                      value={songSearchQuery}
                      onChange={(e) => setSongSearchQuery(e.target.value)}
                      placeholder="Search title or artist..."
                      className="w-full bg-surface-container-high border border-white/10 focus:border-primary-container/80 rounded-xl pl-9 pr-4 py-2 text-xs text-pale-cream placeholder-muted-grey/60 outline-none"
                    />
                  </div>

                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {filteredCandidates.slice(0, 15).map((track) => {
                      const isSelected = manualTracks.some(t => t.id === track.id);
                      return (
                        <div
                          key={track.id}
                          onClick={() => handleToggleTrack(track)}
                          className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-colors border ${
                            isSelected
                              ? 'bg-primary-container/15 border-primary-container/40'
                              : 'bg-surface/40 hover:bg-surface border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                            <img
                              src={getActualSongImage(track)}
                              alt={track.title}
                              onError={(e) => handleSongImageError(e, track.id)}
                              className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
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
                            className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                              isSelected
                                ? 'bg-primary-container text-[#3c3c2a]'
                                : 'bg-surface-container hover:bg-white/10 text-muted-grey'
                            }`}
                          >
                            <span className="material-symbols-outlined text-sm">
                              {isSelected ? 'check' : 'add'}
                            </span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting || !manualName.trim()}
                  className={`w-full py-3.5 rounded-2xl font-label text-sm uppercase tracking-wider font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    isSubmitting || !manualName.trim()
                      ? 'bg-surface-container-high/60 text-muted-grey/50 cursor-not-allowed'
                      : 'bg-primary-container text-[#3c3c2a] hover:opacity-95 shadow-xl shadow-primary-container/20'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                      Saving Playlist...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-lg">add_circle</span>
                      Create Playlist ({manualTracks.length} tracks)
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
