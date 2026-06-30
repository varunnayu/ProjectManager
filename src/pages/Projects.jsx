import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiAddLine,
  RiSearchLine,
  RiFilter3Line,
  RiFolderLine,
  RiAlertLine,
  RiLayoutGridLine,
  RiListUnordered,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiFlashlightLine,
  RiCheckboxCircleLine,
  RiTimeLine,
} from "react-icons/ri";
import { ProjectService } from "../services/projectService";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useConfirm } from "../context/ConfirmContext";
import ProjectCard from "../components/ProjectCard";
import ProjectForm from "../components/ProjectForm";
import { SkeletonGrid } from "../components/Skeleton";

export default function Projects() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const { confirm } = useConfirm();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Layout mode
  const [viewMode, setViewMode] = useState("grid");

  // Tab filter: all, active, completed, archived
  const [activeTab, setActiveTab] = useState("all");

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [techFilter, setTechFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  // Form Modal state
  const [formOpen, setFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  // Fetch projects from service
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await ProjectService.getAllForUser(user?.uid || "mock-user-123");
      setProjects(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching projects:", err);
      setError("Failed to load projects. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [user]);

  // Connect Topbar "+ Create Project" button click custom event
  useEffect(() => {
    const handleCreateEvent = () => {
      setEditingProject(null);
      setFormOpen(true);
    };
    window.addEventListener("create-projects", handleCreateEvent);
    return () => window.removeEventListener("create-projects", handleCreateEvent);
  }, []);

  // --- CRUD Handlers ---
  const handleCreateOrUpdate = async (projectData) => {
    try {
      if (editingProject) {
        // Update
        await ProjectService.update(editingProject.id, projectData);
        addToast({ message: "Project updated successfully!", type: "success" });
      } else {
        // Create
        await ProjectService.create(projectData, user?.uid || "mock-user-123");
        addToast({ message: "New project created successfully!", type: "success" });
      }
      setFormOpen(false);
      setEditingProject(null);
      fetchProjects();
    } catch (err) {
      console.error("Error saving project:", err);
      addToast({ message: "Failed to save project. Please try again.", type: "error" });
    }
  };

  const handleDelete = async (projectId, projectTitle) => {
    if (await confirm(`Are you sure you want to permanently delete "${projectTitle}"?`)) {
      try {
        await ProjectService.delete(projectId);
        addToast({ message: "Project deleted successfully.", type: "success" });
        fetchProjects();
      } catch (err) {
        console.error("Error deleting project:", err);
        addToast({ message: "Failed to delete project.", type: "error" });
      }
    }
  };

  const handleArchive = async (projectId) => {
    try {
      await ProjectService.archive(projectId);
      addToast({ message: "Project archived successfully.", type: "success" });
      fetchProjects();
    } catch (err) {
      console.error("Error archiving project:", err);
      addToast({ message: "Failed to archive project.", type: "error" });
    }
  };

  const handleDuplicate = async (projectId) => {
    try {
      await ProjectService.duplicate(projectId);
      addToast({ message: "Project duplicated successfully.", type: "success" });
      fetchProjects();
    } catch (err) {
      console.error("Error duplicating project:", err);
      addToast({ message: "Failed to duplicate project.", type: "error" });
    }
  };

  // --- KPI Calculation ---
  const totalCount = projects.length;
  const activeCount = projects.filter(
    (p) => p.status === "active" || p.status === "in-progress"
  ).length;
  const completedCount = projects.filter((p) => p.status === "completed").length;
  const onHoldCount = projects.filter(
    (p) => p.status === "on-hold" || p.status === "planning"
  ).length;

  // --- Dynamic Technologies List ---
  const allTechnologies = useMemo(() => {
    const techs = new Set();
    projects.forEach((p) => {
      p.technologies?.forEach((t) => techs.add(t));
      p.tags?.forEach((t) => techs.add(t));
    });
    return ["all", ...Array.from(techs)];
  }, [projects]);

  // --- Filter and Sort Pipeline ---
  const filteredProjects = useMemo(() => {
    // 1. Filter by Main Horizontal Tab
    let items = projects;
    if (activeTab === "active") {
      items = projects.filter((p) => p.status === "active" || p.status === "in-progress");
    } else if (activeTab === "completed") {
      items = projects.filter((p) => p.status === "completed");
    } else if (activeTab === "archived") {
      items = projects.filter((p) => p.status === "archived");
    }

    // 2. Filter by dropdown selects & search query
    return items.filter((project) => {
      // Status Filter
      if (statusFilter !== "all" && project.status !== statusFilter) {
        return false;
      }
      // Priority Filter
      if (priorityFilter !== "all" && project.priority !== priorityFilter) {
        return false;
      }
      // Technology/Tag Filter
      if (techFilter !== "all") {
        const lowerTech = techFilter.toLowerCase();
        const matchesTech = project.technologies?.some((t) => t.toLowerCase() === lowerTech);
        const matchesTag = project.tags?.some((t) => t.toLowerCase() === lowerTech);
        if (!matchesTech && !matchesTag) {
          return false;
        }
      }
      // Text Search
      if (searchTerm.trim() !== "") {
        const queryText = searchTerm.toLowerCase().trim();
        const matchesTitle = project.title.toLowerCase().includes(queryText);
        const matchesDesc = project.description?.toLowerCase().includes(queryText);
        const matchesTags = project.tags?.some((t) => t.toLowerCase().includes(queryText));
        const matchesTech = project.technologies?.some((t) => t.toLowerCase().includes(queryText));
        return matchesTitle || matchesDesc || matchesTags || matchesTech;
      }
      return true;
    });
  }, [projects, activeTab, searchTerm, statusFilter, priorityFilter, techFilter]);

  // --- Sort Pipeline ---
  const sortedProjects = useMemo(() => {
    const items = [...filteredProjects];
    if (sortBy === "newest") {
      items.sort(
        (a, b) => new Date(b.createdAt || b.startDate || 0) - new Date(a.createdAt || a.startDate || 0)
      );
    } else if (sortBy === "oldest") {
      items.sort(
        (a, b) => new Date(a.createdAt || a.startDate || 0) - new Date(b.createdAt || b.startDate || 0)
      );
    } else if (sortBy === "alphabetical") {
      items.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === "progress") {
      items.sort((a, b) => b.progress - a.progress);
    }
    return items;
  }, [filteredProjects, sortBy]);

  // --- Pagination Pipeline ---
  const totalPages = Math.ceil(sortedProjects.length / pageSize) || 1;
  const paginatedProjects = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedProjects.slice(startIndex, startIndex + pageSize);
  }, [sortedProjects, currentPage, pageSize]);

  const showingStart = sortedProjects.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const showingEnd = Math.min(currentPage * pageSize, sortedProjects.length);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 pb-2">
        <div className="flex items-center justify-between xl:justify-start w-full xl:w-auto">
          <div>
            <h1 className="page-title text-3xl font-extrabold tracking-tight">Projects</h1>
            <p className="page-subtitle text-sm text-gray-400">
              Organize and track all your projects in one place.
            </p>
          </div>
        </div>

        {/* Action Button & KPI Mini Cards Row */}
        <div className="flex flex-wrap gap-4 items-center w-full xl:w-auto justify-between xl:justify-end">
          <button
            onClick={() => {
              setEditingProject(null);
              setFormOpen(true);
            }}
            className="btn btn-primary flex items-center gap-1"
            id="btn-create-project"
          >
            <RiAddLine className="text-lg" />
            New Project
          </button>

        {/* KPI Mini Cards Row */}
        <div className="flex flex-wrap gap-4 items-center">
          {/* Total Projects Card */}
          <div className="bg-slate-900/40 border border-slate-800/80 dark:bg-slate-950/40 dark:border-slate-900 rounded-2xl p-3 px-4 flex items-center gap-3 min-w-[120px] lg:min-w-[140px] shadow-sm">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-lg">
              <RiFolderLine />
            </div>
            <div>
              <div className="text-[10px] font-bold text-gray-400 uppercase leading-none">Total Projects</div>
              <div className="text-lg font-extrabold text-white mt-1.5 leading-none">{totalCount}</div>
            </div>
          </div>

          {/* Active Card */}
          <div className="bg-slate-900/40 border border-slate-800/80 dark:bg-slate-950/40 dark:border-slate-900 rounded-2xl p-3 px-4 flex items-center gap-3 min-w-[120px] lg:min-w-[140px] shadow-sm">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center text-lg">
              <RiFlashlightLine />
            </div>
            <div>
              <div className="text-[10px] font-bold text-gray-400 uppercase leading-none">Active</div>
              <div className="text-lg font-extrabold text-white mt-1.5 leading-none">{activeCount}</div>
            </div>
          </div>

          {/* Completed Card */}
          <div className="bg-slate-900/40 border border-slate-800/80 dark:bg-slate-950/40 dark:border-slate-900 rounded-2xl p-3 px-4 flex items-center gap-3 min-w-[120px] lg:min-w-[140px] shadow-sm">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-lg">
              <RiCheckboxCircleLine />
            </div>
            <div>
              <div className="text-[10px] font-bold text-gray-400 uppercase leading-none">Completed</div>
              <div className="text-lg font-extrabold text-white mt-1.5 leading-none">{completedCount}</div>
            </div>
          </div>

          {/* On Hold Card */}
          <div className="bg-slate-900/40 border border-slate-800/80 dark:bg-slate-950/40 dark:border-slate-900 rounded-2xl p-3 px-4 flex items-center gap-3 min-w-[120px] lg:min-w-[140px] shadow-sm">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center text-lg">
              <RiTimeLine />
            </div>
            <div>
              <div className="text-[10px] font-bold text-gray-400 uppercase leading-none">On Hold</div>
              <div className="text-lg font-extrabold text-white mt-1.5 leading-none">{onHoldCount}</div>
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* Tabs and Grid/List Toggler */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/60 pb-1">
        {/* Left: Horizontal Tabs */}
        <div className="flex gap-2 overflow-x-auto">
          {[
            { id: "all", label: "All Projects" },
            { id: "active", label: "Active" },
            { id: "completed", label: "Completed" },
            { id: "archived", label: "Archived" },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setCurrentPage(1);
                }}
                className={`pb-3 px-3.5 text-xs font-bold transition-all relative whitespace-nowrap ${
                  isActive ? "text-indigo-400" : "text-gray-400 hover:text-white"
                }`}
              >
                {tab.label}
                {isActive && (
                  <motion.div
                    layoutId="activeTabUnderline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Right: Grid/List Toggle */}
        <div className="flex items-center gap-1 bg-slate-950/60 border border-slate-800 p-1 rounded-xl self-end sm:self-auto">
          <button
            onClick={() => setViewMode("grid")}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-[10px] font-bold tracking-wide transition-colors ${
              viewMode === "grid"
                ? "bg-indigo-600 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <RiLayoutGridLine className="text-xs" />
            <span>Grid</span>
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-[10px] font-bold tracking-wide transition-colors ${
              viewMode === "list"
                ? "bg-indigo-600 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <RiListUnordered className="text-xs" />
            <span>List</span>
          </button>
        </div>
      </div>

      {/* Control Bar Filters & Search */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-slate-900/20 border border-slate-800/80 dark:bg-slate-950/20 dark:border-slate-900 rounded-2xl p-4">
        {/* Search */}
        <div className="w-full lg:max-w-xs flex items-center gap-2 px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl">
          <RiSearchLine className="text-gray-500 text-sm flex-shrink-0" />
          <input
            type="search"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-transparent outline-none border-none text-xs text-white"
          />
        </div>

        {/* Custom filters dropdown list */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-slate-950/60 border border-slate-800 text-[11px] font-bold text-gray-300 rounded-xl px-3 py-2 outline-none focus:border-indigo-500 transition-colors"
          >
            <option value="all">All Status</option>
            <option value="planning">Planning</option>
            <option value="active">Active</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => {
              setPriorityFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-slate-950/60 border border-slate-800 text-[11px] font-bold text-gray-300 rounded-xl px-3 py-2 outline-none focus:border-indigo-500 transition-colors"
          >
            <option value="all">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>

          <select
            value={techFilter}
            onChange={(e) => {
              setTechFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-slate-950/60 border border-slate-800 text-[11px] font-bold text-gray-300 rounded-xl px-3 py-2 outline-none focus:border-indigo-500 transition-colors max-w-[130px] truncate"
          >
            <option value="all">All Technologies</option>
            {allTechnologies
              .filter((t) => t !== "all")
              .map((tech) => (
                <option key={tech} value={tech}>
                  {tech}
                </option>
              ))}
          </select>

          <button
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("all");
              setPriorityFilter("all");
              setTechFilter("all");
              setSortBy("newest");
              setCurrentPage(1);
            }}
            className="flex items-center gap-1.5 bg-slate-950/60 hover:bg-slate-900 border border-slate-800 text-[11px] font-bold text-gray-300 rounded-xl px-3.5 py-2 outline-none transition-colors"
          >
            <RiFilter3Line className="text-xs" />
            <span>Filters</span>
          </button>
        </div>

        {/* Sort select */}
        <div className="w-full lg:w-auto flex justify-end">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-slate-950/60 border border-slate-800 text-[11px] font-bold text-gray-300 rounded-xl px-3 py-2 outline-none focus:border-indigo-500 transition-colors"
          >
            <option value="newest">Sort by: Newest</option>
            <option value="oldest">Sort by: Oldest</option>
            <option value="alphabetical">Sort by: Alphabetical</option>
            <option value="progress">Sort by: Progress</option>
          </select>
        </div>
      </div>

      {/* Projects List/Grid Display */}
      {loading ? (
        <SkeletonGrid count={8} />
      ) : error ? (
        <div className="glass-card p-6 flex flex-col items-center justify-center text-center space-y-3 border-rose-500/20">
          <RiAlertLine className="text-3xl text-rose-500" />
          <p className="text-sm text-gray-300">{error}</p>
          <button onClick={fetchProjects} className="btn btn-secondary btn-sm">
            Retry
          </button>
        </div>
      ) : paginatedProjects.length === 0 ? (
        <div className="empty-state glass-card py-16">
          <div className="empty-state-icon">
            <RiFolderLine />
          </div>
          <h3 className="text-base font-bold text-gray-400 mb-1">No Projects Found</h3>
          <p className="text-xs text-gray-500 max-w-xs mx-auto mb-6">
            Try adjusting your search queries or filter selections, or create a brand new project record.
          </p>
          <button
            onClick={() => {
              setEditingProject(null);
              setFormOpen(true);
            }}
            className="btn btn-secondary btn-sm"
          >
            Add New Project
          </button>
        </div>
      ) : (
        <motion.div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "flex flex-col gap-4"
          }
          layout
        >
          <AnimatePresence mode="popLayout">
            {paginatedProjects.map((project, index) => (
              <ProjectCard
                key={project.id}
                id={project.id}
                title={project.title}
                description={project.description}
                progress={project.progress}
                status={project.status}
                priority={project.priority}
                startDate={project.startDate}
                dueDate={project.dueDate}
                tags={project.tags}
                technologies={project.technologies}
                index={index}
                viewMode={viewMode}
                onEdit={() => {
                  setEditingProject(project);
                  setFormOpen(true);
                }}
                onDelete={() => handleDelete(project.id, project.title)}
                onArchive={() => handleArchive(project.id)}
                onDuplicate={() => handleDuplicate(project.id)}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Pagination Footer */}
      {!loading && !error && sortedProjects.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800/40">
          <span className="text-[11px] font-bold text-gray-500">
            Showing {showingStart} to {showingEnd} of {sortedProjects.length} projects
          </span>

          <div className="flex items-center gap-1.5 bg-slate-950/60 border border-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg flex items-center justify-center text-gray-500 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
              aria-label="Previous page"
            >
              <RiArrowLeftSLine className="text-sm" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              const isPageActive = currentPage === page;
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-6 h-6 rounded-lg text-[10px] font-black flex items-center justify-center transition-colors ${
                    isPageActive
                      ? "bg-indigo-600 text-white"
                      : "text-gray-400 hover:text-white hover:bg-slate-900"
                  }`}
                >
                  {page}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg flex items-center justify-center text-gray-500 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
              aria-label="Next page"
            >
              <RiArrowRightSLine className="text-sm" />
            </button>
          </div>

          <div>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-slate-950/60 border border-slate-800 text-[10px] font-bold text-gray-400 rounded-xl px-3 py-1.5 outline-none focus:border-indigo-500 transition-colors"
            >
              <option value={8}>8 per page</option>
              <option value={12}>12 per page</option>
              <option value={24}>24 per page</option>
            </select>
          </div>
        </div>
      )}

      {/* Create / Edit Form Modal */}
      <ProjectForm
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingProject(null);
        }}
        onSubmit={handleCreateOrUpdate}
        initialData={editingProject}
      />
    </div>
  );
}
