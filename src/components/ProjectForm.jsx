import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RiCloseLine, RiSaveLine } from "react-icons/ri";

const STATUS_OPTIONS = [
  { value: "planning", label: "Planning" },
  { value: "active", label: "Active" },
  { value: "in-progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "archived", label: "Archived" },
];

const PRIORITY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

export default function ProjectForm({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("planning");
  const [priority, setPriority] = useState("medium");
  const [progress, setProgress] = useState(0);
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [techInput, setTechInput] = useState("");

  // Sync state if editing an existing project
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setDescription(initialData.description || "");
      setStatus(initialData.status || "planning");
      setPriority(initialData.priority || "medium");
      setProgress(initialData.progress || 0);
      setStartDate(initialData.startDate || "");
      setDueDate(initialData.dueDate || "");
      setTagsInput(initialData.tags ? initialData.tags.join(", ") : "");
      setTechInput(initialData.technologies ? initialData.technologies.join(", ") : "");
    } else {
      // Clear form for new project
      setTitle("");
      setDescription("");
      setStatus("planning");
      setPriority("medium");
      setProgress(0);
      setStartDate("");
      setDueDate("");
      setTagsInput("");
      setTechInput("");
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Process comma-separated tags/tech
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t !== "");
    const technologies = techInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t !== "");

    const projectData = {
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      progress: Number(progress),
      startDate,
      dueDate,
      tags,
      technologies,
    };

    onSubmit(projectData);
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
                {initialData ? "Edit Project Details" : "Create New Project"}
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
                <label htmlFor="form-title" className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Project Title <span className="text-rose-500">*</span>
                </label>
                <input
                  id="form-title"
                  type="text"
                  required
                  placeholder="Enter project name..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input"
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="form-desc" className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  id="form-desc"
                  placeholder="Provide a detailed description of this project..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input min-h-24 resize-y text-sm"
                />
              </div>

              {/* Status & Priority Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="form-status" className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    Status
                  </label>
                  <select
                    id="form-status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="input bg-gray-900/60 border border-gray-800 text-gray-300 outline-none"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="form-priority" className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    Priority
                  </label>
                  <select
                    id="form-priority"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="input bg-gray-900/60 border border-gray-800 text-gray-300 outline-none"
                  >
                    {PRIORITY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Progress Slider */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label htmlFor="form-progress" className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Progress completion
                  </label>
                  <span className="text-xs font-bold text-indigo-400">{progress}%</span>
                </div>
                <input
                  id="form-progress"
                  type="range"
                  min="0"
                  max="100"
                  value={progress}
                  onChange={(e) => setProgress(e.target.value)}
                  className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              {/* Start Date & Due Date Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="form-start-date" className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    Start Date
                  </label>
                  <input
                    id="form-start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="input text-gray-300"
                  />
                </div>
                <div>
                  <label htmlFor="form-due-date" className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    Due Date
                  </label>
                  <input
                    id="form-due-date"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="input text-gray-300"
                  />
                </div>
              </div>

              {/* Tags */}
              <div>
                <label htmlFor="form-tags" className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Tags (comma-separated)
                </label>
                <input
                  id="form-tags"
                  type="text"
                  placeholder="e.g. AI, SaaS, Analytics"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="input"
                />
              </div>

              {/* Technologies */}
              <div>
                <label htmlFor="form-tech" className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Technologies (comma-separated)
                </label>
                <input
                  id="form-tech"
                  type="text"
                  placeholder="e.g. React, Firebase, Tailwind"
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  className="input"
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
                  Save Changes
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
