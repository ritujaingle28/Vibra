import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AvatarConfig,
  DEFAULT_AVATAR_CONFIG,
  SKIN_TONES,
  HAIR_COLORS,
  EYE_COLORS,
  OUTFIT_COLORS,
  HAIR_STYLES,
  OUTFIT_STYLES,
  GLASSES_OPTIONS,
  HEADWEAR_OPTIONS,
  STORY_RINGS,
  BACKGROUND_GRADIENTS,
  generateAvatarSvg,
  getRandomAvatarConfig,
  INSTAGRAM_PRESETS,
  InstagramPresetItem
} from './InstagramAvatarCustomizer';

interface QuickAvatarSelectionBarProps {
  currentAvatarUrl: string;
  customAvatars: string[];
  onSelectAvatar: (url: string) => void;
  onSaveCustomAvatar: (url: string, cfg?: AvatarConfig) => void;
  onOpenFullCustomizer: (initialCfg?: AvatarConfig) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const QuickAvatarSelectionBar: React.FC<QuickAvatarSelectionBarProps> = ({
  currentAvatarUrl,
  customAvatars,
  onSelectAvatar,
  onSaveCustomAvatar,
  onOpenFullCustomizer,
  showToast,
}) => {
  const [isInlineCustomizerOpen, setIsInlineCustomizerOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<AvatarConfig>(DEFAULT_AVATAR_CONFIG);
  const [activeInlineTab, setActiveInlineTab] = useState<'hair' | 'skin' | 'outfit' | 'ring' | 'face' | 'accessories'>('hair');

  // Compute live SVG URL for the inline editor
  const inlineSvgUrl = generateAvatarSvg(editingConfig);

  // Quick Randomize (Dice) action directly from the bar
  const handleQuickDice = () => {
    const randomCfg = getRandomAvatarConfig();
    const newSvg = generateAvatarSvg(randomCfg);
    setEditingConfig(randomCfg);
    onSaveCustomAvatar(newSvg, randomCfg);
    showToast('Random Instagram avatar generated & applied! 🎲✨', 'success');
  };

  // Open inline customizer initialized with a preset or custom config
  const handleEditAvatar = (cfg: AvatarConfig) => {
    setEditingConfig(cfg);
    setIsInlineCustomizerOpen(true);
  };

  // Save the currently edited avatar
  const handleSaveInline = () => {
    onSaveCustomAvatar(inlineSvgUrl, editingConfig);
    showToast('Custom Instagram avatar applied & saved! ✨', 'success');
    setIsInlineCustomizerOpen(false);
  };

  return (
    <div className="mb-8 rounded-3xl bg-surface-container/70 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden transition-all duration-300">
      {/* Top Header Card */}
      <div className="p-4 md:p-5 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] flex items-center justify-center text-white shadow-lg shadow-pink-500/20 flex-shrink-0">
            <span className="material-symbols-outlined text-2xl">face</span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-display text-base md:text-lg text-pale-cream tracking-wide">
                Quick Avatar Selection
              </span>
              <span className="font-mono text-[9px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-[#f9ce34]/20 via-[#ee2a7b]/20 to-[#6228d7]/20 text-[#ee2a7b] uppercase border border-[#ee2a7b]/30">
                Instagram Avatar Studio
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live 3D Customizer
              </span>
            </div>
            <p className="text-xs text-muted-grey font-body mt-0.5">
              Select or customise your personal avatar just like in Instagram (hair, skin, outfits, story rings & accessories)
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Toggle Inline Customizer */}
          <button
            type="button"
            onClick={() => setIsInlineCustomizerOpen((prev) => !prev)}
            className={`px-3.5 py-1.5 rounded-full font-label text-xs uppercase font-bold tracking-wider flex items-center gap-1.5 shadow-md transition-all cursor-pointer ${
              isInlineCustomizerOpen
                ? 'bg-primary-container text-on-primary-container ring-2 ring-primary-container/40'
                : 'bg-gradient-to-r from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white shadow-pink-500/25 hover:opacity-95 active:scale-95'
            }`}
            title="Customise your avatar with inline controls"
          >
            <span className="material-symbols-outlined text-sm">
              {isInlineCustomizerOpen ? 'expand_less' : 'tune'}
            </span>
            <span>{isInlineCustomizerOpen ? 'Hide Studio' : 'Customise Avatar'}</span>
          </button>

          {/* Quick Dice / Randomizer */}
          <button
            type="button"
            onClick={handleQuickDice}
            className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 active:scale-95 text-pale-cream border border-white/10 text-xs font-label uppercase font-bold tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
            title="Roll random Instagram avatar"
          >
            <span className="material-symbols-outlined text-sm text-[#f9ce34]">casino</span>
            <span>Roll Dice</span>
          </button>

          {/* Full Studio Modal Button */}
          <button
            type="button"
            onClick={() => onOpenFullCustomizer(editingConfig)}
            className="px-3 py-1.5 rounded-full bg-surface-container-high hover:bg-surface-container-highest active:scale-95 text-muted-grey hover:text-pale-cream border border-white/10 text-xs font-label uppercase font-bold tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
            title="Open Full Instagram Studio Modal"
          >
            <span className="material-symbols-outlined text-sm">open_in_full</span>
            <span className="hidden sm:inline">Full Studio</span>
          </button>
        </div>
      </div>

      {/* Avatar Quick Switcher Row */}
      <div className="p-4 md:p-5 bg-surface-container-high/20 border-b border-white/5">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-[11px] font-label font-bold uppercase tracking-wider text-muted-grey flex items-center gap-1.5">
            <span className="material-symbols-outlined text-xs text-[#ee2a7b]">auto_awesome</span>
            Tap to wear or click pencil to customise
          </span>
          <span className="text-[11px] font-mono text-pale-cream/60">
            {customAvatars.length} custom • {INSTAGRAM_PRESETS.length} Instagram presets
          </span>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto hide-scrollbar pb-2 pt-1">
          {/* Create New Avatar Button */}
          <button
            type="button"
            onClick={() => {
              setEditingConfig(getRandomAvatarConfig());
              setIsInlineCustomizerOpen(true);
            }}
            className="flex-shrink-0 flex flex-col items-center justify-center w-14 h-14 rounded-2xl border-2 border-dashed border-white/20 hover:border-[#ee2a7b] hover:bg-[#ee2a7b]/10 text-muted-grey hover:text-pale-cream transition-all cursor-pointer group"
            title="Create a new custom Instagram avatar"
          >
            <span className="material-symbols-outlined text-lg group-hover:scale-110 transition-transform text-[#ee2a7b]">
              add
            </span>
            <span className="text-[9px] font-label uppercase font-bold tracking-wider mt-0.5">
              New
            </span>
          </button>

          {/* User's Custom Created Avatars */}
          {customAvatars.map((url, idx) => {
            const isSelected = currentAvatarUrl === url;
            return (
              <div key={`custom-${idx}`} className="relative flex-shrink-0 group">
                <button
                  type="button"
                  onClick={() => {
                    onSelectAvatar(url);
                    showToast('Custom Instagram avatar applied! ✨', 'info');
                  }}
                  className={`relative w-14 h-14 rounded-2xl overflow-hidden border-2 transition-all cursor-pointer p-0.5 flex items-center justify-center ${
                    isSelected
                      ? 'border-primary-container scale-105 ring-4 ring-primary-container/40 shadow-lg shadow-primary-container/20'
                      : 'border-pink-500/40 hover:border-pink-400 hover:scale-105'
                  }`}
                  title={`Your Custom Avatar #${idx + 1}`}
                >
                  <img
                    src={url}
                    alt={`Custom ${idx + 1}`}
                    className="w-full h-full rounded-xl object-cover bg-surface-container"
                  />
                  {/* Active Indicator Checkmark */}
                  {isSelected && (
                    <div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-primary-container text-[#3c3c2a] flex items-center justify-center shadow">
                      <span className="material-symbols-outlined text-[10px] font-bold">check</span>
                    </div>
                  )}
                  {/* Custom badge */}
                  <span className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-[#f9ce34] to-[#ee2a7b] ring-1 ring-black" />
                </button>

                {/* Edit Button Overlay */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenFullCustomizer(DEFAULT_AVATAR_CONFIG);
                  }}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-surface-container-highest border border-white/20 text-pale-cream hover:text-white hover:bg-[#ee2a7b] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md cursor-pointer scale-90 hover:scale-110 z-10"
                  title="Customise in Instagram Studio"
                >
                  <span className="material-symbols-outlined text-[11px]">edit</span>
                </button>
              </div>
            );
          })}

          {/* Instagram Stylized Presets */}
          {INSTAGRAM_PRESETS.map((preset) => {
            const isSelected = currentAvatarUrl === preset.svgUrl;
            return (
              <div key={preset.id} className="relative flex-shrink-0 group">
                <button
                  type="button"
                  onClick={() => {
                    onSelectAvatar(preset.svgUrl);
                    showToast(`${preset.name} avatar applied! ✨`, 'info');
                  }}
                  className={`relative w-14 h-14 rounded-2xl overflow-hidden border-2 transition-all cursor-pointer p-0.5 flex items-center justify-center ${
                    isSelected
                      ? 'border-primary-container scale-105 ring-4 ring-primary-container/40 shadow-lg shadow-primary-container/20'
                      : 'border-white/10 hover:border-primary-container/60 hover:scale-105'
                  }`}
                  title={`${preset.name} - ${preset.subtitle}`}
                >
                  <img
                    src={preset.svgUrl}
                    alt={preset.name}
                    className="w-full h-full rounded-xl object-cover bg-surface-container"
                  />
                  {/* Active Indicator Checkmark */}
                  {isSelected && (
                    <div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-primary-container text-[#3c3c2a] flex items-center justify-center shadow">
                      <span className="material-symbols-outlined text-[10px] font-bold">check</span>
                    </div>
                  )}
                </button>

                {/* Edit this preset button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditAvatar(preset.config);
                  }}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-surface-container-highest border border-white/20 text-pale-cream hover:text-white hover:bg-gradient-to-tr hover:from-[#f9ce34] hover:to-[#ee2a7b] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md cursor-pointer scale-90 hover:scale-110 z-10"
                  title={`Customise ${preset.name} in Studio`}
                >
                  <span className="material-symbols-outlined text-[11px]">edit</span>
                </button>

                <div className="text-center mt-1">
                  <span className="block text-[9px] font-mono text-muted-grey truncate max-w-[56px]" title={preset.name}>
                    {preset.name.split(' ')[0]}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Expandable Inline Instagram Avatar Customizer Drawer */}
      <AnimatePresence>
        {isInlineCustomizerOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden border-t border-white/10 bg-surface-container-high/40"
          >
            <div className="p-4 md:p-6 space-y-6">
              {/* Studio Workspace Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Column: Live Interactive Preview */}
                <div className="lg:col-span-4 flex flex-col items-center justify-center p-5 rounded-2xl bg-black/25 border border-white/10 relative">
                  <div className="relative group mb-3">
                    {/* Glowing Instagram Story Ring */}
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-full p-1.5 bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] shadow-xl shadow-pink-500/20 flex items-center justify-center">
                      <div className="w-full h-full rounded-full overflow-hidden bg-black/50 border-2 border-black flex items-center justify-center shadow-inner">
                        <img
                          src={inlineSvgUrl}
                          alt="Inline Avatar Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    {/* Live Indicator Pill */}
                    <div className="absolute -bottom-1 -right-1 bg-surface-container-highest px-2 py-0.5 rounded-full border border-white/10 shadow text-[9px] font-mono text-primary-container font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse" />
                      Live Customizer
                    </div>
                  </div>

                  <span className="text-xs font-label font-bold text-pale-cream uppercase tracking-wider mb-4">
                    Instagram Story Avatar
                  </span>

                  {/* Actions for Left Column */}
                  <div className="w-full space-y-2">
                    <button
                      type="button"
                      onClick={handleSaveInline}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white font-label text-xs uppercase font-bold tracking-wider shadow-lg shadow-pink-500/20 hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-base">check_circle</span>
                      Save & Apply Avatar
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const r = getRandomAvatarConfig();
                          setEditingConfig(r);
                        }}
                        className="py-2 px-2 rounded-xl bg-white/5 hover:bg-white/10 text-pale-cream font-label text-[11px] uppercase font-bold tracking-wider border border-white/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm text-[#f9ce34]">casino</span>
                        Randomize
                      </button>

                      <button
                        type="button"
                        onClick={() => onOpenFullCustomizer(editingConfig)}
                        className="py-2 px-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-muted-grey hover:text-pale-cream font-label text-[11px] uppercase font-bold tracking-wider border border-white/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm">open_in_new</span>
                        Full Studio
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Column: Customization Controls & Swatches */}
                <div className="lg:col-span-8 space-y-4">
                  {/* Category Switcher Tabs */}
                  <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar pb-1 border-b border-white/10">
                    {[
                      { id: 'hair', label: 'Hairstyle & Color', icon: 'content_cut' },
                      { id: 'skin', label: 'Skin Tone', icon: 'palette' },
                      { id: 'outfit', label: 'Outfit & Color', icon: 'checkroom' },
                      { id: 'ring', label: 'Story Ring', icon: 'circle' },
                      { id: 'face', label: 'Face & Mood', icon: 'visibility' },
                      { id: 'accessories', label: 'Accessories', icon: 'glasses' },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveInlineTab(tab.id as any)}
                        className={`px-3 py-1.5 rounded-xl font-label text-xs uppercase tracking-wider font-bold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                          activeInlineTab === tab.id
                            ? 'bg-primary-container text-on-primary-container shadow-md'
                            : 'text-muted-grey hover:text-pale-cream hover:bg-white/5'
                        }`}
                      >
                        <span className="material-symbols-outlined text-sm">{tab.icon}</span>
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* TAB: HAIR */}
                  {activeInlineTab === 'hair' && (
                    <div className="space-y-4">
                      <div>
                        <span className="text-xs font-label uppercase font-bold tracking-wider text-muted-grey block mb-2">
                          Choose Hairstyle
                        </span>
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                          {HAIR_STYLES.map((style) => (
                            <button
                              key={style.id}
                              type="button"
                              onClick={() =>
                                setEditingConfig((prev) => ({
                                  ...prev,
                                  hairStyle: style.id as AvatarConfig['hairStyle'],
                                }))
                              }
                              className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                                editingConfig.hairStyle === style.id
                                  ? 'border-primary-container bg-primary-container/15 text-primary-container font-bold shadow'
                                  : 'border-white/10 bg-surface-container/60 hover:border-white/30 text-pale-cream/80'
                              }`}
                            >
                              <span className="text-xl">{style.icon}</span>
                              <span className="text-[10px] font-label tracking-wide uppercase truncate w-full">
                                {style.label}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="text-xs font-label uppercase font-bold tracking-wider text-muted-grey block mb-2">
                          Hair Color Swatches
                        </span>
                        <div className="flex items-center gap-2 flex-wrap">
                          {HAIR_COLORS.map((hc) => (
                            <button
                              key={hc.id}
                              type="button"
                              onClick={() =>
                                setEditingConfig((prev) => ({ ...prev, hairColor: hc.id }))
                              }
                              className={`w-8 h-8 rounded-full border-2 transition-all cursor-pointer relative ${
                                editingConfig.hairColor === hc.id
                                  ? 'border-primary-container scale-110 ring-2 ring-primary-container/40'
                                  : 'border-white/20 hover:scale-105'
                              }`}
                              style={{ backgroundColor: hc.id }}
                              title={hc.label}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB: SKIN TONE */}
                  {activeInlineTab === 'skin' && (
                    <div className="space-y-4">
                      <span className="text-xs font-label uppercase font-bold tracking-wider text-muted-grey block">
                        Select Realistic Skin Undertone
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        {SKIN_TONES.map((st) => (
                          <button
                            key={st.id}
                            type="button"
                            onClick={() =>
                              setEditingConfig((prev) => ({ ...prev, skinTone: st.id }))
                            }
                            className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-2.5 ${
                              editingConfig.skinTone === st.id
                                ? 'border-primary-container bg-primary-container/15 text-primary-container font-bold'
                                : 'border-white/10 bg-surface-container/60 hover:border-white/30 text-pale-cream/80'
                            }`}
                          >
                            <span
                              className="w-6 h-6 rounded-full border border-black/20 flex-shrink-0"
                              style={{ backgroundColor: st.id }}
                            />
                            <span className="text-xs font-label truncate">{st.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TAB: OUTFIT */}
                  {activeInlineTab === 'outfit' && (
                    <div className="space-y-4">
                      <div>
                        <span className="text-xs font-label uppercase font-bold tracking-wider text-muted-grey block mb-2">
                          Outfit Cut & Silhouette
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {OUTFIT_STYLES.map((o) => (
                            <button
                              key={o.id}
                              type="button"
                              onClick={() =>
                                setEditingConfig((prev) => ({
                                  ...prev,
                                  outfit: o.id as AvatarConfig['outfit'],
                                }))
                              }
                              className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-2 ${
                                editingConfig.outfit === o.id
                                  ? 'border-primary-container bg-primary-container/15 text-primary-container font-bold'
                                  : 'border-white/10 bg-surface-container/60 hover:border-white/30 text-pale-cream/80'
                              }`}
                            >
                              <span className="text-lg">{o.icon}</span>
                              <span className="text-xs font-label uppercase tracking-wide truncate">
                                {o.label}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="text-xs font-label uppercase font-bold tracking-wider text-muted-grey block mb-2">
                          Outfit Fabric Color
                        </span>
                        <div className="flex items-center gap-2 flex-wrap">
                          {OUTFIT_COLORS.map((oc) => (
                            <button
                              key={oc.id}
                              type="button"
                              onClick={() =>
                                setEditingConfig((prev) => ({ ...prev, outfitColor: oc.id }))
                              }
                              className={`w-8 h-8 rounded-full border-2 transition-all cursor-pointer ${
                                editingConfig.outfitColor === oc.id
                                  ? 'border-primary-container scale-110 ring-2 ring-primary-container/40'
                                  : 'border-white/20 hover:scale-105'
                              }`}
                              style={{ backgroundColor: oc.id }}
                              title={oc.label}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB: STORY RING */}
                  {activeInlineTab === 'ring' && (
                    <div className="space-y-4">
                      <span className="text-xs font-label uppercase font-bold tracking-wider text-muted-grey block">
                        Instagram Profile Story Ring Glow
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {STORY_RINGS.map((ring) => (
                          <button
                            key={ring.id}
                            type="button"
                            onClick={() =>
                              setEditingConfig((prev) => ({
                                ...prev,
                                storyRing: ring.id as AvatarConfig['storyRing'],
                              }))
                            }
                            className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                              editingConfig.storyRing === ring.id
                                ? 'border-primary-container bg-primary-container/15 text-primary-container font-bold'
                                : 'border-white/10 bg-surface-container/60 hover:border-white/30 text-pale-cream/80'
                            }`}
                          >
                            <span className="text-xs font-label uppercase tracking-wide truncate">
                              {ring.label}
                            </span>
                            <div
                              className={`w-6 h-6 rounded-full bg-gradient-to-tr ${ring.color} border border-white/20 flex-shrink-0`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TAB: FACE & MOOD */}
                  {activeInlineTab === 'face' && (
                    <div className="space-y-4">
                      <div>
                        <span className="text-xs font-label uppercase font-bold tracking-wider text-muted-grey block mb-2">
                          Facial Expression
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {[
                            { id: 'smile', label: 'Smile', emoji: '😊' },
                            { id: 'wink', label: 'Wink', emoji: '😉' },
                            { id: 'smirk', label: 'Smirk', emoji: '😏' },
                            { id: 'dreamy', label: 'Dreamy', emoji: '✨' },
                          ].map((exp) => (
                            <button
                              key={exp.id}
                              type="button"
                              onClick={() =>
                                setEditingConfig((prev) => ({
                                  ...prev,
                                  expression: exp.id as AvatarConfig['expression'],
                                }))
                              }
                              className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                                editingConfig.expression === exp.id
                                  ? 'border-primary-container bg-primary-container/15 text-primary-container font-bold'
                                  : 'border-white/10 bg-surface-container/60 hover:border-white/30 text-pale-cream/80'
                              }`}
                            >
                              <span>{exp.emoji}</span>
                              <span className="text-xs font-label uppercase tracking-wide">
                                {exp.label}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="text-xs font-label uppercase font-bold tracking-wider text-muted-grey block mb-2">
                          Eye Color
                        </span>
                        <div className="flex items-center gap-2 flex-wrap">
                          {EYE_COLORS.map((ec) => (
                            <button
                              key={ec.id}
                              type="button"
                              onClick={() =>
                                setEditingConfig((prev) => ({ ...prev, eyeColor: ec.id }))
                              }
                              className={`w-7 h-7 rounded-full border-2 transition-all cursor-pointer ${
                                editingConfig.eyeColor === ec.id
                                  ? 'border-primary-container scale-110 ring-2 ring-primary-container/40'
                                  : 'border-white/20 hover:scale-105'
                              }`}
                              style={{ backgroundColor: ec.id }}
                              title={ec.label}
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="text-xs font-label uppercase font-bold tracking-wider text-muted-grey block mb-2">
                          Facial Details & Features
                        </span>
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            type="button"
                            onClick={() =>
                              setEditingConfig((prev) => ({ ...prev, blush: !prev.blush }))
                            }
                            className={`px-3 py-1.5 rounded-lg border text-xs font-label uppercase tracking-wider cursor-pointer ${
                              editingConfig.blush
                                ? 'border-pink-500 bg-pink-500/20 text-pink-300 font-bold'
                                : 'border-white/10 bg-white/5 text-muted-grey'
                            }`}
                          >
                            Blush: {editingConfig.blush ? 'ON' : 'OFF'}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setEditingConfig((prev) => ({ ...prev, freckles: !prev.freckles }))
                            }
                            className={`px-3 py-1.5 rounded-lg border text-xs font-label uppercase tracking-wider cursor-pointer ${
                              editingConfig.freckles
                                ? 'border-primary-container bg-primary-container/20 text-primary-container font-bold'
                                : 'border-white/10 bg-white/5 text-muted-grey'
                            }`}
                          >
                            Freckles: {editingConfig.freckles ? 'ON' : 'OFF'}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setEditingConfig((prev) => ({
                                ...prev,
                                beautyMark: !prev.beautyMark,
                              }))
                            }
                            className={`px-3 py-1.5 rounded-lg border text-xs font-label uppercase tracking-wider cursor-pointer ${
                              editingConfig.beautyMark
                                ? 'border-primary-container bg-primary-container/20 text-primary-container font-bold'
                                : 'border-white/10 bg-white/5 text-muted-grey'
                            }`}
                          >
                            Beauty Mark: {editingConfig.beautyMark ? 'ON' : 'OFF'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB: ACCESSORIES */}
                  {activeInlineTab === 'accessories' && (
                    <div className="space-y-4">
                      <div>
                        <span className="text-xs font-label uppercase font-bold tracking-wider text-muted-grey block mb-2">
                          Eyewear / Glasses
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {GLASSES_OPTIONS.map((g) => (
                            <button
                              key={g.id}
                              type="button"
                              onClick={() =>
                                setEditingConfig((prev) => ({
                                  ...prev,
                                  glasses: g.id as AvatarConfig['glasses'],
                                }))
                              }
                              className={`p-2 rounded-xl border text-xs font-label uppercase tracking-wider transition-all cursor-pointer ${
                                editingConfig.glasses === g.id
                                  ? 'border-primary-container bg-primary-container/15 text-primary-container font-bold'
                                  : 'border-white/10 bg-surface-container/60 hover:border-white/30 text-pale-cream/80'
                              }`}
                            >
                              {g.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="text-xs font-label uppercase font-bold tracking-wider text-muted-grey block mb-2">
                          Headwear
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {HEADWEAR_OPTIONS.map((hw) => (
                            <button
                              key={hw.id}
                              type="button"
                              onClick={() =>
                                setEditingConfig((prev) => ({
                                  ...prev,
                                  headwear: hw.id as AvatarConfig['headwear'],
                                }))
                              }
                              className={`p-2 rounded-xl border text-xs font-label uppercase tracking-wider transition-all cursor-pointer ${
                                editingConfig.headwear === hw.id
                                  ? 'border-primary-container bg-primary-container/15 text-primary-container font-bold'
                                  : 'border-white/10 bg-surface-container/60 hover:border-white/30 text-pale-cream/80'
                              }`}
                            >
                              {hw.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
