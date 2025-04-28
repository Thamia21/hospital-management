import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  sendEmailVerification,
  applyActionCode,
  verifyPasswordResetCode,
  confirmPasswordReset,
  fetchSignInMethodsForEmail,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
  serverTimestamp
} from 'firebase/firestore';
// DEPRECATED: Auth is now handled by backend REST API.

// Helper function to handle Firebase auth errors
const handleAuthError = (error) => {
  let message = 'An error occurred';
  switch (error.code) {
    case 'auth/operation-not-allowed':
      message = 'Email/Password sign-in is not enabled. Please contact the administrator.';
      break;
    case 'auth/email-already-in-use':
      message = 'This email is already registered. Please try logging in instead.';
      break;
    case 'auth/invalid-email':
      message = 'Invalid email address.';
      break;
    case 'auth/weak-password':
      message = 'Password should be at least 6 characters.';
      break;
    case 'auth/user-disabled':
      message = 'This account has been disabled.';
      break;
    case 'auth/user-not-found':
      message = 'No account found with this email.';
      break;
    case 'auth/wrong-password':
      message = 'Invalid password.';
      break;
    case 'auth/too-many-requests':
      message = 'Too many failed attempts. Please try again later.';
      break;
    case 'auth/network-request-failed':
      message = 'Network error. Please check your internet connection.';
      break;
    default:
      message = error.message;
  }
  return new Error(message);
};

// Check if email exists
export const checkEmailExists = async (email) => {
  try {
    const methods = await fetchSignInMethodsForEmail(auth, email);
    return methods.length > 0;
  } catch (error) {
    console.error('Error checking email:', error);
    throw handleAuthError(error);
  }
};

// Sign Up
export const registerUser = async (username, password, role, userData) => {
  try {
    // Create authentication account
    let authMethod;
    if (userData.registrationType === 'email') {
      authMethod = createUserWithEmailAndPassword(auth, username, password);
    } else {
      // For phone and ID registration, create a custom email
      const customEmail = `${username}@${userData.registrationType}.hospital.system`;
      authMethod = createUserWithEmailAndPassword(auth, customEmail, password);
    }

    const userCredential = await authMethod;
    const user = userCredential.user;

    // Create user profile in Firestore
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, {
      ...userData,
      role,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: 'active'
    });

    return user;
  } catch (error) {
    console.error('Error in registerUser:', error);
    throw error;
  }
};

// Sign In
export const loginUser = async (identifier, password) => {
  try {
    let email;
    // Check if the identifier is an email
    if (identifier.includes('@')) {
      email = identifier;
    } else {
      // For phone and ID login, construct the custom email
      const userDoc = await getDocs(
        query(
          collection(db, 'users'),
          where(identifier.length === 10 ? 'phoneNumber' : 'idNumber', '==', identifier)
        )
      );
      
      if (userDoc.empty) {
        throw new Error('User not found');
      }
      
      const userData = userDoc.docs[0].data();
      email = `${identifier}@${userData.registrationType}.hospital.system`;
    }

    // Authenticate the user
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Get additional user data from Firestore
    const userDocRef = doc(db, 'users', userCredential.user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      // Create user document if it doesn't exist (first-time login)
      const defaultRole = email === 'nurse@hospital.com' ? 'NURSE' :
                         email === 'doctor@hospital.com' ? 'DOCTOR' :
                         email === 'admin@hospital.com' ? 'ADMIN' : 'PATIENT';
      
      await setDoc(userDocRef, {
        email: email,
        role: defaultRole,
        createdAt: serverTimestamp(),
      });
      
      return {
        ...userCredential.user,
        role: defaultRole
      };
    }
    
    const userData = userDoc.data();
    return {
      ...userCredential.user,
      ...userData
    };
  } catch (error) {
    console.error('Error in loginUser:', error);
    throw handleAuthError(error);
  }
};

// Sign Out
export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error in logoutUser:', error);
    throw handleAuthError(error);
  }
};

// Password Reset
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error('Error in resetPassword:', error);
    throw handleAuthError(error);
  }
};

// Get Current User
export const getCurrentUser = () => {
  return auth.currentUser;
};
