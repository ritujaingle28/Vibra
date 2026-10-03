import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, setDoc, deleteDoc, collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

import { getActualSongImage } from '../lib/songImage';
import { Cassette } from '../types';
import { recordUserLogin } from '../lib/loginAudit';

export interface Track {
  id: string;
  title: string;
  channel: string;
  thumbnail: string;
  audioUrl?: string;
  duration?: number;
  genre?: string;
  prompt?: string;
  isGenerated?: boolean;
  lyrics?: string;
  modelUsed?: 'lyria-3-clip-preview' | 'lyria-3-pro-preview' | string;
  createdAt?: number;
}

export interface UserPlaylist {
  id: string;
  name: string;
  description: string;
  coverUrl: string;
  createdAt: number;
  updatedAt: number;
  isAIGenerated: boolean;
  prompt: string;
  tracks: Track[];
}

export interface ToastInfo {
  message: string;
  type?: 'success' | 'info' | 'error';
}

let sharedAudioContext: AudioContext | null = null;
function unlockBrowserAudio() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtx) {
      if (!sharedAudioContext || sharedAudioContext.state === 'closed') {
        sharedAudioContext = new AudioCtx();
      }
      if (sharedAudioContext.state === 'suspended') {
        sharedAudioContext.resume().catch(() => {});
      }
    }
  } catch {}
}

const cleanTrack = (track: any): Track => {
  if (!track || typeof track !== 'object' || track.nativeEvent || track.target || track._reactName || track.bubbles) {
    return { id: '', title: 'Unknown', channel: 'Unknown', thumbnail: '' };
  }
  const id = String(track.id || '');
  const title = String(track.title || 'Unknown Title');
  const channel = String(track.channel || 'Unknown Artist');
  const thumbnail = getActualSongImage({ id, thumbnail: track.thumbnail, title });

  return {
    id,
    title,
    channel,
    thumbnail,
    audioUrl: track.audioUrl || undefined,
    duration: typeof track.duration === 'number' ? track.duration : undefined,
    genre: track.genre || undefined,
    prompt: track.prompt || undefined,
    isGenerated: !!track.isGenerated,
    lyrics: track.lyrics || undefined,
    modelUsed: track.modelUsed || undefined,
    createdAt: track.createdAt || undefined,
  };
};

const DEFAULT_PLAYLISTS: UserPlaylist[] = [
  {
    id: 'pl-default-eras',
    name: 'The Eras Gold Collection',
    description: 'Iconic hits spanning Lover, 1989, Midnights, Folklore and Fearless.',
    coverUrl: 'https://i.ytimg.com/vi/ic8j13piAhQ/hqdefault.jpg',
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 86400000,
    isAIGenerated: false,
    prompt: '',
    tracks: [
      { id: 'ic8j13piAhQ', title: 'Cruel Summer', channel: 'Taylor Swift', thumbnail: 'https://i.ytimg.com/vi/ic8j13piAhQ/hqdefault.jpg' },
      { id: 'b1kbLwvqugk', title: 'Anti-Hero', channel: 'Taylor Swift', thumbnail: 'https://i.ytimg.com/vi/b1kbLwvqugk/hqdefault.jpg' },
      { id: '-CmadmM5cOk', title: 'Style (Taylor\'s Version)', channel: 'Taylor Swift', thumbnail: 'https://i.ytimg.com/vi/-CmadmM5cOk/hqdefault.jpg' },
      { id: 'e-ORhEE9VVg', title: 'Blank Space', channel: 'Taylor Swift', thumbnail: 'https://i.ytimg.com/vi/e-ORhEE9VVg/hqdefault.jpg' }
    ]
  },
  {
    id: 'pl-default-folklore',
    name: 'Autumn Cabin Acoustics',
    description: 'Warm nostalgic storytelling, rain on the roof, and delicate guitar strings.',
    coverUrl: 'https://i.ytimg.com/vi/K-a8s8OLBSE/hqdefault.jpg',
    createdAt: Date.now() - 43200000,
    updatedAt: Date.now() - 43200000,
    isAIGenerated: true,
    prompt: 'Cozy autumn cabin with woodsy acoustic folk ballads and bittersweet melodies',
    tracks: [
      { id: 'K-a8s8OLBSE', title: 'cardigan', channel: 'Taylor Swift', thumbnail: 'https://i.ytimg.com/vi/K-a8s8OLBSE/hqdefault.jpg' },
      { id: 'nn_0zPAfyo8', title: 'august', channel: 'Taylor Swift', thumbnail: 'https://i.ytimg.com/vi/nn_0zPAfyo8/hqdefault.jpg' },
      { id: 'tollGa3S0o8', title: 'All Too Well (10 Minute Version)', channel: 'Taylor Swift', thumbnail: 'https://i.ytimg.com/vi/tollGa3S0o8/hqdefault.jpg' }
    ]
  }
];

const DEFAULT_CASSETTES: Cassette[] = [
  {
    id: 'cassette-midnight-drives',
    title: 'Our Midnight Drives 🌙',
    recipientName: 'My Soulmate',
    senderName: 'Yours Forever',
    note: 'To the late-night highway drives with the windows rolled down, singing every lyric off-key with you. Every melody here is a polaroid of us. Never forget how much you mean to me.',
    themeColor: 'violet',
    sticker: '❤️ Forever & Always',
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 86400000 * 2,
    tracks: [
      { id: 'ic8j13piAhQ', title: 'Cruel Summer', channel: 'Taylor Swift', thumbnail: 'https://i.ytimg.com/vi/ic8j13piAhQ/hqdefault.jpg' },
      { id: '-BjZmE2gtdo', title: 'Lover', channel: 'Taylor Swift', thumbnail: 'https://i.ytimg.com/vi/-BjZmE2gtdo/hqdefault.jpg' },
      { id: 'V1Z586zoeeE', title: 'As It Was', channel: 'Harry Styles', thumbnail: 'https://i.ytimg.com/vi/V1Z586zoeeE/hqdefault.jpg' },
      { id: '-CmadmM5cOk', title: "Style (Taylor's Version)", channel: 'Taylor Swift', thumbnail: 'https://i.ytimg.com/vi/-CmadmM5cOk/hqdefault.jpg' }
    ]
  },
  {
    id: 'cassette-golden-hours',
    title: 'Warm Days & Coffee ☕',
    recipientName: 'Sweetheart',
    senderName: 'With Love',
    note: 'A little acoustic mixtape for your quiet mornings and coffee breaks. Whenever life gets overwhelming, press play and remember I am always right beside you.',
    themeColor: 'gold',
    sticker: '☕ Warmest Hugs',
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 86400000,
    tracks: [
      { id: 'K-a8s8OLBSE', title: 'cardigan', channel: 'Taylor Swift', thumbnail: 'https://i.ytimg.com/vi/K-a8s8OLBSE/hqdefault.jpg' },
      { id: 'nn_0zPAfyo8', title: 'august', channel: 'Taylor Swift', thumbnail: 'https://i.ytimg.com/vi/nn_0zPAfyo8/hqdefault.jpg' },
      { id: 'UEvOsQBu1jY', title: 'Apna Bana Le', channel: 'Arijit Singh', thumbnail: 'https://i.ytimg.com/vi/UEvOsQBu1jY/hqdefault.jpg' },
      { id: 'tollGa3S0o8', title: 'All Too Well (10 Minute Version)', channel: 'Taylor Swift', thumbnail: 'https://i.ytimg.com/vi/tollGa3S0o8/hqdefault.jpg' }
    ]
  }
];

interface PlayerContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  queue: Track[];
  queueIndex: number;
  currentTime: number;
  duration: number;
  seekRequest: number | null;
  likedSongs: Track[];
  recentPlays: Track[];
  playlists: UserPlaylist[];
  isPlayerExpanded: boolean;
  setIsPlayerExpanded: (expanded: boolean) => void;
  openFullScreenPlayer: () => void;
  closeFullScreenPlayer: () => void;
  shuffleMode: boolean;
  toggleShuffle: () => void;
  repeatMode: 'off' | 'all' | 'one';
  toggleRepeat: () => void;
  volume: number;
  setVolume: (vol: number) => void;
  isMuted: boolean;
  toggleMute: () => void;
  activeViewMode: 'songs' | 'video' | 'lyrics' | 'queue';
  setActiveViewMode: (mode: 'songs' | 'video' | 'lyrics' | 'queue') => void;
  isLiked: (trackId: string) => boolean;
  toggleLike: (track: Track) => Promise<boolean>;
  playTrack: (track: Track, queue?: Track[]) => void;
  addToQueue: (track: Track) => void;
  playNext: () => void;
  playPrevious: () => void;
  togglePlayPause: () => void;
  setPlayerState: (isPlaying: boolean) => void;
  stopPlayback: () => void;
  updateTime: (current: number, total: number) => void;
  seekTo: (seconds: number) => void;
  clearSeekRequest: () => void;
  shareTrack: (track: Track) => void;
  isShareModalOpen: boolean;
  sharingTrack: Track | null;
  closeShareModal: () => void;
  toast: ToastInfo | null;
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  // Playlist Management
  createPlaylist: (data: { name: string; description?: string; coverUrl?: string; tracks?: Track[]; isAIGenerated?: boolean; prompt?: string }) => Promise<string>;
  updatePlaylist: (id: string, updates: Partial<UserPlaylist>) => Promise<void>;
  deletePlaylist: (id: string) => Promise<void>;
  addTrackToPlaylist: (playlistId: string, track: Track) => Promise<void>;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => Promise<void>;
  isAddToPlaylistModalOpen: boolean;
  trackToAddToPlaylist: Track | null;
  openAddToPlaylistModal: (track: Track) => void;
  closeAddToPlaylistModal: () => void;
  // Cassette Mixtape Management
  cassettes: Cassette[];
  createCassette: (data: {
    title: string;
    recipientName: string;
    senderName: string;
    note: string;
    themeColor: 'rose' | 'gold' | 'violet' | 'mint' | 'cherry' | 'midnight';
    sticker?: string;
    tracks: Track[];
  }) => Promise<string>;
  updateCassette: (id: string, updates: Partial<Cassette>) => Promise<void>;
  deleteCassette: (id: string) => Promise<void>;
  playCassette: (cassette: Cassette, startIndex?: number) => void;
  viewingCassette: Cassette | null;
  setViewingCassette: (cassette: Cassette | null) => void;
  // Generated Music Management (Lyria 3)
  generatedTracks: Track[];
  saveGeneratedTrack: (track: Track) => Promise<void>;
  deleteGeneratedTrack: (trackId: string) => Promise<void>;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [queue, setQueue] = useState<Track[]>([]);
  const [queueIndex, setQueueIndex] = useState(-1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [seekRequest, setSeekRequest] = useState<number | null>(null);
  
  // Full-Screen Player & Extended controls state
  const [isPlayerExpanded, setIsPlayerExpanded] = useState(false);
  const [shuffleMode, setShuffleMode] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [activeViewMode, setActiveViewMode] = useState<'songs' | 'video' | 'lyrics' | 'queue'>('songs');

  const openFullScreenPlayer = () => setIsPlayerExpanded(true);
  const closeFullScreenPlayer = () => setIsPlayerExpanded(false);

  const toggleShuffle = () => {
    setShuffleMode((prev) => {
      const next = !prev;
      showToast(next ? 'Shuffle Enabled 🔀' : 'Shuffle Disabled ➡️', 'info');
      return next;
    });
  };

  const toggleRepeat = () => {
    setRepeatMode((prev) => {
      if (prev === 'off') {
        showToast('Repeat All 🔁', 'info');
        return 'all';
      }
      if (prev === 'all') {
        showToast('Repeat Current Song 🔂', 'info');
        return 'one';
      }
      showToast('Repeat Off ➡️', 'info');
      return 'off';
    });
  };

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };
  
  const [likedSongs, setLikedSongs] = useState<Track[]>(() => {
    try {
      const cached = localStorage.getItem('beatz_liked_songs');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [recentPlays, setRecentPlays] = useState<Track[]>(() => {
    try {
      const cached = localStorage.getItem('beatz_recent_plays');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [playlists, setPlaylists] = useState<UserPlaylist[]>(() => {
    try {
      const cached = localStorage.getItem('beatz_custom_playlists');
      return cached ? JSON.parse(cached) : DEFAULT_PLAYLISTS;
    } catch {
      return DEFAULT_PLAYLISTS;
    }
  });

  const [cassettes, setCassettes] = useState<Cassette[]>(() => {
    try {
      const cached = localStorage.getItem('beatz_saved_cassettes');
      return cached ? JSON.parse(cached) : DEFAULT_CASSETTES;
    } catch {
      return DEFAULT_CASSETTES;
    }
  });
  const [viewingCassette, setViewingCassette] = useState<Cassette | null>(null);

  // Generated Music Tracks (Lyria 3)
  const [generatedTracks, setGeneratedTracks] = useState<Track[]>(() => {
    try {
      const cached = localStorage.getItem('beatz_generated_tracks');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [sharingTrack, setSharingTrack] = useState<Track | null>(null);
  const [isAddToPlaylistModalOpen, setIsAddToPlaylistModalOpen] = useState(false);
  const [trackToAddToPlaylist, setTrackToAddToPlaylist] = useState<Track | null>(null);
  const [toast, setToast] = useState<ToastInfo | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((current) => (current?.message === message ? null : current));
    }, 2800);
  };

  // Sync with Firestore when auth state changes
  useEffect(() => {
    let activeUnsubscribers: (() => void)[] = [];

    const cleanupActiveSubscriptions = () => {
      activeUnsubscribers.forEach((unsub) => {
        try {
          unsub();
        } catch {}
      });
      activeUnsubscribers = [];
    };

    const unsubAuth = onAuthStateChanged(auth, (user) => {
      // Clean up previous user subscriptions immediately
      cleanupActiveSubscriptions();

      if (user) {
        // Record user login into secure admin audit collection
        recordUserLogin(user).catch(() => {});

        const currentUid = user.uid;

        // Subscribe to liked songs
        const likedRef = collection(db, 'users', currentUid, 'liked_songs');
        const qLiked = query(likedRef, orderBy('timestamp', 'desc'));
        const unsubLiked = onSnapshot(qLiked, (snapshot) => {
          const songs = snapshot.docs.map(
            (d) =>
              ({
                id: d.id,
                title: d.data().title || '',
                channel: d.data().channel || '',
                thumbnail: d.data().thumbnail || '',
              } as Track)
          );
          setLikedSongs(songs);
          try {
            localStorage.setItem('beatz_liked_songs', JSON.stringify(songs));
          } catch {}
        }, (err) => {
          if (!auth.currentUser || auth.currentUser.uid !== currentUid) {
            return;
          }
          console.warn('Firestore liked snapshot error:', err);
          if (err?.code === 'permission-denied' || String(err).includes('insufficient permissions')) {
            handleFirestoreError(err, OperationType.LIST, `users/${currentUid}/liked_songs`);
          }
        });
        activeUnsubscribers.push(unsubLiked);

        // Subscribe to recent plays
        const recentRef = collection(db, 'users', currentUid, 'recent_plays');
        const qRecent = query(recentRef, orderBy('timestamp', 'desc'));
        const unsubRecent = onSnapshot(qRecent, (snapshot) => {
          const recents = snapshot.docs.map(
            (d) =>
              ({
                id: d.id,
                title: d.data().title || '',
                channel: d.data().channel || '',
                thumbnail: d.data().thumbnail || '',
              } as Track)
          );
          setRecentPlays(recents);
          try {
            localStorage.setItem('beatz_recent_plays', JSON.stringify(recents));
          } catch {}
        }, (err) => {
          if (!auth.currentUser || auth.currentUser.uid !== currentUid) {
            return;
          }
          console.warn('Firestore recents snapshot error:', err);
          if (err?.code === 'permission-denied' || String(err).includes('insufficient permissions')) {
            handleFirestoreError(err, OperationType.LIST, `users/${currentUid}/recent_plays`);
          }
        });
        activeUnsubscribers.push(unsubRecent);

        // Subscribe to user playlists
        const playlistsRef = collection(db, 'users', currentUid, 'playlists');
        const qPlaylists = query(playlistsRef, orderBy('createdAt', 'desc'));
        const unsubPlaylists = onSnapshot(qPlaylists, (snapshot) => {
          if (!snapshot.empty) {
            const pls = snapshot.docs.map((d) => ({
              id: d.id,
              name: d.data().name || 'Untitled Playlist',
              description: d.data().description || '',
              coverUrl: d.data().coverUrl || '',
              createdAt: d.data().createdAt || Date.now(),
              updatedAt: d.data().updatedAt || Date.now(),
              isAIGenerated: !!d.data().isAIGenerated,
              prompt: d.data().prompt || '',
              tracks: Array.isArray(d.data().tracks) ? d.data().tracks : []
            } as UserPlaylist));
            setPlaylists(pls);
            try {
              localStorage.setItem('beatz_custom_playlists', JSON.stringify(pls));
            } catch {}
          }
        }, (err) => {
          if (!auth.currentUser || auth.currentUser.uid !== currentUid) {
            return;
          }
          console.warn('Firestore playlists snapshot error:', err);
          if (err?.code === 'permission-denied' || String(err).includes('insufficient permissions')) {
            handleFirestoreError(err, OperationType.LIST, `users/${currentUid}/playlists`);
          }
        });
        activeUnsubscribers.push(unsubPlaylists);

        // Subscribe to user cassettes
        const cassettesRef = collection(db, 'users', currentUid, 'cassettes');
        const qCassettes = query(cassettesRef, orderBy('createdAt', 'desc'));
        const unsubCassettes = onSnapshot(qCassettes, (snapshot) => {
          if (!snapshot.empty) {
            const list = snapshot.docs.map((d) => ({
              id: d.id,
              title: d.data().title || 'Untitled Tape',
              recipientName: d.data().recipientName || 'Loved One',
              senderName: d.data().senderName || 'Me',
              note: d.data().note || '',
              themeColor: d.data().themeColor || 'rose',
              sticker: d.data().sticker || '❤️ Forever & Always',
              createdAt: d.data().createdAt || Date.now(),
              updatedAt: d.data().updatedAt || Date.now(),
              tracks: Array.isArray(d.data().tracks) ? d.data().tracks : []
            } as Cassette));
            setCassettes(list);
            try {
              localStorage.setItem('beatz_saved_cassettes', JSON.stringify(list));
            } catch {}
          }
        }, (err) => {
          if (!auth.currentUser || auth.currentUser.uid !== currentUid) {
            return;
          }
          console.warn('Firestore cassettes snapshot error:', err);
          if (err?.code === 'permission-denied' || String(err).includes('insufficient permissions')) {
            handleFirestoreError(err, OperationType.LIST, `users/${currentUid}/cassettes`);
          }
        });
        activeUnsubscribers.push(unsubCassettes);

        // Subscribe to generated tracks
        const genRef = collection(db, 'users', currentUid, 'generated_tracks');
        const qGen = query(genRef, orderBy('createdAt', 'desc'));
        const unsubGen = onSnapshot(qGen, (snapshot) => {
          if (!snapshot.empty) {
            const list = snapshot.docs.map((d) => ({
              id: d.id,
              title: d.data().title || 'AI Track',
              channel: d.data().channel || 'Google Lyria 3',
              thumbnail: d.data().thumbnail || '',
              audioUrl: d.data().audioUrl || '',
              duration: d.data().duration,
              genre: d.data().genre,
              prompt: d.data().prompt,
              lyrics: d.data().lyrics,
              modelUsed: d.data().modelUsed,
              createdAt: d.data().createdAt || Date.now(),
              isGenerated: true
            } as Track));
            setGeneratedTracks(list);
            try {
              localStorage.setItem('beatz_generated_tracks', JSON.stringify(list));
            } catch {}
          }
        }, (err) => {
          if (!auth.currentUser || auth.currentUser.uid !== currentUid) {
            return;
          }
          console.warn('Firestore generated_tracks snapshot error:', err);
        });
        activeUnsubscribers.push(unsubGen);
      } else {
        // Fallback local storage
        try {
          const cachedLiked = localStorage.getItem('beatz_liked_songs');
          if (cachedLiked) setLikedSongs(JSON.parse(cachedLiked));
          const cachedRecent = localStorage.getItem('beatz_recent_plays');
          if (cachedRecent) setRecentPlays(JSON.parse(cachedRecent));
          const cachedPlaylists = localStorage.getItem('beatz_custom_playlists');
          if (cachedPlaylists) setPlaylists(JSON.parse(cachedPlaylists));
          const cachedCassettes = localStorage.getItem('beatz_saved_cassettes');
          if (cachedCassettes) setCassettes(JSON.parse(cachedCassettes));
          const cachedGen = localStorage.getItem('beatz_generated_tracks');
          if (cachedGen) setGeneratedTracks(JSON.parse(cachedGen));
        } catch {}
      }
    });

    return () => {
      cleanupActiveSubscriptions();
      unsubAuth();
    };
  }, []);

  const savePlaylistsLocally = (newList: UserPlaylist[]) => {
    setPlaylists(newList);
    try {
      localStorage.setItem('beatz_custom_playlists', JSON.stringify(newList));
    } catch {}
  };

  const createPlaylist = async (data: {
    name: string;
    description?: string;
    coverUrl?: string;
    tracks?: Track[];
    isAIGenerated?: boolean;
    prompt?: string;
  }): Promise<string> => {
    const newId = 'pl-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
    const now = Date.now();
    const newPlaylist: UserPlaylist = {
      id: newId,
      name: data.name.trim() || 'New Playlist',
      description: data.description?.trim() || 'Curated track collection',
      coverUrl: data.coverUrl || (data.tracks && data.tracks[0]?.thumbnail) || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
      createdAt: now,
      updatedAt: now,
      isAIGenerated: !!data.isAIGenerated,
      prompt: data.prompt || '',
      tracks: data.tracks || []
    };

    const updated = [newPlaylist, ...playlists];
    savePlaylistsLocally(updated);
    showToast(`Created playlist "${newPlaylist.name}" 🎵`, 'success');

    if (auth.currentUser) {
      try {
        const plRef = doc(db, 'users', auth.currentUser.uid, 'playlists', newId);
        await setDoc(plRef, {
          name: newPlaylist.name,
          description: newPlaylist.description,
          coverUrl: newPlaylist.coverUrl,
          createdAt: newPlaylist.createdAt,
          updatedAt: newPlaylist.updatedAt,
          isAIGenerated: newPlaylist.isAIGenerated,
          prompt: newPlaylist.prompt,
          tracks: newPlaylist.tracks
        });
      } catch (err: any) {
        console.error('Error saving playlist in Firestore:', err);
        if (err?.code === 'permission-denied' || String(err).includes('insufficient permissions')) {
          handleFirestoreError(err, OperationType.CREATE, `users/${auth.currentUser.uid}/playlists/${newId}`);
        }
      }
    }

    return newId;
  };

  const updatePlaylist = async (id: string, updates: Partial<UserPlaylist>) => {
    const updated = playlists.map((pl) => {
      if (pl.id === id) {
        return {
          ...pl,
          ...updates,
          updatedAt: Date.now()
        };
      }
      return pl;
    });

    savePlaylistsLocally(updated);
    showToast('Playlist updated ✨', 'success');

    if (auth.currentUser) {
      try {
        const plRef = doc(db, 'users', auth.currentUser.uid, 'playlists', id);
        const target = updated.find((p) => p.id === id);
        if (target) {
          await setDoc(plRef, {
            name: target.name,
            description: target.description,
            coverUrl: target.coverUrl,
            createdAt: target.createdAt,
            updatedAt: target.updatedAt,
            isAIGenerated: target.isAIGenerated,
            prompt: target.prompt,
            tracks: target.tracks
          }, { merge: true });
        }
      } catch (err: any) {
        console.error('Error updating playlist in Firestore:', err);
        if (err?.code === 'permission-denied' || String(err).includes('insufficient permissions')) {
          handleFirestoreError(err, OperationType.UPDATE, `users/${auth.currentUser.uid}/playlists/${id}`);
        }
      }
    }
  };

  const deletePlaylist = async (id: string) => {
    const target = playlists.find((p) => p.id === id);
    const updated = playlists.filter((p) => p.id !== id);
    savePlaylistsLocally(updated);
    showToast(`Deleted playlist "${target?.name || ''}"`, 'info');

    if (auth.currentUser) {
      try {
        const plRef = doc(db, 'users', auth.currentUser.uid, 'playlists', id);
        await deleteDoc(plRef);
      } catch (err: any) {
        console.error('Error deleting playlist from Firestore:', err);
        if (err?.code === 'permission-denied' || String(err).includes('insufficient permissions')) {
          handleFirestoreError(err, OperationType.DELETE, `users/${auth.currentUser.uid}/playlists/${id}`);
        }
      }
    }
  };

  const addTrackToPlaylist = async (playlistId: string, rawTrack: Track) => {
    const track = cleanTrack(rawTrack);
    if (!track.id) return;

    let targetPlaylistName = '';
    const updated = playlists.map((pl) => {
      if (pl.id === playlistId) {
        targetPlaylistName = pl.name;
        // Avoid duplicate additions
        const exists = pl.tracks.some((t) => t.id === track.id);
        const newTracks = exists ? pl.tracks : [...pl.tracks, track];
        return {
          ...pl,
          tracks: newTracks,
          updatedAt: Date.now(),
          coverUrl: pl.coverUrl || track.thumbnail
        };
      }
      return pl;
    });

    savePlaylistsLocally(updated);
    showToast(`Added "${track.title}" to ${targetPlaylistName || 'Playlist'} 🎶`, 'success');

    if (auth.currentUser) {
      try {
        const plRef = doc(db, 'users', auth.currentUser.uid, 'playlists', playlistId);
        const target = updated.find((p) => p.id === playlistId);
        if (target) {
          await setDoc(plRef, {
            name: target.name,
            description: target.description,
            coverUrl: target.coverUrl,
            createdAt: target.createdAt,
            updatedAt: target.updatedAt,
            isAIGenerated: target.isAIGenerated,
            prompt: target.prompt,
            tracks: target.tracks
          }, { merge: true });
        }
      } catch (err) {
        console.error('Error adding track to playlist in Firestore:', err);
      }
    }
  };

  const removeTrackFromPlaylist = async (playlistId: string, trackId: string) => {
    const updated = playlists.map((pl) => {
      if (pl.id === playlistId) {
        return {
          ...pl,
          tracks: pl.tracks.filter((t) => t.id !== trackId),
          updatedAt: Date.now()
        };
      }
      return pl;
    });

    savePlaylistsLocally(updated);
    showToast('Removed track from playlist', 'info');

    if (auth.currentUser) {
      try {
        const plRef = doc(db, 'users', auth.currentUser.uid, 'playlists', playlistId);
        const target = updated.find((p) => p.id === playlistId);
        if (target) {
          await setDoc(plRef, {
            name: target.name,
            description: target.description,
            coverUrl: target.coverUrl,
            createdAt: target.createdAt,
            updatedAt: target.updatedAt,
            isAIGenerated: target.isAIGenerated,
            prompt: target.prompt,
            tracks: target.tracks
          }, { merge: true });
        }
      } catch (err) {
        console.error('Error removing track from playlist in Firestore:', err);
      }
    }
  };

  const openAddToPlaylistModal = (track: Track) => {
    setTrackToAddToPlaylist(cleanTrack(track));
    setIsAddToPlaylistModalOpen(true);
  };

  const closeAddToPlaylistModal = () => {
    setIsAddToPlaylistModalOpen(false);
    setTrackToAddToPlaylist(null);
  };

  const saveCassettesLocally = (newList: Cassette[]) => {
    setCassettes(newList);
    try {
      localStorage.setItem('beatz_saved_cassettes', JSON.stringify(newList));
    } catch {}
  };

  const createCassette = async (data: {
    title: string;
    recipientName: string;
    senderName: string;
    note: string;
    themeColor: 'rose' | 'gold' | 'violet' | 'mint' | 'cherry' | 'midnight';
    sticker?: string;
    tracks: Track[];
  }): Promise<string> => {
    const newId = 'cst-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
    const now = Date.now();
    const newCassette: Cassette = {
      id: newId,
      title: data.title?.trim() || 'Untitled Mixtape',
      recipientName: data.recipientName?.trim() || 'My Loved One',
      senderName: data.senderName?.trim() || 'Me',
      note: data.note?.trim() || '',
      themeColor: data.themeColor || 'rose',
      sticker: data.sticker || '❤️ Forever & Always',
      createdAt: now,
      updatedAt: now,
      tracks: (data.tracks || []).map(cleanTrack).filter((t) => t.id)
    };

    const updated = [newCassette, ...cassettes];
    saveCassettesLocally(updated);
    showToast(`Cassette "${newCassette.title}" created for ${newCassette.recipientName} 📼💌`, 'success');

    if (auth.currentUser) {
      try {
        const cRef = doc(db, 'users', auth.currentUser.uid, 'cassettes', newId);
        await setDoc(cRef, {
          title: newCassette.title,
          recipientName: newCassette.recipientName,
          senderName: newCassette.senderName,
          note: newCassette.note,
          themeColor: newCassette.themeColor,
          sticker: newCassette.sticker || '',
          createdAt: newCassette.createdAt,
          updatedAt: newCassette.updatedAt,
          tracks: newCassette.tracks
        });
      } catch (err: any) {
        console.error('Error saving cassette in Firestore:', err);
        if (err?.code === 'permission-denied' || String(err).includes('insufficient permissions')) {
          handleFirestoreError(err, OperationType.CREATE, `users/${auth.currentUser.uid}/cassettes/${newId}`);
        }
      }
    }

    return newId;
  };

  const updateCassette = async (id: string, updates: Partial<Cassette>) => {
    const updated = cassettes.map((c) => {
      if (c.id === id) {
        return {
          ...c,
          ...updates,
          updatedAt: Date.now()
        };
      }
      return c;
    });

    saveCassettesLocally(updated);
    showToast('Cassette updated ✨', 'success');

    if (auth.currentUser) {
      try {
        const cRef = doc(db, 'users', auth.currentUser.uid, 'cassettes', id);
        const target = updated.find((c) => c.id === id);
        if (target) {
          await setDoc(cRef, {
            title: target.title,
            recipientName: target.recipientName,
            senderName: target.senderName,
            note: target.note,
            themeColor: target.themeColor,
            sticker: target.sticker || '',
            createdAt: target.createdAt,
            updatedAt: target.updatedAt,
            tracks: target.tracks
          }, { merge: true });
        }
      } catch (err: any) {
        console.error('Error updating cassette in Firestore:', err);
        if (err?.code === 'permission-denied' || String(err).includes('insufficient permissions')) {
          handleFirestoreError(err, OperationType.UPDATE, `users/${auth.currentUser.uid}/cassettes/${id}`);
        }
      }
    }
  };

  const deleteCassette = async (id: string) => {
    const target = cassettes.find((c) => c.id === id);
    const updated = cassettes.filter((c) => c.id !== id);
    saveCassettesLocally(updated);
    showToast(`Deleted cassette "${target?.title || ''}"`, 'info');

    if (auth.currentUser) {
      try {
        const cRef = doc(db, 'users', auth.currentUser.uid, 'cassettes', id);
        await deleteDoc(cRef);
      } catch (err: any) {
        console.error('Error deleting cassette from Firestore:', err);
        if (err?.code === 'permission-denied' || String(err).includes('insufficient permissions')) {
          handleFirestoreError(err, OperationType.DELETE, `users/${auth.currentUser.uid}/cassettes/${id}`);
        }
      }
    }
  };

  const saveGeneratedTrack = async (track: Track) => {
    const cleaned = cleanTrack({ ...track, isGenerated: true, createdAt: track.createdAt || Date.now() });
    setGeneratedTracks((prev) => {
      const updated = [cleaned, ...prev.filter((t) => t.id !== cleaned.id)];
      try {
        localStorage.setItem('beatz_generated_tracks', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    showToast(`Saved "${cleaned.title}" to Library ✨`, 'success');

    if (auth.currentUser) {
      try {
        const trackRef = doc(db, 'users', auth.currentUser.uid, 'generated_tracks', cleaned.id);
        await setDoc(trackRef, {
          title: cleaned.title,
          channel: cleaned.channel,
          thumbnail: cleaned.thumbnail,
          audioUrl: cleaned.audioUrl || '',
          duration: cleaned.duration || 30,
          genre: cleaned.genre || '',
          prompt: cleaned.prompt || '',
          lyrics: cleaned.lyrics || '',
          modelUsed: cleaned.modelUsed || 'lyria-3-clip-preview',
          createdAt: cleaned.createdAt || Date.now(),
          isGenerated: true
        });
      } catch (err: any) {
        console.warn('Error saving generated track in Firestore:', err);
      }
    }
  };

  const deleteGeneratedTrack = async (trackId: string) => {
    setGeneratedTracks((prev) => {
      const updated = prev.filter((t) => t.id !== trackId);
      try {
        localStorage.setItem('beatz_generated_tracks', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    showToast('Track removed from Library', 'info');

    if (auth.currentUser) {
      try {
        const trackRef = doc(db, 'users', auth.currentUser.uid, 'generated_tracks', trackId);
        await deleteDoc(trackRef);
      } catch (err: any) {
        console.warn('Error deleting generated track in Firestore:', err);
      }
    }
  };

  const playCassette = (cassette: Cassette, startIndex = 0) => {
    if (!cassette.tracks || cassette.tracks.length === 0) {
      showToast('This cassette has no songs. Add some tracks first! 📼', 'info');
      return;
    }
    const cleanTracks = cassette.tracks.map(cleanTrack).filter((t) => t.id);
    const startTrack = cleanTracks[startIndex] || cleanTracks[0];
    playTrack(startTrack, cleanTracks);
    showToast(`Playing "${cassette.title}" for ${cassette.recipientName} 📼✨`, 'success');
  };

  const saveToRecentPlays = async (rawTrack: Track) => {
    const track = cleanTrack(rawTrack);
    if (!track.id) return;

    // Update state immediately
    setRecentPlays((prev) => {
      const filtered = prev.filter((t) => t.id !== track.id);
      const updated = [track, ...filtered].slice(0, 25);
      try {
        localStorage.setItem('beatz_recent_plays', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    if (auth.currentUser) {
      try {
        const trackRef = doc(db, 'users', auth.currentUser.uid, 'recent_plays', track.id);
        await setDoc(trackRef, {
          title: track.title,
          channel: track.channel,
          thumbnail: track.thumbnail,
          timestamp: Date.now(),
        });
      } catch (error: any) {
        console.error('Error saving to recent plays:', error);
        if (error?.code === 'permission-denied' || String(error).includes('insufficient permissions')) {
          handleFirestoreError(error, OperationType.CREATE, `users/${auth.currentUser.uid}/recent_plays/${track.id}`);
        }
      }
    }
  };

  const isLiked = (trackId: string): boolean => {
    return likedSongs.some((t) => t.id === trackId);
  };

  const toggleLike = async (rawTrack: Track): Promise<boolean> => {
    const track = cleanTrack(rawTrack);
    if (!track.id) return false;

    const currentlyLiked = isLiked(track.id);
    const newStatus = !currentlyLiked;

    // Optimistic local update
    setLikedSongs((prev) => {
      let updated: Track[];
      if (currentlyLiked) {
        updated = prev.filter((t) => t.id !== track.id);
      } else {
        updated = [track, ...prev.filter((t) => t.id !== track.id)];
      }
      try {
        localStorage.setItem('beatz_liked_songs', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    if (newStatus) {
      showToast(`Added "${track.title}" to Liked Songs ❤️`);
    } else {
      showToast(`Removed from Liked Songs`);
    }

    if (auth.currentUser) {
      try {
        const trackRef = doc(db, 'users', auth.currentUser.uid, 'liked_songs', track.id);
        if (newStatus) {
          await setDoc(trackRef, {
            title: track.title,
            channel: track.channel,
            thumbnail: track.thumbnail,
            timestamp: Date.now(),
          });
        } else {
          await deleteDoc(trackRef);
        }
      } catch (err: any) {
        console.error('Error updating like in Firestore:', err);
        if (err?.code === 'permission-denied' || String(err).includes('insufficient permissions')) {
          handleFirestoreError(err, newStatus ? OperationType.CREATE : OperationType.DELETE, `users/${auth.currentUser.uid}/liked_songs/${track.id}`);
        }
      }
    }

    return newStatus;
  };

  const shareTrack = (track: Track) => {
    setSharingTrack(track);
    setIsShareModalOpen(true);
  };

  const closeShareModal = () => {
    setIsShareModalOpen(false);
    setSharingTrack(null);
  };

  const playTrack = (track: Track, newQueue?: Track[]) => {
    unlockBrowserAudio();

    setCurrentTrack(track);
    setIsPlaying(true);
    setCurrentTime(0);
    setDuration(0);

    saveToRecentPlays(track);

    if (newQueue) {
      setQueue(newQueue);
      const index = newQueue.findIndex((t) => t.id === track.id);
      setQueueIndex(index !== -1 ? index : 0);
    } else if (queue.length === 0) {
      setQueue([track]);
      setQueueIndex(0);
    }
  };

  const addToQueue = (track: Track) => {
    setQueue((prev) => {
      if (prev.some((t) => t.id === track.id)) {
        showToast(`"${track.title}" is already in queue`);
        return prev;
      }
      showToast(`Added "${track.title}" to queue`);
      if (prev.length === 0) {
        setQueueIndex(0);
        setCurrentTrack(track);
      }
      return [...prev, track];
    });
  };

  const playNext = () => {
    if (queue.length === 0) return;

    if (repeatMode === 'one' && currentTrack) {
      seekTo(0);
      setIsPlaying(true);
      return;
    }

    if (shuffleMode && queue.length > 1) {
      let nextIdx = Math.floor(Math.random() * queue.length);
      if (nextIdx === queueIndex) {
        nextIdx = (queueIndex + 1) % queue.length;
      }
      setQueueIndex(nextIdx);
      setCurrentTrack(queue[nextIdx]);
      setIsPlaying(true);
      saveToRecentPlays(queue[nextIdx]);
      return;
    }

    if (queueIndex < queue.length - 1) {
      const nextIndex = queueIndex + 1;
      setQueueIndex(nextIndex);
      setCurrentTrack(queue[nextIndex]);
      setIsPlaying(true);
      saveToRecentPlays(queue[nextIndex]);
    } else if (repeatMode === 'all' && queue.length > 0) {
      setQueueIndex(0);
      setCurrentTrack(queue[0]);
      setIsPlaying(true);
      saveToRecentPlays(queue[0]);
    }
  };

  const playPrevious = () => {
    if (queue.length === 0) return;

    // If more than 3 seconds into track, restart current track
    if (currentTime > 3) {
      seekTo(0);
      return;
    }

    if (shuffleMode && queue.length > 1) {
      const prevIdx = Math.floor(Math.random() * queue.length);
      setQueueIndex(prevIdx);
      setCurrentTrack(queue[prevIdx]);
      setIsPlaying(true);
      saveToRecentPlays(queue[prevIdx]);
      return;
    }

    if (queueIndex > 0) {
      const prevIndex = queueIndex - 1;
      setQueueIndex(prevIndex);
      setCurrentTrack(queue[prevIndex]);
      setIsPlaying(true);
      saveToRecentPlays(queue[prevIndex]);
    } else if (repeatMode === 'all' && queue.length > 0) {
      const lastIndex = queue.length - 1;
      setQueueIndex(lastIndex);
      setCurrentTrack(queue[lastIndex]);
      setIsPlaying(true);
      saveToRecentPlays(queue[lastIndex]);
    } else {
      seekTo(0);
    }
  };

  const togglePlayPause = () => {
    unlockBrowserAudio();

    setIsPlaying((prev) => !prev);
  };

  const setPlayerState = (playing: boolean) => {
    setIsPlaying(playing);
  };

  const stopPlayback = () => {
    setIsPlaying(false);
  };

  const updateTime = (current: number, total: number) => {
    setCurrentTime(current);
    if (total > 0) {
      setDuration(total);
    }
  };

  const seekTo = (seconds: number) => {
    setSeekRequest(seconds);
  };

  const clearSeekRequest = () => {
    setSeekRequest(null);
  };

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        queue,
        queueIndex,
        currentTime,
        duration,
        seekRequest,
        likedSongs,
        recentPlays,
        playlists,
        isPlayerExpanded,
        setIsPlayerExpanded,
        openFullScreenPlayer,
        closeFullScreenPlayer,
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
        isLiked,
        toggleLike,
        playTrack,
        addToQueue,
        playNext,
        playPrevious,
        togglePlayPause,
        setPlayerState,
        stopPlayback,
        updateTime,
        seekTo,
        clearSeekRequest,
        shareTrack,
        isShareModalOpen,
        sharingTrack,
        closeShareModal,
        toast,
        showToast,
        createPlaylist,
        updatePlaylist,
        deletePlaylist,
        addTrackToPlaylist,
        removeTrackFromPlaylist,
        isAddToPlaylistModalOpen,
        trackToAddToPlaylist,
        openAddToPlaylistModal,
        closeAddToPlaylistModal,
        cassettes,
        createCassette,
        updateCassette,
        deleteCassette,
        playCassette,
        viewingCassette,
        setViewingCassette,
        generatedTracks,
        saveGeneratedTrack,
        deleteGeneratedTrack,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};

