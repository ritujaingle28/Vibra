import React, { useState, useEffect } from 'react';

export interface AvatarConfig {
  skinTone: string;
  hairStyle: 'wavy-long' | 'bob-bangs' | 'curly-afro' | 'fade-short' | 'high-ponytail' | 'messy-bun' | 'braids-locs' | 'slicked-back' | 'wolf-cut';
  hairColor: string;
  eyeColor: string;
  expression: 'smile' | 'wink' | 'smirk' | 'dreamy';
  blush: boolean;
  freckles: boolean;
  beautyMark: boolean;
  outfit: 'hoodie' | 'denim-jacket' | 'cardigan' | 'leather-jacket' | 'blazer' | 'vintage-tee';
  outfitColor: string;
  glasses: 'none' | 'round-wire' | 'cat-eye' | 'sunglasses' | 'tinted-oval';
  headwear: 'none' | 'beanie' | 'cap' | 'beret' | 'headband';
  earrings: 'none' | 'gold-hoops' | 'diamond-studs';
  storyRing: 'instagram-classic' | 'close-friends' | 'lavender-dream' | 'golden-hour' | 'none';
  background: 'sunset-glow' | 'purple-haze' | 'mint-fresh' | 'velvet-night' | 'sunny-cream';
}

export const DEFAULT_AVATAR_CONFIG: AvatarConfig = {
  skinTone: '#fce5d8',
  hairStyle: 'wavy-long',
  hairColor: '#3b2314',
  eyeColor: '#3a2312',
  expression: 'smile',
  blush: true,
  freckles: false,
  beautyMark: true,
  outfit: 'hoodie',
  outfitColor: '#b8a4d4',
  glasses: 'none',
  headwear: 'none',
  earrings: 'gold-hoops',
  storyRing: 'instagram-classic',
  background: 'sunset-glow',
};

export const SKIN_TONES = [
  { id: '#fce5d8', label: 'Fair Rose', shadow: '#e8c4b2' },
  { id: '#f7d8c0', label: 'Warm Ivory', shadow: '#e0b89f' },
  { id: '#e5b78f', label: 'Honey Tan', shadow: '#c9986f' },
  { id: '#d69e6e', label: 'Golden Olive', shadow: '#b88052' },
  { id: '#b77648', label: 'Caramel Bronze', shadow: '#965b32' },
  { id: '#8c532b', label: 'Warm Chestnut', shadow: '#6f3e1b' },
  { id: '#5c341b', label: 'Rich Espresso', shadow: '#42220f' },
  { id: '#3e2114', label: 'Deep Cocoa', shadow: '#29130a' },
];

export const HAIR_COLORS = [
  { id: '#1a1a1a', label: 'Jet Black' },
  { id: '#3b2314', label: 'Espresso' },
  { id: '#59361e', label: 'Chestnut' },
  { id: '#e5b567', label: 'Honey Blonde' },
  { id: '#e8eaf0', label: 'Platinum' },
  { id: '#a34424', label: 'Auburn' },
  { id: '#ff8ebb', label: 'Pastel Pink' },
  { id: '#ba85ef', label: 'Lavender' },
  { id: '#29c7c2', label: 'Electric Teal' },
];

export const EYE_COLORS = [
  { id: '#3a2312', label: 'Deep Brown' },
  { id: '#1976d2', label: 'Ocean Blue' },
  { id: '#2e7d32', label: 'Emerald' },
  { id: '#d97706', label: 'Amber' },
  { id: '#7c3aed', label: 'Amethyst' },
  { id: '#18181b', label: 'Obsidian' },
];

export const OUTFIT_COLORS = [
  { id: '#b8a4d4', label: 'Pastel Lavender' },
  { id: '#e1306c', label: 'Instagram Berry' },
  { id: '#1f2421', label: 'Pitch Black' },
  { id: '#4a5843', label: 'Sage Olive' },
  { id: '#ece5d8', label: 'Vintage Cream' },
  { id: '#c45d3e', label: 'Terracotta' },
  { id: '#1d2a44', label: 'Midnight Blue' },
  { id: '#f59e0b', label: 'Sunflower' },
];

export const HAIR_STYLES = [
  { id: 'wavy-long', label: 'Wavy Long', icon: '🌊' },
  { id: 'bob-bangs', label: 'Chic Bob', icon: '💇' },
  { id: 'curly-afro', label: 'Curly Afro', icon: '🌀' },
  { id: 'fade-short', label: 'Modern Fade', icon: '✂️' },
  { id: 'high-ponytail', label: 'High Pony', icon: '👱' },
  { id: 'messy-bun', label: 'Top Knot', icon: '🎀' },
  { id: 'braids-locs', label: 'Braided Locs', icon: '✨' },
  { id: 'slicked-back', label: 'Slicked Back', icon: '🎩' },
  { id: 'wolf-cut', label: 'Wolf Cut', icon: '🐺' },
];

export const OUTFIT_STYLES = [
  { id: 'hoodie', label: 'Oversized Hoodie', icon: '🧥' },
  { id: 'denim-jacket', label: 'Denim Jacket', icon: '👖' },
  { id: 'cardigan', label: 'Cozy Cardigan', icon: '🧶' },
  { id: 'leather-jacket', label: 'Biker Leather', icon: '🕶️' },
  { id: 'blazer', label: 'Modern Blazer', icon: '👔' },
  { id: 'vintage-tee', label: 'Vintage Tee', icon: '👕' },
];

export const GLASSES_OPTIONS = [
  { id: 'none', label: 'None' },
  { id: 'round-wire', label: 'Gold Wire Round' },
  { id: 'cat-eye', label: 'Cat Eye Frames' },
  { id: 'sunglasses', label: 'Classic Shades' },
  { id: 'tinted-oval', label: '90s Tinted Oval' },
];

export const HEADWEAR_OPTIONS = [
  { id: 'none', label: 'None' },
  { id: 'beanie', label: 'Ribbed Beanie' },
  { id: 'cap', label: 'Baseball Cap' },
  { id: 'beret', label: 'Chic Beret' },
  { id: 'headband', label: 'Wide Headband' },
];

export const STORY_RINGS = [
  { id: 'instagram-classic', label: 'Instagram Sunset (Gradient)', color: 'from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]' },
  { id: 'close-friends', label: 'Close Friends (Neon Green)', color: 'from-[#00e676] to-[#00b0ff]' },
  { id: 'lavender-dream', label: 'Lavender Dream (Violet)', color: 'from-[#e879f9] to-[#818cf8]' },
  { id: 'golden-hour', label: 'Golden Hour (VIP)', color: 'from-[#fbbf24] to-[#f59e0b]' },
  { id: 'none', label: 'Clean (No Ring)', color: 'from-transparent to-transparent' },
];

export const BACKGROUND_GRADIENTS = [
  { id: 'sunset-glow', label: 'Sunset Glow', css: 'linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)' },
  { id: 'purple-haze', label: 'Purple Haze', css: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { id: 'mint-fresh', label: 'Mint Fresh', css: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)' },
  { id: 'velvet-night', label: 'Velvet Night', css: 'linear-gradient(135deg, #240b36 0%, #c31432 100%)' },
  { id: 'sunny-cream', label: 'Warm Pastel', css: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)' },
];

// Generates scalable vector SVG data URL representation of the customized avatar
export function generateAvatarSvg(cfg: AvatarConfig): string {
  const bgMap: Record<string, string> = {
    'sunset-glow': 'url(#bg-sunset)',
    'purple-haze': 'url(#bg-purple)',
    'mint-fresh': 'url(#bg-mint)',
    'velvet-night': 'url(#bg-velvet)',
    'sunny-cream': 'url(#bg-pastel)',
  };

  const skin = cfg.skinTone;
  const hair = cfg.hairColor;
  const eyes = cfg.eyeColor;
  const outfit = cfg.outfitColor;

  // Render SVG layers
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
  <defs>
    <linearGradient id="bg-sunset" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f09433"/>
      <stop offset="50%" stop-color="#dc2743"/>
      <stop offset="100%" stop-color="#bc1888"/>
    </linearGradient>
    <linearGradient id="bg-purple" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#667eea"/>
      <stop offset="100%" stop-color="#764ba2"/>
    </linearGradient>
    <linearGradient id="bg-mint" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#84fab0"/>
      <stop offset="100%" stop-color="#8fd3f4"/>
    </linearGradient>
    <linearGradient id="bg-velvet" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#240b36"/>
      <stop offset="100%" stop-color="#88102a"/>
    </linearGradient>
    <linearGradient id="bg-pastel" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ff9a9e"/>
      <stop offset="100%" stop-color="#fecfef"/>
    </linearGradient>
    <linearGradient id="ig-ring" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f9ce34"/>
      <stop offset="40%" stop-color="#ee2a7b"/>
      <stop offset="100%" stop-color="#6228d7"/>
    </linearGradient>
    <linearGradient id="cf-ring" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00e676"/>
      <stop offset="100%" stop-color="#00b0ff"/>
    </linearGradient>
  </defs>

  <!-- Background Circle -->
  <circle cx="100" cy="100" r="95" fill="${bgMap[cfg.background] || '#333'}"/>

  <!-- Shoulders & Outfit -->
  <g id="outfit">
    <!-- Body base -->
    <path d="M 40 185 C 40 148, 65 140, 100 140 C 135 140, 160 148, 160 185 Z" fill="${outfit}"/>
    
    <!-- Neck -->
    <path d="M 85 115 L 85 148 Q 100 152 115 148 L 115 115 Z" fill="${skin}"/>
    <path d="M 85 130 Q 100 138 115 130 L 115 140 Q 100 148 85 140 Z" fill="#000000" opacity="0.08"/>

    ${cfg.outfit === 'hoodie' ? `
      <!-- Hoodie details -->
      <path d="M 75 146 Q 100 162 125 146 Q 100 170 75 146 Z" fill="#ffffff" opacity="0.25"/>
      <circle cx="92" cy="160" r="2" fill="#ffffff" opacity="0.6"/>
      <circle cx="108" cy="160" r="2" fill="#ffffff" opacity="0.6"/>
      <path d="M 92 162 L 92 178" stroke="#ffffff" stroke-width="2" opacity="0.6" stroke-linecap="round"/>
      <path d="M 108 162 L 108 175" stroke="#ffffff" stroke-width="2" opacity="0.6" stroke-linecap="round"/>
    ` : ''}

    ${cfg.outfit === 'denim-jacket' ? `
      <!-- Denim jacket lapels -->
      <path d="M 82 142 L 70 185" stroke="#ffffff" stroke-width="2" opacity="0.3"/>
      <path d="M 118 142 L 130 185" stroke="#ffffff" stroke-width="2" opacity="0.3"/>
      <path d="M 90 145 L 100 160 L 110 145 Z" fill="#ffffff" opacity="0.3"/>
    ` : ''}

    ${cfg.outfit === 'cardigan' ? `
      <!-- Cardigan V-neck & buttons -->
      <path d="M 88 140 L 100 165 L 112 140 Z" fill="#ffffff" opacity="0.35"/>
      <circle cx="100" cy="172" r="2" fill="#ffffff" opacity="0.8"/>
      <circle cx="100" cy="182" r="2" fill="#ffffff" opacity="0.8"/>
    ` : ''}

    ${cfg.outfit === 'leather-jacket' ? `
      <!-- Biker zipper & lapels -->
      <path d="M 70 145 L 90 185" stroke="#ffffff" stroke-width="2.5" opacity="0.4"/>
      <path d="M 85 140 L 75 160 L 92 155 Z" fill="#ffffff" opacity="0.18"/>
      <path d="M 115 140 L 125 160 L 108 155 Z" fill="#ffffff" opacity="0.18"/>
    ` : ''}
  </g>

  <!-- Head Base & Ears -->
  <g id="head">
    <!-- Ears -->
    <ellipse cx="62" cy="100" rx="8" ry="12" fill="${skin}"/>
    <ellipse cx="138" cy="100" rx="8" ry="12" fill="${skin}"/>
    
    ${cfg.earrings === 'gold-hoops' ? `
      <circle cx="62" cy="108" r="6" stroke="#ffd700" stroke-width="2" fill="none"/>
      <circle cx="138" cy="108" r="6" stroke="#ffd700" stroke-width="2" fill="none"/>
    ` : ''}
    ${cfg.earrings === 'diamond-studs' ? `
      <circle cx="62" cy="106" r="3" fill="#ffffff" stroke="#90caf9" stroke-width="1"/>
      <circle cx="138" cy="106" r="3" fill="#ffffff" stroke="#90caf9" stroke-width="1"/>
    ` : ''}

    <!-- Face shape -->
    <path d="M 68 85 Q 65 125 100 132 Q 135 125 132 85 Q 130 50 100 50 Q 70 50 68 85 Z" fill="${skin}"/>

    <!-- Cheek Blush -->
    ${cfg.blush ? `
      <circle cx="78" cy="106" r="8" fill="#ff4081" opacity="0.25"/>
      <circle cx="122" cy="106" r="8" fill="#ff4081" opacity="0.25"/>
    ` : ''}

    <!-- Freckles -->
    ${cfg.freckles ? `
      <circle cx="82" cy="104" r="1" fill="#795548" opacity="0.7"/>
      <circle cx="86" cy="107" r="1.1" fill="#795548" opacity="0.7"/>
      <circle cx="92" cy="105" r="0.9" fill="#795548" opacity="0.7"/>
      <circle cx="108" cy="105" r="0.9" fill="#795548" opacity="0.7"/>
      <circle cx="114" cy="107" r="1.1" fill="#795548" opacity="0.7"/>
      <circle cx="118" cy="104" r="1" fill="#795548" opacity="0.7"/>
    ` : ''}

    <!-- Beauty Mark -->
    ${cfg.beautyMark ? `
      <circle cx="117" cy="112" r="1.3" fill="#3e2723"/>
    ` : ''}

    <!-- Nose -->
    <path d="M 98 96 Q 100 106 103 105 Q 98 107 97 106" stroke="#000000" stroke-width="1.5" stroke-linecap="round" fill="none" opacity="0.35"/>

    <!-- Eyes & Brows -->
    <!-- Left Eyebrow -->
    <path d="M 74 80 Q 84 76 94 80" stroke="${hair}" stroke-width="2.5" stroke-linecap="round" fill="none"/>
    <!-- Right Eyebrow -->
    <path d="M 106 80 Q 116 76 126 80" stroke="${hair}" stroke-width="2.5" stroke-linecap="round" fill="none"/>

    ${cfg.expression === 'wink' ? `
      <!-- Left Eye open -->
      <ellipse cx="84" cy="90" rx="6" ry="7" fill="#ffffff"/>
      <circle cx="85" cy="90" r="4" fill="${eyes}"/>
      <circle cx="86" cy="88" r="1.5" fill="#ffffff"/>
      <!-- Right Eye Winking -->
      <path d="M 110 91 Q 116 85 122 91" stroke="#222" stroke-width="2.5" stroke-linecap="round" fill="none"/>
    ` : `
      <!-- Both Eyes Open -->
      <ellipse cx="84" cy="90" rx="6" ry="7" fill="#ffffff"/>
      <circle cx="85" cy="90" r="4" fill="${eyes}"/>
      <circle cx="86" cy="88" r="1.5" fill="#ffffff"/>

      <ellipse cx="116" cy="90" rx="6" ry="7" fill="#ffffff"/>
      <circle cx="115" cy="90" r="4" fill="${eyes}"/>
      <circle cx="116" cy="88" r="1.5" fill="#ffffff"/>
    `}

    <!-- Mouth / Smile -->
    ${cfg.expression === 'smirk' ? `
      <path d="M 92 118 Q 102 121 112 116" stroke="#b71c1c" stroke-width="2.5" stroke-linecap="round" fill="none"/>
    ` : `
      <path d="M 90 117 Q 100 126 110 117 Q 100 122 90 117 Z" fill="#d32f2f"/>
      <path d="M 92 118 Q 100 121 108 118" stroke="#ffffff" stroke-width="1.8" fill="none"/>
    `}
  </g>

  <!-- Glasses -->
  ${cfg.glasses === 'round-wire' ? `
    <circle cx="84" cy="90" r="12" stroke="#d4af37" stroke-width="2" fill="none" opacity="0.9"/>
    <circle cx="116" cy="90" r="12" stroke="#d4af37" stroke-width="2" fill="none" opacity="0.9"/>
    <path d="M 96 90 L 104 90" stroke="#d4af37" stroke-width="2"/>
    <path d="M 72 90 L 62 88" stroke="#d4af37" stroke-width="1.8"/>
    <path d="M 128 90 L 138 88" stroke="#d4af37" stroke-width="1.8"/>
  ` : ''}

  ${cfg.glasses === 'sunglasses' ? `
    <path d="M 70 82 L 98 82 L 95 98 Q 84 103 72 98 Z" fill="#111111" stroke="#222" stroke-width="2"/>
    <path d="M 102 82 L 130 82 L 128 98 Q 116 103 105 98 Z" fill="#111111" stroke="#222" stroke-width="2"/>
    <path d="M 98 84 L 102 84" stroke="#222" stroke-width="2.5"/>
    <path d="M 74 84 L 80 94" stroke="#ffffff" stroke-width="1.5" opacity="0.4"/>
    <path d="M 106 84 L 112 94" stroke="#ffffff" stroke-width="1.5" opacity="0.4"/>
  ` : ''}

  ${cfg.glasses === 'cat-eye' ? `
    <path d="M 68 83 Q 84 79 98 85 L 94 98 Q 80 102 70 95 Z" fill="none" stroke="#e1306c" stroke-width="2.5"/>
    <path d="M 132 83 Q 116 79 102 85 L 106 98 Q 120 102 130 95 Z" fill="none" stroke="#e1306c" stroke-width="2.5"/>
    <path d="M 98 85 L 102 85" stroke="#e1306c" stroke-width="2"/>
  ` : ''}

  ${cfg.glasses === 'tinted-oval' ? `
    <ellipse cx="84" cy="90" rx="13" ry="8" fill="#ff7043" opacity="0.75" stroke="#bf360c" stroke-width="1.5"/>
    <ellipse cx="116" cy="90" rx="13" ry="8" fill="#ff7043" opacity="0.75" stroke="#bf360c" stroke-width="1.5"/>
    <path d="M 97 90 L 103 90" stroke="#bf360c" stroke-width="1.8"/>
  ` : ''}

  <!-- Hairstyle Layer -->
  <g id="hair">
    ${cfg.hairStyle === 'wavy-long' ? `
      <!-- Back hair -->
      <path d="M 64 80 Q 45 130 52 170 Q 70 175 68 120 Z" fill="${hair}"/>
      <path d="M 136 80 Q 155 130 148 170 Q 130 175 132 120 Z" fill="${hair}"/>
      <!-- Front waves -->
      <path d="M 66 75 Q 75 48 100 48 Q 125 48 134 75 Q 115 62 100 64 Q 85 62 66 75 Z" fill="${hair}"/>
      <path d="M 68 70 Q 60 110 56 145 Q 68 140 74 100 Z" fill="${hair}"/>
      <path d="M 132 70 Q 140 110 144 145 Q 132 140 126 100 Z" fill="${hair}"/>
    ` : ''}

    ${cfg.hairStyle === 'bob-bangs' ? `
      <path d="M 62 70 Q 70 45 100 45 Q 130 45 138 70 Q 145 110 135 125 Q 130 115 132 90 L 130 78 Q 100 70 70 78 L 68 90 Q 70 115 65 125 Q 55 110 62 70 Z" fill="${hair}"/>
      <path d="M 70 76 Q 100 68 130 76 L 132 82 Q 100 78 68 82 Z" fill="#000000" opacity="0.15"/>
    ` : ''}

    ${cfg.hairStyle === 'curly-afro' ? `
      <circle cx="70" cy="65" r="22" fill="${hair}"/>
      <circle cx="100" cy="52" r="25" fill="${hair}"/>
      <circle cx="130" cy="65" r="22" fill="${hair}"/>
      <circle cx="58" cy="90" r="18" fill="${hair}"/>
      <circle cx="142" cy="90" r="18" fill="${hair}"/>
      <circle cx="62" cy="115" r="14" fill="${hair}"/>
      <circle cx="138" cy="115" r="14" fill="${hair}"/>
    ` : ''}

    ${cfg.hairStyle === 'fade-short' ? `
      <path d="M 66 76 Q 72 48 100 48 Q 128 48 134 76 Q 130 68 100 66 Q 70 68 66 76 Z" fill="${hair}"/>
      <path d="M 66 76 L 68 96 L 64 96 Z" fill="${hair}" opacity="0.5"/>
      <path d="M 134 76 L 132 96 L 136 96 Z" fill="${hair}" opacity="0.5"/>
    ` : ''}

    ${cfg.hairStyle === 'high-ponytail' ? `
      <path d="M 66 75 Q 75 48 100 48 Q 125 48 134 75 Q 115 65 100 66 Q 85 65 66 75 Z" fill="${hair}"/>
      <!-- Ponytail puff -->
      <ellipse cx="100" cy="42" rx="8" ry="6" fill="#e1306c"/>
      <path d="M 100 40 Q 135 30 148 60 Q 150 90 142 110 Q 138 95 138 75 Q 130 52 100 40 Z" fill="${hair}"/>
    ` : ''}

    ${cfg.hairStyle === 'messy-bun' ? `
      <circle cx="100" cy="38" r="18" fill="${hair}"/>
      <ellipse cx="100" cy="44" rx="8" ry="4" fill="#ffffff" opacity="0.3"/>
      <path d="M 66 75 Q 75 52 100 52 Q 125 52 134 75 Q 100 65 66 75 Z" fill="${hair}"/>
      <path d="M 66 78 Q 63 95 62 108" stroke="${hair}" stroke-width="2.5" fill="none"/>
      <path d="M 134 78 Q 137 95 138 108" stroke="${hair}" stroke-width="2.5" fill="none"/>
    ` : ''}

    ${cfg.hairStyle === 'braids-locs' ? `
      <path d="M 66 75 Q 75 48 100 48 Q 125 48 134 75 Q 100 65 66 75 Z" fill="${hair}"/>
      <path d="M 60 85 L 52 165" stroke="${hair}" stroke-width="4.5" stroke-linecap="round"/>
      <path d="M 66 85 L 60 170" stroke="${hair}" stroke-width="4.5" stroke-linecap="round"/>
      <path d="M 72 85 L 68 175" stroke="${hair}" stroke-width="4.5" stroke-linecap="round"/>
      <path d="M 140 85 L 148 165" stroke="${hair}" stroke-width="4.5" stroke-linecap="round"/>
      <path d="M 134 85 L 140 170" stroke="${hair}" stroke-width="4.5" stroke-linecap="round"/>
      <path d="M 128 85 L 132 175" stroke="${hair}" stroke-width="4.5" stroke-linecap="round"/>
    ` : ''}

    ${cfg.hairStyle === 'slicked-back' ? `
      <path d="M 68 76 Q 74 44 100 44 Q 126 44 132 76 Q 120 62 100 60 Q 80 62 68 76 Z" fill="${hair}"/>
      <path d="M 78 55 Q 100 50 122 55" stroke="#ffffff" stroke-width="1.8" fill="none" opacity="0.3"/>
    ` : ''}

    ${cfg.hairStyle === 'wolf-cut' ? `
      <path d="M 66 75 Q 75 46 100 46 Q 125 46 134 75 Q 100 64 66 75 Z" fill="${hair}"/>
      <path d="M 60 80 L 52 125 L 64 115 L 56 145" stroke="${hair}" stroke-width="5" stroke-linejoin="round" fill="none"/>
      <path d="M 140 80 L 148 125 L 136 115 L 144 145" stroke="${hair}" stroke-width="5" stroke-linejoin="round" fill="none"/>
    ` : ''}
  </g>

  <!-- Headwear Layer -->
  ${cfg.headwear === 'beanie' ? `
    <path d="M 62 76 C 60 38, 140 38, 138 76 Z" fill="#2d3748"/>
    <rect x="60" y="68" width="80" height="12" rx="4" fill="#1a202c"/>
    <circle cx="100" cy="36" r="6" fill="#e2e8f0"/>
  ` : ''}

  ${cfg.headwear === 'cap' ? `
    <path d="M 64 74 C 62 42, 138 42, 136 74 Z" fill="#e1306c"/>
    <path d="M 54 74 Q 100 78 146 74 Q 100 65 54 74 Z" fill="#c1275d"/>
  ` : ''}

  ${cfg.headwear === 'beret' ? `
    <ellipse cx="100" cy="52" rx="42" ry="18" fill="#1f2421"/>
    <circle cx="100" cy="34" r="3" fill="#1f2421"/>
  ` : ''}

  ${cfg.headwear === 'headband' ? `
    <path d="M 64 76 Q 100 50 136 76" stroke="#fbbf24" stroke-width="8" stroke-linecap="round" fill="none"/>
  ` : ''}

  <!-- Instagram Story Ring Overlay (Iconic Meta Profile Border) -->
  ${cfg.storyRing === 'instagram-classic' ? `
    <circle cx="100" cy="100" r="95" stroke="url(#ig-ring)" stroke-width="6" fill="none"/>
  ` : ''}
  ${cfg.storyRing === 'close-friends' ? `
    <circle cx="100" cy="100" r="95" stroke="url(#cf-ring)" stroke-width="6" fill="none"/>
  ` : ''}
  ${cfg.storyRing === 'lavender-dream' ? `
    <circle cx="100" cy="100" r="95" stroke="#ba85ef" stroke-width="6" fill="none"/>
  ` : ''}
  ${cfg.storyRing === 'golden-hour' ? `
    <circle cx="100" cy="100" r="95" stroke="#f59e0b" stroke-width="6" fill="none"/>
  ` : ''}
</svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function getRandomAvatarConfig(): AvatarConfig {
  const randomSkin = SKIN_TONES[Math.floor(Math.random() * SKIN_TONES.length)].id;
  const randomHairStyle = HAIR_STYLES[Math.floor(Math.random() * HAIR_STYLES.length)].id as AvatarConfig['hairStyle'];
  const randomHairColor = HAIR_COLORS[Math.floor(Math.random() * HAIR_COLORS.length)].id;
  const randomEyeColor = EYE_COLORS[Math.floor(Math.random() * EYE_COLORS.length)].id;
  const expressions: AvatarConfig['expression'][] = ['smile', 'wink', 'smirk', 'dreamy'];
  const randomExp = expressions[Math.floor(Math.random() * expressions.length)];
  const randomOutfit = OUTFIT_STYLES[Math.floor(Math.random() * OUTFIT_STYLES.length)].id as AvatarConfig['outfit'];
  const randomOutfitColor = OUTFIT_COLORS[Math.floor(Math.random() * OUTFIT_COLORS.length)].id;
  const glassesList: AvatarConfig['glasses'][] = ['none', 'none', 'round-wire', 'sunglasses', 'cat-eye', 'tinted-oval'];
  const randomGlasses = glassesList[Math.floor(Math.random() * glassesList.length)];
  const headwearList: AvatarConfig['headwear'][] = ['none', 'none', 'beanie', 'cap', 'beret', 'headband'];
  const randomHeadwear = headwearList[Math.floor(Math.random() * headwearList.length)];
  const earringList: AvatarConfig['earrings'][] = ['none', 'gold-hoops', 'diamond-studs'];
  const randomEarrings = earringList[Math.floor(Math.random() * earringList.length)];
  const ringList: AvatarConfig['storyRing'][] = ['instagram-classic', 'close-friends', 'lavender-dream', 'golden-hour'];
  const randomRing = ringList[Math.floor(Math.random() * ringList.length)];
  const bgList: AvatarConfig['background'][] = ['sunset-glow', 'purple-haze', 'mint-fresh', 'velvet-night', 'sunny-cream'];
  const randomBg = bgList[Math.floor(Math.random() * bgList.length)];

  return {
    skinTone: randomSkin,
    hairStyle: randomHairStyle,
    hairColor: randomHairColor,
    eyeColor: randomEyeColor,
    expression: randomExp,
    blush: Math.random() > 0.3,
    freckles: Math.random() > 0.6,
    beautyMark: Math.random() > 0.5,
    outfit: randomOutfit,
    outfitColor: randomOutfitColor,
    glasses: randomGlasses,
    headwear: randomHeadwear,
    earrings: randomEarrings,
    storyRing: randomRing,
    background: randomBg,
  };
}

export interface InstagramPresetItem {
  id: string;
  name: string;
  subtitle: string;
  config: AvatarConfig;
  svgUrl: string;
}

export const INSTAGRAM_PRESETS: InstagramPresetItem[] = [
  {
    id: 'sunset-wave',
    name: 'Sunset Wave',
    subtitle: 'Classic IG Story Glow',
    config: {
      skinTone: '#fce5d8',
      hairStyle: 'wavy-long',
      hairColor: '#3b2314',
      eyeColor: '#3a2312',
      expression: 'smile',
      blush: true,
      freckles: false,
      beautyMark: true,
      outfit: 'hoodie',
      outfitColor: '#b8a4d4',
      glasses: 'none',
      headwear: 'none',
      earrings: 'gold-hoops',
      storyRing: 'instagram-classic',
      background: 'sunset-glow'
    },
    get svgUrl() { return generateAvatarSvg(this.config); }
  },
  {
    id: 'lavender-dream',
    name: 'Lavender Chic',
    subtitle: 'Cozy Cardigan & Bob',
    config: {
      skinTone: '#f7d8c0',
      hairStyle: 'bob-bangs',
      hairColor: '#ba85ef',
      eyeColor: '#7c3aed',
      expression: 'smirk',
      blush: true,
      freckles: true,
      beautyMark: false,
      outfit: 'cardigan',
      outfitColor: '#ece5d8',
      glasses: 'round-wire',
      headwear: 'none',
      earrings: 'gold-hoops',
      storyRing: 'lavender-dream',
      background: 'purple-haze'
    },
    get svgUrl() { return generateAvatarSvg(this.config); }
  },
  {
    id: 'close-friends-afro',
    name: 'Neon Close Friends',
    subtitle: 'Curly Afro & Denim',
    config: {
      skinTone: '#8c532b',
      hairStyle: 'curly-afro',
      hairColor: '#1a1a1a',
      eyeColor: '#18181b',
      expression: 'wink',
      blush: false,
      freckles: false,
      beautyMark: true,
      outfit: 'denim-jacket',
      outfitColor: '#1d2a44',
      glasses: 'none',
      headwear: 'none',
      earrings: 'diamond-studs',
      storyRing: 'close-friends',
      background: 'mint-fresh'
    },
    get svgUrl() { return generateAvatarSvg(this.config); }
  },
  {
    id: 'golden-hour-pony',
    name: 'Golden Hour VIP',
    subtitle: 'Honey Blonde High Pony',
    config: {
      skinTone: '#e5b78f',
      hairStyle: 'high-ponytail',
      hairColor: '#e5b567',
      eyeColor: '#d97706',
      expression: 'smile',
      blush: true,
      freckles: false,
      beautyMark: false,
      outfit: 'blazer',
      outfitColor: '#f59e0b',
      glasses: 'none',
      headwear: 'none',
      earrings: 'gold-hoops',
      storyRing: 'golden-hour',
      background: 'sunset-glow'
    },
    get svgUrl() { return generateAvatarSvg(this.config); }
  },
  {
    id: 'paris-beret',
    name: 'Parisian Artist',
    subtitle: 'Chic Beret & Cat-Eye',
    config: {
      skinTone: '#fce5d8',
      hairStyle: 'messy-bun',
      hairColor: '#a34424',
      eyeColor: '#2e7d32',
      expression: 'dreamy',
      blush: true,
      freckles: true,
      beautyMark: true,
      outfit: 'cardigan',
      outfitColor: '#e1306c',
      glasses: 'cat-eye',
      headwear: 'beret',
      earrings: 'gold-hoops',
      storyRing: 'instagram-classic',
      background: 'sunny-cream'
    },
    get svgUrl() { return generateAvatarSvg(this.config); }
  },
  {
    id: 'biker-wolf',
    name: 'Midnight Rebel',
    subtitle: 'Wolf Cut & Biker Leather',
    config: {
      skinTone: '#5c341b',
      hairStyle: 'wolf-cut',
      hairColor: '#1a1a1a',
      eyeColor: '#1976d2',
      expression: 'smirk',
      blush: false,
      freckles: false,
      beautyMark: false,
      outfit: 'leather-jacket',
      outfitColor: '#1f2421',
      glasses: 'sunglasses',
      headwear: 'none',
      earrings: 'diamond-studs',
      storyRing: 'none',
      background: 'velvet-night'
    },
    get svgUrl() { return generateAvatarSvg(this.config); }
  },
  {
    id: 'streetwear-cap',
    name: 'Retro Streetwear',
    subtitle: 'Baseball Cap & Vintage Tee',
    config: {
      skinTone: '#d69e6e',
      hairStyle: 'fade-short',
      hairColor: '#1a1a1a',
      eyeColor: '#3a2312',
      expression: 'smile',
      blush: false,
      freckles: false,
      beautyMark: false,
      outfit: 'vintage-tee',
      outfitColor: '#4a5843',
      glasses: 'tinted-oval',
      headwear: 'cap',
      earrings: 'none',
      storyRing: 'close-friends',
      background: 'mint-fresh'
    },
    get svgUrl() { return generateAvatarSvg(this.config); }
  },
  {
    id: 'braids-locs-star',
    name: 'Braided Royalty',
    subtitle: 'Braided Locs & Gold Ring',
    config: {
      skinTone: '#3e2114',
      hairStyle: 'braids-locs',
      hairColor: '#1a1a1a',
      eyeColor: '#18181b',
      expression: 'smile',
      blush: true,
      freckles: false,
      beautyMark: true,
      outfit: 'hoodie',
      outfitColor: '#c45d3e',
      glasses: 'round-wire',
      headwear: 'headband',
      earrings: 'gold-hoops',
      storyRing: 'golden-hour',
      background: 'sunset-glow'
    },
    get svgUrl() { return generateAvatarSvg(this.config); }
  }
];

interface InstagramAvatarCustomizerProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveAvatar: (url: string, cfg?: AvatarConfig) => void;
  currentAvatarUrl: string;
  initialConfig?: AvatarConfig;
}

export const InstagramAvatarCustomizer: React.FC<InstagramAvatarCustomizerProps> = ({
  isOpen,
  onClose,
  onSaveAvatar,
  initialConfig,
}) => {
  const [config, setConfig] = useState<AvatarConfig>(initialConfig || DEFAULT_AVATAR_CONFIG);
  const [activeTab, setActiveTab] = useState<'skin' | 'hair' | 'eyes' | 'outfit' | 'accessories' | 'ring'>('skin');

  useEffect(() => {
    if (initialConfig && isOpen) {
      setConfig(initialConfig);
    }
  }, [initialConfig, isOpen]);

  if (!isOpen) return null;

  // Real-time live generated SVG data URL
  const currentSvgUrl = generateAvatarSvg(config);

  // Randomize generator (Dice)
  const handleRandomize = () => {
    setConfig(getRandomAvatarConfig());
  };

  const handleApply = () => {
    onSaveAvatar(currentSvgUrl);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-surface-container rounded-3xl border border-white/10 shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/5 flex-shrink-0 bg-surface-container-high/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-white text-base">face</span>
            </div>
            <div>
              <h2 className="font-display text-base sm:text-lg text-pale-cream leading-tight">
                Instagram Avatar Studio
              </h2>
              <p className="text-[11px] text-muted-grey font-body">
                Customize your personal avatar, outfit, features & story ring
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRandomize}
              className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-pale-cream text-xs font-label uppercase font-bold tracking-wider flex items-center gap-1.5 border border-white/10 transition-all cursor-pointer active:scale-95"
              title="Randomize combination (Roll Dice)"
            >
              <span className="material-symbols-outlined text-sm text-primary-container">casino</span>
              <span>Dice</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-muted-grey hover:text-white transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
        </div>

        {/* Live Preview Display Card */}
        <div className="flex flex-col items-center justify-center py-6 px-4 bg-gradient-to-b from-surface-container-high/60 to-surface-container border-b border-white/5 flex-shrink-0">
          <div className="relative group">
            {/* Instagram Story Ring Glow */}
            <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full p-1.5 bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] shadow-xl shadow-pink-500/10 flex items-center justify-center">
              <div className="w-full h-full rounded-full overflow-hidden bg-black/40 border-2 border-black flex items-center justify-center shadow-inner">
                <img
                  src={currentSvgUrl}
                  alt="Custom Avatar Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Quick Badge */}
            <div className="absolute -bottom-1 -right-1 bg-surface-container-highest px-2 py-0.5 rounded-full border border-white/10 shadow text-[10px] font-mono text-primary-container font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse" />
              Live
            </div>
          </div>

          <span className="text-xs font-label font-bold text-pale-cream/80 mt-3 tracking-wider uppercase">
            Preview on Beatz
          </span>
        </div>

        {/* Category Navigation Bar (Instagram tabs) */}
        <div className="flex items-center gap-1 px-4 py-2 border-b border-white/5 overflow-x-auto hide-scrollbar bg-surface-container-high/30 flex-shrink-0">
          {[
            { id: 'skin', label: 'Skin', icon: 'palette' },
            { id: 'hair', label: 'Hair', icon: 'content_cut' },
            { id: 'eyes', label: 'Face & Eyes', icon: 'visibility' },
            { id: 'outfit', label: 'Outfit', icon: 'checkroom' },
            { id: 'accessories', label: 'Accessories', icon: 'glasses' },
            { id: 'ring', label: 'Story Ring', icon: 'circle' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl font-label text-xs tracking-wider uppercase font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-primary-container text-on-primary-container shadow-sm font-bold'
                  : 'text-muted-grey hover:text-pale-cream hover:bg-white/5'
              }`}
            >
              <span className="material-symbols-outlined text-sm">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Controls Canvas */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* TAB: SKIN TONE */}
          {activeTab === 'skin' && (
            <div className="space-y-4">
              <h3 className="text-xs font-label uppercase tracking-wider text-muted-grey font-bold">
                Select Skin Tone
              </h3>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                {SKIN_TONES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setConfig({ ...config, skinTone: t.id })}
                    className={`flex flex-col items-center gap-1.5 p-2 rounded-2xl border transition-all cursor-pointer ${
                      config.skinTone === t.id
                        ? 'border-primary-container bg-primary-container/10 ring-2 ring-primary-container/40 scale-105'
                        : 'border-white/5 bg-surface-container-high/40 hover:border-white/20'
                    }`}
                  >
                    <div
                      className="w-10 h-10 rounded-full shadow-md border border-black/20"
                      style={{ backgroundColor: t.id }}
                    />
                    <span className="text-[10px] text-pale-cream/80 text-center font-medium leading-none">
                      {t.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB: HAIR */}
          {activeTab === 'hair' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-xs font-label uppercase tracking-wider text-muted-grey font-bold mb-3">
                  Hairstyle
                </h3>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
                  {HAIR_STYLES.map((h) => (
                    <button
                      key={h.id}
                      onClick={() => setConfig({ ...config, hairStyle: h.id as any })}
                      className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                        config.hairStyle === h.id
                          ? 'border-primary-container bg-primary-container/15 ring-2 ring-primary-container/30'
                          : 'border-white/5 bg-surface-container-high/30 hover:bg-surface-container-high/60'
                      }`}
                    >
                      <span className="text-2xl">{h.icon}</span>
                      <span className="text-xs text-pale-cream font-medium text-center truncate max-w-full">
                        {h.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-label uppercase tracking-wider text-muted-grey font-bold mb-3">
                  Hair Color
                </h3>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {HAIR_COLORS.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setConfig({ ...config, hairColor: c.id })}
                      className={`flex items-center gap-2 p-2 rounded-xl border transition-all cursor-pointer ${
                        config.hairColor === c.id
                          ? 'border-primary-container bg-primary-container/10 ring-1 ring-primary-container/40'
                          : 'border-white/5 bg-surface-container-high/30 hover:border-white/20'
                      }`}
                    >
                      <div
                        className="w-5 h-5 rounded-full border border-white/20 flex-shrink-0"
                        style={{ backgroundColor: c.id }}
                      />
                      <span className="text-xs text-pale-cream truncate">{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: FACE & EYES */}
          {activeTab === 'eyes' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-xs font-label uppercase tracking-wider text-muted-grey font-bold mb-3">
                  Eye Color
                </h3>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {EYE_COLORS.map((ec) => (
                    <button
                      key={ec.id}
                      onClick={() => setConfig({ ...config, eyeColor: ec.id })}
                      className={`flex items-center gap-2 p-2 rounded-xl border transition-all cursor-pointer ${
                        config.eyeColor === ec.id
                          ? 'border-primary-container bg-primary-container/10 ring-1 ring-primary-container/40'
                          : 'border-white/5 bg-surface-container-high/30'
                      }`}
                    >
                      <div className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: ec.id }} />
                      <span className="text-xs text-pale-cream truncate">{ec.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-label uppercase tracking-wider text-muted-grey font-bold mb-3">
                  Expression & Vibe
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: 'smile', label: 'Warm Smile', emoji: '😊' },
                    { id: 'wink', label: 'Flirty Wink', emoji: '😉' },
                    { id: 'smirk', label: 'Cool Smirk', emoji: '😏' },
                    { id: 'dreamy', label: 'Dreamy Vibe', emoji: '✨' },
                  ].map((exp) => (
                    <button
                      key={exp.id}
                      onClick={() => setConfig({ ...config, expression: exp.id as any })}
                      className={`p-3 rounded-2xl border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        config.expression === exp.id
                          ? 'border-primary-container bg-primary-container/15 font-bold text-primary-container'
                          : 'border-white/5 bg-surface-container-high/30 text-pale-cream hover:bg-surface-container-high/60'
                      }`}
                    >
                      <span>{exp.emoji}</span>
                      <span className="text-xs">{exp.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-label uppercase tracking-wider text-muted-grey font-bold mb-3">
                  Cheeks & Details
                </h3>
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setConfig({ ...config, blush: !config.blush })}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                      config.blush
                        ? 'border-pink-400 bg-pink-500/20 text-pink-300 font-bold'
                        : 'border-white/5 bg-surface-container-high/30 text-muted-grey hover:text-pale-cream'
                    }`}
                  >
                    <span className="text-xs">🌸 Rosy Blush</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setConfig({ ...config, freckles: !config.freckles })}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                      config.freckles
                        ? 'border-amber-400 bg-amber-500/20 text-amber-300 font-bold'
                        : 'border-white/5 bg-surface-container-high/30 text-muted-grey hover:text-pale-cream'
                    }`}
                  >
                    <span className="text-xs">✨ Freckles</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setConfig({ ...config, beautyMark: !config.beautyMark })}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                      config.beautyMark
                        ? 'border-primary-container bg-primary-container/20 text-primary-container font-bold'
                        : 'border-white/5 bg-surface-container-high/30 text-muted-grey hover:text-pale-cream'
                    }`}
                  >
                    <span className="text-xs">💄 Beauty Mark</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: OUTFIT */}
          {activeTab === 'outfit' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-xs font-label uppercase tracking-wider text-muted-grey font-bold mb-3">
                  Outfit Style
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {OUTFIT_STYLES.map((out) => (
                    <button
                      key={out.id}
                      onClick={() => setConfig({ ...config, outfit: out.id as any })}
                      className={`p-3 rounded-2xl border flex items-center gap-2.5 transition-all cursor-pointer ${
                        config.outfit === out.id
                          ? 'border-primary-container bg-primary-container/15 font-bold'
                          : 'border-white/5 bg-surface-container-high/30 hover:bg-surface-container-high/60'
                      }`}
                    >
                      <span className="text-xl">{out.icon}</span>
                      <span className="text-xs text-pale-cream truncate">{out.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-label uppercase tracking-wider text-muted-grey font-bold mb-3">
                  Outfit Color
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {OUTFIT_COLORS.map((col) => (
                    <button
                      key={col.id}
                      onClick={() => setConfig({ ...config, outfitColor: col.id })}
                      className={`flex items-center gap-2 p-2 rounded-xl border transition-all cursor-pointer ${
                        config.outfitColor === col.id
                          ? 'border-primary-container bg-primary-container/10 ring-1 ring-primary-container/40'
                          : 'border-white/5 bg-surface-container-high/30'
                      }`}
                    >
                      <div className="w-5 h-5 rounded-full border border-white/20" style={{ backgroundColor: col.id }} />
                      <span className="text-xs text-pale-cream truncate">{col.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: ACCESSORIES */}
          {activeTab === 'accessories' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-xs font-label uppercase tracking-wider text-muted-grey font-bold mb-3">
                  Eyewear & Glasses
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {GLASSES_OPTIONS.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => setConfig({ ...config, glasses: g.id as any })}
                      className={`p-2.5 rounded-xl border text-xs text-left transition-all cursor-pointer ${
                        config.glasses === g.id
                          ? 'border-primary-container bg-primary-container/15 text-primary-container font-bold'
                          : 'border-white/5 bg-surface-container-high/30 text-pale-cream'
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-label uppercase tracking-wider text-muted-grey font-bold mb-3">
                  Headwear & Hats
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {HEADWEAR_OPTIONS.map((hw) => (
                    <button
                      key={hw.id}
                      onClick={() => setConfig({ ...config, headwear: hw.id as any })}
                      className={`p-2.5 rounded-xl border text-xs text-left transition-all cursor-pointer ${
                        config.headwear === hw.id
                          ? 'border-primary-container bg-primary-container/15 text-primary-container font-bold'
                          : 'border-white/5 bg-surface-container-high/30 text-pale-cream'
                      }`}
                    >
                      {hw.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-label uppercase tracking-wider text-muted-grey font-bold mb-3">
                  Earrings & Piercings
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'none', label: 'None' },
                    { id: 'gold-hoops', label: 'Golden Hoops ✨' },
                    { id: 'diamond-studs', label: 'Diamond Studs 💎' },
                  ].map((ear) => (
                    <button
                      key={ear.id}
                      onClick={() => setConfig({ ...config, earrings: ear.id as any })}
                      className={`p-2.5 rounded-xl border text-xs text-center transition-all cursor-pointer ${
                        config.earrings === ear.id
                          ? 'border-primary-container bg-primary-container/15 text-primary-container font-bold'
                          : 'border-white/5 bg-surface-container-high/30 text-pale-cream'
                      }`}
                    >
                      {ear.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: STORY RING & BACKDROP */}
          {activeTab === 'ring' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-xs font-label uppercase tracking-wider text-muted-grey font-bold mb-3">
                  Instagram Profile Story Ring
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {STORY_RINGS.map((ring) => (
                    <button
                      key={ring.id}
                      onClick={() => setConfig({ ...config, storyRing: ring.id as any })}
                      className={`p-3 rounded-2xl border flex items-center gap-3 transition-all cursor-pointer ${
                        config.storyRing === ring.id
                          ? 'border-primary-container bg-primary-container/15'
                          : 'border-white/5 bg-surface-container-high/30 hover:bg-surface-container-high/60'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full bg-gradient-to-r ${ring.color} border border-white/20`}
                      />
                      <span className="text-xs font-medium text-pale-cream">{ring.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-label uppercase tracking-wider text-muted-grey font-bold mb-3">
                  Background Backdrop Gradient
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {BACKGROUND_GRADIENTS.map((bg) => (
                    <button
                      key={bg.id}
                      onClick={() => setConfig({ ...config, background: bg.id as any })}
                      className={`p-2.5 rounded-2xl border flex items-center gap-2.5 transition-all cursor-pointer ${
                        config.background === bg.id
                          ? 'border-primary-container bg-primary-container/15'
                          : 'border-white/5 bg-surface-container-high/30'
                      }`}
                    >
                      <div
                        className="w-6 h-6 rounded-full border border-white/20 flex-shrink-0"
                        style={{ background: bg.css }}
                      />
                      <span className="text-xs text-pale-cream truncate">{bg.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Action Buttons Footer */}
        <div className="p-4 sm:p-5 border-t border-white/5 bg-surface-container-high/40 flex items-center justify-between gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-full bg-surface-container hover:bg-surface-container-highest text-muted-grey hover:text-pale-cream text-xs font-label uppercase font-bold tracking-wider transition-all cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleApply}
            className="px-7 py-2.5 rounded-full bg-gradient-to-r from-primary-container via-pink-400 to-primary-container text-[#2c2b1e] font-label text-xs uppercase font-bold tracking-widest shadow-lg shadow-pink-500/20 hover:opacity-95 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-base">check</span>
            Set as My Avatar
          </button>
        </div>
      </div>
    </div>
  );
};
