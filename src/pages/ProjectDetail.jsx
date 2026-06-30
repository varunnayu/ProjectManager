import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  RiArrowLeftLine,
  RiEditLine,
  RiDeleteBinLine,
  RiArchiveLine,
  RiFileCopy2Line,
  RiCalendarEventLine,
  RiCpuLine,
  RiPriceTag3Line,
  RiCheckboxCircleLine,
  RiProgress3Line,
  RiTodoLine,
  RiAddLine,
  RiDeleteBin6Line,
} from "react-icons/ri";
import { ProjectService } from "../services/projectService";
import { useToast } from "../context/ToastContext";
import { useConfirm } from "../context/ConfirmContext";
import ProjectForm from "../components/ProjectForm";
import { SkeletonCard } from "../components/Skeleton";

const STATUS_MAP = {
  planning: "badge-violet",
  active: "badge-emerald",
  "in-progress": "badge-amber",
  completed: "badge-indigo",
  archived: "badge-rose",
};

const PRIORITY_MAP = {
  low: "badge-emerald",
  medium: "badge-amber",
  high: "badge-rose",
  urgent: "badge-rose animate-pulse",
};

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { confirm } = useConfirm();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);

  // Nested Project-specific interactive tasks state (mock storage fallback)
  const [subtasks, setSubtasks] = useState([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      const data = await ProjectService.getById(id);
      if (!data) {
        addToast({ message: "Project not found.", type: "error" });
        navigate("/projects");
        return;
      }
      setProject(data);

      // Load subtasks linked to this project id
      const storedSubtasks = localStorage.getItem(`pv_subtasks_${id}`);
      if (storedSubtasks) {
        setSubtasks(JSON.parse(storedSubtasks));
      } else {
        const initialSubtasks = [
          { id: 1, title: "Initial requirements definition", done: true },
          { id: 2, title: "Architecture design & stack approval", done: true },
          { id: 3, title: "Frontend development of main module", done: false },
          { id: 4, title: "API integration & security check", done: false },
        ];
        localStorage.setItem(`pv_subtasks_${id}`, JSON.stringify(initialSubtasks));
        setSubtasks(initialSubtasks);
      }
    } catch (err) {
      console.error("Error loading project details:", err);
      addToast({ message: "Error loading project details.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  // Sync subtasks to LocalStorage
  const saveSubtasks = (updatedList) => {
    setSubtasks(updatedList);
    localStorage.setItem(`pv_subtasks_${id}`, JSON.stringify(updatedList));

    // Update Project progress based on subtasks completion
    if (project && updatedList.length > 0) {
      const completed = updatedList.filter((t) => t.done).length;
      const calculatedProgress = Math.round((completed / updatedList.length) * 100);
      
      const updatedProject = { ...project, progress: calculatedProgress };
      setProject(updatedProject);
      ProjectService.update(id, { progress: calculatedProgress });
    }
  };

  const handleToggleSubtask = (taskId) => {
    const updated = subtasks.map((t) => (t.id === taskId ? { ...t, done: !t.done } : t));
    saveSubtasks(updated);
  };

  const handleAddSubtask = (e) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;

    const newT = {
      id: Date.now(),
      title: newSubtaskTitle.trim(),
      done: false,
    };
    const updated = [...subtasks, newT];
    saveSubtasks(updated);
    setNewSubtaskTitle("");
  };

  const handleDeleteSubtask = (taskId) => {
    const updated = subtasks.filter((t) => t.id !== taskId);
    saveSubtasks(updated);
  };

  const handleEditSubmit = async (projectData) => {
    try {
      await ProjectService.update(id, projectData);
      setProject({ ...project, ...projectData });
      setEditOpen(false);
      addToast({ message: "Project details updated.", type: "success" });
    } catch (err) {
      console.error(err);
      addToast({ message: "Failed to update project.", type: "error" });
    }
  };

  const handleDelete = async () => {
    if (await confirm(`Delete "${project?.title}" permanently? This cannot be undone.`)) {
      try {
        await ProjectService.delete(id);
        addToast({ message: "Project deleted.", type: "success" });
        navigate("/projects");
      } catch (err) {
        console.error(err);
        addToast({ message: "Failed to delete project.", type: "error" });
      }
    }
  };

  const handleArchive = async () => {
    try {
      await ProjectService.archive(id);
      setProject({ ...project, status: "archived" });
      addToast({ message: "Project archived.", type: "success" });
    } catch (err) {
      console.error(err);
      addToast({ message: "Failed to archive project.", type: "error" });
    }
  };

  const handleDuplicate = async () => {
    try {
      const cloned = await ProjectService.duplicate(id);
      addToast({ message: "Project duplicated successfully.", type: "success" });
      navigate(`/projects/${cloned.id}`);
    } catch (err) {
      console.error(err);
      addToast({ message: "Failed to duplicate project.", type: "error" });
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6 space-y-4">
            <div className="skeleton skeleton-title w-1/4" />
            <div className="skeleton skeleton-text w-full" />
            <div className="skeleton skeleton-text w-full" />
            <div className="skeleton skeleton-text w-5/6" />
          </div>
          <div className="glass-card p-6 space-y-4">
            <div className="skeleton skeleton-title w-1/3" />
            <div className="skeleton skeleton-text w-full" />
            <div className="skeleton skeleton-text w-3/4" />
          </div>
        </div>
        <div className="lg:col-span-1 glass-card p-6 space-y-4">
          <div className="skeleton skeleton-title w-1/2" />
          <div className="skeleton skeleton-card w-full" style={{ height: "200px" }} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back & Actions header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white transition-colors"
        >
          <RiArrowLeftLine /> Back to Projects
        </Link>
        <div className="flex flex-wrap gap-2.5">
          <button onClick={() => setEditOpen(true)} className="btn btn-secondary btn-sm">
            <RiEditLine /> Edit
          </button>
          <button onClick={handleDuplicate} className="btn btn-secondary btn-sm">
            <RiFileCopy2Line /> Duplicate
          </button>
          {project.status !== "archived" && (
            <button onClick={handleArchive} className="btn btn-secondary btn-sm">
              <RiArchiveLine /> Archive
            </button>
          )}
          <button onClick={handleDelete} className="btn btn-secondary btn-sm border-rose-500/20 text-rose-400 hover:bg-rose-600 hover:text-white">
            <RiDeleteBinLine /> Delete
          </button>
        </div>
      </div>

      {/* Main Info Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side Info Details (col-span-2) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6 space-y-4">
            <div className="flex items-center gap-3">
              <span className={`badge ${STATUS_MAP[project.status]} text-xs uppercase font-bold`}>
                {project.status.replace("-", " ")}
              </span>
              <span className={`badge ${PRIORITY_MAP[project.priority]} text-xs uppercase font-bold`}>
                {project.priority} priority
              </span>
            </div>

            <h1 className="text-3xl font-extrabold text-white leading-tight">
              {project.title}
            </h1>

            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
              {project.description || "No description provided."}
            </p>

            {/* Start Date & Due Date Info */}
            <div className="grid grid-cols-2 gap-4 border-t border-gray-800/80 pt-4">
              <div className="flex items-center gap-2.5 text-xs text-gray-400">
                <RiCalendarEventLine className="text-indigo-400 text-lg" />
                <div>
                  <span className="block text-[10px] uppercase font-bold tracking-wider text-gray-500">Start Date</span>
                  <span className="font-semibold text-gray-200">
                    {project.startDate ? new Date(project.startDate).toLocaleDateString("en-US", { dateStyle: "long" }) : "—"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-gray-400">
                <RiCalendarEventLine className="text-indigo-400 text-lg" />
                <div>
                  <span className="block text-[10px] uppercase font-bold tracking-wider text-gray-500">Due Date</span>
                  <span className="font-semibold text-gray-200">
                    {project.dueDate ? new Date(project.dueDate).toLocaleDateString("en-US", { dateStyle: "long" }) : "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Subtasks Tracker (Nested project management feature) */}
          <div className="glass-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <RiTodoLine className="text-indigo-400" />
                Project Checklist
              </h2>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {subtasks.filter((t) => t.done).length} / {subtasks.length} Completed
              </span>
            </div>

            {/* Quick add subtask form */}
            <form onSubmit={handleAddSubtask} className="flex gap-2">
              <input
                type="text"
                placeholder="Add checklist item..."
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                className="input flex-1"
              />
              <button type="submit" className="btn btn-primary px-4">
                <RiAddLine /> Add
              </button>
            </form>

            {/* List of subtasks */}
            <div className="divide-y divide-gray-800/60 max-h-[300px] overflow-y-auto pr-1">
              {subtasks.length === 0 ? (
                <div className="text-center py-6 text-xs text-gray-500 font-bold uppercase tracking-wider">
                  Checklist is empty. Add tasks to calculate progress automatically!
                </div>
              ) : (
                subtasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between py-3 group">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleToggleSubtask(task.id)}
                        className={`h-5 w-5 rounded-full border flex items-center justify-center transition-all ${
                          task.done
                            ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                            : "border-gray-600 hover:border-indigo-400"
                        }`}
                      >
                        {task.done && <RiCheckboxCircleLine className="text-xs" />}
                      </button>
                      <span className={`text-sm ${task.done ? "line-through text-gray-500" : "text-gray-200"}`}>
                        {task.title}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteSubtask(task.id)}
                      className="p-1 text-gray-500 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <RiDeleteBin6Line />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Side Widgets (col-span-1) */}
        <div className="space-y-6">
          {/* Progress Card */}
          <div className="glass-card p-6 space-y-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <RiProgress3Line className="text-indigo-400 text-base" /> Project Progress
            </h3>

            {/* Big circular or simple slider */}
            <div className="py-6 flex flex-col items-center justify-center">
              <div className="relative h-32 w-32 flex items-center justify-center">
                {/* SVG circular track */}
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="52"
                    stroke="var(--color-bg-primary)"
                    strokeWidth="8"
                    fill="transparent"
                    className="stroke-gray-800"
                  />
                  <motion.circle
                    cx="64"
                    cy="64"
                    r="52"
                    stroke="url(#progress-gradient)"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 52}
                    initial={{ strokeDashoffset: 2 * Math.PI * 52 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 52 * (1 - project.progress / 100) }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                  <defs>
                    <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="var(--color-accent)" />
                      <stop offset="100%" stopColor="var(--color-violet)" />
                    </linearGradient>
                  </defs>
                </svg>
                {/* Centered progress text */}
                <div className="absolute text-center">
                  <span className="text-3xl font-extrabold text-white">{project.progress}%</span>
                  <span className="block text-[9px] uppercase tracking-wider text-gray-400 mt-0.5">Complete</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tags Widget */}
          {project.tags?.length > 0 && (
            <div className="glass-card p-6 space-y-3">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <RiPriceTag3Line className="text-indigo-400 text-base" /> Tags
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {project.tags.map((tag) => (
                  <span key={tag} className="badge badge-indigo text-xs py-1 px-2.5 font-semibold">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Technologies Widget */}
          {project.technologies?.length > 0 && (
            <div className="glass-card p-6 space-y-3">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <RiCpuLine className="text-indigo-400 text-base" /> Core Technologies
              </h3>
              <div className="flex flex-wrap gap-2">
                {project.technologies.map((tech) => (
                  <span key={tech} className="bg-indigo-500/10 text-indigo-300 text-xs font-semibold px-2.5 py-1 rounded">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Form Modal */}
      <ProjectForm
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        onSubmit={handleEditSubmit}
        initialData={project}
      />
    </div>
  );
}
