import React, { useState } from 'react';
import { Cassette, Track } from '../types';
import { usePlayer } from '../context/PlayerContext';
import { CassetteTape } from './CassetteTape';

interface CreateCassetteModalProps {
  isOpen: boolean;
  onClose: () => void;
  editCassette?: Cassette | null;
}

const COLOR_THEMES: { id: Cassette['themeColor']; label: string; bg: string }[] = [
  { id: 'rose', label: 'Vintage Rose', bg: 'bg-rose-500' },
  { id: 'violet', label: 'Twilight Violet', bg: 'bg-purple-500' },
  { id: 'gold', label: 'Golden Hour', bg: 'bg-amber-500' },
  { id: 'mint', label: 'Retro Mint', bg: 'bg-emerald-500' },
  { id: 'cherry', label: 'Cherry Scarlet', bg: 'bg-red-500' },
  { id: 'midnight', label: 'Midnight Blue', bg: 'bg-blue-600' },
];

const STICKER_PRESETS = [
  '❤️ Forever & Always',
  '💌 Sealed with Love',
  '🌙 You are My Moonlight',
  '☕ Warmest Hugs',
  '✨ Soulmate',
  '🌟 My Favorite Human',
  '💐 Thinking of You',
  '♾️ In Every Lifetime'
];

const SUGGESTED_TRACKS: Track[] = [
  { id: 'ic8j13piAhQ', title: 'Cruel Summer', channel: 'Taylor Swift', thumbnail: 'https://i.ytimg.com/vi/ic8j13piAhQ/hqdefault.jpg' },
  { id: '-BjZmE2gtdo', title: 'Lover', channel: 'Taylor Swift', thumbnail: 'https://i.ytimg.com/vi/-BjZmE2gtdo/hqdefault.jpg' },
  { id: 'K-a8s8OLBSE', title: 'cardigan', channel: 'Taylor Swift', thumbnail: 'https://i.ytimg.com/vi/K-a8s8OLBSE/hqdefault.jpg' },
  { id: 'UEvOsQBu1jY', title: 'Apna Bana Le', channel: 'Arijit Singh', thumbnail: 'https://i.ytimg.com/vi/UEvOsQBu1jY/hqdefault.jpg' },
  { id: 'V1Z586zoeeE', title: 'As It Was', channel: 'Harry Styles', thumbnail: 'https://i.ytimg.com/vi/V1Z586zoeeE/hqdefault.jpg' },
  { id: 'JGwWNGJdvx8', title: 'Shape of You', channel: 'Ed Sheeran', thumbnail: 'https://i.ytimg.com/vi/JGwWNGJdvx8/hqdefault.jpg' },
  { id: 'tollGa3S0o8', title: 'All Too Well (10 Minute Version)', channel: 'Taylor Swift', thumbnail: 'https://i.ytimg.com/vi/tollGa3S0o8/hqdefault.jpg' },
  { id: '2Vv-BfVoq4g', title: 'Perfect', channel: 'Ed Sheeran', thumbnail: 'https://i.ytimg.com/vi/2Vv-BfVoq4g/hqdefault.jpg' },
];

export const CreateCassetteModal: React.FC<CreateCassetteModalProps> = ({
  isOpen,
  onClose,
  editCassette,
}) => {
  const { likedSongs, recentPlays, generatedTracks, createCassette, updateCassette, showToast } = usePlayer();

  const [title, setTitle] = useState(editCassette?.title || '');
  const [recipientName, setRecipientName] = useState(editCassette?.recipientName || '');
  const [senderName, setSenderName] = useState(editCassette?.senderName || '');
  const [note, setNote] = useState(editCassette?.note || '');
  const [themeColor, setThemeColor] = useState<Cassette['themeColor']>(editCassette?.themeColor || 'rose');
  const [sticker, setSticker] = useState(editCassette?.sticker || '❤️ Forever & Always');
  const [selectedTracks, setSelectedTracks] = useState<Track[]>(editCassette?.tracks || []);
  const [tone, setTone] = useState<'romantic' | 'sweet' | 'playful' | 'nostalgic'>('romantic');

  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'details' | 'songs' | 'note'>('details');

  if (!isOpen) return null;

  const handleAddTrack = (track: Track) => {
    if (selectedTracks.some((t) => t.id === track.id)) {
      showToast('Track already added to this tape', 'info');
      return;
    }
    setSelectedTracks((prev) => [...prev, track]);
    showToast(`Added "${track.title}" to cassette 📼`, 'success');
  };

  const handleRemoveTrack = (trackId: string) => {
    setSelectedTracks((prev) => prev.filter((t) => t.id !== trackId));
  };

  const handleAIAssist = async () => {
    setIsGeneratingAI(true);
    try {
      const response = await fetch('/api/ai/cassette-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientName: recipientName.trim() || 'My Loved One',
          senderName: senderName.trim() || 'Me',
          tone,
          songTitles: selectedTracks.map((t) => t.title),
          customPrompt: note
        })
      });
      const data = await response.json();
      if (data.note) {
        setNote(data.note);
      }
      if (data.suggestedTitle && !title) {
        setTitle(data.suggestedTitle);
      }
      if (data.sticker) {
        setSticker(data.sticker);
      }
      showToast('AI crafted a personalized love note! ✨💌', 'success');
    } catch {
      showToast('Generated warm note template', 'info');
      if (!note) {
        setNote(
          `Every song on this mixtape was chosen with you in mind. Whenever you hear these tracks, remember that someone is thinking of you and sending warm hugs.`
        );
      }
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!recipientName.trim()) {
      showToast('Please enter the recipient name', 'error');
      setActiveTab('details');
      return;
    }

    if (selectedTracks.length === 0) {
      showToast('Please add at least 1 song to your cassette tape', 'error');
      setActiveTab('songs');
      return;
    }

    const finalTitle = title.trim() || `Mixtape for ${recipientName.trim()}`;
    const finalSender = senderName.trim() || 'Someone who cares';
    const finalNote = note.trim() || `A collection of songs chosen just for you with love.`;

    if (editCassette) {
      await updateCassette(editCassette.id, {
        title: finalTitle,
        recipientName: recipientName.trim(),
        senderName: finalSender,
        note: finalNote,
        themeColor,
        sticker,
        tracks: selectedTracks
      });
    } else {
      await createCassette({
        title: finalTitle,
        recipientName: recipientName.trim(),
        senderName: finalSender,
        note: finalNote,
        themeColor,
        sticker,
        tracks: selectedTracks
      });
    }

    onClose();
  };

  // Preview Cassette Object
  const previewCassette: Cassette = {
    id: 'preview',
    title: title.trim() || `Mixtape for ${recipientName || 'Loved One'}`,
    recipientName: recipientName.trim() || 'My Love',
    senderName: senderName.trim() || 'Me',
    note: note.trim() || 'A handwritten note for someone special...',
    themeColor,
    sticker,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    tracks: selectedTracks
  };

  // Filter songs for search
  const allAvailableSongs: Track[] = [
    ...(generatedTracks || []),
    ...likedSongs,
    ...recentPlays,
    ...SUGGESTED_TRACKS
  ].filter(
    (item, index, self) => index === self.findIndex((t) => t.id === item.id)
  );

  const filteredSongs = searchQuery.trim()
    ? allAvailableSongs.filter(
        (t) =>
          t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.channel.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allAvailableSongs;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col bg-surface-container rounded-3xl border border-white/10 shadow-2xl overflow-hidden my-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between p-5 md:p-6 border-b border-white/5 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-xl">
              📼
            </div>
            <div>
              <h2 className="font-display text-lg sm:text-xl text-pale-cream">
                {editCassette ? 'Edit Cassette Mixtape' : 'Craft a Custom Cassette for Loved Ones'}
              </h2>
              <p className="text-xs text-muted-grey">
                Create a vintage personalized tape with songs and a heartfelt handwritten note
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-muted-grey hover:text-white transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Step Navigation Tabs */}
        <div className="flex border-b border-white/5 px-6 pt-2 gap-4 bg-surface-container-lowest/50 flex-shrink-0">
          <button
            onClick={() => setActiveTab('details')}
            className={`pb-3 text-xs font-semibold tracking-wide transition-colors border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'details'
                ? 'border-primary-container text-primary-container'
                : 'border-transparent text-muted-grey hover:text-pale-cream'
            }`}
          >
            <span className="material-symbols-outlined text-sm">palette</span>
            <span>1. Tape & Recipient</span>
          </button>
          <button
            onClick={() => setActiveTab('songs')}
            className={`pb-3 text-xs font-semibold tracking-wide transition-colors border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'songs'
                ? 'border-primary-container text-primary-container'
                : 'border-transparent text-muted-grey hover:text-pale-cream'
            }`}
          >
            <span className="material-symbols-outlined text-sm">queue_music</span>
            <span>2. Song Selection ({selectedTracks.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('note')}
            className={`pb-3 text-xs font-semibold tracking-wide transition-colors border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'note'
                ? 'border-primary-container text-primary-container'
                : 'border-transparent text-muted-grey hover:text-pale-cream'
            }`}
          >
            <span className="material-symbols-outlined text-sm">history_edu</span>
            <span>3. Heartfelt Note 💌</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-6">
          {/* TAB 1: DETAILS & CASSETTE LOOK */}
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Live Preview */}
              <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-black/40 border border-white/5">
                <span className="text-[11px] uppercase tracking-wider text-muted-grey font-mono mb-3">
                  Live Cassette Shell Preview
                </span>
                <CassetteTape cassette={previewCassette} isPlaying={false} />
              </div>

              {/* Form inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-pale-cream block mb-1.5">
                    For (Recipient Name) *
                  </label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="e.g. Sophia, Mom, Aarav, Best Friend"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-high border border-white/10 text-sm text-pale-cream placeholder-muted-grey/60 focus:outline-hidden focus:border-primary-container"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-pale-cream block mb-1.5">
                    From (Your Name / Sign-off)
                  </label>
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="e.g. Yours Always, Alex, With Love"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-high border border-white/10 text-sm text-pale-cream placeholder-muted-grey/60 focus:outline-hidden focus:border-primary-container"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-pale-cream block mb-1.5">
                    Cassette Mixtape Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Our Midnight Drives 🌙, Songs That Sound Like You, Coffee & Hugs"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-high border border-white/10 text-sm text-pale-cream placeholder-muted-grey/60 focus:outline-hidden focus:border-primary-container"
                  />
                </div>
              </div>

              {/* Theme Color Picker */}
              <div>
                <label className="text-xs font-semibold text-pale-cream block mb-2">
                  Vintage Tape Shell Color
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {COLOR_THEMES.map((theme) => (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => setThemeColor(theme.id)}
                      className={`flex flex-col items-center p-2.5 rounded-xl border transition-all cursor-pointer ${
                        themeColor === theme.id
                          ? 'border-primary-container bg-primary-container/15 ring-2 ring-primary-container/30'
                          : 'border-white/5 bg-surface-container-high/50 hover:bg-surface-container-high'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full ${theme.bg} shadow-md mb-1.5`} />
                      <span className="text-[11px] font-medium text-pale-cream">{theme.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sticker / Stamp Badge */}
              <div>
                <label className="text-xs font-semibold text-pale-cream block mb-2">
                  Cassette Sticker Badge
                </label>
                <div className="flex flex-wrap gap-2">
                  {STICKER_PRESETS.map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setSticker(st)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                        sticker === st
                          ? 'bg-rose-500/20 border-rose-400 text-rose-300 font-semibold'
                          : 'bg-surface-container-high/60 border-white/5 text-muted-grey hover:text-pale-cream'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SONG SELECTION */}
          {activeTab === 'songs' && (
            <div className="space-y-6">
              {/* Currently Selected Songs */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-pale-cream uppercase tracking-wider font-mono">
                    Tape Tracklist ({selectedTracks.length} Songs on Cassette)
                  </label>
                  {selectedTracks.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedTracks([])}
                      className="text-xs text-rose-400 hover:underline cursor-pointer"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                {selectedTracks.length === 0 ? (
                  <div className="p-6 rounded-2xl border border-dashed border-white/10 text-center bg-surface-container-lowest/50">
                    <span className="material-symbols-outlined text-3xl text-muted-grey/60 mb-2">
                      playlist_add
                    </span>
                    <p className="text-xs text-muted-grey">No songs added yet.</p>
                    <p className="text-[11px] text-muted-grey/60 mt-1">
                      Choose from your favorite tunes or the curated songs below.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {selectedTracks.map((track, idx) => (
                      <div
                        key={track.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container-high/70 border border-white/5 group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-xs font-mono font-bold text-muted-grey w-5 text-center">
                            {idx + 1}
                          </span>
                          <img
                            src={track.thumbnail}
                            alt=""
                            className="w-9 h-9 rounded-lg object-cover border border-white/10"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-pale-cream truncate">
                              {track.title}
                            </p>
                            <p className="text-[11px] text-muted-grey truncate">{track.channel}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveTrack(track.id)}
                          className="w-7 h-7 rounded-lg text-muted-grey hover:text-rose-400 hover:bg-rose-500/10 flex items-center justify-center transition-colors cursor-pointer"
                          title="Remove track"
                        >
                          <span className="material-symbols-outlined text-base">close</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add Songs Search & Suggestions */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-pale-cream">
                    Add Songs to Cassette
                  </label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search songs..."
                    className="px-2.5 py-1 rounded-lg bg-surface-container-high border border-white/10 text-xs text-pale-cream placeholder-muted-grey/60 focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
                  {filteredSongs.map((track) => {
                    const isAdded = selectedTracks.some((t) => t.id === track.id);
                    return (
                      <div
                        key={track.id}
                        className={`flex items-center justify-between p-2 rounded-xl border transition-all ${
                          isAdded
                            ? 'bg-primary-container/10 border-primary-container/30'
                            : 'bg-surface-container-high/40 border-white/5 hover:bg-surface-container-high'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={track.thumbnail}
                            alt=""
                            className="w-8 h-8 rounded-md object-cover border border-white/10 flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-pale-cream truncate">
                              {track.title}
                            </p>
                            <p className="text-[10px] text-muted-grey truncate">{track.channel}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => (isAdded ? handleRemoveTrack(track.id) : handleAddTrack(track))}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex-shrink-0 ${
                            isAdded
                              ? 'bg-white/10 text-primary-container'
                              : 'bg-primary-container text-on-primary-container hover:opacity-90 active:scale-95'
                          }`}
                        >
                          {isAdded ? 'Added ✓' : '+ Add'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: WRITE NOTE & AI ASSISTANT */}
          {activeTab === 'note' && (
            <div className="space-y-5">
              {/* AI Generator Helper Bar */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-transparent border border-pink-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-lg">
                    ✨
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-pale-cream">
                      AI Love Letter & Heartfelt Note Assistant
                    </h4>
                    <p className="text-[11px] text-muted-grey">
                      Craft a touching, customized message matching your songs & tone
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value as any)}
                    className="px-2 py-1.5 rounded-lg bg-surface-container border border-white/10 text-xs text-pale-cream focus:outline-hidden"
                  >
                    <option value="romantic">Romantic & Deep ❤️</option>
                    <option value="sweet">Sweet & Gentle 🌸</option>
                    <option value="playful">Cute & Playful 🧸</option>
                    <option value="nostalgic">Nostalgic & Warm 🌙</option>
                  </select>

                  <button
                    type="button"
                    onClick={handleAIAssist}
                    disabled={isGeneratingAI}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-500 hover:bg-pink-600 active:scale-95 text-white font-semibold text-xs transition-all shadow-md cursor-pointer disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-sm">
                      {isGeneratingAI ? 'autorenew' : 'auto_fix_high'}
                    </span>
                    <span>{isGeneratingAI ? 'Writing...' : 'Write for Me'}</span>
                  </button>
                </div>
              </div>

              {/* Note Textarea styled like stationery */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-pale-cream">
                    Your Personal Note on the Cassette Letter
                  </label>
                  <span className="text-[11px] text-muted-grey font-mono">
                    {note.length} characters
                  </span>
                </div>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={5}
                  placeholder={`Write your heartfelt note here... (e.g., "To my favorite person, every song here carries a memory of our spontaneous road trips and late night conversations. Press play whenever you miss me!")`}
                  className="w-full p-4 rounded-2xl bg-[#faf5ec] text-[#2c2621] font-serif text-sm leading-relaxed border border-[#ded2be] focus:outline-hidden focus:ring-2 focus:ring-rose-400 placeholder-[#9c8a74]/70 shadow-inner"
                />
              </div>

              {/* Stationery Letter Preview Box */}
              <div className="p-4 rounded-xl bg-[#faf5ec]/90 text-[#3b2b1d] border border-[#ded2be] font-serif">
                <div className="text-xs italic text-[#8c7b66] mb-1">
                  Preview on letter paper:
                </div>
                <div className="font-bold text-sm">Dearest {recipientName || '[Recipient]'},</div>
                <div className="text-xs italic mt-1 leading-relaxed text-[#2b221a]">
                  "{note || 'Your note will be beautifully displayed on vintage stationery here...'}"
                </div>
                <div className="text-xs font-bold text-right mt-2">
                  — {senderName || '[Your Name]'}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-t border-white/5 bg-surface-container-lowest/70 flex-shrink-0">
          <div className="flex items-center gap-2">
            {activeTab !== 'details' && (
              <button
                type="button"
                onClick={() => setActiveTab(activeTab === 'note' ? 'songs' : 'details')}
                className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium text-pale-cream transition-colors cursor-pointer"
              >
                Back
              </button>
            )}
            {activeTab !== 'note' && (
              <button
                type="button"
                onClick={() => setActiveTab(activeTab === 'details' ? 'songs' : 'note')}
                className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium text-pale-cream transition-colors cursor-pointer"
              >
                Next Step →
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium text-muted-grey hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-primary-container text-on-primary-container hover:opacity-95 active:scale-95 text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">album</span>
              <span>{editCassette ? 'Save Changes' : 'Create & Seal Tape 📼'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
