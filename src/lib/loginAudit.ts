import { User } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from './firebase';

export interface UserLoginAudit {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  providerId: string;
  isAnonymous: boolean;
  lastLoginAt: number;
  firstLoginAt: number;
  loginCount: number;
  userAgent: string;
  updatedAt: number;
}

export const ADMIN_EMAIL = 'beatzapp.team@gmail.com';

/**
 * Checks if the given email is the authorized admin email.
 */
export function isAuthorizedAdmin(email?: string | null): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();
}

/**
 * Records an authorized audit entry whenever any user logs into the app.
 * Saved to /admin_user_logins/{userId}, which is strictly protected by Firestore
 * security rules so only beatzapp.team@gmail.com can read or list the records.
 */
export async function recordUserLogin(user: User): Promise<void> {
  if (!user || !user.uid) return;

  try {
    const userDocRef = doc(db, 'admin_user_logins', user.uid);
    const existingSnap = await getDoc(userDocRef).catch(() => null);

    const now = Date.now();
    let firstLoginAt = now;
    let loginCount = 1;

    if (existingSnap && existingSnap.exists()) {
      const data = existingSnap.data();
      firstLoginAt = typeof data.firstLoginAt === 'number' ? data.firstLoginAt : now;
      loginCount = typeof data.loginCount === 'number' ? data.loginCount + 1 : 2;
    } else if (user.metadata?.creationTime) {
      const createdMs = new Date(user.metadata.creationTime).getTime();
      if (!isNaN(createdMs)) firstLoginAt = createdMs;
    }

    const providerId = user.providerData?.[0]?.providerId || (user.isAnonymous ? 'anonymous' : 'password');
    const email = user.email || (user.isAnonymous ? 'Guest (Anonymous)' : 'No Email Provided');
    const displayName = user.displayName || (user.isAnonymous ? 'Guest Listener' : email.split('@')[0] || 'User');
    const photoURL = user.photoURL || '';
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 400) : 'Web App';

    const loginRecord: UserLoginAudit = {
      uid: user.uid,
      email,
      displayName,
      photoURL,
      providerId,
      isAnonymous: !!user.isAnonymous,
      lastLoginAt: now,
      firstLoginAt,
      loginCount,
      userAgent,
      updatedAt: now,
    };

    await setDoc(userDocRef, loginRecord, { merge: true });
  } catch (err) {
    // Non-blocking catch to ensure app flow is never interrupted
    console.info('Audit logging note:', err);
  }
}

/**
 * Retrieves all login information records.
 * STRICTLY readable ONLY by beatzapp.team@gmail.com.
 * Firestore security rules reject any other user with permission-denied.
 */
export async function fetchAllUserLogins(): Promise<UserLoginAudit[]> {
  try {
    const loginsRef = collection(db, 'admin_user_logins');
    const q = query(loginsRef, orderBy('lastLoginAt', 'desc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((d) => {
      const data = d.data();
      return {
        uid: data.uid || d.id,
        email: data.email || 'Unknown',
        displayName: data.displayName || 'User',
        photoURL: data.photoURL || '',
        providerId: data.providerId || 'password',
        isAnonymous: !!data.isAnonymous,
        lastLoginAt: data.lastLoginAt || Date.now(),
        firstLoginAt: data.firstLoginAt || Date.now(),
        loginCount: data.loginCount || 1,
        userAgent: data.userAgent || '',
        updatedAt: data.updatedAt || Date.now(),
      } as UserLoginAudit;
    });
  } catch (err) {
    console.error('Failed to fetch user logins (Access denied for non-admin):', err);
    throw err;
  }
}
