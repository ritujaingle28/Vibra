import React, { useState, useEffect } from 'react';

export const Sidebar = ({ 
  activeTab, 
  setActiveTab, 
  onProfileClick, 
  isLoggedIn, 
  avatarUrl,
  isOpen: controlledIsOpen,
  setIsOpen: controlledSetIsOpen,
}: { 
  activeTab: string; 
  setActiveTab: (tab: string) => void; 
  onProfileClick: () => void; 
  isLoggedIn: boolean; 
  avatarUrl: string;
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const setIsOpen = controlledSetIsOpen !== undefined ? controlledSetIsOpen : setInternalIsOpen;

  const handleClose = () => setIsOpen(false);
  const handleToggle = () => setIsOpen(!isOpen);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const navItems = [
    { id: 'home', icon: 'home', label: 'Home' },
    { id: 'search', icon: 'search', label: 'Search' },
    { id: 'generate', icon: 'music_note', label: 'Generate Music' },
    { id: 'cassettes', icon: 'album', label: 'Cassettes' },
    { id: 'library', icon: 'library_music', label: 'Library' },
    { id: 'premium', icon: 'workspace_premium', label: 'Premium' },
    { id: 'profile', icon: 'person', label: 'Profile' },
  ];

  return (
    <>
      {/* Floating Three Lines (Hamburger Menu) toggle button in desktop mode */}
      {!isOpen && (
        <button
          id="desktop-three-lines-toggle"
          type="button"
          onClick={handleToggle}
          title="Open Navigation Menu (Three Lines)"
          aria-label="Open Navigation Menu"
          className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-surface-container-high/90 hover:bg-surface-container-highest backdrop-blur-xl border border-white/10 text-pale-cream hover:text-primary-container shadow-md hover:shadow-[0_4px_16px_rgba(231,181,247,0.2)] transition-all duration-200 cursor-pointer fixed top-3 left-6 z-40 group"
        >
          <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">
            menu
          </span>
          <span className="font-display text-sm tracking-wider text-pastel-lavender">
            Menu
          </span>
        </button>
      )}

      {/* Backdrop overlay for desktop when sidebar is open */}
      {isOpen && (
        <div 
          onClick={handleClose}
          className="hidden md:block fixed inset-0 bg-black/60 backdrop-blur-xs z-45 transition-opacity duration-300 cursor-pointer"
          title="Click to close menu"
        />
      )}

      {/* Desktop Sidebar Navigation Drawer */}
      <nav 
        id="desktop-sidebar-navigation"
        className={`hidden md:flex flex-col w-[280px] h-full bg-surface/90 backdrop-blur-2xl border-r border-white/10 py-6 px-6 z-50 flex-shrink-0 fixed top-0 left-0 bottom-0 shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full pointer-events-none'
        }`}
      >
        {/* Brand & Three Lines Toggle Header */}
        <div className="flex items-center justify-between mb-8 pb-3 border-b border-white/5">
          <div 
            onClick={() => {
              onProfileClick();
              handleClose();
            }}
            className="flex items-center gap-3.5 cursor-pointer group p-1 -m-1 rounded-2xl hover:bg-surface-container-high/40 transition-colors flex-1 min-w-0"
            title="View Profile"
          >
            <div 
              className={`w-11 h-11 rounded-full bg-surface-container-high/80 border-2 ${
                activeTab === 'profile' ? 'border-primary-container ring-2 ring-primary-container/40' : 'border-pastel-lavender/50'
              } relative overflow-hidden flex items-center justify-center group-hover:scale-105 transition-transform flex-shrink-0`}
            >
              {isLoggedIn ? (
                <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <>
                  <span className="material-symbols-outlined text-muted-grey text-xl">person</span>
                  <div className="absolute inset-0 bg-pastel-lavender/20 animate-pulse rounded-full"></div>
                </>
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-display text-2xl text-pastel-lavender drop-shadow-sm leading-tight">Vibra</span>
              <span className="font-label text-[10px] text-muted-grey uppercase tracking-wider group-hover:text-primary-container transition-colors truncate">
                {isLoggedIn ? 'Your Profile' : 'Sign In / Join'}
              </span>
            </div>
          </div>

          {/* Three Lines Button inside menu to collapse / hide */}
          <button
            type="button"
            onClick={handleClose}
            title="Hide Navigation Menu (Three Lines)"
            aria-label="Hide Navigation Menu"
            className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 text-muted-grey hover:text-white flex items-center justify-center transition-all cursor-pointer flex-shrink-0 ml-2 group"
          >
            <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">
              menu_open
            </span>
          </button>
        </div>

        <div className="flex flex-col gap-3 mt-1 flex-1 overflow-y-auto pr-1">
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'profile') {
                    onProfileClick();
                  } else {
                    setActiveTab(item.id);
                  }
                  handleClose();
                }}
                className={`flex items-center gap-4 rounded-full px-4 py-3 transition-all duration-300 group cursor-pointer ${
                  isActive
                    ? 'bg-primary-container/80 backdrop-blur-sm text-on-primary-container scale-105 shadow-[0_0_15px_rgba(231,181,247,0.4)]'
                    : 'text-muted-grey hover:text-pale-cream hover:bg-surface-container-high/50'
                }`}
              >
                <span
                  className={`material-symbols-outlined ${!isActive && 'group-hover:scale-110 transition-transform'}`}
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                  {item.icon}
                </span>
                <span className="font-label text-base font-semibold tracking-wider">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* User Quick Switcher Footer */}
        <div 
          onClick={() => {
            onProfileClick();
            handleClose();
          }}
          className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between cursor-pointer hover:opacity-90 transition-opacity"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-surface-container flex items-center justify-center flex-shrink-0">
              {isLoggedIn ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-sm text-muted-grey">person</span>
              )}
            </div>
            <span className="text-xs text-pale-cream truncate font-body">
              {isLoggedIn ? 'Account Active' : 'Guest Mode'}
            </span>
          </div>
          <span className="material-symbols-outlined text-muted-grey text-base">chevron_right</span>
        </div>
      </nav>
    </>
  );
};

export const BottomNav = ({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (tab: string) => void }) => {
  const navItems = [
    { id: 'home', icon: 'home', label: 'Home' },
    { id: 'search', icon: 'search', label: 'Search' },
    { id: 'generate', icon: 'music_note', label: 'Create' },
    { id: 'cassettes', icon: 'album', label: 'Tapes' },
    { id: 'library', icon: 'library_music', label: 'Library' },
    { id: 'premium', icon: 'workspace_premium', label: 'VIP' },
    { id: 'profile', icon: 'person', label: 'Profile' },
  ];

  return (
    <nav
      id="bottom-navigation-bar"
      className="md:hidden fixed bottom-3 left-2 right-2 z-40 max-w-lg mx-auto bg-surface-container-high/90 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] px-1 py-1 grid grid-cols-7 items-center gap-0.5"
    >
      {navItems.map(item => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            id={`bottom-nav-${item.id}`}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex flex-col items-center justify-center py-1.5 px-0.5 rounded-xl cursor-pointer transition-all duration-200 ${
              isActive
                ? 'bg-primary-container/85 text-on-primary-container shadow-[0_2px_10px_rgba(231,181,247,0.3)] font-semibold'
                : 'text-muted-grey hover:text-pale-cream hover:bg-white/5'
            }`}
          >
            <span
              className="material-symbols-outlined text-[19px] leading-none select-none flex items-center justify-center"
              style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
            >
              {item.icon}
            </span>
            <span className="font-label text-[9px] tracking-tight mt-1 leading-none text-center truncate max-w-full select-none">
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
