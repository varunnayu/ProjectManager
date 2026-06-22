import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import { auth } from "../firebase/config";

const googleProvider = new GoogleAuthProvider();

/**
 * AuthService — Firebase Authentication helpers.
 */
export const AuthService = {
  /**
   * Register a new user with email/password and optional display name.
   * @param {string} email
   * @param {string} password
   * @param {string} [displayName]
   */
  async register(email, password, displayName) {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) {
      await updateProfile(credential.user, { displayName });
    }
    return credential;
  },

  /**
   * Sign in with email and password.
   * @param {string} email
   * @param {string} password
   */
  async login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  },

  /**
   * Sign in with Google OAuth popup.
   */
  async loginWithGoogle() {
    return signInWithPopup(auth, googleProvider);
  },

  /**
   * Sign out the current user.
   */
  async logout() {
    return signOut(auth);
  },

  /**
   * Send a password reset email.
   * @param {string} email
   */
  async resetPassword(email) {
    return sendPasswordResetEmail(auth, email);
  },
};
