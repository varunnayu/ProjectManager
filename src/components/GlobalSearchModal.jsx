import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiSearchLine,
  RiFolderLine,
  RiTaskLine,
  RiFileTextLine,
  RiBookmarkLine,
  RiHistoryLine,
  RiCommandLine,
} from "react-icons/ri";
import { ProjectService } from "../services/projectService";
import { TaskService } from "../services/taskService";
import { NoteService } from "../services/noteService";
import { ResourceService } from "../services/resourceService";
import { LogService } from "../services/logService";
import { useAuth } from "../context/AuthContext";

const TYPE_ICONS = {
  project: <RiFolderLine className="text-indigo-400" />,
  task: <RiTaskLine className="text-amber-400" />,
  note: <RiFileTextLine className="text-cyan-400" />,
  resource: <RiBookmarkLine className="text-emerald-400" />,
  log: <RiHistoryLine className="text-rose-400" />,
};

// Helper component to highlight search terms
function HighlightedText({ text = "", highlight = "" }) {
  if (!highlight.trim()) return <span>{text}</span>;
  
  const regex = new RegExp(`(${highlight.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);
  
  return (
    <span>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-indigo-500/30 text-indigo-300 font-bold px-0.5 rounded">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </span>
  );
}

export default function GlobalSearchModal({ isOpen, onClose }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [queryText, setQueryText] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Collection states
  const [allItems, setAllItems] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // Debounce effect
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(queryText);
    }, 150); // Fast 150ms debounce for instant feel

    return () => clearTimeout(handler);
  }, [queryText]);

  // Load all items across collections when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const loadSearchDataset = async () => {
      try {
        const uid = user?.uid || "mock-user-123";
        const [projs, tsks, nts, ress, lgs] = await Promise.all([
          ProjectService.getAllForUser(uid),
          TaskService.getAllForUser(uid),
          NoteService.getAllForUser(uid),
          ResourceService.getAllForUser(uid),
          LogService.getAllForUser(uid),
        ]);

        // Standardize items structure
        const dataset = [
          ...projs.map((p) => ({
            id: p.id,
            title: p.title,
            subtitle: p.description || "Project Workspace",
            type: "project",
            route: `/projects/${p.id}`,
          })),
          ...tsks.map((t) => ({
            id: t.id,
            title: t.title,
            subtitle: `Task · Column: ${t.status.toUpperCase()} · Priority: ${t.priority}`,
            type: "task",
            route: "/tasks",
          })),
          ...nts.map((n) => ({
            id: n.id,
            title: n.title,
            subtitle: `Documentation Doc · Category: ${n.category}`,
            type: "note",
            route: "/notes",
          })),
          ...ress.map((r) => ({
            id: r.id,
            title: r.title,
            subtitle: `Vault Resource · Scope: ${r.type.toUpperCase()}`,
            type: "resource",
            route: "/resources",
          })),
          ...lgs.map((l) => ({
            id: l.id,
            title: `Dev Log: ${new Date(l.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`,
            subtitle: `Milestones: ${l.completedWork.slice(0, 80)}...`,
            type: "log",
            route: "/logs",
          })),
        ];

        setAllItems(dataset);
        setSelectedIndex(0);
        
        // Auto focus input
        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
      } catch (err) {
        console.error("Error building search index:", err);
      }
    };

    loadSearchDataset();
    setQueryText("");
    setDebouncedQuery("");
  }, [isOpen, user]);

  // Filter items matching query
  const searchResults = useMemo(() => {
    if (!debouncedQuery.trim()) return [];
    const q = debouncedQuery.toLowerCase().trim();
    return allItems.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q)
    );
  }, [allItems, debouncedQuery]);

  // Sync selected index bounds when results list size changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchResults.length]);

  // Handle keyboard selectors (Notion Raycast key bindings)
  const handleKeyDown = (e) => {
    if (searchResults.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % searchResults.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + searchResults.length) % searchResults.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      handleSelectResult(searchResults[selectedIndex]);
    }
  };

  const handleSelectResult = (result) => {
    if (!result) return;
    onClose();
    navigate(result.route);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[15vh]">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-gray-950/80 backdrop-blur-md"
          />

          {/* Search container Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative w-full max-w-xl z-10 glass-card overflow-hidden flex flex-col max-h-[60vh] border-indigo-500/20 shadow-2xl"
            onKeyDown={handleKeyDown}
          >
            {/* Search Input bar */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-800 bg-gray-900/10">
              <RiSearchLine className="text-indigo-400 text-lg flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Type to search workspace projects, tasks, docs..."
                value={queryText}
                onChange={(e) => setQueryText(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-sm text-white placeholder-gray-500"
              />
              <span className="text-[10px] bg-gray-950 border border-gray-800 text-gray-500 font-bold px-1.5 py-0.5 rounded">
                ESC
              </span>
            </div>

            {/* Results Canvas */}
            <div className="flex-1 overflow-y-auto p-2 min-h-[100px] max-h-[40vh]">
              {!debouncedQuery.trim() ? (
                <div className="flex flex-col items-center justify-center py-10 text-gray-500 gap-1.5 select-none">
                  <RiCommandLine className="text-3xl text-gray-700 animate-pulse" />
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-600">Search Cmd Palette</p>
                  <p className="text-[10px] text-gray-600">Enter terms to filter projects, sprint tasks, resources...</p>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="text-center py-12 text-gray-500 text-xs font-semibold select-none">
                  No matching files found.
                </div>
              ) : (
                <div className="space-y-1">
                  {searchResults.map((res, i) => {
                    const isSelected = i === selectedIndex;
                    return (
                      <button
                        key={`${res.type}-${res.id}`}
                        onClick={() => handleSelectResult(res)}
                        onMouseEnter={() => setSelectedIndex(i)}
                        className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-all ${
                          isSelected
                            ? "bg-indigo-600 text-white shadow-lg"
                            : "hover:bg-gray-900/40 text-gray-400 hover:text-gray-200"
                        }`}
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <span className={`text-lg p-1.5 rounded-lg ${isSelected ? "bg-white/10" : "bg-gray-950"}`}>
                            {TYPE_ICONS[res.type]}
                          </span>
                          <div className="min-w-0">
                            <span className="block text-xs font-bold truncate leading-tight">
                              <HighlightedText text={res.title} highlight={debouncedQuery} />
                            </span>
                            <span className={`block text-[10px] mt-0.5 truncate leading-tight ${isSelected ? "text-indigo-200" : "text-gray-500"}`}>
                              <HighlightedText text={res.subtitle} highlight={debouncedQuery} />
                            </span>
                          </div>
                        </div>

                        {isSelected && (
                          <span className="text-[9px] bg-white/20 text-white font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow">
                            Select ↵
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Bottom Keyboard Guide */}
            <div className="border-t border-gray-800 bg-gray-950 px-4 py-2 flex items-center justify-between text-[10px] text-gray-500 select-none">
              <div className="flex gap-3">
                <span>↑↓ Navigation</span>
                <span>↵ Open File</span>
              </div>
              <span>ProjectVault AI Search</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
