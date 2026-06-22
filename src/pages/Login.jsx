import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { RiMailLine, RiLockPasswordLine, RiGoogleFill, RiRocketLine } from "react-icons/ri";
import { AuthService } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Login() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // If already logged in, redirect to home
  useEffect(() => {
    if (user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    try {
      setLoading(true);
      setError(null);
      
      // Attempt login
      await AuthService.login(email.trim(), password);
      addToast({ message: "Welcome back!", type: "success" });
      navigate("/");
    } catch (err) {
      console.error(err);
      // Firebase auth error check
      if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        setError("Invalid email address or password.");
      } else {
        setError(err.message || "An authentication error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      await AuthService.loginWithGoogle();
      addToast({ message: "Signed in with Google.", type: "success" });
      navigate("/");
    } catch (err) {
      console.error(err);
      setError("Google Sign-in was cancelled or encountered an error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[var(--color-bg-primary)]">
      {/* Background design mesh */}
      <div className="gradient-mesh" aria-hidden="true" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-md z-10 glass-card p-8 space-y-6"
      >
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto h-12 w-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <RiRocketLine className="text-white text-2xl" />
          </div>
          <h1 className="text-2xl font-extrabold text-white font-display">ProjectVault AI</h1>
          <p className="text-xs text-gray-400">Sign in to access your dashboard workspace</p>
        </div>

        {/* Validation Error Alert */}
        {error && (
          <div className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs font-semibold text-rose-400">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="topbar-search w-full py-2.5 px-3" style={{ background: "rgba(0,0,0,0.2)" }}>
              <RiMailLine className="text-gray-500" />
              <input
                type="email"
                required
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent outline-none border-none text-sm text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="topbar-search w-full py-2.5 px-3" style={{ background: "rgba(0,0,0,0.2)" }}>
              <RiLockPasswordLine className="text-gray-500" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent outline-none border-none text-sm text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full py-2.5 text-sm flex items-center justify-center gap-1.5"
          >
            {loading ? <div className="spinner border-2" style={{ width: "16px", height: "16px" }} /> : "Sign In"}
          </button>
        </form>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-gray-800"></div>
          <span className="flex-shrink mx-4 text-[10px] text-gray-500 font-bold uppercase tracking-widest">Or continue with</span>
          <div className="flex-grow border-t border-gray-800"></div>
        </div>

        {/* Google OAuth Trigger */}
        <button
          onClick={handleGoogleLogin}
          type="button"
          disabled={loading}
          className="btn btn-secondary w-full py-2.5 text-sm flex items-center justify-center gap-2"
        >
          <RiGoogleFill className="text-base text-gray-300" />
          Google Workspace
        </button>

        {/* Redirect toggle */}
        <p className="text-center text-xs text-gray-500">
          Don't have an account?{" "}
          <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold underline">
            Register workspace
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
