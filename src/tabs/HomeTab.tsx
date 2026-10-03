import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { usePlayer, Track } from '../context/PlayerContext';
import { AICategory, CategorizedTrack, AISuggestedMix } from '../types';
import { getActualSongImage, handleSongImageError } from '../lib/songImage';

export const HomeTab = ({ onProfileClick, onSearchClick, onNavigateToGenerate, avatarUrl, isLoggedIn }: { onProfileClick: () => void, onSearchClick: () => void, onNavigateToGenerate?: () => void, avatarUrl: string, isLoggedIn: boolean }) => {
  const { 
    currentTrack, 
    isPlaying, 
    togglePlayPause, 
    playTrack, 
    playNext, 
    playPrevious, 
    queue, 
    currentTime, 
    duration, 
    seekTo,
    likedSongs,
    recentPlays,
    isLiked,
    toggleLike,
    shareTrack,
    openAddToPlaylistModal,
    openFullScreenPlayer,
    showToast,
    addToQueue
  } = usePlayer();
  
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [categories, setCategories] = useState<AICategory[]>([
    { id: 'all', name: 'All Vibes', icon: 'auto_awesome', count: 8 },
    { id: 'taylor-eras', name: "Taylor's Era", icon: 'sparkles', count: 6 },
    { id: 'pop-anthems', name: 'Pop Anthems', icon: 'bolt', count: 4 },
    { id: 'folklore-chill', name: 'Folklore & Acoustic', icon: 'forest', count: 3 },
    { id: 'midnight-synth', name: 'Midnights & Synth', icon: 'nightlife', count: 3 },
  ]);

  const [topPicks, setTopPicks] = useState<CategorizedTrack[]>([
    { id: 'ic8j13piAhQ', title: 'Cruel Summer', channel: 'Taylor Swift', thumbnail: 'https://i.ytimg.com/vi/ic8j13piAhQ/hqdefault.jpg', category: "Taylor's Era", aiReason: 'High-energy bridge & quintessential pop anthem', moodTag: 'Lover Era' },
    { id: 'b1kbLwvqugk', title: 'Anti-Hero', channel: 'Taylor Swift', thumbnail: 'https://i.ytimg.com/vi/b1kbLwvqugk/hqdefault.jpg', category: 'Midnights & Synth', aiReason: 'Catchy synthpop introspection with retro textures', moodTag: 'Midnights Vibe' },
    { id: 'K-a8s8OLBSE', title: 'cardigan', channel: 'Taylor Swift', thumbnail: 'https://i.ytimg.com/vi/K-a8s8OLBSE/hqdefault.jpg', category: 'Folklore & Acoustic', aiReason: 'Nostalgic piano and cozy autumnal storytelling', moodTag: 'Cozy Folklore' },
    { id: '-CmadmM5cOk', title: 'Style (Taylor\'s Version)', channel: 'Taylor Swift', thumbnail: 'https://i.ytimg.com/vi/-CmadmM5cOk/hqdefault.jpg', category: "Taylor's Era", aiReason: 'Iconic 80s funk-pop groove and timeless hook', moodTag: '1989 Pop' },
    { id: 'q3zqJs7JUCQ', title: 'Fortnight (feat. Post Malone)', channel: 'Taylor Swift', thumbnail: 'https://i.ytimg.com/vi/q3zqJs7JUCQ/hqdefault.jpg', category: 'Midnights & Synth', aiReason: 'Moody synth textures with delicate vocal harmonies', moodTag: 'TTPD Era' },
    { id: 'eVli-tstM5E', title: 'Espresso', channel: 'Sabrina Carpenter', thumbnail: 'https://i.ytimg.com/vi/eVli-tstM5E/hqdefault.jpg', category: 'Pop Anthems', aiReason: 'Breezy retro disco groove perfect for sunny listening', moodTag: 'Sunny Pop' },
    { id: '-BjZmE2gtdo', title: 'Lover', channel: 'Taylor Swift', thumbnail: 'https://i.ytimg.com/vi/-BjZmE2gtdo/hqdefault.jpg', category: "Taylor's Era", aiReason: 'Romantic waltz with acoustic warmth and nostalgic strings', moodTag: 'Lover & Romance' },
    { id: 'tollGa3S0o8', title: 'All Too Well (10 Minute Version)', channel: 'Taylor Swift', thumbnail: 'https://i.ytimg.com/vi/tollGa3S0o8/hqdefault.jpg', category: 'Folklore & Acoustic', aiReason: 'Masterclass in lyrical narrative and dynamic crescendo', moodTag: 'Red Era' },
  ]);

  const [suggestedMixes, setSuggestedMixes] = useState<AISuggestedMix[]>([
    {
      id: 'mix-1',
      title: 'The Eras Experience',
      subtitle: 'Taylor Swift • Essential Anthems',
      tagline: 'A journey through Lover, 1989, Midnights & Folklore eras',
      badge: 'TOP SWIFTIE PICK',
      category: "Taylor's Era",
      colorFrom: 'from-pink-950/90',
      colorTo: 'to-purple-950/90',
      thumbnail: 'https://i.ytimg.com/vi/ic8j13piAhQ/hqdefault.jpg',
      tracks: [
        { id: 'ic8j13piAhQ', title: 'Cruel Summer', channel: 'Taylor Swift', thumbnail: 'https://i.ytimg.com/vi/ic8j13piAhQ/hqdefault.jpg' },
        { id: 'b1kbLwvqugk', title: 'Anti-Hero', channel: 'Taylor Swift', thumbnail: 'https://i.ytimg.com/vi/b1kbLwvqugk/hqdefault.jpg' },
        { id: '-CmadmM5cOk', title: 'Style (Taylor\'s Version)', channel: 'Taylor Swift', thumbnail: 'https://i.ytimg.com/vi/-CmadmM5cOk/hqdefault.jpg' },
        { id: 'e-ORhEE9VVg', title: 'Blank Space', channel: 'Taylor Swift', thumbnail: 'https://i.ytimg.com/vi/e-ORhEE9VVg/hqdefault.jpg' }
      ]
    },
    {
      id: 'mix-2',
      title: 'Folklore & Autumnal Coffee',
      subtitle: 'Cozy Piano & Acoustic Storytelling',
      tagline: 'Intimate woodsy ballads and warm nostalgic melodies',
      badge: 'ACOUSTIC VIBES',
      category: 'Folklore & Acoustic',
      colorFrom: 'from-amber-950/90',
      colorTo: 'to-emerald-950/90',
      thumbnail: 'https://i.ytimg.com/vi/K-a8s8OLBSE/hqdefault.jpg',
      tracks: [
        { id: 'K-a8s8OLBSE', title: 'cardigan', channel: 'Taylor Swift', thumbnail: 'https://i.ytimg.com/vi/K-a8s8OLBSE/hqdefault.jpg' },
        { id: 'nn_0zPAfyo8', title: 'august', channel: 'Taylor Swift', thumbnail: 'https://i.ytimg.com/vi/nn_0zPAfyo8/hqdefault.jpg' },
        { id: 'tollGa3S0o8', title: 'All Too Well (10 Minute Version)', channel: 'Taylor Swift', thumbnail: 'https://i.ytimg.com/vi/tollGa3S0o8/hqdefault.jpg' }
      ]
    },
    {
      id: 'mix-3',
      title: 'Midnight Pop Drive',
      subtitle: 'Synthpop & Late Night Energy',
      tagline: 'Shimmering synths for 3 AM thoughts and late night highway drives',
      badge: 'MIDNIGHTS',
      category: 'Midnights & Synth',
      colorFrom: 'from-indigo-950/90',
      colorTo: 'to-violet-950/90',
      thumbnail: 'https://i.ytimg.com/vi/b1kbLwvqugk/hqdefault.jpg',
      tracks: [
        { id: 'b1kbLwvqugk', title: 'Anti-Hero', channel: 'Taylor Swift', thumbnail: 'https://i.ytimg.com/vi/b1kbLwvqugk/hqdefault.jpg' },
        { id: 'q3zqJs7JUCQ', title: 'Fortnight (feat. Post Malone)', channel: 'Taylor Swift', thumbnail: 'https://i.ytimg.com/vi/q3zqJs7JUCQ/hqdefault.jpg' },
        { id: 'b7QlX3yR2xs', title: 'Karma', channel: 'Taylor Swift', thumbnail: 'https://i.ytimg.com/vi/b7QlX3yR2xs/hqdefault.jpg' },
        { id: 'V1Z586zoeeE', title: 'As It Was', channel: 'Harry Styles', thumbnail: 'https://i.ytimg.com/vi/V1Z586zoeeE/hqdefault.jpg' }
      ]
    }
  ]);

  // Fetch Categorization
  const fetchAICuration = async (moodOverride?: any) => {
    setIsLoadingAI(true);
    const safeMood = typeof moodOverride === 'string' && moodOverride.trim().length > 0 
      ? moodOverride.trim() 
      : undefined;

    try {
      const cleanRecent = (recentPlays || []).map((t) => ({
        id: String(t.id || ''),
        title: String(t.title || ''),
        channel: String(t.channel || '')
      })).slice(0, 6);

      const cleanLiked = (likedSongs || []).map((t) => ({
        id: String(t.id || ''),
        title: String(t.title || ''),
        channel: String(t.channel || '')
      })).slice(0, 8);

      const cleanCurrent = currentTrack ? {
        id: String(currentTrack.id || ''),
        title: String(currentTrack.title || ''),
        channel: String(currentTrack.channel || '')
      } : undefined;

      const response = await fetch('/api/ai/categorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recentTracks: cleanRecent,
          likedTracks: cleanLiked,
          currentTrack: cleanCurrent,
          customMood: safeMood
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.categories && data.categories.length > 0) setCategories(data.categories);
        if (data.topPicks && data.topPicks.length > 0) setTopPicks(data.topPicks);
        if (data.suggestedMixes && data.suggestedMixes.length > 0) setSuggestedMixes(data.suggestedMixes);
      }
    } catch (err) {
      console.warn('Categorization fetch error:', err);
    } finally {
      setIsLoadingAI(false);
    }
  };

  useEffect(() => {
    // Initial fetch to categorize songs based on user state
    fetchAICuration();
  }, []);

  const displayTrack: Track = currentTrack || {
    id: 'ic8j13piAhQ',
    title: 'Cruel Summer',
    channel: 'Taylor Swift',
    thumbnail: 'https://i.ytimg.com/vi/ic8j13piAhQ/hqdefault.jpg'
  };

  const isCurrentLiked = isLiked(displayTrack.id);

  const getThemeColor = (id: string) => {
    if (id === 'placeholder') return "#4a2559";
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash) % 360;
    return `hsl(${h}, 50%, 18%)`;
  };

  const currentThemeColor = getThemeColor(displayTrack.id);

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return "0:00";
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const bounds = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - bounds.left) / bounds.width;
    seekTo(percent * duration);
  };

  const handlePlaySuggestedMix = (mix: AISuggestedMix) => {
    if (mix.tracks && mix.tracks.length > 0) {
      playTrack(mix.tracks[0], mix.tracks);
      showToast(`Playing Mix: ${mix.title} (${mix.tracks.length} tracks)`, 'success');
    }
  };

  // Filter top picks based on active category
  const filteredTopPicks = topPicks.filter(track => {
    if (activeCategory === 'all') return true;
    const catObj = categories.find(c => c.id === activeCategory);
    if (!catObj) return true;
    return track.category.toLowerCase().includes(catObj.name.toLowerCase()) || 
           catObj.name.toLowerCase().includes(track.category.toLowerCase());
  });

  return (
    <div className="px-6 py-6 md:px-8 max-w-5xl mx-auto pb-40 relative">
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <div 
          onClick={onProfileClick}
          className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary-container cursor-pointer hover:scale-105 transition-transform md:hidden flex items-center justify-center bg-surface-container-high"
        >
          {isLoggedIn ? (
            <img src={avatarUrl} alt="User" className="w-full h-full object-cover" />
          ) : (
            <span className="material-symbols-outlined text-muted-grey text-2xl">person</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <h1 className="font-display text-3xl md:text-4xl text-primary-container tracking-widest uppercase drop-shadow-md">Vibe Time</h1>
        </div>
        <button onClick={onSearchClick} className="w-12 h-12 rounded-full bg-surface-container-high/50 flex items-center justify-center hover:bg-surface-container-high transition-colors">
          <span className="material-symbols-outlined text-pale-cream text-2xl">search</span>
        </button>
      </header>

      {/* Category Filter Tabs */}
      <section className="mb-8">
        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 -mx-6 px-6 md:-mx-8 md:px-8 hide-scrollbar">
          {categories.map((cat) => {
            const isSelected = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex-none px-4 py-2.5 rounded-full font-label text-xs tracking-wider uppercase font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-primary-container text-[#2c2b1e] shadow-[0_0_15px_rgba(254,214,255,0.35)] scale-105'
                    : 'bg-surface-container-high/60 text-pale-cream/80 hover:text-pale-cream hover:bg-surface-container-high border border-white/5'
                }`}
              >
                <span className="material-symbols-outlined text-base">
                  {cat.icon || 'music_note'}
                </span>
                <span>{cat.name}</span>
                {cat.count !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-[#2c2b1e]/20 text-[#2c2b1e]' : 'bg-white/10 text-muted-grey'}`}>
                    {cat.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Spinning Now Hero Player Card */}
      <section className="mb-10">
        <div className="bg-[#4a4737]/80 backdrop-blur-xl rounded-[32px] p-6 md:p-8 shadow-2xl border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="inline-block bg-[#8c8861] text-[#2c2b1e] font-label text-xs font-bold tracking-widest px-3 py-1 rounded-sm uppercase">
              Spinning Now
            </div>
            <button
              type="button"
              onClick={openFullScreenPlayer}
              className="text-xs font-label uppercase tracking-widest text-primary-container hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">open_in_full</span>
              Full Screen Player
            </button>
          </div>
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-end justify-between">
            <div className="flex-1 w-full min-w-0">
              <h2
                onClick={openFullScreenPlayer}
                className="font-display text-2xl sm:text-3xl md:text-6xl text-primary-container leading-tight md:leading-[0.9] mb-2 drop-shadow-lg break-words cursor-pointer hover:opacity-90 transition-opacity"
                dangerouslySetInnerHTML={{ __html: displayTrack.title }}
              ></h2>
              <p className="font-body text-base md:text-xl text-pale-cream tracking-wider uppercase mb-6 drop-shadow-md break-words">{displayTrack.channel}</p>
              
              <div className="flex flex-wrap items-center gap-3">
                <button 
                  onClick={() => togglePlayPause()}
                  className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-primary-container flex items-center justify-center hover:scale-105 transition-transform shadow-[0_0_20px_rgba(254,214,255,0.4)] cursor-pointer"
                  title={isPlaying ? "Pause" : "Play"}
                >
                  <span className="material-symbols-outlined text-[#4a4737] text-2xl md:text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {isPlaying ? 'pause' : 'play_arrow'}
                  </span>
                </button>
                <button 
                  onClick={() => toggleLike(displayTrack)}
                  className="w-12 h-12 md:w-16 md:h-16 rounded-full border-2 border-primary-container/50 flex items-center justify-center hover:bg-primary-container/10 transition-colors cursor-pointer"
                  title={isCurrentLiked ? "Unlike song" : "Like song"}
                >
                  <span 
                    className={`material-symbols-outlined text-xl md:text-2xl transition-all ${isCurrentLiked ? 'text-primary-container scale-110' : 'text-pale-cream'}`}
                    style={{ fontVariationSettings: isCurrentLiked ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    favorite
                  </span>
                </button>
                <button 
                  onClick={() => shareTrack(displayTrack)}
                  className="w-12 h-12 md:w-16 md:h-16 rounded-full border-2 border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer"
                  title="Share song"
                >
                  <span className="material-symbols-outlined text-pale-cream text-xl md:text-2xl">
                    share
                  </span>
                </button>
                <button
                  type="button"
                  onClick={openFullScreenPlayer}
                  className="w-12 h-12 md:w-16 md:h-16 rounded-full border-2 border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer"
                  title="Open Full Screen Player"
                >
                  <span className="material-symbols-outlined text-pale-cream text-xl md:text-2xl">
                    fullscreen
                  </span>
                </button>
              </div>
            </div>
            <div 
              onClick={openFullScreenPlayer}
              className="w-44 h-44 md:w-60 md:h-60 rounded-full overflow-hidden border-4 border-surface-container-highest shadow-2xl flex-shrink-0 relative group cursor-pointer hover:scale-105 transition-transform"
              title="Click to open Full Screen Player"
            >
              <img 
                src={getActualSongImage(displayTrack)} 
                alt={displayTrack.title} 
                onError={(e) => handleSongImageError(e, displayTrack.id)}
                className="w-full h-full object-cover animate-[spin_20s_linear_infinite]" 
                style={{ animationPlayState: isPlaying ? 'running' : 'paused' }} 
              />
              <div className="absolute inset-0 rounded-full border-[12px] border-black/20 pointer-events-none"></div>
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-full">
                <span className="material-symbols-outlined text-pale-cream text-3xl">open_in_full</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lyria 3 Music Generation Spotlight */}
      <section className="mb-10">
        <div className="bg-gradient-to-r from-primary-container/20 via-surface-container-high/80 to-surface-container/60 border border-primary-container/30 backdrop-blur-xl rounded-3xl p-6 md:p-7 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-container/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary-container text-on-primary-container flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-2xl">music_note</span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-label text-[10px] font-bold uppercase tracking-wider text-primary-container bg-primary-container/20 px-2 py-0.5 rounded-full border border-primary-container/30">
                  Google Lyria 3 Powered
                </span>
                <span className="text-[10px] text-muted-grey font-mono">
                  Clip & Pro Models
                </span>
              </div>
              <h2 className="font-display text-xl md:text-2xl text-pale-cream tracking-wide">
                Generate Custom Music & Soundtracks
              </h2>
              <p className="font-body text-xs md:text-sm text-muted-grey mt-1 max-w-xl">
                Create 30s clips or full-length tracks with Lyria 3 from text descriptions or uploaded cover art.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onNavigateToGenerate}
            className="relative z-10 px-6 py-3 rounded-2xl bg-primary-container text-on-primary-container font-label text-xs uppercase tracking-wider font-bold shadow-lg hover:shadow-primary-container/30 hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer self-start md:self-auto flex-shrink-0"
          >
            <span className="material-symbols-outlined text-lg">auto_awesome</span>
            Generate Music
          </button>
        </div>
      </section>

      {/* TOP PICKS FOR YOU */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-2xl text-primary-container drop-shadow-md tracking-wider">TOP PICKS FOR YOU</h2>
            </div>
            <p className="font-body text-xs text-muted-grey">Curated by audio texture, era, and tempo</p>
          </div>
          {activeCategory !== 'all' && (
            <button 
              onClick={() => setActiveCategory('all')}
              className="text-xs text-tertiary-container hover:underline cursor-pointer"
            >
              Show all ({topPicks.length})
            </button>
          )}
        </div>

        {filteredTopPicks.length === 0 ? (
          <div className="bg-surface-container-high/40 rounded-2xl p-8 text-center border border-white/5">
            <p className="text-pale-cream font-body mb-2">No tracks currently categorized under this mood.</p>
            <button onClick={() => setActiveCategory('all')} className="text-primary-container font-label text-xs font-bold uppercase tracking-wider underline">
              View all top picks
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredTopPicks.map((item, i) => (
              <motion.div 
                key={`top-${item.id}-${i}`} 
                whileHover={{ scale: 1.03, y: -3 }} 
                onClick={() => playTrack(item, filteredTopPicks)} 
                className="bg-surface-container-high/40 hover:bg-surface-container-high/80 border border-white/5 rounded-2xl p-3 cursor-pointer group transition-all shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="w-full aspect-square rounded-xl overflow-hidden mb-3 shadow-md relative">
                    <img 
                      src={getActualSongImage(item)} 
                      alt={item.title} 
                      onError={(e) => handleSongImageError(e, item.id)}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="material-symbols-outlined text-pale-cream text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>play_circle</span>
                    </div>
                    {item.moodTag && (
                      <span className="absolute top-2 left-2 bg-[#2c2b1e]/90 backdrop-blur-md text-primary-container font-mono text-[9px] font-bold px-2 py-0.5 rounded-md border border-primary-container/30 uppercase tracking-widest shadow-md">
                        {item.moodTag}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[10px] font-label font-bold text-tertiary-container uppercase tracking-wider bg-tertiary-container/10 px-1.5 py-0.5 rounded">
                      {item.category}
                    </span>
                  </div>

                  <h4 className="font-display text-sm md:text-base text-pale-cream line-clamp-1 leading-snug mb-0.5" dangerouslySetInnerHTML={{ __html: item.title }}></h4>
                  <p className="font-body text-xs text-muted-grey truncate">{item.channel}</p>
                </div>

                <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[10px] text-muted-grey/70 truncate max-w-[120px]">
                    {item.category}
                  </span>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={(e) => { e.stopPropagation(); addToQueue(item); }}
                      className="w-7 h-7 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors flex-shrink-0 text-muted-grey hover:text-pale-cream"
                      title="Add to queue"
                    >
                      <span className="material-symbols-outlined text-sm">
                        queue_music
                      </span>
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); openAddToPlaylistModal(item); }}
                      className="w-7 h-7 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors flex-shrink-0 text-muted-grey hover:text-pale-cream"
                      title="Add to playlist"
                    >
                      <span className="material-symbols-outlined text-sm">
                        playlist_add
                      </span>
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleLike(item); }}
                      className="w-7 h-7 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors flex-shrink-0"
                      title="Like song"
                    >
                      <span 
                        className={`material-symbols-outlined text-base ${isLiked(item.id) ? 'text-primary-container' : 'text-muted-grey hover:text-pale-cream'}`}
                        style={{ fontVariationSettings: isLiked(item.id) ? "'FILL' 1" : "'FILL' 0" }}
                      >
                        favorite
                      </span>
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); shareTrack(item); }}
                      className="w-7 h-7 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors flex-shrink-0 text-muted-grey hover:text-pale-cream"
                      title="Share track"
                    >
                      <span className="material-symbols-outlined text-sm">
                        share
                      </span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* FEATURED MIXES & PLAYLISTS */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-2xl text-primary-container drop-shadow-md tracking-wider">FEATURED MIXES & PLAYLISTS</h2>
            </div>
            <p className="font-body text-xs text-muted-grey">Thematic playlists assembled for your favorite vibes and eras</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {suggestedMixes.map((mix) => (
            <motion.div 
              key={mix.id} 
              whileHover={{ scale: 1.02, y: -4 }} 
              onClick={() => handlePlaySuggestedMix(mix)} 
              className={`relative rounded-3xl overflow-hidden cursor-pointer group shadow-2xl border border-white/10 bg-gradient-to-b ${mix.colorFrom || 'from-neutral-900'} ${mix.colorTo || 'to-neutral-950'} flex flex-col justify-between p-5 min-h-[300px]`}
            >
              {/* Background Thumbnail with soft overlay */}
              <div className="absolute inset-0 -z-0 opacity-25 group-hover:opacity-35 transition-opacity duration-700">
                <img 
                  src={getActualSongImage(mix.tracks[0] || mix)} 
                  alt={mix.title} 
                  onError={(e) => handleSongImageError(e, mix.tracks[0]?.id)}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent -z-0"></div>

              {/* Top Meta */}
              <div className="relative z-10 flex items-start justify-between">
                <span className="bg-primary-container text-[#2c2b1e] font-label text-[10px] font-black tracking-widest px-2.5 py-1 rounded-full uppercase shadow-md">
                  {mix.badge ? mix.badge.replace(/AI/gi, '').trim() || 'FEATURED' : 'FEATURED'}
                </span>
                <span className="text-pale-cream/70 font-mono text-xs font-bold bg-black/40 px-2 py-0.5 rounded-md border border-white/10 backdrop-blur-md">
                  {mix.tracks.length} tracks
                </span>
              </div>

              {/* Bottom Content */}
              <div className="relative z-10 pt-8">
                <p className="font-label text-xs tracking-widest uppercase text-tertiary-container font-semibold mb-1">{mix.subtitle}</p>
                <h3 className="font-display text-2xl md:text-3xl text-pale-cream leading-tight mb-2 drop-shadow-md">{mix.title}</h3>
                <p className="font-body text-xs text-pale-cream/80 line-clamp-2 mb-4 leading-relaxed">{mix.tagline}</p>
                
                <div className="flex items-center justify-between pt-3 border-t border-white/10">
                  <div className="flex items-center gap-1.5 text-xs text-pale-cream/70">
                    <span className="material-symbols-outlined text-sm text-primary-container">queue_music</span>
                    <span className="truncate max-w-[150px]">{mix.tracks[0]?.title || 'Multi-track set'}</span>
                  </div>
                  <button className="w-10 h-10 rounded-full bg-primary-container text-[#2c2b1e] flex items-center justify-center shadow-[0_0_15px_rgba(254,214,255,0.4)] group-hover:scale-110 transition-transform flex-shrink-0">
                    <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* RECENTLY PLAYED */}
      {recentPlays.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-2xl text-primary-container drop-shadow-md tracking-wider">RECENTLY PLAYED</h2>
            <span className="text-xs text-muted-grey font-mono">{recentPlays.length} saved</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {recentPlays.slice(0, 4).map((track, i) => (
              <motion.div key={`recent-${track.id}-${i}`} whileHover={{ scale: 1.02 }} onClick={() => playTrack(track, recentPlays)} className="bg-surface-container-high/60 backdrop-blur-md rounded-full flex items-center pr-4 border border-white/5 cursor-pointer overflow-hidden h-16 hover:bg-surface-container-high/90 transition-colors shadow-lg group">
                <img src={track.thumbnail} alt={track.title} className="w-16 h-16 object-cover flex-shrink-0" />
                <span className="font-headline text-sm md:text-base text-tertiary-container ml-4 leading-tight drop-shadow-sm truncate flex-1" dangerouslySetInnerHTML={{ __html: track.title }}></span>
                <button 
                  onClick={(e) => { e.stopPropagation(); toggleLike(track); }}
                  className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center ml-2 flex-shrink-0 opacity-80 group-hover:opacity-100"
                  title="Like song"
                >
                  <span 
                    className={`material-symbols-outlined text-sm ${isLiked(track.id) ? 'text-primary-container' : 'text-muted-grey hover:text-pale-cream'}`}
                    style={{ fontVariationSettings: isLiked(track.id) ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    favorite
                  </span>
                </button>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* LIKED SONGS */}
      {likedSongs.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-2xl text-primary-container drop-shadow-md tracking-wider">YOUR LIKED SONGS</h2>
            <span className="text-xs text-muted-grey font-mono">{likedSongs.length} favorites</span>
          </div>
          <div className="flex overflow-x-auto gap-4 pb-4 -mx-6 px-6 md:-mx-8 md:px-8 hide-scrollbar">
            {likedSongs.map((track, i) => (
              <motion.div key={`liked-${track.id}-${i}`} whileHover={{ scale: 1.05 }} onClick={() => playTrack(track, likedSongs)} className="flex-none w-36 md:w-48 cursor-pointer group">
                <div className="w-full aspect-square rounded-full overflow-hidden mb-3 shadow-lg relative border-4 border-surface-container-highest">
                  <img src={track.thumbnail} alt={track.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                     <span className="material-symbols-outlined text-pale-cream text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>play_circle</span>
                  </div>
                </div>
                <h4 className="font-display text-base md:text-lg text-pale-cream text-center truncate" dangerouslySetInnerHTML={{ __html: track.title }}></h4>
                <p className="font-body text-xs md:text-sm text-muted-grey text-center truncate">{track.channel}</p>
              </motion.div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};



