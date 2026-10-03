import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { auth } from '../lib/firebase';
import firebaseConfig from '../../firebase-applet-config.json';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updateProfile,
  signInWithPopup,
  signInWithCredential,
  GoogleAuthProvider,
  signInAnonymously
} from 'firebase/auth';

interface ErrorDetail {
  title: string;
  message: string;
  code?: string;
  actionText?: string;
  actionType?: 'copy_domain' | 'switch_email';
}

export const AuthTab = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [errorDetail, setErrorDetail] = useState<ErrorDetail | null>(null);
  const [domainCopied, setDomainCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const googleBtnContainerRef = useRef<HTMLDivElement>(null);

  // Initialize Google Identity Services (GIS) inline one-click sign in if supported
  useEffect(() => {
    const clientId = firebaseConfig.oAuthClientId;
    if (!clientId) return;

    const scriptId = 'google-identity-services-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    
    const initGis = () => {
      const g = (window as any).google;
      if (g?.accounts?.id && googleBtnContainerRef.current) {
        try {
          g.accounts.id.initialize({
            client_id: clientId,
            callback: async (response: any) => {
              if (!response?.credential) return;
              try {
                setSocialLoading('google');
                const credential = GoogleAuthProvider.credential(response.credential);
                await signInWithCredential(auth, credential);
              } catch (gisErr: any) {
                console.warn('GIS credential sign-in note:', gisErr);
                setError(getFriendlyErrorMessage(gisErr?.code || '', false, gisErr?.message));
              } finally {
                setSocialLoading(null);
              }
            }
          });

          googleBtnContainerRef.current.innerHTML = '';
          g.accounts.id.renderButton(googleBtnContainerRef.current, {
            theme: 'filled_black',
            size: 'large',
            shape: 'pill',
            text: isSignUp ? 'signup_with' : 'signin_with',
            width: 280,
          });
        } catch (e) {
          console.info('GIS init note:', e);
        }
      }
    };

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initGis;
      document.body.appendChild(script);
    } else {
      initGis();
    }
  }, [isSignUp]);

  const getFriendlyErrorMessage = (errCode: string, isSignUpMode: boolean, rawMessage?: string) => {
    switch (errCode) {
      case 'auth/unauthorized-domain':
        return `Domain not authorized in Firebase: "${window.location.hostname}". Add this domain to Firebase Console > Authentication > Settings > Authorized domains.`;
      case 'auth/operation-not-allowed':
        return 'Google Sign-In is not enabled in your Firebase Console. Please enable Google in Firebase Console > Authentication > Sign-in method.';
      case 'auth/admin-restricted-operation':
        return 'Anonymous sign-in is disabled in your Firebase Console. Please enable Anonymous auth in Authentication settings, or sign in with Email / Google.';
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        return isSignUpMode 
          ? 'Invalid account details. Please check and try again.'
          : 'Account not found or incorrect password. If you are new, click "Create One" below!';
      case 'auth/email-already-in-use':
        return 'An account already exists with this email. Please switch to Sign In.';
      case 'auth/weak-password':
        return 'Password must be at least 6 characters long.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/popup-closed-by-user':
        return 'The sign-in popup was closed. Click Continue with Google to try again, or sign in below.';
      case 'auth/cancelled-popup-request':
        return 'Sign-in popup was cancelled. Click Continue with Google to retry.';
      case 'auth/popup-blocked':
        return 'Popups are blocked by your browser. Please allow popups or use email sign-in.';
      case 'auth/network-request-failed':
        return 'Network connection error. Please check your internet connection.';
      default:
        return rawMessage || 'Failed to authenticate. Please check your credentials and try again.';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setErrorDetail(null);
    setLoading(true);

    try {
      if (isSignUp) {
        if (password.length < 6) {
          setError('Password must be at least 6 characters long.');
          setLoading(false);
          return;
        }
        const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        if (username.trim()) {
          await updateProfile(userCredential.user, { displayName: username.trim() });
        }
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }
    } catch (err: any) {
      console.warn('Auth note:', err);
      const code = err?.code || '';
      setError(getFriendlyErrorMessage(code, isSignUp, err?.message));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setErrorDetail(null);
    setSocialLoading('google');

    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      provider.setCustomParameters({ 
        prompt: 'select_account' 
      });

      await signInWithPopup(auth, provider);
    } catch (err: any) {
      const code = err?.code || '';
      const message = err?.message || '';

      // Gracefully handle expected user cancellations without throwing errors
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        console.info('Google sign-in popup closed by user');
        setErrorDetail({
          title: 'Sign-In Window Closed',
          message: 'The Google sign-in window was closed. Click below to try again, or use Quick Login.',
        });
        return;
      }

      console.warn('Google sign-in notice:', code, message);

      if (code === 'auth/unauthorized-domain') {
        setErrorDetail({
          title: 'Authorized Domain Setup Required',
          message: `Firebase requires this domain to be authorized before Google Sign-In can work:`,
          code: window.location.hostname,
          actionText: domainCopied ? 'Domain Copied!' : 'Copy Domain to Add in Firebase',
          actionType: 'copy_domain'
        });
      } else if (code === 'auth/operation-not-allowed') {
        setErrorDetail({
          title: 'Google Provider Disabled in Firebase',
          message: 'Google Sign-In is disabled in your Firebase project. Go to Firebase Console > Authentication > Sign-in method and enable Google.',
          actionText: 'Use Email Sign-In',
          actionType: 'switch_email'
        });
      } else if (code === 'auth/popup-blocked') {
        setErrorDetail({
          title: 'Browser Blocked the Google Popup',
          message: 'Your browser or iframe environment blocked the popup window. Look for the popup blocker icon in your browser address bar to allow popups, or use Email / Guest sign-in below.',
        });
      } else {
        setErrorDetail({
          title: 'Google Sign-In Notice',
          message: getFriendlyErrorMessage(code, false, message),
        });
      }
    } finally {
      setSocialLoading(null);
    }
  };

  const handleGuestSignIn = async () => {
    setError('');
    setErrorDetail(null);
    setSocialLoading('guest');
    try {
      const userCredential = await signInAnonymously(auth);
      await updateProfile(userCredential.user, { displayName: 'Guest Explorer' });
    } catch (err: any) {
      console.warn('Guest sign-in note:', err);
      const code = err?.code || '';
      setError(getFriendlyErrorMessage(code, false, err?.message));
    } finally {
      setSocialLoading(null);
    }
  };

  const handleQuickDemoLogin = async (demoEmail: string, demoPass: string, demoName: string) => {
    setError('');
    setErrorDetail(null);
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, demoEmail, demoPass);
    } catch (err: any) {
      if (err?.code === 'auth/user-not-found' || err?.code === 'auth/invalid-credential') {
        // Auto-create demo user if it doesn't exist yet
        try {
          const cred = await createUserWithEmailAndPassword(auth, demoEmail, demoPass);
          await updateProfile(cred.user, { displayName: demoName });
        } catch (createErr: any) {
          setError(getFriendlyErrorMessage(createErr?.code || '', true, createErr?.message));
        }
      } else {
        setError(getFriendlyErrorMessage(err?.code || '', false, err?.message));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopyDomain = () => {
    navigator.clipboard.writeText(window.location.hostname);
    setDomainCopied(true);
    setTimeout(() => setDomainCopied(false), 3000);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 py-10">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-surface-container-high/70 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 sm:p-10 w-full max-w-md shadow-2xl relative overflow-hidden text-pale-cream"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-container via-pastel-mint to-tertiary-container"></div>
        
        <h2 className="font-display text-3xl sm:text-4xl text-pale-cream mb-2 text-center drop-shadow-sm">
          {isSignUp ? 'Join Vibra' : 'Welcome Back'}
        </h2>
        <p className="font-body text-muted-grey text-center mb-6 tracking-wider text-sm sm:text-base">
          {isSignUp ? 'Create an account to save your vibes & mixtapes.' : 'Sign in to sync your library across devices.'}
        </p>

        {/* Quick Sign In Options */}
        <div className="flex flex-col items-center gap-3 mb-6 w-full">
          {/* Native Google One-Tap Button (if GIS loads) */}
          <div ref={googleBtnContainerRef} className="flex justify-center min-h-[40px] empty:hidden"></div>

          <button
            type="button"
            id="google-signin-btn"
            disabled={loading || socialLoading !== null}
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 bg-white/10 hover:bg-white/15 active:scale-[0.98] border border-white/15 text-pale-cream rounded-full py-3.5 px-6 font-label text-sm tracking-wider transition-all cursor-pointer disabled:opacity-50 shadow-md"
          >
            {socialLoading === 'google' ? (
              <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
            ) : (
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z" />
                <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z" />
                <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12 0 12s.7 2.3 1.9 4.7l3.7-2.9z" />
                <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z" />
              </svg>
            )}
            <span>{socialLoading === 'google' ? 'Connecting to Google...' : 'Continue with Google'}</span>
          </button>

          <button
            type="button"
            id="guest-signin-btn"
            disabled={loading || socialLoading !== null}
            onClick={handleGuestSignIn}
            className="w-full flex items-center justify-center gap-2 bg-surface-container/60 hover:bg-surface-container/90 active:scale-[0.98] border border-white/5 text-muted-grey hover:text-pale-cream rounded-full py-3 px-6 font-label text-xs tracking-widest uppercase transition-all cursor-pointer disabled:opacity-50"
          >
            {socialLoading === 'guest' ? (
              <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
            ) : (
              <span className="material-symbols-outlined text-base">person</span>
            )}
            <span>{socialLoading === 'guest' ? 'Entering...' : 'Continue as Guest'}</span>
          </button>
        </div>

        {/* Actionable Error Card (with Domain Copy & Direct Solutions) */}
        <AnimatePresence>
          {errorDetail && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-amber-950/40 border border-amber-500/40 rounded-2xl p-4 mb-6 text-xs text-amber-200/90 leading-relaxed shadow-lg space-y-2.5"
            >
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-amber-400 text-lg shrink-0">info</span>
                <strong className="font-semibold text-amber-100 text-sm">{errorDetail.title}</strong>
              </div>
              <p>{errorDetail.message}</p>
              
              {errorDetail.code && (
                <div className="bg-black/40 border border-amber-500/30 rounded-xl p-2.5 font-mono text-[11px] text-amber-300 break-all select-all flex items-center justify-between gap-2">
                  <span>{errorDetail.code}</span>
                  <button
                    type="button"
                    onClick={handleCopyDomain}
                    className="px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 text-[10px] font-bold uppercase transition-colors shrink-0 cursor-pointer"
                  >
                    {domainCopied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              )}

              {errorDetail.actionType === 'copy_domain' && (
                <div className="text-[11px] text-amber-300/80 pt-1 border-t border-amber-500/20 space-y-1">
                  <p><strong>To resolve in Firebase:</strong></p>
                  <ol className="list-decimal list-inside space-y-0.5 pl-1">
                    <li>Copy domain above</li>
                    <li>Open Firebase Console &gt; Authentication &gt; Settings</li>
                    <li>Under "Authorized domains", click "Add domain" and paste.</li>
                  </ol>
                  <p className="pt-1 text-pale-cream/90 font-medium">Or use 1-click Email Login below!</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {error && !errorDetail && (
          <motion.div 
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-error-container bg-error-container/10 border border-error-container/20 p-3.5 rounded-2xl mb-6 font-body text-xs sm:text-sm text-center leading-relaxed"
          >
            {error}
          </motion.div>
        )}

        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-white/10"></div>
          <span className="font-label text-xs text-muted-grey tracking-widest uppercase">or sign in with email</span>
          <div className="flex-1 h-px bg-white/10"></div>
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {isSignUp && (
            <div className="flex flex-col">
              <label className="font-label text-xs text-pale-cream mb-1.5 tracking-widest uppercase">Username</label>
              <input 
                type="text" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                className="bg-surface-container/80 text-pale-cream rounded-full px-5 py-3 border border-white/5 focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-all font-body text-sm sm:text-base placeholder:text-muted-grey/60" 
                placeholder="VibeMaster99" 
                required 
              />
            </div>
          )}
          <div className="flex flex-col">
            <label className="font-label text-xs text-pale-cream mb-1.5 tracking-widest uppercase">Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="bg-surface-container/80 text-pale-cream rounded-full px-5 py-3 border border-white/5 focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-all font-body text-sm sm:text-base placeholder:text-muted-grey/60" 
              placeholder="your@email.com" 
              required 
            />
          </div>
          <div className="flex flex-col">
            <label className="font-label text-xs text-pale-cream mb-1.5 tracking-widest uppercase">Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="bg-surface-container/80 text-pale-cream rounded-full px-5 py-3 border border-white/5 focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-all font-body text-sm sm:text-base placeholder:text-muted-grey/60" 
              placeholder="•••••••• (min. 6 characters)" 
              required 
            />
          </div>
          
          <button 
            type="submit" 
            id="auth-submit-btn"
            disabled={loading || socialLoading !== null} 
            className="mt-2 disabled:opacity-50 bg-primary-container text-on-primary-container rounded-full py-3.5 font-label text-sm font-bold tracking-widest shadow-[0_4px_15px_rgba(254,214,255,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            {loading ? 'PLEASE WAIT...' : (isSignUp ? 'CREATE ACCOUNT' : 'SIGN IN')}
          </button>
        </form>

        {/* 1-Click Fast Login Shortcuts */}
        <div className="mt-5 pt-4 border-t border-white/10 flex flex-col gap-2">
          <span className="text-[11px] font-mono text-muted-grey text-center uppercase tracking-wider">
            Quick Instant Login
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('beatzapp.team@gmail.com', 'AdminPass2026!', 'Vibra Admin')}
              disabled={loading}
              className="px-3 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high border border-primary-container/30 text-primary-container text-[11px] font-mono font-bold tracking-wide truncate transition-all cursor-pointer disabled:opacity-50"
              title="Sign in as beatzapp.team@gmail.com"
            >
              👑 Admin Account
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('listener@vibra.app', 'VibraPass2026!', 'Swiftie Listener')}
              disabled={loading}
              className="px-3 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high border border-white/10 text-pale-cream text-[11px] font-mono font-bold tracking-wide truncate transition-all cursor-pointer disabled:opacity-50"
              title="Sign in as Demo Listener"
            >
              🎧 Demo Listener
            </button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="font-body text-sm md:text-base text-muted-grey tracking-wide">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button 
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
                setErrorDetail(null);
              }} 
              className="text-primary-container hover:text-pale-cream font-bold underline underline-offset-4 ml-1 transition-colors cursor-pointer"
            >
              {isSignUp ? 'Sign In' : 'Create One'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
