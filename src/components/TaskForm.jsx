import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RiCloseLine, RiSaveLine } from "react-icons/ri";

const PRIORITY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

const STATUS_OPTIONS = [
  { value: "todo", label: "To Do" },
  { value: "in-progress", label: "In Progress" },
  { value: "in-review", label: "Under Review" },
  { value: "done", label: "Completed" },
];

export default function TaskForm({
  isOpen,
  onClose,
  onSubmit,
  projects = [],
  initialData = null,
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [status, setStatus] = useState("todo");
  const [dueDate, setDueDate] = useState("");
  const [projectId, setProjectId] = useState("all");

  // Sync state if editing an existing task
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setDescription(initialData.description || "");
      setPriority(initialData.priority || "medium");
      setStatus(initialData.status || "todo");
      setDueDate(initialData.dueDate || "");
      setProjectId(initialData.projectId || "all");
    } else {
      // Clear form
      setTitle("");
      setDescription("");
      setPriority("medium");
      setStatus("todo");
      setDueDate("");
      setProjectId("all");
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Lookup project title for display helper
    let projectTitle = "General Tasks";
    if (projectId !== "all") {
      const match = projects.find((p) => p.id === projectId);
      if (match) projectTitle = match.title;
    }

    const taskData = {
      title: title.trim(),
      description: description.trim(),
      priority,
      status,
      dueDate,
      projectId,
      projectTitle,
    };

    onSubmit(taskData);
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
                {initialData ? "Edit Task Details" : "Create New Task"}
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
              {/* Title */}
              <div>
                <label htmlFor="task-title" className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Task Title <span className="text-rose-500">*</span>
                </label>
                <input
                  id="task-title"
                  type="text"
                  required
                  placeholder="What needs to be done?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input"
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="task-desc" className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  id="task-desc"
                  placeholder="Provide sub-tasks, context, or notes for this task..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input min-h-24 resize-y text-sm"
                />
              </div>

              {/* Project Assignment */}
              <div>
                <label htmlFor="task-project" className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Assign Project Workspace
                </label>
                <select
                  id="task-project"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="input bg-gray-900/60 border border-gray-800 text-gray-300 outline-none text-sm"
                >
                  <option value="all">General / Personal Tasks</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status & Priority Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="task-status" className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    Status Column
                  </label>
                  <select
                    id="task-status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="input bg-gray-900/60 border border-gray-800 text-gray-300 outline-none text-sm"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="task-priority" className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    Priority Level
                  </label>
                  <select
                    id="task-priority"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="input bg-gray-900/60 border border-gray-800 text-gray-300 outline-none text-sm"
                  >
                    {PRIORITY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Due Date */}
              <div>
                <label htmlFor="task-due" className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Due Date
                </label>
                <input
                  id="task-due"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="input text-gray-300"
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
                  Save Task
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
