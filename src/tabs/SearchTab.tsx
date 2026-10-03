import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { usePlayer } from '../context/PlayerContext';
import { getActualSongImage, handleSongImageError } from '../lib/songImage';

const categories = [
  { title: "Taylor's Eras", query: "Taylor Swift", outerRing: 'border-tertiary-container/30 bg-tertiary-container/10', innerLabel: 'bg-tertiary-container', textColor: 'text-pastel-lavender' },
  { title: 'Pop Anthems', query: 'Pop Anthems', outerRing: 'border-primary-container/30 bg-primary-container/10', innerLabel: 'bg-primary-container', textColor: 'text-pastel-mint' },
  { title: 'Folklore & Chill', query: 'Taylor Swift folklore acoustic', outerRing: 'border-secondary-container/30 bg-secondary-container/10', innerLabel: 'bg-secondary-container', textColor: 'text-pale-cream' },
  { title: 'Midnights Synth', query: 'Taylor Swift Midnights', outerRing: 'border-surface-container-high/30 bg-surface-container-high/10', innerLabel: 'bg-surface-container-high', textColor: 'text-pastel-lavender' },
  { title: 'Acoustic Folk', query: 'Acoustic Folk pop', outerRing: 'border-error-container/30 bg-error-container/10', innerLabel: 'bg-error-container', textColor: 'text-pastel-mint' },
  { title: 'Lo-Fi Beats', query: 'lofi hip hop radio', outerRing: 'border-tertiary-fixed-dim/30 bg-tertiary-fixed-dim/10', innerLabel: 'bg-tertiary-fixed-dim', textColor: 'text-pale-cream' }
];

const VinylCard = ({ title, query, onClick, outerRing, innerLabel, textColor }: any) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className="relative overflow-visible aspect-square group cursor-pointer flex items-center justify-center"
    >
      <div className={`absolute inset-0 rounded-full border-4 ${outerRing} backdrop-blur-sm z-0`}></div>
      <div className="w-[90%] h-[90%] rounded-full overflow-hidden relative z-10 animate-[spin_10s_linear_infinite] bg-gradient-to-tr from-surface-dim via-surface-container-highest to-surface-dim border-4 border-surface shadow-2xl flex items-center justify-center">
        {/* Grooves */}
        <div className="absolute inset-0 bg-[repeating-radial-gradient(circle,transparent,transparent_2px,rgba(255,255,255,0.05)_3px,transparent_4px)] rounded-full"></div>
        {/* Inner Label */}
        <div className={`w-1/3 h-1/3 ${innerLabel} rounded-full absolute border-4 border-surface-dim shadow-inner flex items-center justify-center`}>
          {/* Hole */}
          <div className="w-2 h-2 bg-pale-cream rounded-full shadow-sm"></div>
        </div>
      </div>
      <h3 className={`absolute font-headline text-2xl md:text-3xl ${textColor} z-20 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] pointer-events-none text-center px-4 leading-none`}>
        {title.split(' ').map((word: string, i: number) => <React.Fragment key={i}>{word}<br/></React.Fragment>)}
      </h3>
    </motion.div>
  );
};

export const SearchTab = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { currentTrack, playTrack, isLiked, toggleLike, shareTrack, openAddToPlaylistModal, addToQueue } = usePlayer();

  const trendingTags = [
    '✨ Taylor Swift',
    'Cruel Summer',
    'Anti-Hero',
    'cardigan',
    'Style (Taylor\'s Version)',
    'Espresso',
    'Blank Space',
    'Lover',
    'Lo-Fi Study'
  ];

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      setError('');
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (!response.ok) {
          throw new Error('Failed to fetch search results');
        }
        const data = await response.json();
        setResults(data.tracks || []);
      } catch (err) {
        console.error(err);
        setError('Something went wrong. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="px-6 md:px-8 py-8 pb-40 md:pb-8">
      <div className="max-w-[1400px] mx-auto">
        <header className="flex flex-col mb-8 md:mb-12">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-4xl md:text-[56px] text-pastel-lavender drop-shadow-md mb-6"
          >
            Search
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="relative max-w-2xl"
          >
            <span className="material-symbols-outlined absolute left-5 top-1/2 transform -translate-y-1/2 text-muted-grey text-2xl">search</span>
            <input
              className="w-full bg-surface-container-high/80 text-pale-cream rounded-full py-4 pl-14 pr-6 border-none focus:ring-2 focus:ring-pastel-lavender outline-none font-body text-lg placeholder-muted-grey backdrop-blur-md shadow-lg transition-all"
              placeholder="SEARCH TAYLOR SWIFT, SONGS, ARTISTS..."
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {isLoading && (
              <span className="material-symbols-outlined absolute right-5 top-1/2 transform -translate-y-1/2 text-pastel-mint text-2xl animate-spin">refresh</span>
            )}
          </motion.div>

          {/* Quick Trending Tags */}
          <div className="flex items-center gap-2 overflow-x-auto py-3 no-scrollbar max-w-2xl">
            <span className="text-xs font-mono uppercase text-muted-grey flex-shrink-0 flex items-center gap-1">
              <span className="material-symbols-outlined text-sm text-primary-container">trending_up</span> Top:
            </span>
            {trendingTags.map((tag, idx) => {
              const cleanTag = tag.replace('✨ ', '');
              return (
                <button
                  key={idx}
                  onClick={() => setQuery(cleanTag)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-body whitespace-nowrap transition-all cursor-pointer border ${
                    query === cleanTag
                      ? 'bg-primary-container text-[#3c3c2a] font-bold border-primary-container'
                      : 'bg-surface-container-high/60 text-pale-cream border-white/5 hover:border-primary-container/40 hover:bg-surface-container-high'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </header>

        {query.trim() && (
          <section className="mb-12">
            <h2 className="font-headline text-2xl text-pale-cream mb-6">Search Results</h2>
            {error && <p className="text-error-container">{error}</p>}
            
            {!isLoading && results.length === 0 && !error && (
              <p className="text-muted-grey">No results found for "{query}".</p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {results.map((track, i) => {
                const trackItem = {
                  id: track.id,
                  title: track.title,
                  channel: track.channel,
                  thumbnail: track.thumbnail,
                };
                const liked = isLiked(track.id);

                return (
                  <motion.div
                    key={track.id}
                    onClick={() => playTrack(trackItem, results)}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`flex items-center gap-4 p-3 rounded-2xl cursor-pointer group transition-colors border ${currentTrack?.id === track.id ? 'bg-primary-container/20 border-primary-container/50' : 'bg-surface-container/50 hover:bg-surface-container border-transparent hover:border-white/10'}`}
                  >
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 shadow-md">
                      <img
                        src={getActualSongImage(trackItem)}
                        alt={track.title}
                        onError={(e) => handleSongImageError(e, track.id)}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="material-symbols-outlined text-pale-cream text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                          {currentTrack?.id === track.id ? 'volume_up' : 'play_arrow'}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <h4 className={`font-display text-lg truncate leading-tight mb-1 ${currentTrack?.id === track.id ? 'text-primary-container' : 'text-pale-cream'}`} dangerouslySetInnerHTML={{ __html: track.title }}></h4>
                      <p className="font-body text-sm text-muted-grey truncate">{track.channel}</p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          addToQueue(trackItem);
                        }}
                        className="w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer text-muted-grey hover:text-pale-cream"
                        title="Add to Queue"
                      >
                        <span className="material-symbols-outlined text-lg">queue_music</span>
                      </button>
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openAddToPlaylistModal(trackItem);
                        }}
                        className="w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer text-muted-grey hover:text-pale-cream"
                        title="Add to Playlist"
                      >
                        <span className="material-symbols-outlined text-lg">playlist_add</span>
                      </button>
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLike(trackItem);
                        }}
                        className="w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
                        title={liked ? "Unlike song" : "Like song"}
                      >
                        <span 
                          className={`material-symbols-outlined text-xl transition-transform ${liked ? 'text-primary-container scale-110' : 'text-muted-grey hover:text-pale-cream'}`}
                          style={{ fontVariationSettings: liked ? "'FILL' 1" : "'FILL' 0" }}
                        >
                          favorite
                        </span>
                      </button>
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          shareTrack(trackItem);
                        }}
                        className="w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer text-muted-grey hover:text-pale-cream"
                        title="Share song"
                      >
                        <span className="material-symbols-outlined text-xl">share</span>
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>
        )}

        {!query.trim() && (
          <section className="mt-8">
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="font-headline text-2xl md:text-3xl text-pastel-mint mb-6 drop-shadow-sm"
            >
              Browse all
            </motion.h2>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8"
            >
              {categories.map((cat, idx) => (
                <VinylCard key={idx} {...cat} onClick={() => setQuery(cat.query || cat.title)} />
              ))}
            </motion.div>
          </section>
        )}
      </div>
    </div>
  );
};

