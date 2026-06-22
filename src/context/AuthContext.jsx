import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/config";

/**
 * AuthContext — provides the current Firebase user and loading state
 * throughout the component tree.
 */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hasConfig =
      auth &&
      auth.app &&
      auth.app.options &&
      auth.app.options.apiKey &&
      auth.app.options.apiKey !== "YOUR_API_KEY";

    if (!hasConfig) {
      setUser({
        uid: "mock-user-123",
        displayName: "Varun K T",
        email: "varun@projectvault.ai",
      });
      setLoading(false);
      return;
    }

    try {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        setLoading(false);
      });
      return unsubscribe;
    } catch (err) {
      console.warn("Firebase Auth initialization error, running in demo mode:", err);
      setUser({
        uid: "mock-user-123",
        displayName: "Varun K T",
        email: "varun@projectvault.ai",
      });
      setLoading(false);
    }
  }, []);

  const value = { user, loading };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

/**
 * useAuth — consume AuthContext anywhere in the tree.
 * @returns {{ user: import("firebase/auth").User | null, loading: boolean }}
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return context;
}

export default AuthContext;
