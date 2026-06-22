import { useLocation } from "react-router-dom";
import {
  RiSearchLine,
  RiBellLine,
  RiAddLine,
  RiMoonLine,
  RiSunLine,
  RiMenuLine,
} from "react-icons/ri";
import { useTheme } from "../context/ThemeContext";

const PAGE_TITLES = {
  "/": "Dashboard",
  "/projects": "Projects",
  "/tasks": "Tasks",
  "/notes": "Notes",
  "/resources": "Resources",
  "/settings": "Settings",
};

export default function Topbar({ onOpenSearch, onToggleSidebar }) {
  const { pathname } = useLocation();
  const title = PAGE_TITLES[pathname] ?? "ProjectVault AI";
  const { theme, toggleTheme } = useTheme();

  // Contextual configurations
  let searchPlaceholder = "Search projects, tasks, notes...";
  let newButtonText = "New";

  if (pathname === "/projects") {
    searchPlaceholder = "Search projects by name, tags, or technology...";
    newButtonText = "Create Project";
  } else if (pathname === "/tasks") {
    searchPlaceholder = "Search tasks by name or tag...";
    newButtonText = "Create Task";
  } else if (pathname === "/notes") {
    searchPlaceholder = "Search notes by title or content...";
    newButtonText = "Create Note";
  } else if (pathname === "/resources") {
    searchPlaceholder = "Search resources...";
    newButtonText = "Upload Resource";
  } else if (pathname === "/logs") {
    searchPlaceholder = "Search developer logs...";
    newButtonText = "Create Log";
  }

  const handleNewClick = () => {
    const eventName = `create-${pathname.replace("/", "") || "item"}`;
    window.dispatchEvent(new CustomEvent(eventName));
  };

  return (
    <header
      className="flex items-center justify-between gap-4 sticky top-0 z-40"
      style={{
        height: 72,
        padding: "0 1.5rem",
        borderBottom: "1px solid var(--color-border)",
        background: "rgba(2, 6, 23, 0.7)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}
    >
      {/* Left: Mobile menu toggle + Page title */}
      <div className="flex items-center gap-3 min-w-0 flex-shrink-0">
        <button
          onClick={onToggleSidebar}
          className="topbar-menu-btn"
          aria-label="Open sidebar"
          title="Open sidebar"
        >
          <RiMenuLine />
        </button>
      </div>

      {/* Center: Search Trigger */}
      <div
        className="flex-1 max-w-[520px] mx-auto cursor-pointer select-none group"
        role="search"
        onClick={onOpenSearch}
      >
        <div
          className="flex items-center justify-between gap-2 px-4 transition-all duration-200"
          style={{
            height: 44,
            borderRadius: "var(--radius-lg)",
            background: "var(--color-bg-input)",
            border: "1px solid var(--color-border)",
          }}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <RiSearchLine
              className="text-slate-500 group-hover:text-indigo-400 transition-colors flex-shrink-0"
              style={{ fontSize: "1rem" }}
              aria-hidden="true"
            />
            <span className="text-[13px] text-slate-500 font-medium truncate group-hover:text-slate-400 transition-colors">
              {searchPlaceholder}
            </span>
          </div>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-bold text-slate-500"
            style={{ background: "rgba(15, 23, 42, 0.8)", border: "1px solid rgba(99, 102, 241, 0.15)" }}
          >
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        <button
          onClick={handleNewClick}
          className="btn btn-primary btn-sm flex items-center gap-1.5"
          id="topbar-new-btn"
          aria-label={newButtonText}
          title={newButtonText}
        >
          <RiAddLine aria-hidden="true" />
          <span className="hidden sm:inline">{newButtonText}</span>
        </button>

        <button
          className="relative flex items-center justify-center cursor-pointer"
          id="topbar-notifications-btn"
          aria-label="Notifications"
          title="Notifications"
          style={{
            width: 36, height: 36,
            borderRadius: "var(--radius-sm)",
            background: "var(--color-bg-input)",
            border: "1px solid var(--color-border)",
            color: "var(--color-text-secondary)",
            fontSize: "1rem",
            transition: "all var(--transition-fast)",
          }}
        >
          <RiBellLine aria-hidden="true" />
          <span className="absolute -top-1 -right-1 bg-rose-500 text-[8px] font-black text-white rounded-full w-3.5 h-3.5 flex items-center justify-center" style={{ border: "2px solid var(--color-bg-primary)" }}>
            3
          </span>
        </button>

        <button
          onClick={toggleTheme}
          className="flex items-center justify-center cursor-pointer"
          id="topbar-theme-btn"
          aria-label="Toggle theme"
          title="Toggle theme"
          style={{
            width: 36, height: 36,
            borderRadius: "var(--radius-sm)",
            background: "var(--color-bg-input)",
            border: "1px solid var(--color-border)",
            color: "var(--color-text-secondary)",
            fontSize: "1rem",
            transition: "all var(--transition-fast)",
          }}
        >
          {theme === "dark" ? <RiSunLine aria-hidden="true" /> : <RiMoonLine aria-hidden="true" />}
        </button>
      </div>
    </header>
  );
}
