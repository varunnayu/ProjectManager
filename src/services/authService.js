import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
  updateEmail,
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase/config";

const googleProvider = new GoogleAuthProvider();

/**
 * AuthService — Firebase Authentication helpers.
 */
export const AuthService = {
  /**
   * Register a new user with email/password and store their info in Firestore.
   */
  async register(email, password, displayName) {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    const user = credential.user;

    if (displayName) {
      await updateProfile(user, { displayName });
    }

    // Store user data in Firestore
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: user.email,
      displayName: displayName || user.email.split("@")[0],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      photoURL: user.photoURL || null,
    });

    return credential;
  },

  /**
   * Sign in with email and password.
   */
  async login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  },

  /**
   * Sign in with Google OAuth popup and store info if it's a new user.
   */
  async loginWithGoogle() {
    const credential = await signInWithPopup(auth, googleProvider);
    const user = credential.user;

    // Check if user exists in Firestore
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      // Create new user profile in Firestore
      await setDoc(userDocRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email.split("@")[0],
        photoURL: user.photoURL || null,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
      });
    } else {
      // Update last login
      await setDoc(userDocRef, { lastLoginAt: serverTimestamp() }, { merge: true });
    }

    return credential;
  },

  /**
   * Sign out the current user.
   */
  async logout() {
    return signOut(auth);
  },

  /**
   * Send a password reset email.
   */
  async resetPassword(email) {
    return sendPasswordResetEmail(auth, email);
  },

  /**
   * Update User Profile (displayName, photoURL)
   */
  async updateUserProfile(user, { displayName, photoURL }) {
    const updates = {};
    if (displayName !== undefined) updates.displayName = displayName;
    if (photoURL !== undefined) updates.photoURL = photoURL;
    
    // 1. Update Firebase Auth Profile
    await updateProfile(user, updates);
    
    // 2. Update Firestore User Document
    const userDocRef = doc(db, "users", user.uid);
    await setDoc(userDocRef, { ...updates, updatedAt: serverTimestamp() }, { merge: true });
    
    return true;
  },

  /**
   * Update User Email
   */
  async updateUserEmailAddress(user, newEmail) {
    // 1. Update Firebase Auth Email
    await updateEmail(user, newEmail);
    
    // 2. Update Firestore User Document
    const userDocRef = doc(db, "users", user.uid);
    await setDoc(userDocRef, { email: newEmail, updatedAt: serverTimestamp() }, { merge: true });
    
    return true;
  },
};
