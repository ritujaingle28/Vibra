import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Track } from '../context/PlayerContext';

interface ShareModalProps {
  isOpen: boolean;
  track: Track | null;
  onClose: () => void;
  onCopySuccess: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, track, onClose, onCopySuccess }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !track) return null;

  const trackUrl = `${window.location.origin}/?track=${track.id}`;
  const ytUrl = `https://www.youtube.com/watch?v=${track.id}`;
  const shareText = `🎵 Listening to "${track.title}" by ${track.channel} on Beatz!`;

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(`${shareText}\n${ytUrl}`);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = `${shareText}\n${ytUrl}`;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      onCopySuccess();
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link', err);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: track.title,
          text: shareText,
          url: ytUrl,
        });
        onClose();
      } catch (err) {
        // User cancelled or share failed
      }
    } else {
      handleCopyLink();
    }
  };

  const handleWhatsAppShare = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${ytUrl}`)}`;
    window.open(url, '_blank');
  };

  const handleTwitterShare = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(ytUrl)}`;
    window.open(url, '_blank');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative z-10 w-full max-w-md bg-[#25241b] border border-white/15 rounded-3xl p-6 shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display text-2xl text-pale-cream tracking-wide">Share Song</h3>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-pale-cream transition-colors"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>

          {/* Track Summary */}
          <div className="flex items-center gap-4 p-3 bg-surface-container/60 rounded-2xl mb-6 border border-white/5">
            <img
              src={track.thumbnail}
              alt={track.title}
              className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h4
                className="font-display text-base text-pale-cream truncate"
                dangerouslySetInnerHTML={{ __html: track.title }}
              />
              <p className="font-body text-xs text-muted-grey truncate">{track.channel}</p>
            </div>
          </div>

          {/* Share Action Grid */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <button
              onClick={handleWhatsAppShare}
              className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-[#25D366]/20 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[#25D366] text-2xl">chat</span>
              </div>
              <span className="font-label text-xs text-pale-cream tracking-wider">WhatsApp</span>
            </button>

            <button
              onClick={handleTwitterShare}
              className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-[#1DA1F2]/20 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[#1DA1F2] text-2xl">flutter</span>
              </div>
              <span className="font-label text-xs text-pale-cream tracking-wider">X / Twitter</span>
            </button>

            <button
              onClick={handleNativeShare}
              className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-primary-container/20 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-primary-container text-2xl">share</span>
              </div>
              <span className="font-label text-xs text-pale-cream tracking-wider">More Apps</span>
            </button>
          </div>

          {/* Copy Link Input & Button */}
          <div className="flex items-center gap-2 bg-surface-container-high/80 rounded-full p-1.5 pl-4 border border-white/10">
            <span className="material-symbols-outlined text-muted-grey text-lg">link</span>
            <input
              type="text"
              readOnly
              value={ytUrl}
              className="bg-transparent text-muted-grey text-xs flex-1 outline-none font-body truncate"
            />
            <button
              onClick={handleCopyLink}
              className={`px-4 py-2 rounded-full font-label text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${
                copied
                  ? 'bg-[#34A853] text-white'
                  : 'bg-primary-container text-on-primary-container hover:opacity-90'
              }`}
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
