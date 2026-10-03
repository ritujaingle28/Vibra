import React, { useState } from 'react';
import { Cassette } from '../types';

interface SendCassetteModalProps {
  cassette: Cassette | null;
  isOpen: boolean;
  onClose: () => void;
  onPlay?: () => void;
}

export const SendCassetteModal: React.FC<SendCassetteModalProps> = ({
  cassette,
  isOpen,
  onClose,
  onPlay
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);

  if (!isOpen || !cassette) return null;

  const shareUrl = `${window.location.origin}/?cassette=${encodeURIComponent(cassette.id)}`;
  const messageBody = `📼 Hey ${cassette.recipientName}! I made a custom retro song cassette mixtape for you: "${cassette.title}"\n\n"${cassette.note}"\n\n— With love, ${cassette.senderName}\n\nListen to our mixtape here:\n${shareUrl}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(messageBody);
      setCopiedMessage(true);
      setTimeout(() => setCopiedMessage(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Cassette Mixtape: ${cassette.title}`,
          text: `I made a custom song cassette mixtape for you! "${cassette.note}"`,
          url: shareUrl
        });
      } catch {
        // User cancelled or unsupported
      }
    } else {
      handleCopyLink();
    }
  };

  const openWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(messageBody)}`;
    window.open(url, '_blank');
  };

  const openEmail = () => {
    const subject = encodeURIComponent(`📼 A Mixtape for you: "${cassette.title}"`);
    const body = encodeURIComponent(messageBody);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-surface-container rounded-3xl border border-white/10 p-6 md:p-8 shadow-2xl overflow-hidden">
        {/* Decorative ambient gradient */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-pink-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-muted-grey hover:text-white transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/30 flex items-center justify-center text-2xl">
            💌
          </div>
          <div>
            <h3 className="font-display text-xl text-pale-cream">Send Cassette</h3>
            <p className="text-xs text-muted-grey">
              Deliver your mixtape & love letter to <strong className="text-pastel-lavender">{cassette.recipientName}</strong>
            </p>
          </div>
        </div>

        {/* Cassette Summary Box */}
        <div className="p-4 rounded-2xl bg-surface-container-high/60 border border-white/5 mb-6 flex items-center gap-4">
          <div className="w-16 h-12 rounded-lg bg-stone-900 border border-white/10 flex items-center justify-center flex-shrink-0 text-xl">
            📼
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-display text-sm text-pale-cream truncate">{cassette.title}</h4>
            <p className="text-xs text-muted-grey truncate italic">"{cassette.note}"</p>
            <p className="text-[11px] text-pastel-lavender mt-0.5">
              {cassette.tracks.length} songs • From {cassette.senderName}
            </p>
          </div>
        </div>

        {/* Share Options Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
          <button
            onClick={openWhatsApp}
            className="flex flex-col items-center justify-center gap-1.5 p-3.5 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-300 transition-all cursor-pointer group"
          >
            <span className="text-2xl group-hover:scale-110 transition-transform">💬</span>
            <span className="text-xs font-semibold">WhatsApp</span>
          </button>

          <button
            onClick={handleNativeShare}
            className="flex flex-col items-center justify-center gap-1.5 p-3.5 rounded-2xl bg-primary-container/10 hover:bg-primary-container/20 border border-primary-container/20 text-primary-container transition-all cursor-pointer group"
          >
            <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">share</span>
            <span className="text-xs font-semibold">Share App</span>
          </button>

          <button
            onClick={openEmail}
            className="flex flex-col items-center justify-center gap-1.5 p-3.5 rounded-2xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-300 transition-all cursor-pointer group"
          >
            <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">mail</span>
            <span className="text-xs font-semibold">Email</span>
          </button>

          <button
            onClick={handleCopyMessage}
            className="flex flex-col items-center justify-center gap-1.5 p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-pale-cream transition-all cursor-pointer group"
          >
            <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">
              {copiedMessage ? 'done' : 'chat'}
            </span>
            <span className="text-xs font-semibold">{copiedMessage ? 'Copied!' : 'Copy Msg'}</span>
          </button>
        </div>

        {/* Direct Link Section */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-grey uppercase tracking-wider block">
            Direct Cassette Link
          </label>
          <div className="flex items-center gap-2 p-1.5 pl-3 rounded-xl bg-surface-container-lowest border border-white/5">
            <span className="text-xs text-muted-grey truncate flex-1 font-mono">
              {shareUrl}
            </span>
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-container text-on-primary-container hover:opacity-90 active:scale-95 transition-all text-xs font-semibold cursor-pointer flex-shrink-0"
            >
              <span className="material-symbols-outlined text-sm">
                {copiedLink ? 'done' : 'content_copy'}
              </span>
              <span>{copiedLink ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
          {onPlay && (
            <button
              onClick={() => {
                onPlay();
                onClose();
              }}
              className="flex items-center gap-1.5 text-xs text-pastel-lavender hover:underline cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">play_circle</span>
              <span>Test Play Cassette First</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="ml-auto px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium text-pale-cream cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
