import React from 'react';
import { motion } from 'motion/react';

export const PremiumTab = () => {
  return (
    <div className="w-full h-full text-pale-cream pb-32 md:pb-8">
      <section className="relative min-h-[500px] flex flex-col items-center justify-center text-center px-6 py-12 overflow-hidden rounded-b-[48px]" style={{ backgroundColor: '#131313', backgroundImage: 'radial-gradient(at 0% 0%, hsla(143,100%,40%,0.15) 0px, transparent 50%), radial-gradient(at 100% 100%, hsla(280,100%,40%,0.1) 0px, transparent 50%)' }}>
        <div className="absolute inset-0 z-0 opacity-40">
          <div className="absolute top-10 left-10 w-64 h-64 bg-primary-container rounded-full mix-blend-screen filter blur-[100px] animate-pulse"></div>
        </div>
        <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center gap-8">
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="font-display text-4xl md:text-5xl text-pale-cream"
          >
            Get 3 months of Premium for free
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
            className="font-body text-xl text-on-surface-variant max-w-md tracking-wide"
          >
            Enjoy ad-free music listening, offline playback, and unlimited skips. Cancel anytime.
          </motion.p>
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            className="bg-primary-container text-on-primary-container rounded-full px-8 py-4 font-label text-sm font-bold tracking-widest shadow-[0_8px_24px_rgba(254,214,255,0.2)] hover:opacity-90 transition-all mt-4"
          >
            GET PREMIUM
          </motion.button>
          <p className="font-body text-sm text-on-surface-variant/60 mt-2 max-w-sm tracking-wider">
            Only $10.99/month after. Terms and conditions apply.
          </p>
        </div>
      </section>

      <section className="px-6 py-12 max-w-5xl mx-auto -mt-12 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: 'block', title: 'Ad-free music listening', desc: 'Enjoy uninterrupted music without any ad breaks.' },
            { icon: 'download', title: 'Offline playback', desc: 'Download your favorite tracks and listen anywhere.' },
            { icon: 'skip_next', title: 'Unlimited skips', desc: 'Just hit next. No limits on skipping songs.' }
          ].map((feat, i) => (
            <motion.div
              key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.1 }}
              className="bg-surface-container-high/60 backdrop-blur-xl rounded-[32px] p-8 flex flex-col items-center text-center gap-4 border border-white/5 hover:bg-surface-container-high/80 transition-colors shadow-2xl"
            >
              <div className="w-16 h-16 rounded-full bg-surface-container border border-outline-variant flex items-center justify-center mb-2">
                <span className="material-symbols-outlined text-primary-container text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>{feat.icon}</span>
              </div>
              <h3 className="font-headline text-2xl text-pale-cream tracking-wide leading-tight">{feat.title}</h3>
              <p className="font-body text-lg text-muted-grey tracking-wide">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="px-6 py-12 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}
          className="bg-surface-container-low/80 backdrop-blur-md rounded-[32px] border border-white/10 p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl"
        >
          <div className="flex-1">
            <h2 className="font-headline text-3xl text-pale-cream mb-6">Vibra Premium</h2>
            <ul className="flex flex-col gap-4 font-body text-lg text-muted-grey tracking-wide">
              <li className="flex items-center gap-3"><span className="material-symbols-outlined text-primary-container text-xl font-bold">check</span> Highest audio quality</li>
              <li className="flex items-center gap-3"><span className="material-symbols-outlined text-primary-container text-xl font-bold">check</span> Listen with friends in real-time</li>
              <li className="flex items-center gap-3"><span className="material-symbols-outlined text-primary-container text-xl font-bold">check</span> Organize your listening queue</li>
            </ul>
          </div>
          <div className="flex-shrink-0 text-center md:text-right w-full md:w-auto mt-6 md:mt-0 pt-6 md:pt-0 border-t md:border-t-0 border-white/10">
            <div className="font-display text-5xl text-pale-cream">Free</div>
            <div className="font-body text-base text-muted-grey mb-6 tracking-wider mt-2 uppercase">For 3 Months</div>
            <button className="border border-pale-cream text-pale-cream bg-transparent hover:bg-white/10 transition-colors rounded-full px-8 py-3 font-label text-sm font-bold tracking-widest w-full md:w-auto">
              VIEW PLANS
            </button>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
