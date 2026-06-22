import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { RiMailLine, RiLockPasswordLine, RiUser3Line, RiRocketLine } from "react-icons/ri";
import { AuthService } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Register() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // If already logged in, redirect to home
  useEffect(() => {
    if (user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);

    // Basic Validation
    if (!displayName.trim() || !email.trim() || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      
      // Attempt registration
      await AuthService.register(email.trim(), password, displayName.trim());
      addToast({ message: "Account created successfully! Welcome to ProjectVault.", type: "success" });
      navigate("/");
    } catch (err) {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        setError("This email address is already registered.");
      } else if (err.code === "auth/invalid-email") {
        setError("Invalid email address format.");
      } else {
        setError(err.message || "Failed to register account.");
      }
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
          <h1 className="text-2xl font-extrabold text-white font-display">Create Account</h1>
          <p className="text-xs text-gray-400">Launch your premium AI-assisted project vault</p>
        </div>

        {/* Validation Error Alert */}
        {error && (
          <div className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs font-semibold text-rose-400">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              Full Name
            </label>
            <div className="topbar-search w-full py-2.5 px-3" style={{ background: "rgba(0,0,0,0.2)" }}>
              <RiUser3Line className="text-gray-500" />
              <input
                type="text"
                required
                placeholder="Varun K T"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-transparent outline-none border-none text-sm text-white"
              />
            </div>
          </div>

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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                Confirm Password
              </label>
              <div className="topbar-search w-full py-2.5 px-3" style={{ background: "rgba(0,0,0,0.2)" }}>
                <RiLockPasswordLine className="text-gray-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-transparent outline-none border-none text-sm text-white"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full py-2.5 text-sm flex items-center justify-center gap-1.5"
          >
            {loading ? <div className="spinner border-2" style={{ width: "16px", height: "16px" }} /> : "Register Workspace"}
          </button>
        </form>

        {/* Redirect toggle */}
        <p className="text-center text-xs text-gray-500">
          Already have an account?{" "}
          <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold underline">
            Login here
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
