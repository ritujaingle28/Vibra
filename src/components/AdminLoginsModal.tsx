import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { fetchAllUserLogins, UserLoginAudit, ADMIN_EMAIL } from '../lib/loginAudit';

interface AdminLoginsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserEmail?: string | null;
}

export const AdminLoginsModal: React.FC<AdminLoginsModalProps> = ({
  isOpen,
  onClose,
  currentUserEmail,
}) => {
  const [logins, setLogins] = useState<UserLoginAudit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const isAdmin = currentUserEmail?.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();

  const loadLogins = async () => {
    if (!isAdmin) {
      setError(`Access Denied: Only ${ADMIN_EMAIL} is authorized to access login audit records.`);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const records = await fetchAllUserLogins();
      setLogins(records);
    } catch (err: any) {
      console.error('Error fetching admin logins:', err);
      setError(
        err?.message?.includes('permission-denied')
          ? `Firestore Security Rules enforced: Access restricted strictly to ${ADMIN_EMAIL}.`
          : 'Failed to load user login records. Please check database connection.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadLogins();
    }
  }, [isOpen, currentUserEmail]);

  if (!isOpen) return null;

  const filteredLogins = logins.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      item.uid.toLowerCase().includes(q) ||
      item.email.toLowerCase().includes(q) ||
      item.displayName.toLowerCase().includes(q) ||
      item.providerId.toLowerCase().includes(q)
    );
  });

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logins, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `beatz_user_logins_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-surface-container-high/95 border border-primary-container/40 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-pale-cream"
        >
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between bg-surface/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary-container/20 border border-primary-container/40 flex items-center justify-center text-primary-container">
                <span className="material-symbols-outlined text-2xl">security</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-xl sm:text-2xl text-pale-cream">Admin Login Database</h2>
                  <span className="text-[10px] font-mono uppercase bg-primary-container/20 text-primary-container border border-primary-container/30 px-2 py-0.5 rounded-full font-bold">
                    Confidential
                  </span>
                </div>
                <p className="text-xs text-muted-grey font-body">
                  Authorized Admin Account: <span className="text-primary-container font-mono">{ADMIN_EMAIL}</span>
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-muted-grey hover:text-pale-cream transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>

          {/* Subheader Toolbar */}
          <div className="p-4 sm:p-6 border-b border-white/5 bg-surface-container/40 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-grey text-lg">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by User ID, Email, Name, or Provider..."
                className="w-full bg-surface-container-lowest/80 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-pale-cream placeholder:text-muted-grey focus:outline-none focus:border-primary-container"
              />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={loadLogins}
                disabled={loading}
                className="px-3 py-2 bg-surface-container hover:bg-surface-container-high border border-white/10 rounded-xl text-xs font-label uppercase tracking-wider font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Reload live logins"
              >
                <span className={`material-symbols-outlined text-sm ${loading ? 'animate-spin' : ''}`}>
                  refresh
                </span>
                <span>Refresh</span>
              </button>

              <button
                onClick={handleExportJSON}
                disabled={logins.length === 0}
                className="px-3.5 py-2 bg-primary-container text-on-primary-container rounded-xl text-xs font-label uppercase tracking-wider font-bold flex items-center gap-1.5 hover:opacity-95 transition-opacity cursor-pointer shadow-md disabled:opacity-50"
                title="Download complete login audit database"
              >
                <span className="material-symbols-outlined text-sm">download</span>
                <span>Export JSON</span>
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {error ? (
              <div className="p-6 rounded-2xl bg-red-950/40 border border-red-500/30 text-center">
                <span className="material-symbols-outlined text-red-400 text-4xl mb-2">lock</span>
                <h3 className="font-display text-lg text-red-200 mb-1">Access Restricted</h3>
                <p className="text-xs text-red-300/80 font-body max-w-md mx-auto">{error}</p>
              </div>
            ) : loading ? (
              <div className="py-16 flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-2 border-primary-container border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs font-mono uppercase tracking-widest text-muted-grey">
                  Loading secure login records...
                </span>
              </div>
            ) : filteredLogins.length === 0 ? (
              <div className="py-16 text-center text-muted-grey">
                <span className="material-symbols-outlined text-4xl mb-2 opacity-40">badge</span>
                <p className="font-display text-base">No user login records match your filter</p>
                <p className="text-xs mt-1">Users will appear here in real time as they log into Beatz.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-muted-grey px-1 font-mono">
                  <span>Total Users Logged In: <strong className="text-primary-container">{logins.length}</strong></span>
                  <span>Filtered: {filteredLogins.length}</span>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {filteredLogins.map((record) => {
                    const isGoogle = record.providerId.includes('google');
                    const isAnon = record.isAnonymous;
                    const lastLoginFormatted = new Date(record.lastLoginAt).toLocaleString();
                    const firstLoginFormatted = new Date(record.firstLoginAt).toLocaleDateString();

                    return (
                      <div
                        key={record.uid}
                        className="p-4 rounded-2xl bg-surface-container/60 hover:bg-surface-container border border-white/5 hover:border-primary-container/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div className="flex items-start gap-3.5 min-w-0">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-container-high border border-white/10 shrink-0 flex items-center justify-center">
                            {record.photoURL ? (
                              <img src={record.photoURL} alt={record.displayName} className="w-full h-full object-cover" />
                            ) : (
                              <span className="material-symbols-outlined text-muted-grey text-xl">person</span>
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <h4 className="font-display text-sm sm:text-base text-pale-cream truncate">
                                {record.displayName || 'Beatz User'}
                              </h4>
                              <span
                                className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full font-bold border ${
                                  isGoogle
                                    ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                                    : isAnon
                                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                }`}
                              >
                                {isGoogle ? 'Google Auth' : isAnon ? 'Guest Explorer' : 'Email & Password'}
                              </span>
                              <span className="text-[10px] font-mono bg-white/5 text-muted-grey px-2 py-0.5 rounded-full">
                                {record.loginCount} {record.loginCount === 1 ? 'Login' : 'Logins'}
                              </span>
                            </div>

                            <p className="text-xs font-mono text-primary-container/90 truncate mb-1">
                              {record.email}
                            </p>

                            <div className="flex items-center gap-1.5 text-[11px] font-mono text-muted-grey">
                              <span className="truncate max-w-[200px] sm:max-w-xs">UID: {record.uid}</span>
                              <button
                                onClick={() => handleCopy(record.uid, record.uid)}
                                className="text-muted-grey hover:text-pale-cream transition-colors cursor-pointer"
                                title="Copy User ID"
                              >
                                <span className="material-symbols-outlined text-xs">
                                  {copiedId === record.uid ? 'check' : 'content_copy'}
                                </span>
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 border-white/5 pt-2 md:pt-0 text-[11px] font-mono text-muted-grey shrink-0 gap-1">
                          <span className="text-right">
                            Last Login: <strong className="text-pale-cream">{lastLoginFormatted}</strong>
                          </span>
                          <span className="text-white/40 text-[10px]">
                            Joined: {firstLoginFormatted}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Footer note */}
          <div className="p-4 border-t border-white/10 bg-surface/80 flex items-center justify-between text-xs text-muted-grey">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-xs text-emerald-400">lock</span>
              Protected by Firestore Security Rules (Only {ADMIN_EMAIL})
            </span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-surface-container hover:bg-surface-container-high rounded-full font-label text-xs uppercase font-bold tracking-wider cursor-pointer"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
