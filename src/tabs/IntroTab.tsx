import React from 'react';
import { motion } from 'motion/react';

export const IntroTab = ({ onEnter }: { onEnter: () => void }) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden bg-surface-dim/40 backdrop-blur-md z-[100]">
      <div className="relative z-10 flex flex-col items-center text-center px-6 w-full max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="mb-16 w-full"
        >
          <div className="w-28 h-28 rounded-full bg-surface-container-high/80 border-2 border-pastel-lavender/50 relative overflow-hidden flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(231,181,247,0.3)]">
            <span className="material-symbols-outlined text-pastel-lavender text-6xl">graphic_eq</span>
            <div className="absolute inset-0 bg-pastel-lavender/20 animate-pulse rounded-full"></div>
          </div>
          <h1 className="font-display text-6xl md:text-8xl text-pale-cream drop-shadow-2xl mb-6 tracking-widest uppercase">
            Beatz
          </h1>
          <p className="font-body text-xl md:text-2xl text-pastel-lavender tracking-widest uppercase drop-shadow-md">
            Atmospheric Audio
          </p>
        </motion.div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onEnter}
          className="bg-primary-container text-on-primary-container rounded-full px-14 py-5 font-label text-sm font-bold tracking-widest shadow-[0_0_30px_rgba(254,214,255,0.3)] hover:shadow-[0_0_40px_rgba(254,214,255,0.5)] transition-all uppercase w-full sm:w-auto"
        >
          Enter Experience
        </motion.button>
      </div>
    </div>
  );
};
