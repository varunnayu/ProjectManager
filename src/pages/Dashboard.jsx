import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiFolderLine,
  RiCheckboxCircleLine,
  RiFileTextLine,
  RiFlashlightLine,
  RiTaskLine,
  RiHistoryLine,
  RiCheckLine,
  RiBookmarkLine,
} from "react-icons/ri";
import { where } from "firebase/firestore";
import StatCard from "../components/StatCard";
import { useAuth } from "../context/AuthContext";
import { useCollection } from "../hooks/useCollection";
import { TaskService } from "../services/taskService";

export default function Dashboard() {
  const { user } = useAuth();
  const uid = user?.uid;

  // --- Real-time Data from Firebase ---
  const { data: projects = [] } = useCollection("projects", uid ? [where("userId", "==", uid)] : [], "updatedAt", [uid]);
  const { data: tasks = [] } = useCollection("tasks", uid ? [where("userId", "==", uid)] : [], "createdAt", [uid]);
  const { data: notes = [] } = useCollection("notes", uid ? [where("userId", "==", uid)] : [], "createdAt", [uid]);
  const { data: logs = [] } = useCollection("dev_logs", uid ? [where("userId", "==", uid)] : [], "createdAt", [uid]);

  // --- Handlers ---
  const toggleTask = async (task) => {
    const nextStatus = task.status === "done" ? "todo" : "done";
    await TaskService.update(task.id, { status: nextStatus });
  };

  // --- Dynamic Stats calculation ---
  const totalProjects = projects.length;
  const activeProjects = projects.filter((p) => p.status === "active" || p.status === "in-progress" || p.status === "planning").length;
  const completedProjects = projects.filter((p) => p.status === "completed" || p.progress === 100).length;
  const pendingTasks = tasks.filter((t) => t.status !== "done").length;
  const totalDocuments = notes.length;

  const STATS_DATA = [
    {
      icon: <RiFolderLine />,
      value: totalProjects,
      label: "Projects Hub",
      to: "/projects",
      accentColor: "#6366f1",
      iconBg: "rgba(255, 255, 255, 0.08)",
      iconColor: "#ffffff",
    },
    {
      icon: <RiTaskLine />,
      value: pendingTasks,
      label: "Task Board",
      to: "/tasks",
      accentColor: "#f59e0b",
      iconBg: "rgba(255, 255, 255, 0.08)",
      iconColor: "#ffffff",
    },
    {
      icon: <RiFileTextLine />,
      value: totalDocuments,
      label: "Doc Vault",
      to: "/notes",
      accentColor: "#3b82f6",
      iconBg: "rgba(255, 255, 255, 0.08)",
      iconColor: "#ffffff",
    },
    {
      icon: <RiHistoryLine />,
      value: logs.length,
      label: "Activity Logs",
      to: "/logs",
      accentColor: "#10b981",
      iconBg: "rgba(255, 255, 255, 0.08)",
      iconColor: "#ffffff",
    },
  ];

  // Map Dev Logs to Activity Feed
  const activities = useMemo(() => {
    return logs.slice(0, 5).map(log => {
      let timeString = "";
      if (log.createdAt && log.createdAt.toDate) {
        timeString = log.createdAt.toDate().toLocaleDateString();
      } else if (log.date) {
        timeString = log.date;
      }
      return {
        id: log.id,
        text: log.completedWork || `Dev log for ${log.projectTitle || "Project"}`,
        time: timeString || "Recently",
        type: "log"
      };
    });
  }, [logs]);

  const statusBadge = (status) => {
    const map = {
      "in-progress": { label: "In Progress", cls: "bg-amber-500/10 border-amber-500/25 text-amber-400" },
      "completed": { label: "Completed", cls: "bg-emerald-500/10 border-emerald-500/25 text-emerald-400" },
      "planning": { label: "Planning", cls: "bg-indigo-500/10 border-indigo-500/25 text-indigo-400" },
      "active": { label: "Active", cls: "bg-blue-500/10 border-blue-500/25 text-blue-400" },
    };
    const cfg = map[status] || { label: status, cls: "bg-gray-500/10 border-gray-500/25 text-gray-400" };
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${cfg.cls} capitalize`}>
        {cfg.label}
      </span>
    );
  };

  const priorityBadge = (priority) => {
    const map = {
      high: "bg-rose-500/10 border-rose-500/20 text-rose-400",
      urgent: "bg-rose-500/10 border-rose-500/20 text-rose-400",
      medium: "bg-amber-500/10 border-amber-500/20 text-amber-400",
      low: "bg-indigo-500/10 border-indigo-500/20 text-indigo-400",
    };
    const key = (priority || "").toLowerCase();
    return (
      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${map[key] || map.low}`}>
        {priority || "Low"}
      </span>
    );
  };

  const activityIcon = (type) => {
    const icons = {
      project: { icon: <RiFolderLine />, bg: "bg-indigo-500/15 text-indigo-400" },
      task: { icon: <RiTaskLine />, bg: "bg-emerald-500/15 text-emerald-400" },
      note: { icon: <RiFileTextLine />, bg: "bg-blue-500/15 text-blue-400" },
      resource: { icon: <RiBookmarkLine />, bg: "bg-violet-500/15 text-violet-400" },
      log: { icon: <RiHistoryLine />, bg: "bg-rose-500/15 text-rose-400" },
    };
    const cfg = icons[type] || icons.log;
    return (
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-base ${cfg.bg}`}>
        {cfg.icon}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-8">
      {/* ─── Page Header ─── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-white tracking-tight leading-tight">
            Welcome back, {user?.displayName || "User"}! 👋
          </h1>
          <p className="text-base sm:text-lg text-slate-400 mt-1.5 font-medium">
            Jump back in or review your recent activity below.
          </p>
        </div>
        <div className="flex items-center gap-2 pb-1 flex-shrink-0">
          <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" style={{ boxShadow: "0 0 8px #10b981" }} />
          <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest">
            Live Syncing
          </span>
        </div>
      </div>

      {/* ─── Quick Launch Navigation Tiles ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {STATS_DATA.map((stat, i) => (
          <StatCard key={stat.label} {...stat} index={i} />
        ))}
      </div>

      {/* ─── Widget Grid ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ── Recent Projects ── */}
        <section className="glass-card flex flex-col min-h-[350px]">
          <div className="flex items-center justify-between px-6 pt-5 pb-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Recent Projects</h2>
            <Link to="/projects" className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors">View all</Link>
          </div>

          <div className="flex-1 overflow-y-auto px-5 pb-5 custom-scrollbar flex flex-col gap-3">
            {projects.length === 0 && (
              <p className="text-sm text-slate-500 text-center mt-10">No projects found.</p>
            )}
            {projects.slice(0, 3).map((project) => (
              <div
                key={project.id}
                className="rounded-xl p-4 border transition-all duration-200 hover:border-indigo-500/25 group"
                style={{ background: "rgba(15, 23, 42, 0.4)", borderColor: "var(--color-border)" }}
              >
                <div className="flex justify-between items-start gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <span className="text-[13px] font-bold text-white group-hover:text-indigo-300 transition-colors truncate">{project.title}</span>
                      {statusBadge(project.status)}
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-1 leading-relaxed">
                      {project.description || "No description provided."}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-white flex-shrink-0">{project.progress || 0}%</span>
                </div>

                {/* Progress bar */}
                <div className="h-[6px] w-full rounded-full overflow-hidden" style={{ background: "rgba(15, 23, 42, 0.6)", border: "1px solid rgba(99, 102, 241, 0.1)" }}>
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500"
                    style={{ width: `${project.progress || 0}%` }}
                  />
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {project.tags?.map((tag) => (
                    <span key={tag} className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/8 text-indigo-300 border border-indigo-500/15">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="px-6 py-3 border-t border-indigo-500/10 flex justify-center">
            <Link to="/projects" className="text-xs font-bold text-slate-500 hover:text-indigo-400 transition-colors flex items-center gap-1.5">
              View all projects →
            </Link>
          </div>
        </section>

        {/* ── Recent Tasks ── */}
        <section className="glass-card flex flex-col min-h-[350px]">
          <div className="flex items-center justify-between px-6 pt-5 pb-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Recent Tasks</h2>
            <Link to="/tasks" className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors">View all</Link>
          </div>

          <div className="flex-1 overflow-y-auto px-5 pb-5 custom-scrollbar">
            {tasks.length === 0 && (
              <p className="text-sm text-slate-500 text-center mt-10">No tasks found.</p>
            )}
            <AnimatePresence initial={false}>
              {tasks.slice(0, 5).map((task) => {
                const isDone = task.status === "done";
                return (
                  <motion.div
                    key={task.id}
                    layoutId={`dashboard-task-${task.id}`}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between py-3 border-b gap-3 group transition-colors"
                    style={{ borderColor: "rgba(99, 102, 241, 0.08)" }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        type="button"
                        onClick={() => toggleTask(task)}
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 cursor-pointer ${
                          isDone
                            ? "bg-emerald-500 border-emerald-500 text-white"
                            : "border-slate-600 group-hover:border-indigo-400 text-transparent"
                        }`}
                      >
                        {isDone && <RiCheckLine className="text-[11px]" />}
                      </button>
                      <span className={`text-[13px] font-semibold truncate transition-colors ${isDone ? "line-through text-slate-500" : "text-slate-200 group-hover:text-white"}`}>
                        {task.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      {priorityBadge(task.priority)}
                      <span className="text-[11px] text-slate-500 font-semibold hidden sm:inline">{task.dueDate}</span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          <div className="px-6 py-3 border-t border-indigo-500/10 flex justify-center">
            <Link to="/tasks" className="text-xs font-bold text-slate-500 hover:text-indigo-400 transition-colors flex items-center gap-1.5">
              View all tasks →
            </Link>
          </div>
        </section>

        {/* ── Activity Feed ── */}
        <section className="glass-card flex flex-col min-h-[350px]">
          <div className="flex items-center justify-between px-6 pt-5 pb-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Activity Feed (Logs)</h2>
            <Link to="/logs" className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors">View all</Link>
          </div>

          <div className="flex-1 overflow-y-auto px-5 pb-5 custom-scrollbar flex flex-col gap-4">
            {activities.length === 0 && (
              <p className="text-sm text-slate-500 text-center mt-10">No recent logs found.</p>
            )}
            {activities.map((activity) => (
              <div key={activity.id} className="flex gap-3 items-start group">
                {activityIcon(activity.type)}
                <div className="flex-1 min-w-0 pt-0.5">
                  <p className="text-[12px] text-slate-300 font-semibold leading-snug group-hover:text-white transition-colors">
                    {activity.text}
                  </p>
                  <span className="text-[10px] text-slate-500 block mt-0.5 font-medium">{activity.time}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="px-6 py-3 border-t border-indigo-500/10 flex justify-center">
            <Link to="/logs" className="text-xs font-bold text-slate-500 hover:text-indigo-400 transition-colors flex items-center gap-1.5">
              View all logs →
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}