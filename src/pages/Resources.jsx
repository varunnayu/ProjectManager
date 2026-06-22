import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiAddLine,
  RiSearchLine,
  RiFilter3Line,
  RiExternalLinkLine,
  RiDeleteBinLine,
  RiBookmarkLine,
  RiGithubFill,
  RiGlobalLine,
  RiFilePdfLine,
  RiImage2Line,
  RiVideoLine,
  RiUploadCloud2Line,
  RiCloseLine,
  RiDownload2Line,
} from "react-icons/ri";
import { ResourceService } from "../services/resourceService";
import { ProjectService } from "../services/projectService";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { SkeletonGrid } from "../components/Skeleton";

const TYPE_ICONS = {
  link: <RiGlobalLine className="text-blue-400" />,
  github: <RiGithubFill className="text-gray-300" />,
  documentation: <RiBookmarkLine className="text-indigo-400" />,
  pdf: <RiFilePdfLine className="text-rose-400" />,
  image: <RiImage2Line className="text-emerald-400" />,
  video: <RiVideoLine className="text-amber-400" />,
};

const TYPE_BADGES = {
  link: "badge-indigo",
  github: "badge-rose",
  documentation: "badge-cyan",
  pdf: "badge-rose",
  image: "badge-emerald",
  video: "badge-amber",
};

export default function Resources() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [resources, setResources] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");

  // Modals States
  const [addOpen, setAddOpen] = useState(false);
  const [previewResource, setPreviewResource] = useState(null);

  // Form Fields
  const [formTitle, setFormTitle] = useState("");
  const [formType, setFormType] = useState("link");
  const [formProjectId, setFormProjectId] = useState("all");
  const [formUrl, setFormUrl] = useState("");
  const [formFile, setFormFile] = useState(null);
  
  // File Uploading state indicator
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef(null);

  const loadResourcesAndProjects = async () => {
    try {
      setLoading(true);
      const uid = user?.uid || "mock-user-123";
      const resData = await ResourceService.getAllForUser(uid);
      const projData = await ProjectService.getAllForUser(uid);
      setResources(resData);
      setProjects(projData);
    } catch (err) {
      console.error(err);
      addToast({ message: "Failed to load resource vaults.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResourcesAndProjects();
  }, [user]);

  // --- CRUD Handlers ---
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    try {
      setUploading(true);
      let resourceUrl = formUrl.trim();

      // Check if file upload is needed
      if (["pdf", "image", "video"].includes(formType)) {
        if (!formFile) {
          addToast({ message: "Please select a file to upload.", type: "error" });
          setUploading(false);
          return;
        }
        // Upload bytes to Storage (Firebase/Local Fallback)
        addToast({ message: "Uploading resource file...", type: "info" });
        resourceUrl = await ResourceService.uploadFile(formFile);
      } else {
        if (!resourceUrl) {
          addToast({ message: "Please enter a valid link address.", type: "error" });
          setUploading(false);
          return;
        }
      }

      // Lookup associated project name
      let projectTitle = "General Resources";
      if (formProjectId !== "all") {
        const match = projects.find((p) => p.id === formProjectId);
        if (match) projectTitle = match.title;
      }

      const payload = {
        title: formTitle.trim(),
        type: formType,
        url: resourceUrl,
        projectId: formProjectId,
        projectTitle,
      };

      await ResourceService.create(payload, user?.uid || "mock-user-123");
      addToast({ message: "Resource saved successfully.", type: "success" });
      
      // Reset Form and Reload
      setAddOpen(false);
      setFormTitle("");
      setFormType("link");
      setFormProjectId("all");
      setFormUrl("");
      setFormFile(null);
      loadResourcesAndProjects();
    } catch (err) {
      console.error(err);
      addToast({ message: "Failed to upload resource.", type: "error" });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (e, resId, resTitle) => {
    e.stopPropagation();
    e.preventDefault();
    if (confirm(`Delete resource "${resTitle}"?`)) {
      try {
        await ResourceService.delete(resId);
        addToast({ message: "Resource deleted.", type: "success" });
        loadResourcesAndProjects();
      } catch (err) {
        console.error(err);
        addToast({ message: "Failed to delete resource.", type: "error" });
      }
    }
  };

  // --- Filtering & Sorting computation ---
  const filteredResources = useMemo(() => {
    return resources.filter((res) => {
      // 1. Search text
      if (searchTerm.trim() !== "") {
        const query = searchTerm.toLowerCase().trim();
        const matchesTitle = res.title.toLowerCase().includes(query);
        const matchesType = res.type.toLowerCase().includes(query);
        if (!matchesTitle && !matchesType) return false;
      }

      // 2. Type Filter
      if (typeFilter !== "all" && res.type !== typeFilter) {
        return false;
      }

      // 3. Project Filter
      if (projectFilter !== "all" && res.projectId !== projectFilter) {
        return false;
      }

      return true;
    });
  }, [resources, searchTerm, typeFilter, projectFilter]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="page-header flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="page-title text-3xl font-extrabold tracking-tight">Resource Vault</h1>
          <p className="page-subtitle text-sm text-gray-400">
            Catalog external documentation links, GitHub repos, and upload PDFs, images, or videos.
          </p>
        </div>
        <button onClick={() => setAddOpen(true)} className="btn btn-primary" id="btn-add-resource">
          <RiAddLine className="text-lg" />
          Add Resource
        </button>
      </div>

      {/* Control Bar (Filters & Search) */}
      <div className="glass-card p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="topbar-search w-full md:max-w-md" style={{ background: "rgba(0,0,0,0.2)" }}>
          <RiSearchLine className="text-gray-500" />
          <input
            type="search"
            placeholder="Search resources..."
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
            <option value="all-general">General Resources</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>

          {/* Type filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-gray-900/60 border border-gray-800 text-xs font-semibold text-gray-300 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 transition-colors"
          >
            <option value="all">All Resource Types</option>
            <option value="link">Links</option>
            <option value="github">GitHub Repos</option>
            <option value="documentation">Documentation</option>
            <option value="pdf">PDF Documents</option>
            <option value="image">Images</option>
            <option value="video">Videos</option>
          </select>
        </div>
      </div>

      {/* Main Grid display */}
      {loading ? (
        <SkeletonGrid count={6} />
      ) : filteredResources.length === 0 ? (
        <div className="empty-state glass-card py-16">
          <div className="empty-state-icon">
            <RiBookmarkLine />
          </div>
          <h3 className="text-base font-bold text-gray-400 mb-1">No Resources Found</h3>
          <p className="text-xs text-gray-500 max-w-xs mx-auto mb-6">
            Search terms matched zero records. Upload a new document or add documentation tabs above.
          </p>
          <button onClick={() => setAddOpen(true)} className="btn btn-secondary btn-sm">
            Add New Resource
          </button>
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          layout
        >
          <AnimatePresence mode="popLayout">
            {filteredResources.map((res, index) => (
              <motion.div
                key={res.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.04, duration: 0.3 }}
                whileHover={{ y: -3 }}
                onClick={() => setPreviewResource(res)}
                className="glass-card p-5 cursor-pointer flex flex-col justify-between"
                style={{ minHeight: "160px" }}
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-2.5">
                    <span className="text-2xl">{TYPE_ICONS[res.type] || <RiGlobalLine />}</span>
                    <div className="flex gap-1.5">
                      <span className={`badge ${TYPE_BADGES[res.type]} text-[9px] uppercase font-bold`}>
                        {res.type}
                      </span>
                      <button
                        onClick={(e) => handleDelete(e, res.id, res.title)}
                        className="p-1 rounded text-gray-500 hover:text-rose-400 hover:bg-rose-950/20 transition-colors"
                        title="Delete Resource"
                      >
                        <RiDeleteBinLine className="text-xs" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-white leading-snug line-clamp-2">
                    {res.title}
                  </h3>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-gray-900/60 mt-4 text-[10px] text-gray-500 font-semibold">
                  <span className="flex items-center gap-1 text-[9px]">
                    <RiBookmarkLine className="text-indigo-400" /> {res.projectTitle}
                  </span>
                  {["link", "github", "documentation"].includes(res.type) ? (
                    <a
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-0.5 text-indigo-400 hover:text-indigo-300 font-bold"
                    >
                      Visit Link <RiExternalLinkLine className="text-[10px]" />
                    </a>
                  ) : (
                    <span className="text-indigo-400 font-bold">Open Preview</span>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* --- ADD RESOURCE MODAL --- */}
      <AnimatePresence>
        {addOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !uploading && setAddOpen(false)}
              className="fixed inset-0 bg-gray-950/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              className="relative w-full max-w-md z-10 glass-card p-6 overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="flex items-center justify-between border-b border-gray-800 pb-4 mb-4">
                <h2 className="text-lg font-bold text-white">Add Vault Resource</h2>
                <button
                  onClick={() => !uploading && setAddOpen(false)}
                  disabled={uploading}
                  className="p-1 rounded bg-gray-900/60 hover:bg-gray-800 text-gray-400 hover:text-white"
                >
                  <RiCloseLine className="text-xl" />
                </button>
              </div>

              <form onSubmit={handleAddSubmit} className="space-y-4 overflow-y-auto flex-1 pr-1">
                {/* Title */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    Resource Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Design assets, repo API key guidelines..."
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="input"
                    disabled={uploading}
                  />
                </div>

                {/* Resource Type */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    Resource Type
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => {
                      setFormType(e.target.value);
                      setFormFile(null);
                      setFormUrl("");
                    }}
                    className="input bg-gray-900/60 border border-gray-800 text-gray-300 text-sm outline-none"
                    disabled={uploading}
                  >
                    <option value="link">External Link / URL</option>
                    <option value="github">GitHub Repository</option>
                    <option value="documentation">Documentation Link</option>
                    <option value="pdf">PDF File Upload</option>
                    <option value="image">Image File Upload</option>
                    <option value="video">Video File Upload</option>
                  </select>
                </div>

                {/* Project association */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    Link Project Workspace
                  </label>
                  <select
                    value={formProjectId}
                    onChange={(e) => setFormProjectId(e.target.value)}
                    className="input bg-gray-900/60 border border-gray-800 text-gray-300 text-sm outline-none"
                    disabled={uploading}
                  >
                    <option value="all">General Resources</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Conditional Fields: Upload VS Link Inputs */}
                {["pdf", "image", "video"].includes(formType) ? (
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                      Select Local File <span className="text-rose-500">*</span>
                    </label>
                    <div
                      onClick={() => !uploading && fileInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-800/80 hover:border-indigo-500 rounded-xl p-6 text-center cursor-pointer hover:bg-indigo-500/5 transition-all flex flex-col items-center justify-center gap-2"
                    >
                      <RiUploadCloud2Line className="text-3xl text-indigo-400" />
                      <span className="text-xs font-semibold text-gray-300">
                        {formFile ? formFile.name : "Click to select a file"}
                      </span>
                      <span className="text-[10px] text-gray-500">
                        Max file size: 25MB · Supported formats: PDF, PNG, JPG, MP4
                      </span>
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={(e) => setFormFile(e.target.files?.[0] || null)}
                      accept={formType === "pdf" ? ".pdf" : formType === "image" ? "image/*" : "video/*"}
                      className="hidden"
                      disabled={uploading}
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                      URL Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="url"
                      required
                      placeholder="https://example.com"
                      value={formUrl}
                      onChange={(e) => setFormUrl(e.target.value)}
                      className="input text-sm"
                      disabled={uploading}
                    />
                  </div>
                )}

                {/* Bottom Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
                  <button
                    type="button"
                    onClick={() => setAddOpen(false)}
                    className="btn btn-secondary px-5"
                    disabled={uploading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary px-5"
                    disabled={uploading}
                  >
                    {uploading ? (
                      <div className="spinner border-2" style={{ width: "14px", height: "14px" }} />
                    ) : (
                      "Save Resource"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- RESOURCE PREVIEW MODAL --- */}
      <AnimatePresence>
        {previewResource && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPreviewResource(null)}
              className="fixed inset-0 bg-gray-950/85 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              className="relative w-full max-w-3xl z-10 glass-card p-6 overflow-hidden max-h-[90vh] flex flex-col space-y-4"
            >
              <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                <div>
                  <span className={`badge ${TYPE_BADGES[previewResource.type]} text-[9px] uppercase font-bold mb-1`}>
                    {previewResource.type}
                  </span>
                  <h2 className="text-base font-extrabold text-white line-clamp-1">{previewResource.title}</h2>
                </div>
                <button
                  onClick={() => setPreviewResource(null)}
                  className="p-1 rounded bg-gray-900/60 hover:bg-gray-800 text-gray-400 hover:text-white"
                >
                  <RiCloseLine className="text-xl" />
                </button>
              </div>

              {/* Render Preview canvas by type */}
              <div className="flex-1 flex flex-col items-center justify-center overflow-y-auto min-h-[300px]">
                {previewResource.type === "image" && (
                  <img
                    src={previewResource.url}
                    alt={previewResource.title}
                    className="max-w-full max-h-[60vh] rounded-lg border border-gray-800 object-contain shadow-2xl"
                  />
                )}

                {previewResource.type === "video" && (
                  <video
                    src={previewResource.url}
                    controls
                    autoPlay
                    className="w-full max-h-[60vh] rounded-lg border border-gray-800 object-contain shadow-2xl"
                  />
                )}

                {previewResource.type === "pdf" && (
                  /* Render PDF: iframe fallback on web, or direct download cards */
                  <div className="w-full h-full flex flex-col space-y-4">
                    <iframe
                      src={previewResource.url}
                      className="w-full h-[55vh] rounded-lg border border-gray-800"
                      title="PDF Document"
                    />
                    <div className="flex justify-end">
                      <a
                        href={previewResource.url}
                        download={previewResource.title}
                        className="btn btn-secondary text-xs flex items-center gap-1.5 self-end"
                      >
                        <RiDownload2Line />
                        Download File
                      </a>
                    </div>
                  </div>
                )}

                {["link", "github", "documentation"].includes(previewResource.type) && (
                  <div className="text-center p-8 space-y-4 max-w-sm">
                    <div className="text-5xl mx-auto flex items-center justify-center p-4 rounded-full bg-indigo-500/10 text-indigo-400 w-20 h-20 shadow-inner">
                      {TYPE_ICONS[previewResource.type]}
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-white">{previewResource.title}</h3>
                      <p className="text-xs text-gray-400 truncate max-w-xs">{previewResource.url}</p>
                    </div>
                    <a
                      href={previewResource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary text-xs w-full py-2 flex items-center justify-center gap-1.5"
                    >
                      Visit Resource External Link <RiExternalLinkLine />
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
