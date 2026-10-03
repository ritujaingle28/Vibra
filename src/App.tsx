import React, { useState, useEffect } from 'react';
import { Sidebar, BottomNav } from './components/Navigation';
import { SearchTab } from './tabs/SearchTab';
import { PremiumTab } from './tabs/PremiumTab';
import { HomeTab } from './tabs/HomeTab';
import { LibraryTab } from './tabs/LibraryTab';
import { AuthTab } from './tabs/AuthTab';
import { ProfileTab } from './tabs/ProfileTab';
import { IntroTab } from './tabs/IntroTab';
import { CassetteTab } from './tabs/CassetteTab';
import { GenerateMusicTab } from './tabs/GenerateMusicTab';
import { auth } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { GlobalPlayer } from './components/GlobalPlayer';
import { FullScreenPlayer } from './components/FullScreenPlayer';
import { BottomPlayerBar } from './components/BottomPlayerBar';
import { Toast } from './components/Toast';
import { ShareModal } from './components/ShareModal';
import { AddToPlaylistModal } from './components/AddToPlaylistModal';
import { usePlayer } from './context/PlayerContext';

export default function App() {
  const [activeTab, setActiveTab] = useState('intro');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(() => {
    return localStorage.getItem('user_avatar_url') || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
  });

  const handleAvatarChange = (newUrl: string) => {
    setAvatarUrl(newUrl);
    localStorage.setItem('user_avatar_url', newUrl);
  };

  const { isShareModalOpen, sharingTrack, closeShareModal, toast, showToast } = usePlayer();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
      if (user?.photoURL && !localStorage.getItem('user_avatar_url')) {
        setAvatarUrl(user.photoURL);
        localStorage.setItem('user_avatar_url', user.photoURL);
      }
      setAuthInitialized(true);
      if (user && activeTab === 'auth') {
        setActiveTab('home'); // Redirect to home after login
      }
    });
    return () => unsubscribe();
  }, [activeTab]);

  useEffect(() => {
    // If URL contains ?cassette= or ?tab=cassettes, switch directly
    const params = new URLSearchParams(window.location.search);
    if (params.get('cassette') || params.get('tab') === 'cassettes') {
      setActiveTab('cassettes');
    }
  }, []);

  const handleProfileClick = () => {
    setActiveTab(isLoggedIn ? 'profile' : 'auth');
  };

  if (!authInitialized) {
    return <div className="bg-transparent h-screen w-screen flex items-center justify-center text-pale-cream font-display text-2xl">LOADING...</div>;
  }

  return (
    <div className="bg-transparent text-pale-cream font-body h-screen flex overflow-hidden relative selection:bg-primary-container selection:text-on-primary-container">
      {/* Background Image */}
      <div className="fixed inset-0 w-full h-full -z-10 pointer-events-none">
        <img
          alt="Background collage"
          className="w-full h-full object-cover"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAWqtLP925kTEI7_J__UokCOU2wzNNYgR_6nhzGvl0_I2AUT5KGF2mtyUWE2kFv-hF2uTChd_IU7hVyW0mUQl-l6OkIZHikUt-XfarLZkMqsjAgeq2lAQ4VVKUqHCjJZgzQqjeDNIo-NYoTQd6JE6Xps3gd8Z2dRPuIYpAyinWFwivRi3YrRPx6RUeoFGnZmzn6GUMAz4hAexqL8Xe9an3uR2PspawnHIcSlNPLKvBw7mgFJcY2zgvhNge46RqMj5ET7A"
        />
        <div className="absolute inset-0 bg-surface/70"></div>
      </div>

      {activeTab !== 'intro' && <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onProfileClick={handleProfileClick} isLoggedIn={isLoggedIn} avatarUrl={avatarUrl} />}
      {activeTab !== 'intro' && <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />}
      {activeTab !== 'intro' && <GlobalPlayer />}

      {/* Desktop Top Header Bar backdrop to ensure Three Lines Menu never overlays text */}
      {activeTab !== 'intro' && (
        <div className="hidden md:block fixed top-0 left-0 right-0 h-16 bg-surface/75 backdrop-blur-xl border-b border-white/5 z-30 pointer-events-none" />
      )}

      <main className="flex-1 w-full overflow-y-auto relative pb-44 md:pb-24 md:pt-16">
        {activeTab === 'intro' && <IntroTab onEnter={() => setActiveTab('auth')} />}
        {activeTab === 'home' && <HomeTab onProfileClick={handleProfileClick} onSearchClick={() => setActiveTab('search')} onNavigateToGenerate={() => setActiveTab('generate')} avatarUrl={avatarUrl} isLoggedIn={isLoggedIn} />}
        {activeTab === 'search' && <SearchTab />}
        {activeTab === 'generate' && <GenerateMusicTab onNavigateToLibrary={() => setActiveTab('library')} />}
        {activeTab === 'cassettes' && <CassetteTab />}
        {activeTab === 'library' && <LibraryTab />}
        {activeTab === 'premium' && <PremiumTab />}
        {activeTab === 'auth' && <AuthTab />}
        {activeTab === 'profile' && <ProfileTab avatarUrl={avatarUrl} onAvatarChange={handleAvatarChange} onNavigate={setActiveTab} isLoggedIn={isLoggedIn} />}
      </main>

      {activeTab !== 'intro' && <BottomPlayerBar />}
      {activeTab !== 'intro' && <FullScreenPlayer />}

      <Toast toast={toast} />
      <ShareModal
        isOpen={isShareModalOpen}
        track={sharingTrack}
        onClose={closeShareModal}
        onCopySuccess={() => showToast('Link copied to clipboard! 📋')}
      />
      <AddToPlaylistModal />
    </div>
  );
}
