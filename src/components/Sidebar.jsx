import { useState, useEffect } from "react";
import { NavLink, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import {
  RiDashboardLine,
  RiFolderLine,
  RiTaskLine,
  RiFileTextLine,
  RiBookmarkLine,
  RiHistoryLine,
  RiSparklingLine,
  RiSettings3Line,
  RiRocketLine,
  RiCloseLine,
  RiArrowDownSLine,
} from "react-icons/ri";

const NAV_ITEMS = [
  { label: "Dashboard", to: "/", icon: <RiDashboardLine />, end: true },
  { label: "Projects", to: "/projects", icon: <RiFolderLine /> },
  { label: "Tasks", to: "/tasks", icon: <RiTaskLine /> },
  { label: "Notes", to: "/notes", icon: <RiFileTextLine /> },
  { label: "Resources", to: "/resources", icon: <RiBookmarkLine /> },
  { label: "Dev Logs", to: "/logs", icon: <RiHistoryLine /> },
  { label: "AI Assistant", to: "/ai-assistant", icon: <RiSparklingLine /> },
];

const BOTTOM_ITEMS = [
  { label: "Settings", to: "/profile", icon: <RiSettings3Line /> },
];

const sidebarVariants = {
  desktop: {
    x: 0,
    opacity: 1,
    transition: { type: "none" },
  },
  mobileClosed: {
    x: "-100%",
    opacity: 1,
    transition: { type: "tween", ease: "easeInOut", duration: 0.3 },
  },
  mobileOpen: {
    x: 0,
    opacity: 1,
    transition: { type: "tween", ease: "easeInOut", duration: 0.3 },
  },
};

const navItemVariants = {
  hidden: { x: -8, opacity: 0 },
  visible: (i) => ({
    x: 0,
    opacity: 1,
    transition: { delay: i * 0.04, duration: 0.3, ease: "easeOut" },
  }),
};

export default function Sidebar({ isOpen, onClose, isCollapsed }) {
  const { user } = useAuth();
  const name = user?.displayName || "Varun K T";
  const avatarLetters = name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <motion.aside
      className="fixed top-0 left-0 h-screen flex flex-col z-50 overflow-hidden"
      style={{
        width: "var(--sidebar-width)",
        background: "rgba(2, 6, 23, 0.85)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderRight: "1px solid var(--color-border)",
        boxShadow: "4px 0 32px rgba(0, 0, 0, 0.3)",
        transition: "width var(--transition-base), background var(--transition-base), border-color var(--transition-base)",
      }}
      variants={sidebarVariants}
      animate={isMobile ? (isOpen ? "mobileOpen" : "mobileClosed") : "desktop"}
      initial={isMobile ? "mobileClosed" : "desktop"}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* ── Logo ── */}
      <div
        className={`flex items-center border-b border-indigo-500/15 transition-all duration-250 ${
          isCollapsed ? "justify-center px-0" : "justify-between px-6"
        }`}
        style={{ height: 72 }}
      >
        <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"}`}>
          <div
            className="flex items-center justify-center flex-shrink-0"
            style={{
              width: 36, height: 36,
              borderRadius: "var(--radius-md)",
              background: "linear-gradient(135deg, var(--color-accent), var(--color-violet))",
              boxShadow: "0 0 20px var(--color-accent-glow)",
            }}
            aria-hidden="true"
          >
            <RiRocketLine style={{ color: "white", fontSize: "1.15rem" }} />
          </div>
          {!isCollapsed && (
            <span className="font-bold text-[15px] tracking-tight text-white">
              ProjectVault AI
            </span>
          )}
        </div>

        {/* Mobile Close Button */}
        {!isCollapsed && (
          <button
            onClick={onClose}
            className="sidebar-close-btn"
            aria-label="Close sidebar"
            title="Close sidebar"
          >
            <RiCloseLine />
          </button>
        )}
      </div>

      {/* ── Navigation ── */}
      <nav
        className={`flex-1 py-5 overflow-y-auto custom-scrollbar flex flex-col gap-0.5 transition-all duration-250 ${
          isCollapsed ? "px-1.5" : "px-3"
        }`}
        aria-label="Primary navigation"
      >
        {!isCollapsed && (
          <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase mb-1.5 px-3">
            Navigation
          </span>
        )}

        {NAV_ITEMS.map((item, i) => (
          <motion.div
            key={item.to}
            custom={i}
            variants={navItemVariants}
            initial="hidden"
            animate="visible"
          >
            <NavLink
              to={item.to}
              end={item.end}
              id={`nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
              onClick={() => isMobile && onClose()}
              title={isCollapsed ? item.label : undefined}
              className={({ isActive }) =>
                `flex items-center rounded-xl text-[13px] font-semibold transition-all duration-200 relative ${
                  isCollapsed ? "justify-center px-0 py-2.5 h-10 w-10 mx-auto" : "gap-3 px-3 py-2.5"
                } ${
                  isActive
                    ? "bg-gradient-to-r from-indigo-500/15 to-violet-500/10 text-white border border-indigo-500/25"
                    : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                }`
              }
            >
              <span
                className={`${isCollapsed ? "text-[18px]" : "text-[17px]"} flex-shrink-0 relative z-10`}
                aria-hidden="true"
              >
                {item.icon}
              </span>
              {!isCollapsed && <span className="relative z-10">{item.label}</span>}
            </NavLink>
          </motion.div>
        ))}

        {!isCollapsed && (
          <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase mt-5 mb-1.5 px-3">
            System
          </span>
        )}

        {BOTTOM_ITEMS.map((item, i) => (
          <motion.div
            key={item.to}
            custom={NAV_ITEMS.length + i}
            variants={navItemVariants}
            initial="hidden"
            animate="visible"
          >
            <NavLink
              to={item.to}
              id={`nav-${item.label.toLowerCase()}`}
              onClick={() => isMobile && onClose()}
              title={isCollapsed ? item.label : undefined}
              className={({ isActive }) =>
                `flex items-center rounded-xl text-[13px] font-semibold transition-all duration-200 relative ${
                  isCollapsed ? "justify-center px-0 py-2.5 h-10 w-10 mx-auto" : "gap-3 px-3 py-2.5"
                } ${
                  isActive
                    ? "bg-gradient-to-r from-indigo-500/15 to-violet-500/10 text-white border border-indigo-500/25"
                    : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                }`
              }
            >
              <span
                className={`${isCollapsed ? "text-[18px]" : "text-[17px]"} flex-shrink-0 relative z-10`}
                aria-hidden="true"
              >
                {item.icon}
              </span>
              {!isCollapsed && <span className="relative z-10">{item.label}</span>}
            </NavLink>
          </motion.div>
        ))}
      </nav>

      {/* ── User Card Footer ── */}
      <div className={`pb-4 pt-3 border-t border-indigo-500/15 transition-all duration-250 ${isCollapsed ? "px-1" : "px-3"}`}>
        <Link
          to="/profile"
          className={`flex items-center rounded-xl hover:bg-white/5 transition-all duration-250 ${
            isCollapsed ? "justify-center p-0.5 h-10 w-10 mx-auto" : "justify-between w-full p-2.5"
          }`}
          role="button"
          aria-label="User profile"
          title={isCollapsed ? name : undefined}
        >
          <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"}`}>
            <div
              className="flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
              style={{
                width: 36, height: 36,
                borderRadius: "50%",
                background: "linear-gradient(135deg, var(--color-accent), var(--color-violet))",
                boxShadow: "0 4px 12px rgba(99, 102, 241, 0.25)",
              }}
              aria-hidden="true"
            >{avatarLetters}</div>
            {!isCollapsed && (
              <div>
                <div className="text-[13px] font-bold text-white leading-tight">{name}</div>
                <div className="text-[11px] font-medium text-indigo-400">Pro Plan</div>
              </div>
            )}
          </div>
          {!isCollapsed && <RiArrowDownSLine className="text-slate-500 text-base" />}
        </Link>
      </div>
    </motion.aside>
  );
}