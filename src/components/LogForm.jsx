import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RiCloseLine, RiSaveLine } from "react-icons/ri";

export default function LogForm({
  isOpen,
  onClose,
  onSubmit,
  projects = [],
  initialData = null,
}) {
  const [date, setDate] = useState("");
  const [projectId, setProjectId] = useState("all");
  const [completedWork, setCompletedWork] = useState("");
  const [issues, setIssues] = useState("");
  const [nextSteps, setNextSteps] = useState("");

  // Sync state if editing
  useEffect(() => {
    if (initialData) {
      setDate(initialData.date || "");
      setProjectId(initialData.projectId || "all");
      setCompletedWork(initialData.completedWork || "");
      setIssues(initialData.issues || "");
      setNextSteps(initialData.nextSteps || "");
    } else {
      // Clear form, default date to today
      const today = new Date().toISOString().split("T")[0];
      setDate(today);
      setProjectId("all");
      setCompletedWork("");
      setIssues("");
      setNextSteps("");
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!date || !completedWork.trim()) return;

    // Lookup project title for cataloging
    let projectTitle = "General Work";
    if (projectId !== "all") {
      const match = projects.find((p) => p.id === projectId);
      if (match) projectTitle = match.title;
    }

    const logData = {
      date,
      projectId,
      projectTitle,
      completedWork: completedWork.trim(),
      issues: issues.trim(),
      nextSteps: nextSteps.trim(),
    };

    onSubmit(logData);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-gray-950/80 backdrop-blur-md"
          />

          {/* Form Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative w-full max-w-lg z-10 glass-card p-6 overflow-hidden max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-800 pb-4 mb-4">
              <h2 className="text-lg font-bold text-white">
                {initialData ? "Edit Daily Log" : "Create Daily Log"}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-lg bg-gray-900/60 hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
              >
                <RiCloseLine className="text-xl" />
              </button>
            </div>

            {/* Scrollable Form body */}
            <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto flex-1 pr-1">
              {/* Date */}
              <div>
                <label htmlFor="log-date" className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Log Date <span className="text-rose-500">*</span>
                </label>
                <input
                  id="log-date"
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="input text-gray-300"
                />
              </div>

              {/* Project association */}
              <div>
                <label htmlFor="log-project" className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Link Project Workspace
                </label>
                <select
                  id="log-project"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="input bg-gray-900/60 border border-gray-800 text-gray-300 text-sm outline-none"
                >
                  <option value="all">General / Personal Work</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Completed Work */}
              <div>
                <label htmlFor="log-completed" className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Completed Work <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id="log-completed"
                  required
                  placeholder="What milestones or tasks did you achieve today?"
                  value={completedWork}
                  onChange={(e) => setCompletedWork(e.target.value)}
                  className="input min-h-24 resize-y text-sm"
                />
              </div>

              {/* Issues */}
              <div>
                <label htmlFor="log-issues" className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Blockers or Issues Encountered
                </label>
                <textarea
                  id="log-issues"
                  placeholder="Any hurdles, errors, or blocker tickets? (Leave blank if none)"
                  value={issues}
                  onChange={(e) => setIssues(e.target.value)}
                  className="input min-h-20 resize-y text-sm"
                />
              </div>

              {/* Next Steps */}
              <div>
                <label htmlFor="log-next" className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Next Steps / Plan
                </label>
                <textarea
                  id="log-next"
                  placeholder="What are the next deliverables for tomorrow?"
                  value={nextSteps}
                  onChange={(e) => setNextSteps(e.target.value)}
                  className="input min-h-20 resize-y text-sm"
                />
              </div>

              {/* Bottom Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-secondary px-5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary px-5"
                >
                  <RiSaveLine />
                  Save Log
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
