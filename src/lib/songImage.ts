import React from 'react';

/**
 * Utility to resolve the actual, authentic song image/album thumbnail
 * based on YouTube video ID or verified music artwork.
 */

export const getActualSongImage = (
  trackOrId?: string | { id?: string; thumbnail?: string; title?: string } | null,
  currentThumbnail?: string
): string => {
  if (!trackOrId) {
    return 'https://i.ytimg.com/vi/ic8j13piAhQ/hqdefault.jpg';
  }

  let id = '';
  let thumb = '';

  if (typeof trackOrId === 'string') {
    id = trackOrId.trim();
    thumb = currentThumbnail || '';
  } else if (typeof trackOrId === 'object') {
    id = String(trackOrId.id || '').trim();
    thumb = String(trackOrId.thumbnail || currentThumbnail || '').trim();
  }

  // If already a valid YouTube / music CDN image (not Unsplash placeholder)
  if (
    thumb &&
    !thumb.includes('unsplash.com') &&
    (thumb.includes('ytimg.com') ||
      thumb.includes('youtube.com') ||
      thumb.includes('ggpht.com') ||
      thumb.includes('spotify.com') ||
      thumb.includes('mzstatic.com'))
  ) {
    return thumb;
  }

  // If a valid YouTube ID is present (typically 8-15 characters, alphanumeric with _ -)
  if (id && id.length >= 8 && id.length <= 20 && !id.startsWith('http') && !id.startsWith('pl-')) {
    return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
  }

  // Fallback if thumb is provided and valid
  if (thumb && thumb.startsWith('http') && !thumb.includes('unsplash.com')) {
    return thumb;
  }

  // Default high-quality song image
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : 'https://i.ytimg.com/vi/ic8j13piAhQ/hqdefault.jpg';
};

/**
 * Image error handler that cascades to standard YouTube image mirrors
 */
export const handleSongImageError = (
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  trackId?: string
) => {
  const target = e.currentTarget;
  const currentSrc = target.src;

  if (trackId && trackId.length >= 8 && trackId.length <= 20 && !trackId.startsWith('http')) {
    if (currentSrc.includes('maxresdefault.jpg')) {
      target.src = `https://i.ytimg.com/vi/${trackId}/hqdefault.jpg`;
      return;
    }
    if (currentSrc.includes('hqdefault.jpg')) {
      target.src = `https://img.youtube.com/vi/${trackId}/mqdefault.jpg`;
      return;
    }
  }

  // Fallback to Cruel Summer artwork
  if (!currentSrc.includes('ic8j13piAhQ')) {
    target.src = 'https://i.ytimg.com/vi/ic8j13piAhQ/hqdefault.jpg';
  }
};
