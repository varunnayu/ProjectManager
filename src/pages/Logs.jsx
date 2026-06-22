import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiAddLine,
  RiSearchLine,
  RiFilter3Line,
  RiCalendarLine,
  RiTerminalBoxLine,
  RiCheckboxCircleLine,
  RiErrorWarningLine,
  RiArrowRightDoubleLine,
  RiEditLine,
  RiDeleteBinLine,
  RiAlertLine,
  RiHistoryLine,
} from "react-icons/ri";
import { LogService } from "../services/logService";
import { ProjectService } from "../services/projectService";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import LogForm from "../components/LogForm";
import { SkeletonLogsList } from "../components/Skeleton";

export default function Logs() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [logs, setLogs] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [projectFilter, setProjectFilter] = useState("all");

  // Modals States
  const [formOpen, setFormOpen] = useState(false);
  const [editingLog, setEditingLog] = useState(null);

  // Fetch all logs & projects
  const fetchLogsAndProjects = async () => {
    try {
      setLoading(true);
      const uid = user?.uid || "mock-user-123";
      const logsData = await LogService.getAllForUser(uid);
      const projData = await ProjectService.getAllForUser(uid);
      setLogs(logsData);
      setProjects(projData);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch timeline logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogsAndProjects();
  }, [user]);

  // --- CRUD Handlers ---
  const handleCreateOrUpdate = async (logPayload) => {
    try {
      if (editingLog) {
        await LogService.update(editingLog.id, logPayload);
        addToast({ message: "Daily log updated.", type: "success" });
      } else {
        await LogService.create(logPayload, user?.uid || "mock-user-123");
        addToast({ message: "New daily log entry saved.", type: "success" });
      }
      setFormOpen(false);
      setEditingLog(null);
      fetchLogsAndProjects();
    } catch (err) {
      console.error(err);
      addToast({ message: "Failed to save daily log.", type: "error" });
    }
  };

  const handleDelete = async (logId, logDate) => {
    const formattedDate = new Date(logDate).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    if (confirm(`Delete the daily log for ${formattedDate}?`)) {
      try {
        await LogService.delete(logId);
        addToast({ message: "Daily log removed.", type: "success" });
        fetchLogsAndProjects();
      } catch (err) {
        console.error(err);
        addToast({ message: "Failed to delete log.", type: "error" });
      }
    }
  };

  // --- Filtering & Sorting computation ---
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // 1. Search text
      if (searchTerm.trim() !== "") {
        const query = searchTerm.toLowerCase().trim();
        const matchesCompleted = log.completedWork.toLowerCase().includes(query);
        const matchesIssues = log.issues?.toLowerCase().includes(query);
        const matchesNext = log.nextSteps?.toLowerCase().includes(query);
        if (!matchesCompleted && !matchesIssues && !matchesNext) return false;
      }

      // 2. Project Filter
      if (projectFilter !== "all" && log.projectId !== projectFilter) {
        return false;
      }

      return true;
    });
  }, [logs, searchTerm, projectFilter]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="page-header flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="page-title text-3xl font-extrabold tracking-tight">Development Logs</h1>
          <p className="page-subtitle text-sm text-gray-400">
            Keep a timeline of daily work achievements, warning issues, and deliverables pipelines.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingLog(null);
            setFormOpen(true);
          }}
          className="btn btn-primary"
          id="btn-new-log"
        >
          <RiAddLine className="text-lg" />
          New Log Entry
        </button>
      </div>

      {/* Control Bar (Filters & Search) */}
      <div className="glass-card p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="topbar-search w-full md:max-w-md" style={{ background: "rgba(0,0,0,0.2)" }}>
          <RiSearchLine className="text-gray-500" />
          <input
            type="search"
            placeholder="Search dev logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent outline-none border-none text-sm text-white"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap gap-3 w-full md:w-auto items-center">
          <div className="flex items-center gap-1.5 text-xs text-gray-400 font-bold uppercase tracking-wider">
            <RiFilter3Line /> Project Filter:
          </div>

          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="bg-gray-900/60 border border-gray-800 text-xs font-semibold text-gray-300 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 transition-colors"
          >
            <option value="all">All Projects</option>
            <option value="all-general">General Work</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Timeline View */}
      {loading ? (
        <SkeletonLogsList count={3} />
      ) : error ? (
        <div className="glass-card p-6 flex flex-col items-center justify-center text-center gap-3">
          <RiAlertLine className="text-3xl text-rose-500 animate-pulse" />
          <p className="text-sm text-gray-300">{error}</p>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="empty-state glass-card py-16">
          <div className="empty-state-icon">
            <RiTerminalBoxLine />
          </div>
          <h3 className="text-base font-bold text-gray-400 mb-1">No Log Entries Found</h3>
          <p className="text-xs text-gray-500 max-w-xs mx-auto mb-6">
            Search terms matched zero history logs. Click below to add your daily developer update page.
          </p>
          <button
            onClick={() => {
              setEditingLog(null);
              setFormOpen(true);
            }}
            className="btn btn-secondary btn-sm"
          >
            Log Today's Work
          </button>
        </div>
      ) : (
        /* ================= TIMELINE WORKSPACE ================= */
        <div className="logs-timeline relative pl-6 md:pl-10 space-y-8 border-l border-gray-800/80 ml-3 md:ml-6 mt-4">
          <AnimatePresence mode="popLayout">
            {filteredLogs.map((log, index) => {
              const formattedDate = new Date(log.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              });
              
              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05, duration: 0.35 }}
                  className="relative group"
                >
                  {/* Timeline bullet dot */}
                  <span className="logs-timeline-dot absolute -left-[31px] md:-left-[47px] top-1.5 h-4 w-4 rounded-full border-2 border-gray-950 bg-indigo-500 group-hover:bg-violet-500 shadow-md transition-colors" />

                  {/* Log Card */}
                  <div className="glass-card p-6 space-y-4 relative">
                    
                    {/* Top title line */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-gray-900 pb-3">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1.5 text-xs text-gray-300 font-extrabold uppercase tracking-wider bg-gray-950 px-3 py-1 rounded-full border border-gray-800">
                          <RiCalendarLine className="text-indigo-400" /> {formattedDate}
                        </span>
                        <span className="badge badge-indigo text-[10px] font-bold">
                          {log.projectTitle}
                        </span>
                      </div>

                      {/* Card actions */}
                      <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setEditingLog(log);
                            setFormOpen(true);
                          }}
                          className="p-1.5 rounded hover:bg-gray-900 border border-transparent hover:border-gray-800 text-gray-500 hover:text-white transition-colors"
                          title="Edit Log"
                        >
                          <RiEditLine className="text-xs" />
                        </button>
                        <button
                          onClick={() => handleDelete(log.id, log.date)}
                          className="p-1.5 rounded hover:bg-rose-950/20 border border-transparent hover:border-rose-900/30 text-gray-500 hover:text-rose-400 transition-colors"
                          title="Delete Log"
                        >
                          <RiDeleteBinLine className="text-xs" />
                        </button>
                      </div>
                    </div>

                    {/* Three fields sections */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      
                      {/* Completed Work */}
                      <div className="space-y-1.5">
                        <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1">
                          <RiCheckboxCircleLine className="text-emerald-400" /> Completed Work
                        </h4>
                        <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-line">
                          {log.completedWork}
                        </p>
                      </div>

                      {/* Issues */}
                      <div className="space-y-1.5">
                        <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1">
                          <RiErrorWarningLine className="text-rose-400" /> Blockers / Issues
                        </h4>
                        {log.issues ? (
                          <div className="p-3 rounded-lg bg-rose-500/5 border border-rose-500/10 text-xs text-rose-300/95 leading-relaxed whitespace-pre-line">
                            {log.issues}
                          </div>
                        ) : (
                          <span className="block text-xs text-gray-600 font-semibold italic">None logged.</span>
                        )}
                      </div>

                      {/* Next Steps */}
                      <div className="space-y-1.5">
                        <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1">
                          <RiArrowRightDoubleLine className="text-amber-400 animate-pulse" /> Next Steps
                        </h4>
                        {log.nextSteps ? (
                          <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-line">
                            {log.nextSteps}
                          </p>
                        ) : (
                          <span className="block text-xs text-gray-600 font-semibold italic">None logged.</span>
                        )}
                      </div>

                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Add / Edit Form Modal */}
      <LogForm
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingLog(null);
        }}
        onSubmit={handleCreateOrUpdate}
        projects={projects}
        initialData={editingLog}
      />
    </div>
  );
}
