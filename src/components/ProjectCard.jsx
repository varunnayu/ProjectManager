import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiMoreFill,
  RiEditLine,
  RiDeleteBinLine,
  RiArchiveLine,
  RiFileCopy2Line,
  RiCalendarLine,
  RiFlagLine,
  RiFolderLine,
  RiShoppingCart2Line,
  RiSmartphoneLine,
  RiPaletteLine,
  RiChat3Line,
  RiBarChartLine,
  RiShieldFlashLine,
  RiGraduationCapLine,
} from "react-icons/ri";

const getTopicIcon = (title) => {
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes("ai") || lowerTitle.includes("generator") || lowerTitle.includes("content")) {
    return {
      element: <span className="text-xs font-black tracking-tighter">AI</span>,
      bg: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
      progressColor: "bg-purple-500",
    };
  }
  if (lowerTitle.includes("e-commerce") || lowerTitle.includes("shop") || lowerTitle.includes("dashboard")) {
    return {
      element: <RiShoppingCart2Line />,
      bg: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
      progressColor: "bg-blue-500",
    };
  }
  if (lowerTitle.includes("banking") || lowerTitle.includes("mobile") || lowerTitle.includes("phone")) {
    return {
      element: <RiSmartphoneLine />,
      bg: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
      progressColor: "bg-emerald-500",
    };
  }
  if (lowerTitle.includes("system") || lowerTitle.includes("design") || lowerTitle.includes("figma")) {
    return {
      element: <RiPaletteLine />,
      bg: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
      progressColor: "bg-amber-500",
    };
  }
  if (lowerTitle.includes("chat") || lowerTitle.includes("app") || lowerTitle.includes("message")) {
    return {
      element: <RiChat3Line />,
      bg: "bg-pink-500/10 text-pink-400 border border-pink-500/20",
      progressColor: "bg-pink-500",
    };
  }
  if (lowerTitle.includes("analytics") || lowerTitle.includes("platform") || lowerTitle.includes("data")) {
    return {
      element: <RiBarChartLine />,
      bg: "bg-rose-500/10 text-rose-400 border border-rose-500/20",
      progressColor: "bg-rose-500",
    };
  }
  if (lowerTitle.includes("security") || lowerTitle.includes("shield") || lowerTitle.includes("auth")) {
    return {
      element: <RiShieldFlashLine />,
      bg: "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20",
      progressColor: "bg-cyan-500",
    };
  }
  if (lowerTitle.includes("learning") || lowerTitle.includes("lms") || lowerTitle.includes("education") || lowerTitle.includes("school")) {
    return {
      element: <RiGraduationCapLine />,
      bg: "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20",
      progressColor: "bg-indigo-500",
    };
  }
  
  return {
    element: <RiFolderLine />,
    bg: "bg-slate-500/10 text-slate-400 border border-slate-800/50",
    progressColor: "bg-indigo-500",
  };
};

const getStatusPill = (status) => {
  let colorClass = "bg-slate-500/10 text-slate-400 border-slate-800";
  let dotClass = "bg-slate-400";
  
  if (status === "active") {
    colorClass = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    dotClass = "bg-emerald-500";
  } else if (status === "in-progress") {
    colorClass = "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
    dotClass = "bg-cyan-500";
  } else if (status === "completed") {
    colorClass = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    dotClass = "bg-emerald-500";
  } else if (status === "on-hold" || status === "planning") {
    colorClass = "bg-amber-500/10 text-amber-400 border-amber-500/20";
    dotClass = "bg-amber-500";
  } else if (status === "archived") {
    colorClass = "bg-rose-500/10 text-rose-400 border-rose-500/20";
    dotClass = "bg-rose-500";
  }
  
  return (
    <span className={`inline-flex items-center gap-1 bg-slate-950/20 border px-2 py-0.5 rounded-full text-[10px] font-bold ${colorClass}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
      <span>{status === "in-progress" ? "In Progress" : status === "on-hold" ? "On Hold" : status.charAt(0).toUpperCase() + status.slice(1)}</span>
    </span>
  );
};

export default function ProjectCard({
  id,
  title,
  description,
  progress = 0,
  status = "planning",
  priority = "medium",
  startDate,
  dueDate,
  tags = [],
  technologies = [],
  index = 0,
  viewMode = "grid",
  onEdit,
  onDelete,
  onArchive,
  onDuplicate,
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const themeInfo = getTopicIcon(title);
  
  // Format Date for display
  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const priorityColors = {
    high: "text-rose-400",
    medium: "text-amber-400",
    low: "text-blue-400",
    urgent: "text-rose-500 font-extrabold animate-pulse",
  };

  // Render dropdown action menu
  const renderActionsMenu = () => (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setMenuOpen(!menuOpen);
        }}
        className="p-1.5 rounded-lg bg-slate-950/60 hover:bg-slate-900 border border-slate-800/80 text-gray-400 hover:text-white transition-colors"
        aria-label="Actions menu"
      >
        <RiMoreFill className="text-sm" />
      </button>

      <AnimatePresence>
        {menuOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(false);
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 4 }}
              className="absolute right-0 mt-1.5 w-40 z-20 rounded-xl bg-slate-950 border border-slate-850 p-1 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => {
                  onEdit?.();
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 text-left text-xs font-bold px-3 py-2 rounded-lg text-gray-300 hover:bg-indigo-600 hover:text-white transition-colors"
              >
                <RiEditLine /> Edit Details
              </button>
              <button
                onClick={() => {
                  onDuplicate?.();
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 text-left text-xs font-bold px-3 py-2 rounded-lg text-gray-300 hover:bg-indigo-600 hover:text-white transition-colors"
              >
                <RiFileCopy2Line /> Duplicate
              </button>
              {status !== "archived" && (
                <button
                  onClick={() => {
                    onArchive?.();
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 text-left text-xs font-bold px-3 py-2 rounded-lg text-gray-300 hover:bg-amber-600 hover:text-white transition-colors"
                >
                  <RiArchiveLine /> Archive
                </button>
              )}
              <button
                onClick={() => {
                  onDelete?.();
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 text-left text-xs font-bold px-3 py-2 rounded-lg text-rose-400 hover:bg-rose-600 hover:text-white transition-colors"
              >
                <RiDeleteBinLine /> Delete Project
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );

  if (viewMode === "list") {
    return (
      <motion.div
        className="glass-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 w-full transition-all hover:translate-x-1"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.03, duration: 0.3 }}
      >
        {/* Left: Icon and title */}
        <div className="flex items-center gap-3.5 min-w-[260px] flex-1">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0 ${themeInfo.bg}`}>
            {themeInfo.element}
          </div>
          <div className="min-w-0">
            <Link to={`/projects/${id}`} className="font-bold text-sm text-white hover:text-indigo-400 transition-colors truncate block">
              {title}
            </Link>
            <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">{description}</p>
          </div>
        </div>

        {/* Middle Progress */}
        <div className="w-full md:w-44 flex items-center gap-3 flex-shrink-0">
          <span className="text-xs font-black text-white w-8 flex-shrink-0 text-right">{progress}%</span>
          <div className="h-1.5 flex-1 bg-slate-900 rounded-full overflow-hidden border border-slate-800/40">
            <div className={`h-full rounded-full ${themeInfo.progressColor}`} style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Tags / Tech */}
        <div className="hidden lg:flex flex-wrap gap-1.5 max-w-[200px] flex-shrink-0">
          {technologies.slice(0, 2).map((tech) => (
            <span key={tech} className="bg-slate-950/60 border border-slate-800/80 text-[9px] font-bold px-2 py-0.5 rounded text-gray-400">
              {tech}
            </span>
          ))}
          {tags.slice(0, 1).map((tag) => (
            <span key={tag} className="bg-slate-950/60 border border-slate-800/80 text-[9px] font-bold px-2 py-0.5 rounded text-gray-400">
              #{tag}
            </span>
          ))}
        </div>

        {/* Due & Status */}
        <div className="flex items-center justify-between md:justify-start gap-4 flex-shrink-0">
          <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-semibold min-w-[100px]">
            <RiCalendarLine className="text-gray-600" />
            <span>Due: {formatDate(dueDate).replace(/, \d{4}/, "")}</span>
          </div>

          <div className="min-w-[90px] flex justify-end">
            {getStatusPill(status)}
          </div>
        </div>

        {/* Priority & Actions */}
        <div className="flex items-center justify-between md:justify-start gap-4 flex-shrink-0">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase min-w-[70px]">
            <RiFlagLine className="text-gray-600 text-xs" />
            <span className={priorityColors[priority.toLowerCase()] || "text-gray-400"}>
              {priority}
            </span>
          </div>

          {renderActionsMenu()}
        </div>
      </motion.div>
    );
  }

  // Default Grid View Mode
  return (
    <motion.div
      className="glass-card p-5 flex flex-col justify-between min-h-[220px] transition-all hover:scale-[1.015] relative group"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.35, ease: "easeOut" }}
    >
      <div>
        {/* Upper Header Row */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0 ${themeInfo.bg}`}>
            {themeInfo.element}
          </div>
          <div className="flex items-center gap-1.5">
            {getStatusPill(status)}
          </div>
        </div>

        {/* Title */}
        <Link to={`/projects/${id}`} className="block group/link mb-2">
          <h3 className="text-sm font-bold text-white group-hover/link:text-indigo-400 transition-colors line-clamp-1">
            {title}
          </h3>
        </Link>

        {/* Description */}
        <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed min-h-[34px]">
          {description || "No description provided."}
        </p>

        {/* Tag pills */}
        {(technologies.length > 0 || tags.length > 0) && (
          <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-slate-800/40">
            {technologies.slice(0, 2).map((tech) => (
              <span key={tech} className="bg-slate-950/60 border border-slate-800/80 text-[9px] text-gray-400 font-bold px-2 py-0.5 rounded">
                {tech}
              </span>
            ))}
            {tags.slice(0, 1).map((tag) => (
              <span key={tag} className="bg-slate-950/60 border border-slate-800/80 text-[9px] text-gray-400 font-bold px-2 py-0.5 rounded">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Progress & Bottom Metadata Footer */}
      <div className="mt-4 pt-3 border-t border-slate-800/20">
        {/* Progress bar */}
        <div className="space-y-1.5 mb-4">
          <span className="text-xs font-black text-white">{progress}%</span>
          <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800/40">
            <div className={`h-full rounded-full ${themeInfo.progressColor}`} style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Footer info row */}
        <div className="flex items-center justify-between text-[10px] text-gray-500 font-semibold border-t border-slate-900 pt-2.5">
          <div className="flex items-center gap-1">
            <RiCalendarLine className="text-gray-600 text-xs" />
            <span>Due: {formatDate(dueDate).replace(/, \d{4}/, "")}</span>
          </div>

          <div className="flex items-center gap-1 font-bold uppercase tracking-wider">
            <RiFlagLine className="text-gray-600 text-[11px]" />
            <span className={priorityColors[priority.toLowerCase()] || "text-gray-400"}>
              {priority}
            </span>
          </div>

          {renderActionsMenu()}
        </div>
      </div>
    </motion.div>
  );
}
