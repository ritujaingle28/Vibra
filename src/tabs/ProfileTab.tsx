import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { auth } from '../lib/firebase';
import { signOut, updateProfile } from 'firebase/auth';
import { usePlayer, Track, UserPlaylist } from '../context/PlayerContext';
import { CreatePlaylistModal } from '../components/CreatePlaylistModal';
import { getActualSongImage, handleSongImageError } from '../lib/songImage';
import { InstagramAvatarCustomizer, AvatarConfig, INSTAGRAM_PRESETS } from '../components/InstagramAvatarCustomizer';
import { QuickAvatarSelectionBar } from '../components/QuickAvatarSelectionBar';
import { AdminLoginsModal } from '../components/AdminLoginsModal';
import { isAuthorizedAdmin } from '../lib/loginAudit';

interface ProfileTabProps {
  avatarUrl: string;
  onAvatarChange: (url: string) => void;
  onNavigate: (tab: string) => void;
  isLoggedIn?: boolean;
}

interface CuratedProfilePlaylist {
  id: string;
  title: string;
  era: string;
  description: string;
  img: string;
  accentColor: string;
  tracks: Track[];
}

export const ProfileTab = ({ avatarUrl, onAvatarChange, onNavigate, isLoggedIn }: ProfileTabProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    likedSongs,
    recentPlays,
    playlists,
    playTrack,
    currentTrack,
    isPlaying,
    isLiked,
    toggleLike,
    shareTrack,
    deletePlaylist,
    showToast
  } = usePlayer();

  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [isSavingName, setIsSavingName] = useState(false);
  const [activeSection, setActiveSection] = useState<'overview' | 'playlists' | 'settings'>('overview');
  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState(false);
  const [isAdminLoginsModalOpen, setIsAdminLoginsModalOpen] = useState(false);

  // Local settings state
  const [audioQuality, setAudioQuality] = useState(() => localStorage.getItem('beatz_audio_quality') || 'High (320 kbps)');
  const [visualizerMode, setVisualizerMode] = useState(() => localStorage.getItem('beatz_visualizer_mode') || 'Neon Glow');
  const [smartAIDJ, setSmartAIDJ] = useState(() => localStorage.getItem('beatz_smart_ai_dj') !== 'false');

  useEffect(() => {
    if (auth.currentUser) {
      const name = auth.currentUser.displayName || auth.currentUser.email?.split('@')[0] || 'Vibe Listener';
      setUserName(name);
      setEditedName(name);
      setUserEmail(auth.currentUser.email || 'Authenticated Swiftie');
    } else {
      setUserName('Guest Listener');
      setEditedName('Guest Listener');
      setUserEmail('Exploring in Guest Mode');
    }
  }, [isLoggedIn]);

  // Curated playable playlists for Swifties & Pop lovers
  const profilePlaylists: CuratedProfilePlaylist[] = [
    {
      id: 'pl-eras',
      title: 'The Eras Collection',
      era: "Taylor's Version",
      description: 'Cruel Summer, Anti-Hero, Style & Blank Space essential anthems',
      img: 'https://i.ytimg.com/vi/ic8j13piAhQ/hqdefault.jpg',
      accentColor: 'text-primary-container border-primary-container/40',
      tracks: [
        { id: 'ic8j13piAhQ', title: 'Cruel Summer', channel: 'Taylor Swift', thumbnail: 'https://i.ytimg.com/vi/ic8j13piAhQ/hqdefault.jpg' },
        { id: 'b1kbLwvqugk', title: 'Anti-Hero', channel: 'Taylor Swift', thumbnail: 'https://i.ytimg.com/vi/b1kbLwvqugk/hqdefault.jpg' },
        { id: '-CmadmM5cOk', title: 'Style (Taylor\'s Version)', channel: 'Taylor Swift', thumbnail: 'https://i.ytimg.com/vi/-CmadmM5cOk/hqdefault.jpg' },
        { id: 'e-ORhEE9VVg', title: 'Blank Space', channel: 'Taylor Swift', thumbnail: 'https://i.ytimg.com/vi/e-ORhEE9VVg/hqdefault.jpg' }
      ]
    },
    {
      id: 'pl-folklore',
      title: 'Folklore & Cozy Cabin',
      era: 'Acoustic Woodsy Ballads',
      description: 'cardigan, august, and All Too Well 10min nostalgic story sessions',
      img: 'https://i.ytimg.com/vi/K-a8s8OLBSE/hqdefault.jpg',
      accentColor: 'text-pastel-mint border-pastel-mint/40',
      tracks: [
        { id: 'K-a8s8OLBSE', title: 'cardigan', channel: 'Taylor Swift', thumbnail: 'https://i.ytimg.com/vi/K-a8s8OLBSE/hqdefault.jpg' },
        { id: 'nn_0zPAfyo8', title: 'august', channel: 'Taylor Swift', thumbnail: 'https://i.ytimg.com/vi/nn_0zPAfyo8/hqdefault.jpg' },
        { id: 'tollGa3S0o8', title: 'All Too Well (10 Minute Version)', channel: 'Taylor Swift', thumbnail: 'https://i.ytimg.com/vi/tollGa3S0o8/hqdefault.jpg' }
      ]
    },
    {
      id: 'pl-midnights',
      title: 'Midnights 3 AM Synth',
      era: 'Late Night Synthpop',
      description: 'Anti-Hero, Fortnight, Karma & As It Was late night glow',
      img: 'https://i.ytimg.com/vi/b1kbLwvqugk/hqdefault.jpg',
      accentColor: 'text-pastel-lavender border-pastel-lavender/40',
      tracks: [
        { id: 'b1kbLwvqugk', title: 'Anti-Hero', channel: 'Taylor Swift', thumbnail: 'https://i.ytimg.com/vi/b1kbLwvqugk/hqdefault.jpg' },
        { id: 'q3zqJs7JUCQ', title: 'Fortnight (feat. Post Malone)', channel: 'Taylor Swift', thumbnail: 'https://i.ytimg.com/vi/q3zqJs7JUCQ/hqdefault.jpg' },
        { id: 'b7QlX3yR2xs', title: 'Karma', channel: 'Taylor Swift', thumbnail: 'https://i.ytimg.com/vi/b7QlX3yR2xs/hqdefault.jpg' },
        { id: 'V1Z586zoeeE', title: 'As It Was', channel: 'Harry Styles', thumbnail: 'https://i.ytimg.com/vi/V1Z586zoeeE/hqdefault.jpg' }
      ]
    },
    {
      id: 'pl-lover',
      title: 'Lover & Sunny Pop',
      era: 'Pastel Romance',
      description: 'Lover, Cruel Summer & Espresso breezy hooks and upbeat energy',
      img: 'https://i.ytimg.com/vi/-BjZmE2gtdo/hqdefault.jpg',
      accentColor: 'text-pink-300 border-pink-400/40',
      tracks: [
        { id: '-BjZmE2gtdo', title: 'Lover', channel: 'Taylor Swift', thumbnail: 'https://i.ytimg.com/vi/-BjZmE2gtdo/hqdefault.jpg' },
        { id: 'ic8j13piAhQ', title: 'Cruel Summer', channel: 'Taylor Swift', thumbnail: 'https://i.ytimg.com/vi/ic8j13piAhQ/hqdefault.jpg' },
        { id: 'eVli-tstM5E', title: 'Espresso', channel: 'Sabrina Carpenter', thumbnail: 'https://i.ytimg.com/vi/eVli-tstM5E/hqdefault.jpg' }
      ]
    }
  ];

  const [isPresetModalOpen, setIsPresetModalOpen] = useState(false);
  const [isInstagramCustomizerOpen, setIsInstagramCustomizerOpen] = useState(false);
  const [customizerInitialConfig, setCustomizerInitialConfig] = useState<AvatarConfig | undefined>(undefined);
  const [presetModalTab, setPresetModalTab] = useState<'instagram' | 'photos'>('instagram');
  const [customAvatars, setCustomAvatars] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('beatz_custom_instagram_avatars');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleCustomAvatarSave = async (newUrl: string) => {
    onAvatarChange(newUrl);
    setCustomAvatars((prev) => {
      const updated = [newUrl, ...prev.filter((u) => u !== newUrl)].slice(0, 8);
      try {
        localStorage.setItem('beatz_custom_instagram_avatars', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    if (auth.currentUser) {
      try {
        await updateProfile(auth.currentUser, { photoURL: newUrl });
      } catch (err) {
        console.warn('Could not update Firebase profile avatar:', err);
      }
    }
    showToast('Custom Instagram avatar created & saved! ✨', 'success');
  };

  const presetAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80'
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          onAvatarChange(result);
          showToast('Profile photo saved permanently! 📸', 'success');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveName = async () => {
    if (!editedName.trim()) return;
    setIsSavingName(true);
    try {
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: editedName.trim() });
      }
      setUserName(editedName.trim());
      setIsEditingName(false);
      showToast('Display name updated ✨', 'success');
    } catch (err) {
      console.error('Failed to update name:', err);
      showToast('Could not save name. Try again.', 'error');
    } finally {
      setIsSavingName(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      showToast('Logged out successfully. See you soon! 👋', 'info');
      onNavigate('home');
    } catch (error) {
      console.error('Failed to log out', error);
      showToast('Error logging out', 'error');
    }
  };

  const handlePlayPlaylist = (playlist: CuratedProfilePlaylist) => {
    if (playlist.tracks.length > 0) {
      playTrack(playlist.tracks[0], playlist.tracks);
      showToast(`Playing ${playlist.title} (${playlist.tracks.length} tracks) 🎵`, 'success');
    }
  };

  const handlePlayUserPlaylist = (pl: UserPlaylist, shuffle = false) => {
    if (!pl.tracks || pl.tracks.length === 0) {
      showToast('This playlist is empty. Add some tracks first!', 'info');
      return;
    }
    const tracksToPlay = shuffle ? [...pl.tracks].sort(() => Math.random() - 0.5) : pl.tracks;
    playTrack(tracksToPlay[0], tracksToPlay);
    showToast(`Playing "${pl.name}" ${shuffle ? '(Shuffled)' : ''} 🎶`, 'success');
  };



  return (
    <div className="pb-40 md:pb-16 min-h-screen">
      {/* Banner & Visual Header */}
      <div className="relative h-60 md:h-72 w-full overflow-hidden bg-gradient-to-r from-purple-950/80 via-pink-950/60 to-surface-dim">
        <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent z-10"></div>
        <img
          src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1600&q=80"
          alt="Profile Banner"
          className="w-full h-full object-cover opacity-40 mix-blend-overlay"
        />
        <div className="absolute top-6 left-6 md:left-12 z-20 flex items-center gap-3">
          <button
            onClick={() => onNavigate('home')}
            className="w-10 h-10 rounded-full bg-surface-container/60 hover:bg-surface-container text-pale-cream flex items-center justify-center backdrop-blur-md transition-colors border border-white/10"
            title="Back to Home"
          >
            <span className="material-symbols-outlined text-xl">arrow_back</span>
          </button>
          <span className="font-mono text-xs text-pale-cream/80 bg-black/40 px-3 py-1 rounded-full backdrop-blur-md uppercase tracking-widest border border-white/10">
            Vibra Profile Hub
          </span>
        </div>
      </div>

      {/* Main Profile Canvas */}
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 md:px-12 relative z-20 -mt-20 md:-mt-24 overflow-x-hidden">
        {/* User Identity Card */}
        <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8 mb-8 w-full min-w-0">
          {/* Avatar with dynamic change hover */}
          <div className="relative group">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-36 h-36 md:w-44 md:h-44 rounded-full overflow-hidden border-4 border-primary-container shadow-2xl shadow-primary-container/20 relative cursor-pointer group bg-surface-container-high"
              onClick={() => fileInputRef.current?.click()}
            >
              <img
                src={avatarUrl}
                alt="Profile"
                className="w-full h-full object-cover group-hover:opacity-40 transition-opacity duration-300"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/50">
                <span className="material-symbols-outlined text-pale-cream text-3xl mb-1">photo_camera</span>
                <span className="font-label text-[10px] text-pale-cream font-bold tracking-widest uppercase">Upload Photo</span>
              </div>
            </motion.div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
            <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1 rounded-full bg-surface-container-high hover:bg-surface-container text-pale-cream text-xs font-label uppercase tracking-wider transition-colors border border-white/10 flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">photo_camera</span>
                Upload
              </button>
              <button
                onClick={() => setIsInstagramCustomizerOpen(true)}
                className="px-3 py-1 rounded-full bg-gradient-to-r from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white text-xs font-label uppercase tracking-wider font-bold transition-all shadow-md shadow-pink-500/20 hover:opacity-95 active:scale-95 flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">auto_fix_high</span>
                Customize (Instagram)
              </button>
              <button
                onClick={() => setIsPresetModalOpen(true)}
                className="px-3 py-1 rounded-full bg-primary-container/20 hover:bg-primary-container/30 text-primary-container text-xs font-label uppercase tracking-wider transition-colors border border-primary-container/30 flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">palette</span>
                Presets
              </button>
            </div>
          </div>

          {/* Preset Avatars Modal */}
          {isPresetModalOpen && (
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-surface-container-high border border-white/10 rounded-3xl p-6 max-w-lg w-full shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] flex items-center justify-center text-white">
                      <span className="material-symbols-outlined text-base">face</span>
                    </div>
                    <div>
                      <h3 className="font-display text-lg text-pale-cream">Choose Preset Avatar</h3>
                      <p className="text-[11px] text-muted-grey font-body">Select or customise an aesthetic avatar</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsPresetModalOpen(false)}
                    className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-muted-grey hover:text-pale-cream transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                {/* Tab Switcher: Instagram Avatars vs Aesthetic Photos */}
                <div className="flex items-center gap-2 mb-4 p-1 bg-surface-container rounded-2xl border border-white/5">
                  <button
                    type="button"
                    onClick={() => setPresetModalTab('instagram')}
                    className={`flex-1 py-1.5 rounded-xl font-label text-xs uppercase font-bold tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      presetModalTab === 'instagram'
                        ? 'bg-gradient-to-r from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white shadow-md'
                        : 'text-muted-grey hover:text-pale-cream'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">auto_awesome</span>
                    <span>Instagram Avatars</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPresetModalTab('photos')}
                    className={`flex-1 py-1.5 rounded-xl font-label text-xs uppercase font-bold tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      presetModalTab === 'photos'
                        ? 'bg-primary-container text-on-primary-container shadow-md'
                        : 'text-muted-grey hover:text-pale-cream'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">photo_camera</span>
                    <span>Studio Photos</span>
                  </button>
                </div>

                {/* Instagram Avatars Grid */}
                {presetModalTab === 'instagram' ? (
                  <div className="grid grid-cols-4 gap-3 mb-6 max-h-64 overflow-y-auto pr-1">
                    {INSTAGRAM_PRESETS.map((preset) => (
                      <div
                        key={preset.id}
                        className="group relative flex flex-col items-center p-2 rounded-2xl bg-surface-container/60 hover:bg-surface-container border border-white/5 hover:border-pink-500/40 transition-all cursor-pointer"
                        onClick={() => {
                          onAvatarChange(preset.svgUrl);
                          setIsPresetModalOpen(false);
                          showToast(`${preset.name} avatar applied! ✨`, 'success');
                        }}
                      >
                        <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white/10 group-hover:border-primary-container group-hover:scale-105 transition-all shadow-md">
                          <img src={preset.svgUrl} alt={preset.name} className="w-full h-full object-cover" />
                        </div>
                        <span className="text-[10px] font-label font-bold text-pale-cream/90 mt-1.5 truncate max-w-full">
                          {preset.name}
                        </span>
                        {/* Customise button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsPresetModalOpen(false);
                            setCustomizerInitialConfig(preset.config);
                            setIsInstagramCustomizerOpen(true);
                          }}
                          className="mt-1 text-[9px] font-mono text-[#ee2a7b] hover:text-white hover:underline flex items-center gap-0.5"
                          title="Customise this style in Instagram Studio"
                        >
                          <span className="material-symbols-outlined text-[10px]">edit</span>
                          Customise
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-5 gap-3 mb-6">
                    {presetAvatars.map((url, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          onAvatarChange(url);
                          setIsPresetModalOpen(false);
                          showToast('Profile photo updated & saved! ✨', 'success');
                        }}
                        className="w-16 h-16 rounded-full overflow-hidden border-2 border-transparent hover:border-primary-container cursor-pointer transition-all transform hover:scale-105 shadow-md"
                      >
                        <img src={url} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setIsPresetModalOpen(false);
                    setCustomizerInitialConfig(undefined);
                    setIsInstagramCustomizerOpen(true);
                  }}
                  className="w-full py-2.5 rounded-full bg-gradient-to-r from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white font-label text-xs uppercase tracking-wider font-bold cursor-pointer flex items-center justify-center gap-2 shadow-md hover:opacity-95 mb-2"
                >
                  <span className="material-symbols-outlined text-base">auto_fix_high</span>
                  Open Instagram Avatar Customizer
                </button>
                <button
                  onClick={() => setIsPresetModalOpen(false)}
                  className="w-full py-2.5 rounded-full bg-surface-container text-pale-cream hover:bg-white/10 font-label text-xs uppercase tracking-wider font-bold cursor-pointer border border-white/10 transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          )}

          {/* User Details & Identity */}
          <div className="flex-1 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between w-full min-w-0 gap-6">
            <div className="w-full min-w-0">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2">
                <span className="bg-primary-container/20 text-primary-container border border-primary-container/30 px-3 py-0.5 rounded-full font-mono text-xs uppercase tracking-wider font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">verified</span>
                  {isLoggedIn ? 'Verified Swiftie & Member' : 'Guest Listener'}
                </span>
                <span className="bg-surface-container-high/60 text-muted-grey text-xs px-2.5 py-0.5 rounded-full border border-white/5">
                  Taylor Swift Era Fan
                </span>
              </div>

              {/* Editable Name */}
              {isEditingName ? (
                <div className="flex items-center justify-center md:justify-start gap-2 mb-2 w-full max-w-full">
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="w-full min-w-0 flex-1 max-w-[210px] sm:max-w-xs md:max-w-sm bg-surface-container-high text-pale-cream font-display text-xl sm:text-2xl md:text-3xl px-3 py-1.5 rounded-xl border border-primary-container outline-none"
                    placeholder="Enter your name"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveName}
                    disabled={isSavingName}
                    className="p-2 bg-primary-container text-[#3c3c2a] rounded-xl hover:opacity-90 font-bold transition-all cursor-pointer flex-shrink-0"
                    title="Save name"
                  >
                    <span className="material-symbols-outlined text-xl">check</span>
                  </button>
                  <button
                    onClick={() => setIsEditingName(false)}
                    className="p-2 bg-surface-container text-pale-cream rounded-xl hover:bg-surface-container-high transition-all cursor-pointer flex-shrink-0"
                    title="Cancel"
                  >
                    <span className="material-symbols-outlined text-xl">close</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center md:justify-start gap-3 mb-2 group w-full min-w-0">
                  <h1 className="font-display text-3xl sm:text-4xl md:text-5xl text-pale-cream drop-shadow-md leading-tight truncate">
                    {userName}
                  </h1>
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="text-muted-grey hover:text-primary-container transition-colors cursor-pointer flex-shrink-0 p-1"
                    title="Edit Name"
                  >
                    <span className="material-symbols-outlined text-xl">edit</span>
                  </button>
                </div>
              )}

              <p className="font-body text-sm text-muted-grey mb-4">{userEmail}</p>

              {/* Linked Real Stats */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 md:gap-6 font-body text-base text-muted-grey">
                <div
                  onClick={() => onNavigate('library')}
                  className="cursor-pointer hover:text-primary-container transition-colors flex items-baseline gap-1.5"
                  title="View Playlists in Library"
                >
                  <span className="text-pale-cream font-bold text-lg">{playlists.length}</span>
                  <span className="text-xs uppercase tracking-wider">Playlists</span>
                </div>
                <span className="text-white/20">•</span>
                <div
                  onClick={() => onNavigate('library')}
                  className="cursor-pointer hover:text-primary-container transition-colors flex items-baseline gap-1.5"
                  title="View Liked Songs in Library"
                >
                  <span className="text-pale-cream font-bold text-lg">{likedSongs.length}</span>
                  <span className="text-xs uppercase tracking-wider">Liked Songs</span>
                </div>
                <span className="text-white/20">•</span>
                <div
                  onClick={() => onNavigate('library')}
                  className="cursor-pointer hover:text-primary-container transition-colors flex items-baseline gap-1.5"
                  title="View Recent Sessions in Library"
                >
                  <span className="text-pale-cream font-bold text-lg">{recentPlays.length}</span>
                  <span className="text-xs uppercase tracking-wider">Recent Tracks</span>
                </div>
                <span className="text-white/20">•</span>
                <div
                  onClick={() => onNavigate('home')}
                  className="cursor-pointer hover:text-primary-container transition-colors flex items-baseline gap-1.5"
                  title="Explore AI Mixes"
                >
                  <span className="text-primary-container font-bold text-lg">{profilePlaylists.length}</span>
                  <span className="text-xs uppercase tracking-wider">Curated Eras</span>
                </div>
              </div>
            </div>

            {/* Profile Action Buttons */}
            <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 shrink-0">
              {isLoggedIn ? (
                <>
                  {isAuthorizedAdmin(auth.currentUser?.email || userEmail) && (
                    <button
                      onClick={() => setIsAdminLoginsModalOpen(true)}
                      className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 font-label text-xs font-bold px-4 py-2.5 rounded-full tracking-wider uppercase shadow-lg shadow-emerald-500/10 transition-all cursor-pointer flex items-center gap-1.5"
                      title="Confidential Admin Login Access Hub"
                    >
                      <span className="material-symbols-outlined text-base">admin_panel_settings</span>
                      Admin Logins DB
                    </button>
                  )}
                  <button
                    onClick={() => onNavigate('premium')}
                    className="bg-primary-container text-[#3c3c2a] hover:opacity-95 font-label text-xs font-bold px-5 py-2.5 rounded-full tracking-wider uppercase shadow-lg shadow-primary-container/20 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-base">workspace_premium</span>
                    Go Premium
                  </button>
                  <button
                    onClick={handleLogout}
                    className="border border-white/20 bg-surface-container/60 hover:bg-surface-container text-pale-cream rounded-full px-5 py-2.5 font-label text-xs font-bold tracking-wider uppercase transition-colors backdrop-blur-md cursor-pointer flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-base">logout</span>
                    Log Out
                  </button>
                </>
              ) : (
                <button
                  onClick={() => onNavigate('auth')}
                  className="bg-primary-container text-[#3c3c2a] hover:opacity-95 font-label text-xs font-bold px-6 py-3 rounded-full tracking-wider uppercase shadow-lg shadow-primary-container/20 transition-all cursor-pointer flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">login</span>
                  Sign In to Sync Library
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Avatar Preset Picker / Quick Avatar Selection (Instagram Studio) */}
        <QuickAvatarSelectionBar
          currentAvatarUrl={avatarUrl}
          customAvatars={customAvatars}
          onSelectAvatar={(url) => {
            onAvatarChange(url);
          }}
          onSaveCustomAvatar={handleCustomAvatarSave}
          onOpenFullCustomizer={(cfg) => {
            setCustomizerInitialConfig(cfg);
            setIsInstagramCustomizerOpen(true);
          }}
          showToast={showToast}
        />

        {/* Section Navigation Tabs */}
        <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-8">
          <button
            onClick={() => setActiveSection('overview')}
            className={`px-5 py-2 rounded-full font-label text-xs tracking-wider uppercase transition-all cursor-pointer flex items-center gap-2 ${
              activeSection === 'overview'
                ? 'bg-primary-container text-[#3c3c2a] font-bold shadow-md shadow-primary-container/20'
                : 'bg-surface-container-high/40 text-muted-grey hover:text-pale-cream hover:bg-surface-container-high'
            }`}
          >
            <span className="material-symbols-outlined text-base">dashboard</span>
            Overview & Library
          </button>
          <button
            onClick={() => setActiveSection('playlists')}
            className={`px-5 py-2 rounded-full font-label text-xs tracking-wider uppercase transition-all cursor-pointer flex items-center gap-2 ${
              activeSection === 'playlists'
                ? 'bg-primary-container text-[#3c3c2a] font-bold shadow-md shadow-primary-container/20'
                : 'bg-surface-container-high/40 text-muted-grey hover:text-pale-cream hover:bg-surface-container-high'
            }`}
          >
            <span className="material-symbols-outlined text-base">queue_music</span>
            Playlists & Eras ({playlists.length + profilePlaylists.length})
          </button>
          <button
            onClick={() => setActiveSection('settings')}
            className={`px-5 py-2 rounded-full font-label text-xs tracking-wider uppercase transition-all cursor-pointer flex items-center gap-2 ${
              activeSection === 'settings'
                ? 'bg-primary-container text-[#3c3c2a] font-bold shadow-md shadow-primary-container/20'
                : 'bg-surface-container-high/40 text-muted-grey hover:text-pale-cream hover:bg-surface-container-high'
            }`}
          >
            <span className="material-symbols-outlined text-base">tune</span>
            Audio Preferences
          </button>
        </div>

        {/* Tab 1: Overview & Connected Library Content */}
        {activeSection === 'overview' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
            {/* Quick Cross-Site Action Shortcuts */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div
                onClick={() => onNavigate('home')}
                className="p-5 rounded-2xl bg-gradient-to-br from-purple-900/40 to-surface-container-high/40 border border-purple-500/20 hover:border-primary-container/50 cursor-pointer transition-all hover:scale-[1.02] group"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="material-symbols-outlined text-2xl text-pastel-lavender">auto_awesome</span>
                  <span className="material-symbols-outlined text-muted-grey group-hover:text-pale-cream text-lg">arrow_forward</span>
                </div>
                <h4 className="font-display text-lg text-pale-cream mb-1">AI DJ & Vibe Matcher</h4>
                <p className="font-body text-xs text-muted-grey">Explore personalized song categories and prompt vibes on Home.</p>
              </div>

              <div
                onClick={() => onNavigate('search')}
                className="p-5 rounded-2xl bg-gradient-to-br from-pink-900/40 to-surface-container-high/40 border border-pink-500/20 hover:border-primary-container/50 cursor-pointer transition-all hover:scale-[1.02] group"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="material-symbols-outlined text-2xl text-pink-300">search</span>
                  <span className="material-symbols-outlined text-muted-grey group-hover:text-pale-cream text-lg">arrow_forward</span>
                </div>
                <h4 className="font-display text-lg text-pale-cream mb-1">Search & Discover Eras</h4>
                <p className="font-body text-xs text-muted-grey">Find any Taylor Swift track, album, or artist across the web.</p>
              </div>

              <div
                onClick={() => onNavigate('library')}
                className="p-5 rounded-2xl bg-gradient-to-br from-emerald-900/40 to-surface-container-high/40 border border-emerald-500/20 hover:border-primary-container/50 cursor-pointer transition-all hover:scale-[1.02] group"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="material-symbols-outlined text-2xl text-pastel-mint">library_music</span>
                  <span className="material-symbols-outlined text-muted-grey group-hover:text-pale-cream text-lg">arrow_forward</span>
                </div>
                <h4 className="font-display text-lg text-pale-cream mb-1">Complete Audio Library</h4>
                <p className="font-body text-xs text-muted-grey">Access all your saved favorites and listening history.</p>
              </div>
            </div>

            {/* Currently Playing Spotlight (if active) */}
            {currentTrack && (
              <div className="p-5 rounded-2xl bg-surface-container-high/80 border border-primary-container/30 flex items-center justify-between gap-4 backdrop-blur-md">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden shadow-lg flex-shrink-0">
                    <img src={currentTrack.thumbnail} alt={currentTrack.title} className="w-full h-full object-cover" />
                    {isPlaying && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary-container text-xl animate-pulse">equalizer</span>
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono text-primary-container uppercase tracking-wider font-semibold">
                      Now In Playback
                    </span>
                    <h4 className="font-display text-base text-pale-cream truncate leading-snug">{currentTrack.title}</h4>
                    <p className="text-xs text-muted-grey font-body truncate">{currentTrack.channel}</p>
                  </div>
                </div>
                <button
                  onClick={() => onNavigate('home')}
                  className="px-4 py-2 rounded-full bg-primary-container text-[#3c3c2a] text-xs font-bold font-label uppercase tracking-wider hover:opacity-90 transition-all flex items-center gap-1 shrink-0"
                >
                  <span className="material-symbols-outlined text-base">music_note</span>
                  View Player
                </button>
              </div>
            )}

            {/* Your Created Playlists Section */}
            <div className="space-y-12">
              {/* Custom Playlists */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary-container text-2xl">queue_music</span>
                    <h3 className="font-display text-2xl text-pale-cream">Your Custom Playlists ({playlists.filter(p => !p.isAIGenerated).length})</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsCreatePlaylistOpen(true)}
                      className="px-3.5 py-1.5 rounded-full bg-primary-container/15 hover:bg-primary-container/25 text-primary-container font-label text-xs uppercase tracking-wider font-bold border border-primary-container/30 flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <span className="material-symbols-outlined text-base">add</span>
                      + New Playlist
                    </button>
                    <button
                      onClick={() => onNavigate('library')}
                      className="text-xs text-primary-container hover:underline font-label uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                    >
                      Manage in Library <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </button>
                  </div>
                </div>

                {playlists.filter(p => !p.isAIGenerated).length === 0 ? (
                  <div className="p-8 rounded-2xl bg-surface-container/30 border border-dashed border-white/10 text-center flex flex-col items-center justify-center space-y-3">
                    <span className="material-symbols-outlined text-4xl text-primary-container/40">queue_music</span>
                    <div>
                      <h4 className="font-display text-lg text-pale-cream">No custom playlists yet</h4>
                      <p className="text-xs text-muted-grey mt-0.5">Build a custom playlist to organize your favorite tracks.</p>
                    </div>
                    <button
                      onClick={() => setIsCreatePlaylistOpen(true)}
                      className="px-5 py-2.5 rounded-full bg-primary-container text-[#3c3c2a] font-label text-xs uppercase tracking-wider font-bold shadow-lg cursor-pointer flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-base">add</span>
                      Create Custom Playlist
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {playlists.filter(p => !p.isAIGenerated).map((pl) => (
                      <div
                        key={pl.id}
                        onClick={() => handlePlayUserPlaylist(pl)}
                        className="p-3.5 rounded-2xl bg-surface-container/50 hover:bg-surface-container-high/80 border border-white/5 hover:border-primary-container/40 flex flex-col justify-between gap-3 cursor-pointer group transition-all shadow-md hover:shadow-xl relative overflow-hidden"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 shadow-md bg-surface-container-high">
                            <img
                              src={getActualSongImage(pl.tracks[0] || { id: '', thumbnail: pl.coverUrl })}
                              alt={pl.name}
                              onError={(e) => handleSongImageError(e, pl.tracks[0]?.id)}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="material-symbols-outlined text-pale-cream text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                                play_arrow
                              </span>
                            </div>
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <h4 className="font-display text-base text-pale-cream truncate group-hover:text-primary-container transition-colors">
                                {pl.name}
                              </h4>
                            </div>
                            <p className="text-xs text-muted-grey font-body line-clamp-1">
                              {pl.description || `${pl.tracks.length} tracks`}
                            </p>
                            <div className="flex items-center gap-2 text-[11px] font-label text-muted-grey uppercase tracking-wider mt-1">
                              <span>{pl.tracks.length} songs</span>
                              <span>•</span>
                              <span className="text-primary-container font-semibold">1-Tap Play</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between border-t border-white/5 pt-2 text-xs text-muted-grey">
                          <span className="text-[10px] font-mono opacity-70">
                            {new Date(pl.createdAt).toLocaleDateString()}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePlayUserPlaylist(pl, true);
                              }}
                              className="p-1 rounded-md hover:bg-white/10 text-muted-grey hover:text-pale-cream transition-colors"
                              title="Shuffle play"
                            >
                              <span className="material-symbols-outlined text-sm">shuffle</span>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onNavigate('library');
                              }}
                              className="p-1 rounded-md hover:bg-white/10 text-muted-grey hover:text-pale-cream transition-colors"
                              title="Open in Library"
                            >
                              <span className="material-symbols-outlined text-sm">open_in_new</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* AI Mashups */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary-container text-2xl">auto_awesome</span>
                    <h3 className="font-display text-2xl text-pale-cream">Your AI Mashups ({playlists.filter(p => p.isAIGenerated).length})</h3>
                  </div>
                  <button
                    onClick={() => onNavigate('library')}
                    className="text-xs text-primary-container hover:underline font-label uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                  >
                    Manage in Library <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                </div>

                {playlists.filter(p => p.isAIGenerated).length === 0 ? (
                  <div className="p-8 rounded-2xl bg-surface-container/30 border border-dashed border-white/10 text-center flex flex-col items-center justify-center space-y-3">
                    <span className="material-symbols-outlined text-4xl text-primary-container/40">auto_awesome</span>
                    <div>
                      <h4 className="font-display text-lg text-pale-cream">No AI Mashups yet</h4>
                      <p className="text-xs text-muted-grey mt-0.5">Let Gemini AI generate custom track mixes and mashups for you.</p>
                    </div>
                    <button
                      onClick={() => setIsCreatePlaylistOpen(true)}
                      className="px-5 py-2.5 rounded-full bg-primary-container text-[#3c3c2a] font-label text-xs uppercase tracking-wider font-bold shadow-lg cursor-pointer flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-base">auto_awesome</span>
                      Create AI Mashup
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {playlists.filter(p => p.isAIGenerated).map((pl) => (
                      <div
                        key={pl.id}
                        onClick={() => handlePlayUserPlaylist(pl)}
                        className="p-3.5 rounded-2xl bg-surface-container/50 hover:bg-surface-container-high/80 border border-white/5 hover:border-primary-container/40 flex flex-col justify-between gap-3 cursor-pointer group transition-all shadow-md hover:shadow-xl relative overflow-hidden"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 shadow-md bg-surface-container-high">
                            <img
                              src={getActualSongImage(pl.tracks[0] || { id: '', thumbnail: pl.coverUrl })}
                              alt={pl.name}
                              onError={(e) => handleSongImageError(e, pl.tracks[0]?.id)}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="material-symbols-outlined text-pale-cream text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                                play_arrow
                              </span>
                            </div>
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <h4 className="font-display text-base text-pale-cream truncate group-hover:text-primary-container transition-colors">
                                {pl.name}
                              </h4>
                              <span className="bg-primary-container/20 text-primary-container text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase flex-shrink-0">
                                AI
                              </span>
                            </div>
                            <p className="text-xs text-muted-grey font-body line-clamp-1">
                              {pl.description || 'AI Curated Mashup'}
                            </p>
                            <div className="flex items-center gap-2 text-[11px] font-label text-muted-grey uppercase tracking-wider mt-1">
                              <span>{pl.tracks.length} songs</span>
                              <span>•</span>
                              <span className="text-primary-container font-semibold">1-Tap Play</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between border-t border-white/5 pt-2 text-xs text-muted-grey">
                          <span className="text-[10px] font-mono opacity-70">
                            {new Date(pl.createdAt).toLocaleDateString()}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePlayUserPlaylist(pl, true);
                              }}
                              className="p-1 rounded-md hover:bg-white/10 text-muted-grey hover:text-pale-cream transition-colors"
                              title="Shuffle play"
                            >
                              <span className="material-symbols-outlined text-sm">shuffle</span>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onNavigate('library');
                              }}
                              className="p-1 rounded-md hover:bg-white/10 text-muted-grey hover:text-pale-cream transition-colors"
                              title="Open in Library"
                            >
                              <span className="material-symbols-outlined text-sm">open_in_new</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Liked Songs Quick Shelf */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary-container text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    favorite
                  </span>
                  <h3 className="font-display text-2xl text-pale-cream">Your Favorite Songs ({likedSongs.length})</h3>
                </div>
                <button
                  onClick={() => onNavigate('library')}
                  className="text-xs text-primary-container hover:underline font-label uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                >
                  See All <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>

              {likedSongs.length === 0 ? (
                <div className="p-8 rounded-2xl bg-surface-container/30 border border-white/5 text-center flex flex-col items-center justify-center">
                  <span className="material-symbols-outlined text-4xl text-muted-grey/40 mb-2">favorite_border</span>
                  <p className="text-sm text-pale-cream mb-1">No liked songs in your profile yet</p>
                  <p className="text-xs text-muted-grey mb-4">Tap the heart icon on any song on Home or Search to add it to your profile.</p>
                  <button
                    onClick={() => onNavigate('search')}
                    className="px-5 py-2 rounded-full bg-surface-container-high hover:bg-surface-container text-pale-cream text-xs font-label uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Find Songs to Like
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {likedSongs.slice(0, 4).map((track, i) => (
                    <div
                      key={`${track.id}-${i}`}
                      onClick={() => playTrack(track, likedSongs)}
                      className="p-3 rounded-xl bg-surface-container/50 hover:bg-surface-container-high/70 border border-white/5 hover:border-primary-container/30 flex items-center justify-between gap-3 cursor-pointer group transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 shadow">
                          <img
                            src={getActualSongImage(track)}
                            alt={track.title}
                            onError={(e) => handleSongImageError(e, track.id)}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="material-symbols-outlined text-pale-cream text-xl">play_arrow</span>
                          </div>
                        </div>
                        <div className="min-w-0">
                          <h5 className="font-display text-sm text-pale-cream truncate leading-tight">{track.title}</h5>
                          <p className="text-xs text-muted-grey truncate">{track.channel}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleLike(track);
                          }}
                          className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer text-primary-container"
                          title="Liked"
                        >
                          <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
                            favorite
                          </span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            shareTrack(track);
                          }}
                          className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer text-muted-grey hover:text-pale-cream"
                          title="Share"
                        >
                          <span className="material-symbols-outlined text-base">share</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Listening Sessions */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-pastel-mint text-2xl">history</span>
                  <h3 className="font-display text-2xl text-pale-cream">Recent Listening History</h3>
                </div>
                <button
                  onClick={() => onNavigate('library')}
                  className="text-xs text-pastel-mint hover:underline font-label uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                >
                  View Full History <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>

              {recentPlays.length === 0 ? (
                <div className="p-8 rounded-2xl bg-surface-container/30 border border-white/5 text-center flex flex-col items-center justify-center">
                  <span className="material-symbols-outlined text-4xl text-muted-grey/40 mb-2">music_off</span>
                  <p className="text-sm text-pale-cream mb-1">No recent listening sessions recorded</p>
                  <p className="text-xs text-muted-grey mb-4">Play any Taylor Swift song or mix and your history will track automatically.</p>
                  <button
                    onClick={() => onNavigate('home')}
                    className="px-5 py-2 rounded-full bg-primary-container text-[#3c3c2a] text-xs font-label uppercase tracking-wider font-bold hover:opacity-90 transition-all cursor-pointer"
                  >
                    Start Listening
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {recentPlays.slice(0, 3).map((track, i) => (
                    <div
                      key={`${track.id}-${i}`}
                      onClick={() => playTrack(track, recentPlays)}
                      className="p-3 rounded-xl bg-surface-container/40 hover:bg-surface-container-high/60 border border-white/5 flex items-center justify-between gap-3 cursor-pointer group transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="font-mono text-xs text-muted-grey w-5 text-center">{i + 1}</span>
                        <div className="w-11 h-11 rounded-lg overflow-hidden flex-shrink-0 shadow">
                          <img
                            src={getActualSongImage(track)}
                            alt={track.title}
                            onError={(e) => handleSongImageError(e, track.id)}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <h5 className="font-display text-sm text-pale-cream truncate leading-tight">{track.title}</h5>
                          <p className="text-xs text-muted-grey truncate">{track.channel}</p>
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-muted-grey group-hover:text-primary-container text-xl transition-colors">
                        play_circle
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Tab 2: Curated Eras & Playlists */}
        {activeSection === 'playlists' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
            {/* Header with + Create CTA */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-surface-container-high/60 to-surface-container/30 p-6 rounded-3xl border border-white/10">
              <div>
                <h3 className="font-display text-3xl text-pale-cream mb-1">Your Profile Playlists</h3>
                <p className="font-body text-xs text-muted-grey">
                  Access your personal custom mixes, AI-generated tracklists, and preset Swiftie eras.
                </p>
              </div>
              <button
                onClick={() => setIsCreatePlaylistOpen(true)}
                className="px-6 py-3 rounded-full bg-gradient-to-r from-primary-container to-amber-400 text-[#3c3c2a] font-label text-xs uppercase tracking-wider font-bold shadow-lg shadow-primary-container/20 flex items-center gap-2 cursor-pointer self-start sm:self-auto hover:opacity-95 transition-all"
              >
                <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                  auto_awesome
                </span>
                + Create Playlist
              </button>
            </div>

            {/* PART 1: User Created & AI Playlists */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary-container text-2xl">
                    library_music
                  </span>
                  <h4 className="font-display text-2xl text-pale-cream">
                    Custom & AI Playlists ({playlists.length})
                  </h4>
                </div>
                <button
                  onClick={() => onNavigate('library')}
                  className="text-xs text-primary-container hover:underline font-label uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                >
                  Full Library View <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>

              {playlists.length === 0 ? (
                <div className="p-8 rounded-3xl bg-surface-container/30 border border-dashed border-white/10 text-center flex flex-col items-center justify-center space-y-3">
                  <span className="material-symbols-outlined text-4xl text-muted-grey/40">queue_music</span>
                  <h5 className="font-display text-lg text-pale-cream">No custom playlists created yet</h5>
                  <p className="text-xs text-muted-grey max-w-sm">
                    Create your first custom playlist manually or ask Gemini AI to generate one based on any vibe or mood.
                  </p>
                  <button
                    onClick={() => setIsCreatePlaylistOpen(true)}
                    className="px-6 py-2.5 rounded-full bg-primary-container text-[#3c3c2a] font-label text-xs uppercase tracking-wider font-bold shadow-lg cursor-pointer"
                  >
                    + Create Playlist Now
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {playlists.map((pl) => (
                    <motion.div
                      key={pl.id}
                      whileHover={{ scale: 1.01 }}
                      className="bg-surface-container-high/50 rounded-2xl p-5 border border-white/10 hover:border-primary-container/40 transition-all flex flex-col justify-between group shadow-xl"
                    >
                      <div>
                        <div className="relative aspect-video rounded-xl overflow-hidden mb-4 shadow-md bg-surface-container-high">
                          <img
                            src={getActualSongImage(pl.tracks[0] || { id: '', thumbnail: pl.coverUrl })}
                            alt={pl.name}
                            onError={(e) => handleSongImageError(e, pl.tracks[0]?.id)}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end justify-between p-4">
                            <span className="font-mono text-xs text-primary-container uppercase tracking-wider font-bold bg-black/60 px-2.5 py-1 rounded-md backdrop-blur-sm flex items-center gap-1">
                              {pl.isAIGenerated ? '✨ Gemini AI' : '🎵 Custom'}
                            </span>
                            <span className="font-mono text-xs text-pale-cream/90 bg-black/60 px-2 py-1 rounded-md backdrop-blur-sm">
                              {pl.tracks.length} songs
                            </span>
                          </div>
                          <button
                            onClick={() => handlePlayUserPlaylist(pl)}
                            className="absolute bottom-4 right-4 w-12 h-12 rounded-full bg-primary-container text-[#3c3c2a] flex items-center justify-center shadow-2xl hover:scale-110 transition-transform cursor-pointer"
                            title="Play Playlist"
                          >
                            <span className="material-symbols-outlined text-2xl font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>
                              play_arrow
                            </span>
                          </button>
                        </div>

                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="font-headline text-2xl text-pale-cream leading-tight">{pl.name}</h4>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm(`Delete playlist "${pl.name}"?`)) {
                                deletePlaylist(pl.id);
                              }
                            }}
                            className="p-1 rounded-md hover:bg-red-500/20 text-muted-grey hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                            title="Delete playlist"
                          >
                            <span className="material-symbols-outlined text-base">delete</span>
                          </button>
                        </div>
                        <p className="font-body text-xs text-muted-grey mb-3 line-clamp-2">{pl.description || 'Custom playlist'}</p>

                        {/* Track Preview List */}
                        <div className="space-y-1.5 mb-4">
                          {pl.tracks.length === 0 ? (
                            <p className="text-xs text-muted-grey italic py-2">No tracks added to this playlist yet.</p>
                          ) : (
                            pl.tracks.slice(0, 3).map((t, idx) => (
                              <div
                                key={idx}
                                onClick={() => playTrack(t, pl.tracks)}
                                className="flex items-center justify-between text-xs py-1.5 px-2 rounded-lg hover:bg-white/5 text-pale-cream/80 cursor-pointer"
                              >
                                <span className="truncate flex items-center gap-2">
                                  <span className="text-muted-grey font-mono text-[11px]">{idx + 1}.</span>
                                  <span className="truncate">{t.title}</span>
                                </span>
                                <span className="text-[10px] text-muted-grey uppercase flex-shrink-0">{t.channel}</span>
                              </div>
                            ))
                          )}
                          {pl.tracks.length > 3 && (
                            <div
                              onClick={() => onNavigate('library')}
                              className="text-[11px] text-primary-container/80 hover:text-primary-container px-2 py-0.5 cursor-pointer font-label uppercase tracking-wider"
                            >
                              + {pl.tracks.length - 3} more tracks in Library →
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2 border-t border-white/5">
                        <button
                          onClick={() => handlePlayUserPlaylist(pl)}
                          disabled={pl.tracks.length === 0}
                          className={`flex-1 py-2.5 rounded-full font-label text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                            pl.tracks.length === 0
                              ? 'bg-surface-container text-muted-grey cursor-not-allowed'
                              : 'bg-primary-container text-[#3c3c2a] hover:opacity-95 shadow-md shadow-primary-container/10'
                          }`}
                        >
                          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                            play_arrow
                          </span>
                          Play All ({pl.tracks.length})
                        </button>
                        <button
                          onClick={() => handlePlayUserPlaylist(pl, true)}
                          disabled={pl.tracks.length === 0}
                          className="px-4 py-2.5 rounded-full bg-surface-container hover:bg-surface-container-high text-pale-cream font-label text-xs uppercase tracking-wider transition-colors border border-white/10 flex items-center justify-center cursor-pointer"
                          title="Shuffle Play"
                        >
                          <span className="material-symbols-outlined text-base">shuffle</span>
                        </button>
                        <button
                          onClick={() => onNavigate('library')}
                          className="px-4 py-2.5 rounded-full bg-surface-container hover:bg-surface-container-high text-pale-cream font-label text-xs uppercase tracking-wider transition-colors border border-white/10 flex items-center justify-center cursor-pointer"
                          title="Open in Library"
                        >
                          <span className="material-symbols-outlined text-base">open_in_new</span>
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* PART 2: Playable Swiftie Eras */}
            <div className="space-y-4 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-display text-2xl text-primary-container">Playable Swiftie Eras & Presets</h4>
                  <p className="text-xs text-muted-grey">Instant 1-tap curated era queues</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {profilePlaylists.map((pl) => (
                  <motion.div
                    key={pl.id}
                    whileHover={{ scale: 1.01 }}
                    className="bg-surface-container-high/50 rounded-2xl p-5 border border-white/10 hover:border-primary-container/40 transition-all flex flex-col justify-between group shadow-xl"
                  >
                    <div>
                      <div className="relative aspect-video rounded-xl overflow-hidden mb-4 shadow-md">
                        <img
                          src={getActualSongImage(pl.tracks[0] || { id: '', thumbnail: pl.img })}
                          alt={pl.title}
                          onError={(e) => handleSongImageError(e, pl.tracks[0]?.id)}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-4">
                          <span className="font-mono text-xs text-primary-container uppercase tracking-wider font-bold bg-black/60 px-2.5 py-1 rounded-md backdrop-blur-sm">
                            {pl.era}
                          </span>
                        </div>
                        <button
                          onClick={() => handlePlayPlaylist(pl)}
                          className="absolute bottom-4 right-4 w-12 h-12 rounded-full bg-primary-container text-[#3c3c2a] flex items-center justify-center shadow-2xl hover:scale-110 transition-transform cursor-pointer"
                          title="Play Mix"
                        >
                          <span className="material-symbols-outlined text-2xl font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>
                            play_arrow
                          </span>
                        </button>
                      </div>

                      <h4 className="font-headline text-2xl text-pale-cream mb-1">{pl.title}</h4>
                      <p className="font-body text-xs text-muted-grey mb-4">{pl.description}</p>

                      {/* Track Preview List */}
                      <div className="space-y-1.5 mb-4">
                        {pl.tracks.map((t, idx) => (
                          <div
                            key={idx}
                            onClick={() => playTrack(t, pl.tracks)}
                            className="flex items-center justify-between text-xs py-1 px-2 rounded-lg hover:bg-white/5 text-pale-cream/80 cursor-pointer"
                          >
                            <span className="truncate">
                              <span className="text-muted-grey font-mono mr-2">{idx + 1}.</span>
                              {t.title}
                            </span>
                            <span className="text-[10px] text-muted-grey uppercase">{t.channel}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => handlePlayPlaylist(pl)}
                      className="w-full py-2.5 rounded-full bg-surface-container hover:bg-primary-container hover:text-[#3c3c2a] text-pale-cream font-label text-xs font-bold uppercase tracking-wider transition-all border border-white/10 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">play_circle</span>
                      Play All ({pl.tracks.length} Songs)
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab 3: Audio Preferences & Experience Settings */}
        {activeSection === 'settings' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-2xl">
            <h3 className="font-display text-3xl text-pale-cream mb-4">Playback & Sound Preferences</h3>

            <div className="p-5 rounded-2xl bg-surface-container/40 border border-white/10 space-y-6">
              {/* Streaming Quality */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-body font-bold text-pale-cream text-sm">Streaming Audio Quality</h4>
                  <p className="text-xs text-muted-grey">Higher bitrates deliver richer bass and crisp highs.</p>
                </div>
                <select
                  value={audioQuality}
                  onChange={(e) => {
                    setAudioQuality(e.target.value);
                    localStorage.setItem('beatz_audio_quality', e.target.value);
                    showToast(`Audio quality set to ${e.target.value} 🎧`, 'info');
                  }}
                  className="bg-surface-container-high text-pale-cream text-xs px-3 py-2 rounded-xl border border-white/10 outline-none cursor-pointer"
                >
                  <option value="High (320 kbps)">Ultra HD (320 kbps)</option>
                  <option value="Standard (192 kbps)">Standard (192 kbps)</option>
                  <option value="Data Saver (96 kbps)">Data Saver (96 kbps)</option>
                </select>
              </div>

              {/* Visualizer Preset */}
              <div className="flex items-center justify-between border-t border-white/5 pt-4">
                <div>
                  <h4 className="font-body font-bold text-pale-cream text-sm">Audio Visualizer Atmosphere</h4>
                  <p className="text-xs text-muted-grey">Visual theme for the vinyl player glow and ripples.</p>
                </div>
                <select
                  value={visualizerMode}
                  onChange={(e) => {
                    setVisualizerMode(e.target.value);
                    localStorage.setItem('beatz_visualizer_mode', e.target.value);
                    showToast(`Visualizer set to ${e.target.value} ✨`, 'info');
                  }}
                  className="bg-surface-container-high text-pale-cream text-xs px-3 py-2 rounded-xl border border-white/10 outline-none cursor-pointer"
                >
                  <option value="Neon Glow">Neon Synth Glow</option>
                  <option value="Folklore Woodsy">Folklore Forest Amber</option>
                  <option value="Lover Pastel">Lover Pastel Pink</option>
                </select>
              </div>

              {/* Smart AI DJ Toggle */}
              <div className="flex items-center justify-between border-t border-white/5 pt-4">
                <div>
                  <h4 className="font-body font-bold text-pale-cream text-sm">AI DJ Smart Autoplay</h4>
                  <p className="text-xs text-muted-grey">Intelligently queue matching Swiftie eras when queue ends.</p>
                </div>
                <button
                  onClick={() => {
                    const newVal = !smartAIDJ;
                    setSmartAIDJ(newVal);
                    localStorage.setItem('beatz_smart_ai_dj', String(newVal));
                    showToast(newVal ? 'AI DJ Autoplay enabled 🤖' : 'AI DJ Autoplay disabled', 'info');
                  }}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                    smartAIDJ ? 'bg-primary-container' : 'bg-surface-container-high'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-[#3c3c2a] absolute top-0.5 transition-transform ${
                      smartAIDJ ? 'right-0.5' : 'left-0.5 bg-muted-grey'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Premium Membership Banner */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/80 via-pink-950/60 to-surface-container-high border border-primary-container/30 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="font-mono text-xs text-primary-container uppercase font-bold tracking-widest">
                  VIBRA PREMIUM PASS
                </span>
                <h4 className="font-display text-2xl text-pale-cream mt-0.5">Unlock Lossless Audio & Offline Modes</h4>
                <p className="font-body text-xs text-muted-grey mt-1">Unlimited skips, studio mastering equalizer & exclusive live recordings.</p>
              </div>
              <button
                onClick={() => onNavigate('premium')}
                className="bg-primary-container text-[#3c3c2a] hover:opacity-95 font-label text-xs font-bold px-6 py-3 rounded-full uppercase tracking-wider shadow-lg shadow-primary-container/20 transition-all cursor-pointer shrink-0"
              >
                View Plans
              </button>
            </div>
          </motion.div>
        )}

        {/* Create Playlist Modal (Manual or Gemini AI) */}
        <CreatePlaylistModal
          isOpen={isCreatePlaylistOpen}
          onClose={() => setIsCreatePlaylistOpen(false)}
          onPlaylistCreated={() => {
            setIsCreatePlaylistOpen(false);
          }}
        />

        {/* Instagram Avatar Customizer Modal */}
        <InstagramAvatarCustomizer
          isOpen={isInstagramCustomizerOpen}
          onClose={() => {
            setIsInstagramCustomizerOpen(false);
            setCustomizerInitialConfig(undefined);
          }}
          onSaveAvatar={handleCustomAvatarSave}
          currentAvatarUrl={avatarUrl}
          initialConfig={customizerInitialConfig}
        />

        {/* Secure Admin Logins Modal (strictly accessible only by beatzapp.team@gmail.com) */}
        <AdminLoginsModal
          isOpen={isAdminLoginsModalOpen}
          onClose={() => setIsAdminLoginsModalOpen(false)}
          currentUserEmail={auth.currentUser?.email || userEmail}
        />
      </div>
    </div>
  );
};
