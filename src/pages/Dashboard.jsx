import { useState } from "react";
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
import StatCard from "../components/StatCard";

export default function Dashboard() {
  // --- Live Interactive State (Aligned with Screenshot) ---
  const [projects, setProjects] = useState([
    {
      id: 1,
      title: "AI Content Generator",
      description: "Build a full-stack AI-powered content platform with GPT-4 integration.",
      progress: 72,
      status: "active",
      tags: ["React", "AI", "Node.js"],
    },
    {
      id: 2,
      title: "E-commerce Dashboard",
      description: "Admin dashboard for products and analytics.",
      progress: 45,
      status: "in-progress",
      tags: ["Vue", "Firebase"],
    },
    {
      id: 3,
      title: "Mobile Banking App",
      description: "Cross-platform mobile banking app with biometric auth.",
      progress: 100,
      status: "completed",
      tags: ["React Native"],
    },
  ]);

  const [tasks, setTasks] = useState([
    { id: 1, title: "Set up CI/CD pipeline", done: false, priority: "High", dueDate: "Jun 18" },
    { id: 2, title: "Write GitHub Actions workflow", done: false, priority: "High", dueDate: "Jun 18" },
    { id: 3, title: "Write Firebase security rules", done: false, priority: "High", dueDate: "Jun 20" },
    { id: 4, title: "Design onboarding user flow", done: false, priority: "Medium", dueDate: "Jun 22" },
    { id: 5, title: "Improve dashboard charts", done: false, priority: "Low", dueDate: "Jun 25" },
  ]);

  const [activities, setActivities] = useState([
    { id: 1, text: 'Project "AI Content Generator" updated', time: "2 hours ago", type: "project" },
    { id: 2, text: 'Task "Set up CI/CD pipeline" created', time: "3 hours ago", type: "task" },
    { id: 3, text: 'Note "Project Requirements" updated', time: "5 hours ago", type: "note" },
    { id: 4, text: 'Resource "Architecture.pdf" uploaded', time: "1 day ago", type: "resource" },
    { id: 5, text: 'Dev log for Jun 15 created', time: "1 day ago", type: "log" },
  ]);

  // --- Handlers for interactive widgets ---
  const toggleTask = (taskId) => {
    setTasks(
      tasks.map((task) => {
        if (task.id === taskId) {
          const nextState = !task.done;
          // Log to Activity Feed
          const newAct = {
            id: Date.now(),
            text: nextState ? `Task "${task.title}" completed` : `Task "${task.title}" reopened`,
            time: "Just now",
            type: "task",
          };
          setActivities([newAct, ...activities]);
          return { ...task, done: nextState };
        }
        return task;
      })
    );
  };

  // --- Dynamic Stats calculation ---
  const totalProjects = projects.length;
  const activeProjects = projects.filter((p) => p.status === "active" || p.status === "in-progress").length;
  const completedProjects = projects.filter((p) => p.status === "completed" || p.progress === 100).length;
  const pendingTasks = tasks.filter((t) => !t.done).length;

  const STATS_DATA = [
    {
      icon: <RiFolderLine />,
      value: totalProjects,
      label: "Total Projects",
      trend: "2 this month",
      trendUp: true,
      accentColor: "#6366f1",
      iconBg: "rgba(99, 102, 241, 0.12)",
      iconColor: "#818cf8",
    },
    {
      icon: <RiFlashlightLine />,
      value: activeProjects,
      label: "Active Projects",
      trend: "1 this week",
      trendUp: true,
      accentColor: "#06b6d4",
      iconBg: "rgba(6, 182, 212, 0.12)",
      iconColor: "#22d3ee",
    },
    {
      icon: <RiCheckboxCircleLine />,
      value: completedProjects,
      label: "Completed Projects",
      trend: "4 this month",
      trendUp: true,
      accentColor: "#10b981",
      iconBg: "rgba(16, 185, 129, 0.12)",
      iconColor: "#34d399",
    },
    {
      icon: <RiTaskLine />,
      value: pendingTasks,
      label: "Pending Tasks",
      trend: "2 this week",
      trendUp: true,
      accentColor: "#f59e0b",
      iconBg: "rgba(245, 158, 11, 0.12)",
      iconColor: "#fbbf24",
    },
    {
      icon: <RiFileTextLine />,
      value: 12,
      label: "Total Documents",
      trend: "5 this month",
      trendUp: true,
      accentColor: "#3b82f6",
      iconBg: "rgba(59, 130, 246, 0.12)",
      iconColor: "#60a5fa",
    },
  ];

  const statusBadge = (status) => {
    const map = {
      "in-progress": { label: "In Progress", cls: "bg-amber-500/10 border-amber-500/25 text-amber-400" },
      "completed": { label: "Completed", cls: "bg-emerald-500/10 border-emerald-500/25 text-emerald-400" },
    };
    const cfg = map[status];
    if (!cfg) return null;
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${cfg.cls}`}>
        {cfg.label}
      </span>
    );
  };

  const priorityBadge = (priority) => {
    const map = {
      High: "bg-rose-500/10 border-rose-500/20 text-rose-400",
      Medium: "bg-amber-500/10 border-amber-500/20 text-amber-400",
      Low: "bg-indigo-500/10 border-indigo-500/20 text-indigo-400",
    };
    return (
      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${map[priority] || map.Low}`}>
        {priority}
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
            Welcome back, Varun! 👋
          </h1>
          <p className="text-base sm:text-lg text-slate-400 mt-1.5 font-medium">
            Here's what's happening with your projects today.
          </p>
        </div>
        <div className="flex items-center gap-2 pb-1 flex-shrink-0">
          <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" style={{ boxShadow: "0 0 8px #10b981" }} />
          <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest">
            Live Syncing
          </span>
        </div>
      </div>

      {/* ─── Stat Cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
        {STATS_DATA.map((stat, i) => (
          <StatCard key={stat.label} {...stat} index={i} />
        ))}
      </div>

      {/* ─── Widget Grid ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ── Recent Projects ── */}
        <section className="glass-card flex flex-col" style={{ minHeight: 420 }}>
          <div className="flex items-center justify-between px-6 pt-5 pb-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Recent Projects</h2>
            <Link to="/projects" className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors">View all</Link>
          </div>

          <div className="flex-1 overflow-y-auto px-5 pb-5 custom-scrollbar flex flex-col gap-3">
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
                      {project.description}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-white flex-shrink-0">{project.progress}%</span>
                </div>

                {/* Progress bar */}
                <div className="h-[6px] w-full rounded-full overflow-hidden" style={{ background: "rgba(15, 23, 42, 0.6)", border: "1px solid rgba(99, 102, 241, 0.1)" }}>
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500"
                    style={{ width: `${project.progress}%` }}
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
        <section className="glass-card flex flex-col" style={{ minHeight: 420 }}>
          <div className="flex items-center justify-between px-6 pt-5 pb-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Recent Tasks</h2>
            <Link to="/tasks" className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors">View all</Link>
          </div>

          <div className="flex-1 overflow-y-auto px-5 pb-5 custom-scrollbar">
            <AnimatePresence initial={false}>
              {tasks.slice(0, 5).map((task) => (
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
                      onClick={() => toggleTask(task.id)}
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 cursor-pointer ${
                        task.done
                          ? "bg-emerald-500 border-emerald-500 text-white"
                          : "border-slate-600 group-hover:border-indigo-400 text-transparent"
                      }`}
                    >
                      {task.done && <RiCheckLine className="text-[11px]" />}
                    </button>
                    <span className={`text-[13px] font-semibold truncate transition-colors ${task.done ? "line-through text-slate-500" : "text-slate-200 group-hover:text-white"}`}>
                      {task.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    {priorityBadge(task.priority)}
                    <span className="text-[11px] text-slate-500 font-semibold hidden sm:inline">{task.dueDate}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="px-6 py-3 border-t border-indigo-500/10 flex justify-center">
            <Link to="/tasks" className="text-xs font-bold text-slate-500 hover:text-indigo-400 transition-colors flex items-center gap-1.5">
              View all tasks →
            </Link>
          </div>
        </section>

        {/* ── Activity Feed ── */}
        <section className="glass-card flex flex-col" style={{ minHeight: 420 }}>
          <div className="flex items-center justify-between px-6 pt-5 pb-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Activity Feed</h2>
            <Link to="/logs" className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors">View all</Link>
          </div>

          <div className="flex-1 overflow-y-auto px-5 pb-5 custom-scrollbar flex flex-col gap-4">
            {activities.slice(0, 5).map((activity) => (
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
              View all activity →
            </Link>
          </div>
        </section>
      </div>

      {/* ─── Daily Note ─── */}
      <section className="glass-card relative overflow-hidden" style={{ minHeight: 160 }}>
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-violet-500" />
        <div className="p-6 sm:p-8 flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <RiFileTextLine className="text-indigo-400 text-lg" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Daily Note</h2>
              <span className="text-[10px] text-slate-600 font-medium">✏️</span>
            </div>
            <p className="text-slate-300 text-[14px] leading-relaxed max-w-4xl font-medium outline-none" contentEditable suppressContentEditableWarning>
              Focus on completing the CI/CD pipeline and integrating analytics.{"\n"}
              Review project requirements with the team in the afternoon.
            </p>
          </div>
          <div className="flex justify-end mt-4">
            <span className="text-[10px] font-bold text-slate-600">Updated just now</span>
          </div>
        </div>
      </section>
    </div>
  );
}