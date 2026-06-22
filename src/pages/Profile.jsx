import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  RiUser3Line,
  RiMailLine,
  RiShieldUserLine,
  RiLogoutBoxRLine,
  RiCalendarCheckLine,
  RiAwardLine,
} from "react-icons/ri";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { AuthService } from "../services/authService";

export default function Profile() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setLoading(true);
      await AuthService.logout();
      addToast({ message: "Logged out successfully.", type: "success" });
      navigate("/login");
    } catch (err) {
      console.error(err);
      addToast({ message: "Failed to log out.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Safe parameters fallback
  const name = user?.displayName || "Varun K T";
  const email = user?.email || "varun@projectvault.ai";
  const firstLetter = name.charAt(0).toUpperCase();

  // Mock workspace parameters
  const plan = user?.uid === "mock-user-123" ? "Pro Plan (Demo)" : "Enterprise Suite";
  const memberSince = "June 16, 2026";
  const provider = user?.providerData?.[0]?.providerId === "google.com" ? "Google Account" : "Password Authenticated";

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title text-3xl font-extrabold tracking-tight">Your Workspace Profile</h1>
        <p className="page-subtitle text-sm text-gray-400">
          Manage your personal account settings, authentication details, and SaaS tier.
        </p>
      </div>

      {/* Main Profile Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="glass-card p-8 flex flex-col items-center text-center space-y-6"
      >
        {/* Giant Avatar Circle */}
        <div className="relative h-24 w-24 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-4xl font-extrabold text-white shadow-xl shadow-indigo-500/20">
          {firstLetter}
          <div className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-indigo-600 border-2 border-gray-950 flex items-center justify-center" title="Verified Member">
            <RiShieldUserLine className="text-white text-sm" />
          </div>
        </div>

        {/* User name & email headings */}
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-white leading-none">{name}</h2>
          <span className="text-xs text-indigo-400 font-semibold">{plan}</span>
        </div>

        {/* Details list grid */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 text-left border-y border-gray-900 py-6">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-950/20 border border-gray-900/40">
            <RiUser3Line className="text-indigo-400 text-lg flex-shrink-0" />
            <div>
              <span className="block text-[9px] uppercase tracking-wider text-gray-500 font-bold">Display Name</span>
              <span className="text-xs font-semibold text-gray-200">{name}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-950/20 border border-gray-900/40">
            <RiMailLine className="text-indigo-400 text-lg flex-shrink-0" />
            <div>
              <span className="block text-[9px] uppercase tracking-wider text-gray-500 font-bold">Email Address</span>
              <span className="text-xs font-semibold text-gray-200">{email}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-950/20 border border-gray-900/40">
            <RiAwardLine className="text-indigo-400 text-lg flex-shrink-0" />
            <div>
              <span className="block text-[9px] uppercase tracking-wider text-gray-500 font-bold">Workspace Tier</span>
              <span className="text-xs font-semibold text-gray-200">{plan}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-950/20 border border-gray-900/40">
            <RiCalendarCheckLine className="text-indigo-400 text-lg flex-shrink-0" />
            <div>
              <span className="block text-[9px] uppercase tracking-wider text-gray-500 font-bold">Registration Date</span>
              <span className="text-xs font-semibold text-gray-200">{memberSince}</span>
            </div>
          </div>
        </div>

        <div className="w-full flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-950/20 border border-gray-900 p-4 rounded-xl">
          <div className="text-left">
            <span className="block text-[9px] uppercase tracking-wider text-gray-500 font-bold">Auth Provider</span>
            <span className="text-xs font-semibold text-indigo-300">{provider}</span>
          </div>
          
          <button
            onClick={handleLogout}
            disabled={loading}
            className="btn btn-secondary border-rose-500/20 text-rose-400 hover:bg-rose-600 hover:text-white px-5 py-2 flex items-center gap-1.5 self-stretch md:self-auto justify-center"
          >
            <RiLogoutBoxRLine />
            {loading ? "Logging Out..." : "Sign Out Workspace"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
