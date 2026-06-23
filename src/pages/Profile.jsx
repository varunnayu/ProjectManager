import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  RiUser3Line,
  RiMailLine,
  RiShieldUserLine,
  RiLogoutBoxRLine,
  RiCalendarCheckLine,
  RiAwardLine,
  RiCameraLensLine,
  RiKey2Line,
} from "react-icons/ri";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { AuthService } from "../services/authService";
import { ResourceService } from "../services/resourceService";

export default function Profile() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Editable fields state
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");

  // Sync state with user data
  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || "");
      setEmail(user.email || "");
    }
  }, [user]);

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

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      addToast({ message: "Image must be under 2MB", type: "warning" });
      return;
    }

    try {
      setLoading(true);
      const photoURL = await ResourceService.uploadAvatar(file, user.uid);
      await AuthService.updateUserProfile(user, { photoURL });
      addToast({ message: "Profile picture updated successfully!", type: "success" });
      // Note: useAuth will react automatically to changes in standard auth flows
      // if not, page reload or a manual state update might be needed, but Firebase
      // handles standard object updates gracefully in most hooks.
    } catch (err) {
      console.error(err);
      addToast({ message: "Failed to upload profile picture.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    if (saving) return;
    
    setSaving(true);
    let success = true;

    try {
      // 1. Update Profile (Display Name)
      if (displayName !== user.displayName) {
        await AuthService.updateUserProfile(user, { displayName });
      }

      // 2. Update Email
      if (email !== user.email) {
        await AuthService.updateUserEmailAddress(user, email);
      }
      
      addToast({ message: "Profile updated successfully!", type: "success" });
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      success = false;
      if (err.code === "auth/requires-recent-login") {
        addToast({ message: "Please log out and log back in to change your email address.", type: "error" });
      } else if (err.code === "auth/email-already-in-use") {
        addToast({ message: "That email is already in use by another account.", type: "error" });
      } else {
        addToast({ message: err.message || "Failed to update profile.", type: "error" });
      }
    } finally {
      setSaving(false);
      // Reset if failed
      if (!success && user) {
        setDisplayName(user.displayName || "");
        setEmail(user.email || "");
      }
    }
  };

  const handlePasswordReset = async () => {
    try {
      await AuthService.resetPassword(user.email);
      addToast({ message: `Password reset email sent to ${user.email}`, type: "success" });
    } catch (err) {
      console.error(err);
      addToast({ message: "Failed to send password reset email.", type: "error" });
    }
  };

  // UI helpers
  const currentName = user?.displayName || "User";
  const currentEmail = user?.email || "";
  const firstLetter = currentName.charAt(0).toUpperCase();
  const photoURL = user?.photoURL;

  const plan = "Free Tier";
  const provider = user?.providerData?.[0]?.providerId === "google.com" ? "Google Account" : "Password Authenticated";
  
  // Registration date fallback (creationTime from metadata)
  let memberSince = "Recently";
  if (user?.metadata?.creationTime) {
    memberSince = new Date(user.metadata.creationTime).toLocaleDateString(undefined, {
      year: "numeric", month: "long", day: "numeric"
    });
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-10">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title text-3xl font-extrabold tracking-tight">Profile Settings</h1>
        <p className="page-subtitle text-sm text-gray-400">
          Manage your personal account settings, authentication details, and SaaS tier.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="glass-card p-6 sm:p-8 flex flex-col items-center text-center space-y-8"
      >
        {/* Avatar Section */}
        <div className="relative">
          <div 
            className="h-28 w-28 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-5xl font-extrabold text-white shadow-xl shadow-indigo-500/20 overflow-hidden border-4 border-gray-900 relative"
          >
            {photoURL ? (
              <img src={photoURL} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              firstLetter
            )}
          </div>
          
          <div className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-indigo-600 border-2 border-gray-950 flex items-center justify-center" title="Verified Member">
            <RiShieldUserLine className="text-white text-base" />
          </div>
        </div>

        {/* User name headings */}
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-white leading-none">{currentName}</h2>
          <span className="text-xs text-indigo-400 font-semibold">{plan}</span>
        </div>

        {/* Editable Form / Readonly View */}
        <div className="w-full text-left border-t border-gray-900 pt-6">
          {!isEditing ? (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <RiUser3Line className="text-indigo-400" />
                    Display Name
                  </span>
                  <div className="text-sm font-semibold text-white bg-white/5 border border-gray-800 px-4 py-2.5 rounded-lg truncate">
                    {displayName || "Not set"}
                  </div>
                </div>

                <div>
                  <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <RiMailLine className="text-indigo-400" />
                    Email Address
                  </span>
                  <div className="text-sm font-semibold text-white bg-white/5 border border-gray-800 px-4 py-2.5 rounded-lg truncate">
                    {email || "Not set"}
                  </div>
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="btn btn-secondary border-indigo-500/20 text-indigo-400 hover:bg-indigo-600 hover:text-white px-6 transition-colors"
                >
                  Edit Profile
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSaveChanges} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <RiUser3Line className="text-indigo-400" />
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="input"
                    placeholder="Enter your name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <RiMailLine className="text-indigo-400" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input"
                    placeholder="your.email@example.com"
                    required
                    disabled={provider === "Google Account"} 
                  />
                  {provider === "Google Account" && (
                     <p className="text-[10px] text-gray-500 mt-1">Google account emails cannot be changed here.</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setDisplayName(user?.displayName || "");
                    setEmail(user?.email || "");
                  }}
                  className="btn btn-secondary px-6"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-primary px-6"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Read-only details list */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 text-left border-y border-gray-900 py-6">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-950/20 border border-gray-900/40">
            <RiAwardLine className="text-emerald-400 text-lg flex-shrink-0" />
            <div>
              <span className="block text-[9px] uppercase tracking-wider text-gray-500 font-bold">Workspace Tier</span>
              <span className="text-xs font-semibold text-gray-200">{plan}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-950/20 border border-gray-900/40">
            <RiCalendarCheckLine className="text-blue-400 text-lg flex-shrink-0" />
            <div>
              <span className="block text-[9px] uppercase tracking-wider text-gray-500 font-bold">Registration Date</span>
              <span className="text-xs font-semibold text-gray-200">{memberSince}</span>
            </div>
          </div>
        </div>

        {/* Security & Danger Zone */}
        <div className="w-full space-y-4 text-left">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Account Security</h3>
          
          <div className="flex flex-col sm:flex-row gap-4">
            {provider !== "Google Account" && (
              <div className="flex-1 bg-gray-950/20 border border-gray-900 p-4 rounded-xl flex items-center justify-between gap-4">
                <div>
                  <span className="block text-[11px] font-bold text-gray-300">Password Reset</span>
                  <span className="text-[10px] text-gray-500">Send a recovery link to your email.</span>
                </div>
                <button
                  type="button"
                  onClick={handlePasswordReset}
                  className="btn btn-secondary border-gray-700 hover:bg-gray-800 text-xs px-4 flex items-center gap-1.5 shrink-0"
                >
                  <RiKey2Line />
                  Send Link
                </button>
              </div>
            )}

            <div className="flex-1 bg-gray-950/20 border border-rose-900/30 p-4 rounded-xl flex items-center justify-between gap-4">
              <div>
                <span className="block text-[11px] font-bold text-rose-300">Sign Out</span>
                <span className="text-[10px] text-gray-500">End your current active session.</span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                disabled={loading}
                className="btn btn-secondary border-rose-500/20 text-rose-400 hover:bg-rose-600 hover:text-white text-xs px-4 flex items-center gap-1.5 shrink-0"
              >
                <RiLogoutBoxRLine />
                Log Out
              </button>
            </div>
          </div>
        </div>

      </motion.div>
    </div>
  );
}
