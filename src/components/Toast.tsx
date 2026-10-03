import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface ToastProps {
  toast: {
    message: string;
    type?: 'success' | 'info' | 'error';
  } | null;
}

export const Toast: React.FC<ToastProps> = ({ toast }) => {
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-[150] pointer-events-none"
        >
          <div className="bg-[#2c2b1e]/95 backdrop-blur-xl border border-primary-container/30 text-pale-cream px-5 py-3 rounded-full shadow-2xl flex items-center gap-3">
            <span 
              className={`material-symbols-outlined text-xl ${
                toast.type === 'error' 
                  ? 'text-error-container' 
                  : 'text-primary-container'
              }`}
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {toast.type === 'error' ? 'error' : 'check_circle'}
            </span>
            <span className="font-label text-sm tracking-wider font-medium">{toast.message}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
