import React, { useState, useRef, useEffect } from 'react';
import { usePlayer, Track } from '../context/PlayerContext';
import { CreateCassetteModal } from '../components/CreateCassetteModal';

interface GeneratedTrackData {
  id: string;
  title: string;
  prompt: string;
  model: 'lyria-3-clip-preview' | 'lyria-3-pro-preview';
  duration: number;
  audioUrl: string;
  mimeType: string;
  thumbnail: string;
  lyrics?: string;
  isFallback?: boolean;
  createdAt: number;
  youtubeId?: string;
  channel?: string;
  isMashup?: boolean;
  artistsInvolved?: string[];
  songsInvolved?: string[];
}

const INSPIRATION_PRESETS = [
  {
    icon: '🍂',
    label: 'Folklore Acoustic',
    genre: 'Acoustic Folk',
    mood: 'Nostalgic',
    prompt: 'Intimate fingerpicked acoustic guitar with gentle cello, woodsy room reverb, warm nostalgic storytelling at 76 BPM.',
  },
  {
    icon: '🌆',
    label: 'Midnight 80s Synth',
    genre: 'Synthpop',
    mood: 'Dreamy',
    prompt: 'Shimmering vintage analog synths, punchy retro drum machine, driving bassline and nostalgic late-night highway vibes at 118 BPM.',
  },
  {
    icon: '💖',
    label: 'Golden Hour Pop',
    genre: 'Pop Anthem',
    mood: 'Uplifting',
    prompt: 'Catchy bright acoustic guitar hook, buoyant drums, uplifting pop rhythm, sun-drenched summer melody at 122 BPM.',
  },
  {
    icon: '☕',
    label: 'Rainy Cafe Lo-Fi',
    genre: 'Lo-Fi Chill',
    mood: 'Mellow',
    prompt: 'Warm dusty vinyl crackle, mellow Rhodes electric piano chords, subtle upright bass and gentle rainy study beat at 78 BPM.',
  },
  {
    icon: '🎻',
    label: 'Cinematic Crescendo',
    genre: 'Cinematic Orchestral',
    mood: 'Emotional',
    prompt: 'Sweeping emotional strings, poignant piano melody, soaring brass swells and cinematic percussion building into a breathtaking climax.',
  },
  {
    icon: '🪕',
    label: 'Country Porch Acoustic',
    genre: 'Country & Americana',
    mood: 'Warm',
    prompt: 'Rustic acoustic guitar strumming, soulful pedal steel guitar, warm foot-tapping beat and heartfelt front-porch melody at 96 BPM.',
  }
];

const GENRE_TAGS = ['Acoustic', 'Synthpop', 'Lo-Fi', 'Pop', 'Indie Rock', 'Cinematic', 'Folk', 'Ambient', 'Jazz'];
const MOOD_TAGS = ['Nostalgic', 'Dreamy', 'Energetic', 'Romantic', 'Melancholic', 'Chill', 'Mystical', 'Uplifting'];

const CURATED_STUDIO_COVERS = [
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=600&q=80',
];

export const GenerateMusicTab: React.FC<{ onNavigateToLibrary?: () => void }> = () => {
  const { playTrack, saveGeneratedTrack, deleteGeneratedTrack, generatedTracks, showToast } = usePlayer();

  // Model selection: lyria-3-clip-preview (up to 30s) or lyria-3-pro-preview (full tracks)
  const [model, setModel] = useState<'lyria-3-clip-preview' | 'lyria-3-pro-preview'>('lyria-3-clip-preview');
  const [prompt, setPrompt] = useState('Dreamy acoustic guitar with soft string quartet and nostalgic piano in the style of Folklore.');
  const [customTitle, setCustomTitle] = useState('');
  const [selectedDuration, setSelectedDuration] = useState<number>(30);
  const [selectedGenre, setSelectedGenre] = useState<string>('Acoustic');
  const [selectedMood, setSelectedMood] = useState<string>('Nostalgic');

  // Image input (Lyria image-to-music)
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnhancingPrompt, setIsEnhancingPrompt] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [latestGenerated, setLatestGenerated] = useState<GeneratedTrackData | null>(null);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  // Audio preview element for newly generated track
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const [previewProgress, setPreviewProgress] = useState(0);
  const [previewDuration, setPreviewDuration] = useState(0);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  // Cassette modal state
  const [isCassetteModalOpen, setIsCassetteModalOpen] = useState(false);
  const [cassetteSeedTrack, setCassetteSeedTrack] = useState<Track | null>(null);

  // Set default duration based on model
  const handleModelChange = (newModel: 'lyria-3-clip-preview' | 'lyria-3-pro-preview') => {
    setModel(newModel);
    if (newModel === 'lyria-3-clip-preview') {
      setSelectedDuration(30);
    } else {
      setSelectedDuration(120);
    }
  };

  // Image upload handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please upload an image file (PNG, JPG, WebP)', 'error');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      showToast('Image is too large (max 8MB)', 'error');
      return;
    }

    setImageName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setImageBase64(reader.result as string);
      showToast('Image attached! Lyria will compose music inspired by this visual 🎨', 'success');
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageBase64(null);
    setImageName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Enhance prompt with AI Co-Producer
  const handleEnhancePrompt = async () => {
    if (!prompt.trim()) {
      showToast('Enter a starting idea or prompt to enhance', 'info');
      return;
    }
    setIsEnhancingPrompt(true);
    try {
      const res = await fetch('/api/music/suggest-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea: prompt.trim(),
          genre: selectedGenre,
          mood: selectedMood,
          model
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.prompt) {
          setPrompt(data.prompt);
          if (data.title && !customTitle) {
            setCustomTitle(data.title);
          }
          showToast('Prompt enriched with studio production details! ✨', 'success');
        }
      }
    } catch (e) {
      console.warn('Enhance prompt error:', e);
      showToast('Could not enhance prompt, using existing text', 'info');
    } finally {
      setIsEnhancingPrompt(false);
    }
  };

  // Generate music with Lyria 3
  const handleGenerateMusic = async () => {
    if (!prompt.trim()) {
      showToast('Please describe the sound you want to create', 'error');
      return;
    }

    setIsGenerating(true);
    setNoticeMessage(null);
    setGenerationStep('Connecting to Google Lyria 3 engine...');

    try {
      const stepTimer1 = setTimeout(() => {
        setGenerationStep(`Synthesizing harmonic waveforms with ${model === 'lyria-3-clip-preview' ? 'Lyria 3 Clip' : 'Lyria 3 Pro'}...`);
      }, 1500);

      const stepTimer2 = setTimeout(() => {
        setGenerationStep('Arranging instruments, tempo and mastering audio stream...');
      }, 3500);

      const response = await fetch('/api/music/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          model,
          duration: selectedDuration,
          imageData: imageBase64 || undefined,
          genre: selectedGenre,
          mood: selectedMood,
          title: customTitle.trim() || undefined
        })
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to generate music');
      }

      const data = await response.json();
      if (!data.audioBase64) {
        throw new Error('No audio returned from generator');
      }

      // Convert base64 audio to playable Blob URL
      const binary = atob(data.audioBase64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const mimeType = data.mimeType || 'audio/wav';
      const blob = new Blob([bytes], { type: mimeType });
      const audioUrl = URL.createObjectURL(blob);

      // Pick an aesthetic studio cover matching mood or returned from search
      const coverUrl = data.thumbnail || imageBase64 || CURATED_STUDIO_COVERS[Math.floor(Math.random() * CURATED_STUDIO_COVERS.length)];
      const title = data.title || customTitle || `${prompt.slice(0, 26)}...`;

      const newTrack: GeneratedTrackData = {
        id: data.youtubeId || `lyria-${Date.now()}`,
        title,
        prompt: prompt.trim(),
        model: data.modelUsed || model,
        duration: data.duration || selectedDuration,
        audioUrl,
        mimeType,
        thumbnail: coverUrl,
        lyrics: data.lyrics,
        isFallback: !!data.isFallback,
        createdAt: Date.now(),
        youtubeId: data.youtubeId,
        channel: data.channel,
        isMashup: data.isMashup,
        artistsInvolved: data.artistsInvolved,
        songsInvolved: data.songsInvolved
      };

      setLatestGenerated(newTrack);
      if (data.note || data.paidTierNotice) {
        setNoticeMessage(data.paidTierNotice || data.note);
      }

      // Automatically save to generated tracks history
      saveGeneratedTrack({
        id: newTrack.id,
        title: newTrack.title,
        channel: newTrack.channel || `Lyria 3 (${model === 'lyria-3-clip-preview' ? 'Clip' : 'Pro'})`,
        thumbnail: newTrack.thumbnail,
        audioUrl: newTrack.youtubeId ? undefined : newTrack.audioUrl,
        duration: newTrack.duration,
        genre: selectedGenre,
        prompt: newTrack.prompt,
        lyrics: newTrack.lyrics,
        modelUsed: newTrack.model,
        isGenerated: true,
        createdAt: newTrack.createdAt
      });

      // Auto-start playback of the authentic studio mashup/song immediately
      if (newTrack.youtubeId) {
        handlePlayInGlobalPlayer(newTrack);
      }

      showToast(`✨ Generated "${newTrack.title}"! Playing now with synced lyrics.`, 'success');
    } catch (err: any) {
      console.error('Generation error:', err);
      showToast(err.message || 'Error generating music with Lyria', 'error');
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  // Preview player controls
  const togglePreviewPlay = () => {
    if (!previewAudioRef.current) return;
    if (isPreviewPlaying) {
      previewAudioRef.current.pause();
      setIsPreviewPlaying(false);
    } else {
      previewAudioRef.current.play().then(() => {
        setIsPreviewPlaying(true);
      }).catch((e) => console.warn('Preview play error:', e));
    }
  };

  const handlePreviewSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (previewAudioRef.current) {
      previewAudioRef.current.currentTime = val;
      setPreviewProgress(val);
    }
  };

  // Send to global player with full video & lyrics sync
  const handlePlayInGlobalPlayer = (track: GeneratedTrackData) => {
    const playerTrack: Track = {
      id: track.youtubeId || track.id,
      title: track.title,
      channel: track.channel || `AI Studio • ${track.prompt.slice(0, 24)}`,
      thumbnail: track.thumbnail,
      audioUrl: track.youtubeId ? undefined : track.audioUrl,
      duration: track.duration,
      genre: selectedGenre,
      prompt: track.prompt,
      lyrics: track.lyrics,
      modelUsed: track.model,
      isGenerated: true,
      createdAt: track.createdAt
    };
    playTrack(playerTrack);
    showToast(`Playing "${track.title}" in Beatz Player! 🎵`, 'success');
  };

  // Download WAV file
  const handleDownloadWav = (track: GeneratedTrackData) => {
    const link = document.createElement('a');
    link.href = track.audioUrl;
    link.download = `${track.title.replace(/[^a-zA-Z0-9_-]/g, '_')}_Lyria.wav`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Downloaded .WAV soundtrack to your device 💾', 'success');
  };

  // Record into a Cassette Mixtape
  const handleAddToCassette = (track: GeneratedTrackData) => {
    const playerTrack: Track = {
      id: track.id,
      title: track.title,
      channel: 'Lyria 3 AI',
      thumbnail: track.thumbnail,
      audioUrl: track.audioUrl,
      isGenerated: true
    };
    setCassetteSeedTrack(playerTrack);
    setIsCassetteModalOpen(true);
  };

  // Format time
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="px-4 md:px-8 py-6 max-w-6xl mx-auto pb-44 md:pb-28">
      {/* Top Banner / Studio Header */}
      <div className="relative rounded-3xl overflow-hidden p-6 md:p-8 mb-8 border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.6)] bg-gradient-to-br from-[#23152c]/90 via-[#1c1224]/80 to-[#120a17]/95 backdrop-blur-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-container/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-primary-container/20 text-primary-container border border-primary-container/40">
                <span className="material-symbols-outlined text-xl">music_note</span>
              </span>
              <span className="font-label text-xs tracking-widest uppercase text-pastel-lavender font-bold">
                Google Lyria 3 Music Studio
              </span>
            </div>
            <h1 className="font-display text-3xl md:text-5xl text-pale-cream tracking-wide drop-shadow-md">
              Generate Music
            </h1>
            <p className="font-body text-sm md:text-base text-muted-grey/90 mt-2 max-w-2xl leading-relaxed">
              Compose original high-fidelity soundscapes, song clips, and full tracks using Google’s state-of-the-art <strong className="text-primary-container">lyria-3-clip-preview</strong> (up to 30s) and <strong className="text-pastel-lavender">lyria-3-pro-preview</strong> (full tracks).
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-label text-xs font-semibold text-pale-cream/90">
                Lyria Models Active
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Creator Console (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Model Switcher Box */}
          <div className="bg-surface-container-high/60 backdrop-blur-xl border border-white/10 rounded-3xl p-5 shadow-lg">
            <label className="font-label text-xs uppercase tracking-wider text-muted-grey font-bold mb-3 block">
              1. Choose Lyria 3 Engine & Format
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Lyria Clip */}
              <button
                type="button"
                onClick={() => handleModelChange('lyria-3-clip-preview')}
                className={`p-4 rounded-2xl text-left border transition-all cursor-pointer relative overflow-hidden group ${
                  model === 'lyria-3-clip-preview'
                    ? 'bg-primary-container/20 border-primary-container ring-1 ring-primary-container/50 shadow-[0_0_20px_rgba(231,181,247,0.25)]'
                    : 'bg-black/30 border-white/10 hover:border-white/20 hover:bg-black/40'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-label font-bold text-sm text-pale-cream flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-primary-container text-lg">bolt</span>
                    Lyria 3 Clip
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-primary-container/30 text-primary-container border border-primary-container/30">
                    ≤ 30s
                  </span>
                </div>
                <p className="font-body text-xs text-muted-grey leading-relaxed">
                  Fast, punchy hooks, synth riffs, and cassette intros with <code className="text-primary-container font-mono text-[10px]">lyria-3-clip-preview</code>.
                </p>
              </button>

              {/* Lyria Pro */}
              <button
                type="button"
                onClick={() => handleModelChange('lyria-3-pro-preview')}
                className={`p-4 rounded-2xl text-left border transition-all cursor-pointer relative overflow-hidden group ${
                  model === 'lyria-3-pro-preview'
                    ? 'bg-primary-container/20 border-primary-container ring-1 ring-primary-container/50 shadow-[0_0_20px_rgba(231,181,247,0.25)]'
                    : 'bg-black/30 border-white/10 hover:border-white/20 hover:bg-black/40'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-label font-bold text-sm text-pale-cream flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-pastel-lavender text-lg">album</span>
                    Lyria 3 Pro
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-pastel-lavender/30 text-pastel-lavender border border-pastel-lavender/30">
                    Full Track
                  </span>
                </div>
                <p className="font-body text-xs text-muted-grey leading-relaxed">
                  Extended compositions, full arrangements & deep texture with <code className="text-pastel-lavender font-mono text-[10px]">lyria-3-pro-preview</code>.
                </p>
              </button>
            </div>

            {/* Duration Selector */}
            <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between flex-wrap gap-2">
              <span className="font-label text-xs text-muted-grey">Target Duration:</span>
              <div className="flex items-center gap-2">
                {model === 'lyria-3-clip-preview' ? (
                  [10, 20, 30].map((dur) => (
                    <button
                      key={dur}
                      type="button"
                      onClick={() => setSelectedDuration(dur)}
                      className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                        selectedDuration === dur
                          ? 'bg-primary-container text-on-primary-container shadow-md'
                          : 'bg-white/5 text-pale-cream/70 hover:bg-white/10'
                      }`}
                    >
                      {dur}s
                    </button>
                  ))
                ) : (
                  [60, 90, 120].map((dur) => (
                    <button
                      key={dur}
                      type="button"
                      onClick={() => setSelectedDuration(dur)}
                      className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                        selectedDuration === dur
                          ? 'bg-pastel-lavender text-on-primary-container shadow-md'
                          : 'bg-white/5 text-pale-cream/70 hover:bg-white/10'
                      }`}
                    >
                      {dur}s
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Prompt Studio Input */}
          <div className="bg-surface-container-high/60 backdrop-blur-xl border border-white/10 rounded-3xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <label htmlFor="music-prompt-input" className="font-label text-xs uppercase tracking-wider text-muted-grey font-bold">
                2. Music Prompt & Instrumentation
              </label>
              <button
                type="button"
                onClick={handleEnhancePrompt}
                disabled={isEnhancingPrompt}
                className="text-xs font-label font-bold text-primary-container hover:text-pastel-lavender flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-sm">
                  {isEnhancingPrompt ? 'sync' : 'auto_fix_high'}
                </span>
                {isEnhancingPrompt ? 'Enriching...' : 'Enhance with AI'}
              </button>
            </div>

            <div className="relative">
              <textarea
                id="music-prompt-input"
                rows={3}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your track: instruments (acoustic guitar, piano, synths), tempo (BPM), mood, and emotional direction..."
                className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm text-pale-cream placeholder-muted-grey/60 focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container/40 transition-all resize-none font-body leading-relaxed"
              />
              <div className="text-[10px] text-muted-grey/70 text-right mt-1 font-mono">
                {prompt.length} chars
              </div>
            </div>

            {/* Custom Title (Optional) */}
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-muted-grey text-base">edit_note</span>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="Optional track title (e.g. Lavender Dusk)"
                className="flex-1 bg-black/30 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-pale-cream placeholder-muted-grey/60 focus:outline-none focus:border-primary-container transition-all"
              />
            </div>

            {/* Quick Inspiration Chips */}
            <div>
              <span className="font-label text-[11px] uppercase tracking-wider text-muted-grey font-semibold block mb-2">
                Quick Inspiration Vibes:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {INSPIRATION_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setPrompt(preset.prompt);
                      setSelectedGenre(preset.genre);
                      setSelectedMood(preset.mood);
                      setCustomTitle(preset.label);
                      showToast(`Loaded ${preset.label} preset! 🎶`, 'info');
                    }}
                    className="flex items-center gap-2 p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all text-left group cursor-pointer"
                  >
                    <span className="text-base">{preset.icon}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-pale-cream truncate group-hover:text-primary-container transition-colors">
                        {preset.label}
                      </p>
                      <p className="text-[10px] text-muted-grey truncate">{preset.genre}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Genre & Mood Filter Tags */}
            <div className="pt-2 border-t border-white/5 space-y-3">
              <div>
                <span className="font-label text-[11px] uppercase tracking-wider text-muted-grey font-semibold block mb-1.5">
                  Genre Texture:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {GENRE_TAGS.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setSelectedGenre(g)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-label font-bold transition-all cursor-pointer ${
                        selectedGenre === g
                          ? 'bg-primary-container/80 text-on-primary-container shadow-sm'
                          : 'bg-white/5 text-muted-grey hover:text-pale-cream hover:bg-white/10'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="font-label text-[11px] uppercase tracking-wider text-muted-grey font-semibold block mb-1.5">
                  Mood Feeling:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {MOOD_TAGS.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setSelectedMood(m)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-label font-bold transition-all cursor-pointer ${
                        selectedMood === m
                          ? 'bg-pastel-lavender/80 text-on-primary-container shadow-sm'
                          : 'bg-white/5 text-muted-grey hover:text-pale-cream hover:bg-white/10'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Optional Image Upload for Image-to-Music */}
            <div className="pt-3 border-t border-white/5">
              <div className="flex items-center justify-between mb-2">
                <span className="font-label text-xs uppercase tracking-wider text-muted-grey font-bold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm text-pastel-lavender">image</span>
                  Visual Inspiration (Image-to-Music)
                </span>
                <span className="text-[10px] text-muted-grey font-mono">Optional</span>
              </div>

              {!imageBase64 ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-white/10 hover:border-primary-container/50 rounded-2xl p-4 text-center cursor-pointer transition-colors bg-black/20 hover:bg-black/30 group"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <span className="material-symbols-outlined text-2xl text-muted-grey group-hover:text-primary-container group-hover:scale-110 transition-all mb-1 block">
                    add_photo_alternate
                  </span>
                  <p className="text-xs text-pale-cream font-medium">
                    Upload an album cover, photo, or memory
                  </p>
                  <p className="text-[10px] text-muted-grey mt-0.5">
                    Lyria creates a soundtrack matching the colors and atmosphere
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 rounded-2xl bg-black/40 border border-white/10">
                  <div className="flex items-center gap-3">
                    <img
                      src={imageBase64}
                      alt="Visual Inspiration"
                      className="w-12 h-12 rounded-xl object-cover border border-white/10 shadow-sm"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-pale-cream truncate max-w-[200px]">
                        {imageName || 'Attached Image'}
                      </p>
                      <p className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        Image-to-Music Active
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeImage}
                    className="p-1.5 text-muted-grey hover:text-rose-400 transition-colors cursor-pointer"
                    title="Remove image"
                  >
                    <span className="material-symbols-outlined text-lg">close</span>
                  </button>
                </div>
              )}
            </div>

            {/* Generate Action Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleGenerateMusic}
                disabled={isGenerating}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary-container via-pastel-lavender to-primary-container text-on-primary-container font-display text-lg tracking-wider font-black shadow-[0_8px_30px_rgba(231,181,247,0.35)] hover:shadow-[0_12px_40px_rgba(231,181,247,0.55)] active:scale-[0.99] transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed group"
              >
                {isGenerating ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-2xl">
                      progress_activity
                    </span>
                    <span>Synthesizing with {model === 'lyria-3-clip-preview' ? 'Lyria 3 Clip' : 'Lyria 3 Pro'}...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">
                      auto_awesome
                    </span>
                    <span>Generate Music ({model === 'lyria-3-clip-preview' ? '30s Clip' : 'Full Track'})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Master Output & Studio Rack (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Active Generation Visualizer / Latest Result */}
          <div className="bg-surface-container-high/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-container text-xl">graphic_eq</span>
                <span className="font-display text-lg text-pale-cream tracking-wide">
                  Studio Monitor
                </span>
              </div>
              {latestGenerated && (
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Ready
                </span>
              )}
            </div>

            {isGenerating ? (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-5">
                <div className="relative w-28 h-28 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-2 border-primary-container/30 animate-ping" />
                  <div className="absolute inset-2 rounded-full border-2 border-pastel-lavender/40 animate-pulse" />
                  <div className="w-20 h-20 rounded-full bg-primary-container/20 backdrop-blur-md flex items-center justify-center border border-primary-container/60 shadow-[0_0_30px_rgba(231,181,247,0.4)]">
                    <span className="material-symbols-outlined text-3xl text-primary-container animate-bounce">
                      music_note
                    </span>
                  </div>
                </div>

                <div className="space-y-2 max-w-xs">
                  <h3 className="font-display text-lg text-pale-cream">Lyria 3 Sound Synthesizer</h3>
                  <p className="font-mono text-xs text-primary-container animate-pulse">
                    {generationStep || 'Generating audio stream...'}
                  </p>
                  <p className="font-body text-xs text-muted-grey">
                    Using model: <span className="font-mono text-white/80">{model}</span>
                  </p>
                </div>

                {/* Animated Equalizer Waveform */}
                <div className="flex items-end justify-center gap-1.5 h-10 w-48 mt-2">
                  {[40, 75, 95, 60, 85, 100, 70, 50, 90, 65, 45, 80].map((h, i) => (
                    <span
                      key={i}
                      className="w-2 bg-gradient-to-t from-primary-container to-pastel-lavender rounded-full animate-pulse"
                      style={{
                        height: `${h}%`,
                        animationDuration: `${0.4 + (i % 5) * 0.15}s`,
                        animationDelay: `${i * 0.08}s`
                      }}
                    />
                  ))}
                </div>
              </div>
            ) : latestGenerated ? (
              <div className="space-y-5">
                {/* Artwork & Title Card */}
                <div className="relative rounded-2xl overflow-hidden aspect-video border border-white/10 group shadow-md">
                  <img
                    src={latestGenerated.thumbnail}
                    alt={latestGenerated.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                  
                  {/* Play Overlay Button */}
                  <button
                    type="button"
                    onClick={togglePreviewPlay}
                    className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-primary-container/90 text-on-primary-container flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all cursor-pointer z-10"
                  >
                    <span className="material-symbols-outlined text-3xl">
                      {isPreviewPlaying ? 'pause' : 'play_arrow'}
                    </span>
                  </button>

                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between z-10">
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        {latestGenerated.isMashup && (
                          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-pink-300 bg-pink-950/80 px-2 py-0.5 rounded-md border border-pink-500/40 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-pulse"></span>
                            AI Studio Mashup
                          </span>
                        )}
                        <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-primary-container bg-black/60 px-2 py-0.5 rounded-md border border-white/10">
                          {latestGenerated.channel || latestGenerated.model}
                        </span>
                      </div>
                      <h4 className="font-display text-lg text-pale-cream truncate drop-shadow-md">
                        {latestGenerated.title}
                      </h4>
                    </div>
                    <span className="font-mono text-xs font-bold text-pale-cream/80 bg-black/60 px-2 py-0.5 rounded-md border border-white/10 flex-shrink-0">
                      {latestGenerated.duration}s
                    </span>
                  </div>
                </div>

                {/* Audio Element & Scrubber */}
                {latestGenerated.youtubeId ? (
                  <div className="bg-primary-container/10 border border-primary-container/30 rounded-2xl p-4 space-y-3 text-center">
                    <div className="flex items-center justify-center gap-2 text-primary-container font-label text-xs uppercase tracking-wider font-bold">
                      <span className="material-symbols-outlined text-lg">verified</span>
                      {latestGenerated.isMashup ? 'Authentic Studio Mashup & Video Found' : 'Exact Studio Audio & Video Found'}
                    </div>
                    <button
                      type="button"
                      onClick={() => handlePlayInGlobalPlayer(latestGenerated)}
                      className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-primary-container to-pastel-lavender text-on-primary-container font-label text-sm font-bold tracking-wider hover:opacity-95 active:scale-98 transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-xl">play_circle</span>
                      {latestGenerated.isMashup ? 'Play Studio Mashup in Beatz Player' : 'Play Exact Song in Beatz Player'}
                    </button>
                    <p className="text-[11px] text-muted-grey font-body">
                      Plays authentic multi-artist studio recording with full video and real-time synchronized lyrics.
                    </p>
                  </div>
                ) : (
                  <div className="bg-black/30 border border-white/5 rounded-2xl p-4 space-y-2">
                    <audio
                      ref={previewAudioRef}
                      src={latestGenerated.audioUrl}
                      onTimeUpdate={(e) => {
                        setPreviewProgress(e.currentTarget.currentTime);
                        if (e.currentTarget.duration) setPreviewDuration(e.currentTarget.duration);
                      }}
                      onEnded={() => setIsPreviewPlaying(false)}
                      onPlay={() => setIsPreviewPlaying(true)}
                      onPause={() => setIsPreviewPlaying(false)}
                    />

                    <div className="flex items-center justify-between text-[11px] font-mono text-muted-grey">
                      <span>{formatTime(previewProgress)}</span>
                      <span>{formatTime(previewDuration || latestGenerated.duration)}</span>
                    </div>

                    <input
                      type="range"
                      min={0}
                      max={previewDuration || latestGenerated.duration || 30}
                      step={0.1}
                      value={previewProgress}
                      onChange={handlePreviewSeek}
                      className="w-full accent-primary-container cursor-pointer h-1.5 bg-white/10 rounded-lg"
                    />

                    <div className="flex justify-center pt-1">
                      <button
                        type="button"
                        onClick={togglePreviewPlay}
                        className="py-1.5 px-4 rounded-full bg-white/10 hover:bg-white/20 text-pale-cream text-xs font-label font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-base">
                          {isPreviewPlaying ? 'pause' : 'play_arrow'}
                        </span>
                        {isPreviewPlaying ? 'Pause AI Vocal Audio' : 'Preview AI Vocal Audio'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Prompt & Lyrics Details */}
                <div className="bg-black/20 rounded-2xl p-3 border border-white/5 space-y-1.5">
                  <span className="font-label text-[10px] uppercase tracking-wider text-muted-grey font-bold block">
                    Production Prompt:
                  </span>
                  <p className="font-body text-xs text-pale-cream/80 italic leading-relaxed line-clamp-2" title={latestGenerated.prompt}>
                    "{latestGenerated.prompt}"
                  </p>
                  {latestGenerated.lyrics && (
                    <div className="pt-2 mt-2 border-t border-white/5">
                      <span className="font-label text-[10px] uppercase tracking-wider text-pastel-lavender font-bold block mb-1">
                        Generated Lyrics:
                      </span>
                      <p className="font-body text-xs text-pale-cream/90 whitespace-pre-wrap max-h-24 overflow-y-auto pr-1">
                        {latestGenerated.lyrics}
                      </p>
                    </div>
                  )}
                </div>

                {/* Primary Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handlePlayInGlobalPlayer(latestGenerated)}
                    className="py-2.5 px-3 rounded-xl bg-primary-container text-on-primary-container font-label text-xs font-bold tracking-wider hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-base">play_circle</span>
                    {latestGenerated.youtubeId ? 'Play with Lyrics' : 'Play in App'}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddToCassette(latestGenerated)}
                    className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-pale-cream font-label text-xs font-bold tracking-wider active:scale-95 transition-all flex items-center justify-center gap-1.5 border border-white/10 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-base text-rose-400">album</span>
                    Record to Tape
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleDownloadWav(latestGenerated)}
                    className="flex-1 py-2 px-3 rounded-xl bg-black/40 hover:bg-black/60 text-muted-grey hover:text-pale-cream font-label text-xs font-medium border border-white/5 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-base">download</span>
                    Download .WAV
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-14 flex flex-col items-center justify-center text-center space-y-3 text-muted-grey">
                <span className="material-symbols-outlined text-4xl text-muted-grey/40">
                  graphic_eq
                </span>
                <p className="font-body text-xs max-w-xs">
                  Configure your music prompt on the left and click <strong className="text-pale-cream">Generate Music</strong> to synthesize an audio track with Lyria.
                </p>
              </div>
            )}

            {/* Notice / Guidance Banner */}
            {noticeMessage && (
              <div className="mt-4 p-3 rounded-2xl bg-primary-container/10 border border-primary-container/30 text-[11px] text-pale-cream/90 flex items-start gap-2.5">
                <span className="material-symbols-outlined text-primary-container text-base flex-shrink-0 mt-0.5">
                  info
                </span>
                <div className="min-w-0">
                  <p className="leading-relaxed">{noticeMessage}</p>
                </div>
              </div>
            )}
          </div>

          {/* Studio Rack: Generated Music History */}
          <div className="bg-surface-container-high/60 backdrop-blur-xl border border-white/10 rounded-3xl p-5 shadow-lg space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <span className="font-label text-xs uppercase tracking-wider text-muted-grey font-bold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">history</span>
                My Generated Library ({generatedTracks.length})
              </span>
            </div>

            {generatedTracks.length === 0 ? (
              <div className="py-6 text-center text-muted-grey font-body text-xs">
                No tracks generated yet. Your created songs will appear here.
              </div>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {generatedTracks.map((trk) => (
                  <div
                    key={trk.id}
                    className="flex items-center justify-between p-2.5 rounded-2xl bg-black/30 hover:bg-black/50 border border-white/5 transition-all group"
                  >
                    <div
                      onClick={() => playTrack(trk)}
                      className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                    >
                      <div className="relative w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-surface">
                        <img
                          src={trk.thumbnail || CURATED_STUDIO_COVERS[0]}
                          alt={trk.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-primary-container/40 transition-colors flex items-center justify-center">
                          <span className="material-symbols-outlined text-white text-lg group-hover:scale-110 transition-transform">
                            play_arrow
                          </span>
                        </div>
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-pale-cream truncate group-hover:text-primary-container transition-colors">
                          {trk.title}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-muted-grey">
                          <span className="font-mono text-primary-container/90">
                            {trk.modelUsed === 'lyria-3-pro-preview' ? 'Lyria Pro' : 'Lyria Clip'}
                          </span>
                          {trk.duration && <span>• {trk.duration}s</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => deleteGeneratedTrack(trk.id)}
                        className="p-1.5 text-muted-grey/60 hover:text-rose-400 transition-colors cursor-pointer"
                        title="Delete from history"
                      >
                        <span className="material-symbols-outlined text-base">delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cassette Mixtape Creator Modal Seeded with Generated Song */}
      <CreateCassetteModal
        isOpen={isCassetteModalOpen}
        onClose={() => setIsCassetteModalOpen(false)}
        editCassette={
          cassetteSeedTrack
            ? {
                id: '',
                title: `${cassetteSeedTrack.title} Mixtape`,
                recipientName: 'My Loved One',
                senderName: 'Me',
                note: `I composed this soundtrack specially for you using Google Lyria 3. Hope every melody brings you peace and love.`,
                themeColor: 'violet',
                sticker: '✨ Soulmate',
                createdAt: Date.now(),
                updatedAt: Date.now(),
                tracks: [cassetteSeedTrack]
              }
            : null
        }
      />
    </div>
  );
};
