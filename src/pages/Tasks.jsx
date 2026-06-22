import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiAddLine,
  RiSearchLine,
  RiFilter3Line,
  RiCheckboxCircleLine,
  RiCheckboxBlankCircleLine,
  RiCalendarLine,
  RiFolderLine,
  RiFolder2Line,
  RiEditLine,
  RiDeleteBinLine,
  RiListCheck,
  RiKanbanView,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiAlertLine,
} from "react-icons/ri";
import { TaskService } from "../services/taskService";
import { ProjectService } from "../services/projectService";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import TaskForm from "../components/TaskForm";
import { SkeletonGrid } from "../components/Skeleton";

const PRIORITY_BADGES = {
  low: "badge-emerald",
  medium: "badge-amber",
  high: "badge-rose",
  urgent: "badge-rose animate-pulse",
};

const COLUMNS = [
  { id: "todo", title: "To Do", borderClass: "border-indigo-500/20", textClass: "text-indigo-400" },
  { id: "in-progress", title: "In Progress", borderClass: "border-amber-500/20", textClass: "text-amber-400" },
  { id: "done", title: "Completed", borderClass: "border-emerald-500/20", textClass: "text-emerald-400" },
];

export default function Tasks() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // View Mode: "list" | "kanban"
  const [viewMode, setViewMode] = useState("kanban");

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all"); // Only active in list view

  // Form Modal States
  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Fetch all tasks and projects
  const fetchData = async () => {
    try {
      setLoading(true);
      const uid = user?.uid || "mock-user-123";
      const tasksData = await TaskService.getAllForUser(uid);
      const projectsData = await ProjectService.getAllForUser(uid);
      
      setTasks(tasksData);
      setProjects(projectsData);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch task metrics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // --- Task Operations ---
  const handleCreateOrUpdate = async (taskPayload) => {
    try {
      if (editingTask) {
        // Update
        await TaskService.update(editingTask.id, taskPayload);
        addToast({ message: "Task details updated.", type: "success" });
      } else {
        // Create
        await TaskService.create(taskPayload, user?.uid || "mock-user-123");
        addToast({ message: "New task added successfully.", type: "success" });
      }
      setFormOpen(false);
      setEditingTask(null);
      fetchData();
    } catch (err) {
      console.error(err);
      addToast({ message: "Failed to save task.", type: "error" });
    }
  };

  const handleToggleComplete = async (task) => {
    try {
      const nextStatus = task.status === "done" ? "todo" : "done";
      await TaskService.update(task.id, { status: nextStatus });
      addToast({
        message: nextStatus === "done" ? "Task completed! 🎉" : "Task reopened.",
        type: "success",
      });
      fetchData();
    } catch (err) {
      console.error(err);
      addToast({ message: "Failed to toggle status.", type: "error" });
    }
  };

  const handleDelete = async (taskId, taskTitle) => {
    if (confirm(`Delete task "${taskTitle}"?`)) {
      try {
        await TaskService.delete(taskId);
        addToast({ message: "Task removed.", type: "success" });
        fetchData();
      } catch (err) {
        console.error(err);
        addToast({ message: "Failed to delete task.", type: "error" });
      }
    }
  };

  // Move task to columns (Kanban Board helpers)
  const handleMoveStatus = async (task, direction) => {
    const colOrder = ["todo", "in-progress", "done"];
    const currentStatus = task.status === "in-review" ? "in-progress" : task.status;
    const currentIndex = colOrder.indexOf(currentStatus);
    let nextIndex = currentIndex + direction;

    if (nextIndex >= 0 && nextIndex < colOrder.length) {
      const nextCol = colOrder[nextIndex];
      try {
        await TaskService.update(task.id, { status: nextCol });
        fetchData();
      } catch (err) {
        console.error(err);
        addToast({ message: "Failed to move status.", type: "error" });
      }
    }
  };

  // --- Filtering & Searching computation ---
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // 1. Search text
      if (searchTerm.trim() !== "") {
        const query = searchTerm.toLowerCase().trim();
        const matchesTitle = task.title.toLowerCase().includes(query);
        const matchesDesc = task.description?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc) return false;
      }

      // 2. Priority Filter
      if (priorityFilter !== "all" && task.priority !== priorityFilter) {
        return false;
      }

      // 3. Project Filter
      if (projectFilter !== "all" && task.projectId !== projectFilter) {
        return false;
      }

      // 4. Status Filter (Only applicable in List view)
      if (viewMode === "list" && statusFilter !== "all") {
        if (statusFilter === "in-progress") {
          if (task.status !== "in-progress" && task.status !== "in-review") return false;
        } else if (task.status !== statusFilter) {
          return false;
        }
      }

      return true;
    });
  }, [tasks, searchTerm, priorityFilter, projectFilter, statusFilter, viewMode]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="page-header flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="page-title text-3xl font-extrabold tracking-tight">Tasks</h1>
          <p className="page-subtitle text-sm text-gray-400">
            Organize priorities, manage sprint checklists, and use Kanban pipelines.
          </p>
        </div>
        <div className="flex gap-2">
          {/* View Toggles */}
          <div className="bg-gray-950 p-0.5 rounded-lg border border-gray-800 flex">
            <button
              onClick={() => setViewMode("kanban")}
              className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === "kanban" ? "bg-indigo-600 text-white shadow" : "text-gray-400 hover:text-white"
              }`}
              title="Kanban Board View"
            >
              <RiKanbanView />
              Board
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === "list" ? "bg-indigo-600 text-white shadow" : "text-gray-400 hover:text-white"
              }`}
              title="Detailed Checklist View"
            >
              <RiListCheck />
              List
            </button>
          </div>

          <button
            onClick={() => {
              setEditingTask(null);
              setFormOpen(true);
            }}
            className="btn btn-primary"
            id="btn-create-task"
          >
            <RiAddLine className="text-lg" />
            New Task
          </button>
        </div>
      </div>

      {/* Control Bar (Filters & Search) */}
      <div className="glass-card p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="topbar-search w-full md:max-w-md" style={{ background: "rgba(0, 0, 0, 0.2)" }}>
          <RiSearchLine className="text-gray-500" />
          <input
            type="search"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent outline-none border-none text-sm text-white"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap gap-3 w-full md:w-auto items-center">
          <div className="flex items-center gap-1.5 text-xs text-gray-400 font-bold uppercase tracking-wider">
            <RiFilter3Line /> Filters:
          </div>

          {/* Project filter */}
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="bg-gray-900/60 border border-gray-800 text-xs font-semibold text-gray-300 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 transition-colors"
          >
            <option value="all">All Projects</option>
            <option value="all-general">General Tasks</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>

          {/* Priority filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-gray-900/60 border border-gray-800 text-xs font-semibold text-gray-300 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 transition-colors"
          >
            <option value="all">All Priorities</option>
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
            <option value="urgent">Urgent</option>
          </select>

          {/* Status filter (Only visible in list view) */}
          {viewMode === "list" && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-gray-900/60 border border-gray-800 text-xs font-semibold text-gray-300 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 transition-colors"
            >
              <option value="all">All Columns</option>
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Completed</option>
            </select>
          )}
        </div>
      </div>

      {/* Main Workspace Display */}
      {loading ? (
        <SkeletonGrid count={4} />
      ) : error ? (
        <div className="glass-card p-6 flex flex-col items-center justify-center text-center gap-3">
          <RiAlertLine className="text-3xl text-rose-500 animate-pulse" />
          <p className="text-sm text-gray-300">{error}</p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="empty-state glass-card py-16">
          <div className="empty-state-icon">
            <RiFolder2Line />
          </div>
          <h3 className="text-base font-bold text-gray-400 mb-1">No Tasks Found</h3>
          <p className="text-xs text-gray-500 max-w-xs mx-auto mb-6">
            Adjust your queries or filters, or add a new checklist item below to launch.
          </p>
          <button
            onClick={() => {
              setEditingTask(null);
              setFormOpen(true);
            }}
            className="btn btn-secondary btn-sm"
          >
            Add Checklist Task
          </button>
        </div>
      ) : viewMode === "list" ? (
        /* ================= LIST VIEW ================= */
        <div className="glass-card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-900/40 text-[10px] uppercase font-bold tracking-wider text-gray-400">
                  <th className="py-3 px-4 w-12 text-center">Done</th>
                  <th className="py-3 px-4">Task Details</th>
                  <th className="py-3 px-4">Project</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-900/60">
                {filteredTasks.map((task) => {
                  const isCompleted = task.status === "done";
                  return (
                    <motion.tr
                      key={task.id}
                      layout
                      className={`hover:bg-gray-900/10 transition-colors ${
                        isCompleted ? "opacity-60 bg-gray-950/20" : ""
                      }`}
                    >
                      {/* Checkbox cell */}
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => handleToggleComplete(task)}
                          className={`mx-auto h-5.5 w-5.5 rounded-full border flex items-center justify-center transition-all flex-shrink-0 ${
                            isCompleted
                              ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                              : "border-gray-700 hover:border-indigo-400 text-transparent"
                          }`}
                        >
                          <RiCheckboxCircleLine className="text-sm font-semibold text-emerald-400" />
                        </button>
                      </td>

                      {/* Task Details */}
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <h4
                            className={`text-sm font-bold leading-snug ${
                              isCompleted ? "line-through text-gray-500" : "text-white"
                            }`}
                          >
                            {task.title}
                          </h4>
                          {task.description && (
                            <p className="text-xs text-gray-400 leading-normal max-w-xl line-clamp-2">
                              {task.description}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Project */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 text-xs text-gray-300 font-semibold bg-gray-900/50 px-2.5 py-1 rounded-md border border-gray-800">
                          <RiFolderLine className="text-indigo-400" /> {task.projectTitle}
                        </span>
                      </td>

                      {/* Due Date */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {task.dueDate ? (
                          <span className="inline-flex items-center gap-1.5 text-xs text-gray-300 font-semibold bg-gray-900/50 px-2.5 py-1 rounded-md border border-gray-800">
                            <RiCalendarLine className="text-indigo-400" /> {task.dueDate}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-600">-</span>
                        )}
                      </td>

                      {/* Priority */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className={`badge text-[9px] uppercase font-bold tracking-wider ${PRIORITY_BADGES[task.priority]}`}>
                          {task.priority}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setEditingTask(task);
                              setFormOpen(true);
                            }}
                            className="p-1.5 rounded hover:bg-gray-900 border border-transparent hover:border-gray-800 text-gray-400 hover:text-white transition-colors"
                            title="Edit task details"
                          >
                            <RiEditLine className="text-sm" />
                          </button>
                          <button
                            onClick={() => handleDelete(task.id, task.title)}
                            className="p-1.5 rounded hover:bg-rose-950/20 border border-transparent hover:border-rose-900/30 text-gray-400 hover:text-rose-400 transition-colors"
                            title="Delete task"
                          >
                            <RiDeleteBinLine className="text-sm" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ================= KANBAN BOARD VIEW ================= */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch h-auto md:h-[calc(100vh-260px)] md:min-h-[550px] overflow-hidden pb-4">
          {COLUMNS.map((col) => {
            const colTasks = filteredTasks.filter((t) => col.id === "in-progress" ? (t.status === "in-progress" || t.status === "in-review") : (t.status === col.id));
            return (
              <div key={col.id} className="flex flex-col h-[500px] md:h-full overflow-hidden">
                {/* Column header */}
                <div className="flex-shrink-0 flex items-center justify-between border-b border-gray-900 pb-2 px-1 mb-3">
                  <h3 className={`text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 ${col.textClass}`}>
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {col.title}
                  </h3>
                  <span className="bg-gray-900/80 px-2 py-0.5 rounded text-[10px] font-bold text-gray-400 border border-gray-800/60">
                    {colTasks.length}
                  </span>
                </div>

                {/* Column task items box */}
                <div className={`flex-1 overflow-y-auto min-h-0 flex flex-col gap-3 p-3 rounded-xl bg-gray-950/20 border ${col.borderClass} custom-scrollbar`}>
                  {colTasks.length === 0 ? (
                    <div className="text-center py-12 text-[10px] font-semibold text-gray-600 uppercase tracking-wider border-2 border-dashed border-gray-900 rounded-lg">
                      Column is empty
                    </div>
                  ) : (
                    colTasks.map((task) => (
                      <motion.div
                        key={task.id}
                        layoutId={`board-task-${task.id}`}
                        whileHover={{ y: -2 }}
                        className="p-3.5 rounded-lg bg-gray-900/30 border border-gray-800/60 flex flex-col justify-between space-y-3 flex-shrink-0"
                      >
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-start gap-1">
                            <h4 className="text-xs font-bold text-white line-clamp-2 leading-tight">
                              {task.title}
                            </h4>
                            <span className={`badge text-[8px] uppercase tracking-wider font-extrabold ${PRIORITY_BADGES[task.priority]}`}>
                              {task.priority}
                            </span>
                          </div>
                          {task.description && (
                            <p className="text-[11px] text-gray-400 leading-normal line-clamp-2">{task.description}</p>
                          )}
                        </div>

                        {/* Card metadata row */}
                        <div className="space-y-1.5 pt-2 border-t border-gray-900/80 text-[10px] text-gray-500 font-semibold">
                          <div className="flex items-center gap-1">
                            <RiFolderLine className="text-indigo-400/80 flex-shrink-0" />
                            <span className="truncate">{task.projectTitle}</span>
                          </div>
                          {task.dueDate && (
                            <div className="flex items-center gap-1">
                              <RiCalendarLine className="text-indigo-400/80 flex-shrink-0" />
                              <span>Due: {task.dueDate}</span>
                            </div>
                          )}
                        </div>

                        {/* Move column controllers + Edit options */}
                        <div className="flex justify-between items-center pt-2 border-t border-gray-900/60">
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => {
                                setEditingTask(task);
                                setFormOpen(true);
                              }}
                              className="p-1 rounded bg-gray-950 hover:bg-gray-800 text-gray-500 hover:text-white transition-colors"
                              title="Edit"
                            >
                              <RiEditLine className="text-[11px]" />
                            </button>
                            <button
                              onClick={() => handleDelete(task.id, task.title)}
                              className="p-1 rounded bg-gray-950 hover:bg-rose-950/20 text-gray-500 hover:text-rose-400 transition-colors"
                              title="Delete"
                            >
                              <RiDeleteBinLine className="text-[11px]" />
                            </button>
                          </div>

                          {/* Arrows to move card across columns */}
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleMoveStatus(task, -1)}
                              disabled={task.status === "todo"}
                              className="p-1.5 rounded bg-gray-950 hover:bg-indigo-600 hover:text-white disabled:opacity-20 disabled:hover:bg-gray-950 disabled:hover:text-gray-500 text-gray-400 transition-colors"
                              title="Move Left"
                            >
                              <RiArrowLeftSLine className="text-xs" />
                            </button>
                            <button
                              onClick={() => handleMoveStatus(task, 1)}
                              disabled={task.status === "done"}
                              className="p-1.5 rounded bg-gray-950 hover:bg-indigo-600 hover:text-white disabled:opacity-20 disabled:hover:bg-gray-950 disabled:hover:text-gray-500 text-gray-400 transition-colors"
                              title="Move Right"
                            >
                              <RiArrowRightSLine className="text-xs" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Task Modal Form */}
      <TaskForm
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleCreateOrUpdate}
        projects={projects}
        initialData={editingTask}
      />
    </div>
  );
}
