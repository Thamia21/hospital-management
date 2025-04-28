// TODO: Migrate to use REST API endpoints.
import {
  updateProfile,
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'firebase/auth';
import { doc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';

// Security levels for different roles
export const SECURITY_LEVELS = {
  ADMIN: 4,
  DOCTOR: 3,
  NURSE: 2,
  PATIENT: 1,
  GUEST: 0,
};

// Check if user has required security level
export const hasSecurityLevel = async (userId, requiredLevel) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) return false;

    const userData = userDoc.data();
    return SECURITY_LEVELS[userData.role] >= requiredLevel;
  } catch (error) {
    console.error('Error checking security level:', error);
    return false;
  }
};

// Update user profile with security checks
export const updateUserProfile = async (userId, updates, currentPassword) => {
  try {
    const user = auth.currentUser;
    if (!user || user.uid !== userId) {
      throw new Error('Unauthorized access');
    }

    // If updating email or password, require reauthentication
    if (updates.email || updates.password) {
      if (!currentPassword) {
        throw new Error('Current password required for sensitive updates');
      }

      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      if (updates.email) {
        await updateEmail(user, updates.email);
      }

      if (updates.password) {
        await updatePassword(user, updates.password);
      }
    }

    // Update display name if provided
    if (updates.displayName) {
      await updateProfile(user, {
        displayName: updates.displayName,
      });
    }

    // Update Firestore user document
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });

    // Log security sensitive changes
    if (updates.email || updates.password) {
      await logSecurityEvent(userId, 'PROFILE_UPDATE', {
        emailUpdated: !!updates.email,
        passwordUpdated: !!updates.password,
      });
    }
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Log security events
export const logSecurityEvent = async (userId, eventType, details) => {
  try {
    await addDoc(collection(db, 'security_logs'), {
      userId,
      eventType,
      details,
      timestamp: serverTimestamp(),
      userAgent: navigator.userAgent,
      ipAddress: await fetch('https://api.ipify.org?format=json')
        .then(res => res.json())
        .then(data => data.ip),
    });
  } catch (error) {
    console.error('Error logging security event:', error);
  }
};

// Check for suspicious activity
export const checkSuspiciousActivity = async (userId) => {
  try {
    const timeWindow = new Date();
    timeWindow.setHours(timeWindow.getHours() - 1);

    const q = query(
      collection(db, 'security_logs'),
      where('userId', '==', userId),
      where('timestamp', '>=', timeWindow),
      orderBy('timestamp', 'desc')
    );

    const snapshot = await getDocs(q);
    const events = [];
    snapshot.forEach((doc) => {
      events.push(doc.data());
    });

    // Check for multiple failed login attempts
    const failedLogins = events.filter(e => e.eventType === 'LOGIN_FAILED').length;
    if (failedLogins >= 5) {
      await lockAccount(userId, 'Too many failed login attempts');
      return true;
    }

    // Check for multiple password changes
    const passwordChanges = events.filter(e => e.eventType === 'PASSWORD_CHANGED').length;
    if (passwordChanges >= 3) {
      await lockAccount(userId, 'Suspicious password change activity');
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error checking suspicious activity:', error);
    return false;
  }
};

// Lock user account
export const lockAccount = async (userId, reason) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      locked: true,
      lockedReason: reason,
      lockedAt: serverTimestamp(),
    });

    await logSecurityEvent(userId, 'ACCOUNT_LOCKED', { reason });
  } catch (error) {
    console.error('Error locking account:', error);
    throw error;
  }
};

// Unlock user account (admin only)
export const unlockAccount = async (adminId, userId) => {
  try {
    if (!await hasSecurityLevel(adminId, SECURITY_LEVELS.ADMIN)) {
      throw new Error('Unauthorized access');
    }

    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      locked: false,
      lockedReason: null,
      lockedAt: null,
      unlockedAt: serverTimestamp(),
      unlockedBy: adminId,
    });

    await logSecurityEvent(userId, 'ACCOUNT_UNLOCKED', { unlockedBy: adminId });
  } catch (error) {
    console.error('Error unlocking account:', error);
    throw error;
  }
};
