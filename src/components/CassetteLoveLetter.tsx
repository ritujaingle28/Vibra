import React, { useState } from 'react';
import { Cassette } from '../types';

interface CassetteLoveLetterProps {
  cassette: Cassette;
  onPlay?: () => void;
  onSend?: () => void;
  onEdit?: () => void;
  isPlaying?: boolean;
}

export const CassetteLoveLetter: React.FC<CassetteLoveLetterProps> = ({
  cassette,
  onPlay,
  onSend,
  onEdit,
  isPlaying = false,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyNote = async () => {
    const textToCopy = `📼 Mixtape for ${cassette.recipientName}: "${cassette.title}"\n\n"${cassette.note}"\n\n— With love, ${cassette.senderName}\n\nTracklist:\n${cassette.tracks.map((t, idx) => `${idx + 1}. ${t.title} - ${t.channel}`).join('\n')}`;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="relative w-full max-w-xl mx-auto">
      {/* Vintage Paper Background with torn edge effect & drop shadow */}
      <div className="relative rounded-2xl bg-[#faf5ec] text-[#2c2621] p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-[#e8ded0] overflow-hidden">
        {/* Subtle Paper Texture Lines */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, transparent, transparent 27px, #9c8a74 28px)',
          }}
        />

        {/* Vintage Postmark / Stamp Decor in upper right */}
        <div className="absolute top-5 right-5 flex items-center gap-2 pointer-events-none opacity-80">
          <div className="w-12 h-14 rounded-xs border-2 border-dashed border-rose-900/40 p-1 flex flex-col items-center justify-center bg-rose-50/50 rotate-3">
            <span className="text-base leading-none">💌</span>
            <span className="text-[8px] font-mono uppercase font-bold text-rose-900/70 mt-1">Air Mail</span>
          </div>
          <div className="w-10 h-10 rounded-full border border-stone-800/30 flex items-center justify-center -rotate-12 text-[7px] font-mono uppercase text-stone-700/60 text-center leading-tight">
            VIBRA
            <br />
            SPECIAL
          </div>
        </div>

        {/* Header: To & From */}
        <div className="relative z-10 border-b border-[#ded2be] pb-4 mb-5">
          <div className="flex items-baseline gap-2">
            <span className="font-serif italic text-sm text-[#8c7b66]">Dearest</span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#3b2b1d]">
              {cassette.recipientName}
            </h2>
          </div>
          <p className="text-xs font-mono uppercase tracking-wider text-[#9e8f7a] mt-1">
            Mixtape Tape: <span className="text-[#3b2b1d] font-semibold">{cassette.title}</span>
          </p>
        </div>

        {/* The Handwritten Note */}
        <div className="relative z-10 my-4">
          <p className="font-serif text-base sm:text-lg leading-relaxed sm:leading-loose text-[#2b221a] whitespace-pre-line italic">
            "{cassette.note || 'Every song on this mixtape was chosen with you in mind. Press play whenever you want to be reminded of how special you are to me.'}"
          </p>
        </div>

        {/* Sign-off with Wax Seal look */}
        <div className="relative z-10 mt-6 pt-4 border-t border-[#ded2be] flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="font-serif italic text-xs text-[#8c7b66] block">Always & Forever,</span>
            <span className="font-serif text-xl font-bold text-[#3b2b1d]">{cassette.senderName}</span>
          </div>

          {/* Badge / Sticker */}
          {cassette.sticker && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-rose-300/60 shadow-xs text-xs font-serif text-rose-900 font-medium">
              <span>{cassette.sticker}</span>
            </div>
          )}
        </div>

        {/* Action Controls Bar */}
        <div className="relative z-10 mt-7 pt-4 border-t border-[#ded2be] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {onPlay && (
              <button
                onClick={onPlay}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#3b2b1d] text-[#faf5ec] hover:bg-[#20170f] active:scale-95 transition-all text-xs font-semibold shadow-md cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">
                  {isPlaying ? 'pause' : 'play_arrow'}
                </span>
                <span>{isPlaying ? 'Playing Cassette' : 'Listen Now'}</span>
              </button>
            )}

            {onSend && (
              <button
                onClick={onSend}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-700 text-white hover:bg-rose-800 active:scale-95 transition-all text-xs font-semibold shadow-md cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">send</span>
                <span>Send to {cassette.recipientName.split(' ')[0]}</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyNote}
              title="Copy note & tracklist to clipboard"
              className="flex items-center gap-1 px-3 py-2 rounded-xl bg-[#ede2d1] hover:bg-[#e2d5c1] text-[#3b2b1d] transition-colors text-xs font-medium cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">
                {copied ? 'check' : 'content_copy'}
              </span>
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>

            {onEdit && (
              <button
                onClick={onEdit}
                title="Edit cassette details or note"
                className="flex items-center gap-1 px-3 py-2 rounded-xl bg-[#ede2d1] hover:bg-[#e2d5c1] text-[#3b2b1d] transition-colors text-xs font-medium cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">edit</span>
                <span>Edit</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
