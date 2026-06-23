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
  "/profile": "Profile Settings",
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
        height: 64,
        padding: "0 1.5rem",
        borderBottom: "1px solid var(--color-border)",
        background: "rgba(0, 0, 0, 0.5)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      {/* Left: Mobile menu toggle + Page title */}
      <div className="flex items-center gap-4 min-w-0 flex-shrink-0">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden text-zinc-400 hover:text-white transition-colors"
          aria-label="Open sidebar"
          title="Open sidebar"
        >
          <RiMenuLine className="text-xl" />
        </button>
        <h2 className="text-sm font-bold text-white tracking-wide uppercase hidden sm:block">
          {title}
        </h2>
      </div>

      {/* Right: Search Bar */}
      <div
        className="flex-1 sm:max-w-[320px] ml-auto cursor-pointer select-none group"
        role="search"
        onClick={onOpenSearch}
      >
        <div
          className="flex items-center justify-between gap-2 px-3 transition-all duration-200"
          style={{
            height: 36,
            borderRadius: "var(--radius-lg)",
            background: "var(--color-bg-input)",
            border: "1px solid var(--color-border)",
          }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <RiSearchLine
              className="text-zinc-500 group-hover:text-zinc-300 transition-colors flex-shrink-0"
              style={{ fontSize: "0.9rem" }}
              aria-hidden="true"
            />
            <span className="text-xs text-zinc-500 font-medium truncate group-hover:text-zinc-400 transition-colors">
              {searchPlaceholder}
            </span>
          </div>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[9px] font-mono font-bold text-zinc-500 border border-zinc-800 bg-black/40">
            ⌘K
          </kbd>
        </div>
      </div>
    </header>
  );
}
