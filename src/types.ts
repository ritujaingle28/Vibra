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

export interface GeneratedMusicTrack extends Track {
  audioBase64?: string;
  mimeType?: string;
  prompt: string;
  modelUsed: 'lyria-3-clip-preview' | 'lyria-3-pro-preview';
  durationSeconds: number;
}

export interface CategorizedTrack extends Track {
  category: string;
  aiReason?: string;
  moodTag?: string;
}

export interface AICategory {
  id: string;
  name: string;
  icon: string;
  count?: number;
}

export interface AISuggestedMix {
  id: string;
  title: string;
  subtitle: string;
  tagline: string;
  badge: string;
  category?: string;
  colorFrom: string;
  colorTo: string;
  thumbnail: string;
  tracks: Track[];
}

export interface Cassette {
  id: string;
  title: string;
  recipientName: string;
  senderName: string;
  note: string;
  themeColor: 'rose' | 'gold' | 'violet' | 'mint' | 'cherry' | 'midnight';
  sticker?: string;
  createdAt: number;
  updatedAt: number;
  tracks: Track[];
}

export interface AICurationResponse {
  insight: string;
  categories: AICategory[];
  topPicks: CategorizedTrack[];
  suggestedMixes: AISuggestedMix[];
}
