import React, { useState } from 'react';
import { motion } from 'motion/react';
import { auth } from '../lib/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  signInAnonymously
} from 'firebase/auth';

export const AuthTab = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);

  const getFriendlyErrorMessage = (errCode: string, isSignUpMode: boolean) => {
    switch (errCode) {
      case 'auth/admin-restricted-operation':
        return 'Anonymous sign-in is disabled in your Firebase project console. Please enable Anonymous auth in Firebase Authentication settings, or sign in with Email / Google.';
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
      case 'auth/cancelled-popup-request':
        return 'Sign-in popup was closed before completing.';
      case 'auth/popup-blocked':
        return 'Popups are blocked by your browser. Please allow popups or use email sign-in.';
      case 'auth/network-request-failed':
        return 'Network connection error. Please check your internet connection.';
      default:
        return 'Failed to authenticate. Please check your credentials and try again.';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
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
      console.error('Auth error:', err);
      const code = err?.code || '';
      setError(getFriendlyErrorMessage(code, isSignUp));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setSocialLoading('google');
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      const code = err?.code || '';
      setError(getFriendlyErrorMessage(code, false));
    } finally {
      setSocialLoading(null);
    }
  };

  const handleGuestSignIn = async () => {
    setError('');
    setSocialLoading('guest');
    try {
      const userCredential = await signInAnonymously(auth);
      await updateProfile(userCredential.user, { displayName: 'Guest Explorer' });
    } catch (err: any) {
      console.error('Guest sign-in error:', err);
      const code = err?.code || '';
      setError(getFriendlyErrorMessage(code, false));
    } finally {
      setSocialLoading(null);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-12">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-surface-container-high/60 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 md:p-12 w-full max-w-md shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-container via-pastel-mint to-tertiary-container"></div>
        <h2 className="font-display text-4xl text-pale-cream mb-2 text-center drop-shadow-sm">
          {isSignUp ? 'Join Beatz' : 'Welcome Back'}
        </h2>
        <p className="font-body text-muted-grey text-center mb-6 tracking-wider text-base md:text-lg">
          {isSignUp ? 'Create an account to save your vibes.' : 'Sign in to access your library.'}
        </p>

        {/* Quick Sign In Options */}
        <div className="flex flex-col gap-3 mb-6">
          <button
            type="button"
            id="google-signin-btn"
            disabled={loading || socialLoading !== null}
            onClick={handleGoogleSignIn}
            className="flex items-center justify-center gap-3 bg-white/10 hover:bg-white/15 active:scale-[0.98] border border-white/15 text-pale-cream rounded-full py-3.5 px-6 font-label text-sm tracking-wider transition-all cursor-pointer disabled:opacity-50"
          >
            {socialLoading === 'google' ? (
              <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z" />
                <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z" />
                <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12 0 12s.7 2.3 1.9 4.7l3.7-2.9z" />
                <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z" />
              </svg>
            )}
            <span>{socialLoading === 'google' ? 'Connecting...' : 'Continue with Google'}</span>
          </button>

          <button
            type="button"
            id="guest-signin-btn"
            disabled={loading || socialLoading !== null}
            onClick={handleGuestSignIn}
            className="flex items-center justify-center gap-2 bg-surface-container/60 hover:bg-surface-container/90 active:scale-[0.98] border border-white/5 text-muted-grey hover:text-pale-cream rounded-full py-3 px-6 font-label text-xs tracking-widest uppercase transition-all cursor-pointer disabled:opacity-50"
          >
            {socialLoading === 'guest' ? (
              <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
            ) : (
              <span className="material-symbols-outlined text-base">person</span>
            )}
            <span>{socialLoading === 'guest' ? 'Entering...' : 'Continue as Guest'}</span>
          </button>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-white/10"></div>
          <span className="font-label text-xs text-muted-grey tracking-widest uppercase">or email</span>
          <div className="flex-1 h-px bg-white/10"></div>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-error-container bg-error-container/10 border border-error-container/20 p-3.5 rounded-2xl mb-6 font-body text-sm text-center leading-relaxed"
          >
            {error}
          </motion.div>
        )}

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {isSignUp && (
            <div className="flex flex-col">
              <label className="font-label text-xs text-pale-cream mb-1.5 tracking-widest uppercase">Username</label>
              <input 
                type="text" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                className="bg-surface-container/80 text-pale-cream rounded-full px-5 py-3 border border-white/5 focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-all font-body text-base" 
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
              className="bg-surface-container/80 text-pale-cream rounded-full px-5 py-3 border border-white/5 focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-all font-body text-base" 
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
              className="bg-surface-container/80 text-pale-cream rounded-full px-5 py-3 border border-white/5 focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-all font-body text-base" 
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

        <div className="mt-6 text-center">
          <p className="font-body text-sm md:text-base text-muted-grey tracking-wide">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button 
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
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


