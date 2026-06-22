import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiAddLine,
  RiSearchLine,
  RiDeleteBinLine,
  RiBookmarkLine,
  RiProjectorLine,
  RiEyeLine,
  RiEditLine,
  RiBold,
  RiItalic,
  RiCodeBoxLine,
  RiHeading,
  RiListCheck2,
  RiCheckDoubleLine,
  RiTimeLine,
  RiAlertLine,
  RiFolderLine,
} from "react-icons/ri";
import { NoteService } from "../services/noteService";
import { ProjectService } from "../services/projectService";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { SkeletonList } from "../components/Skeleton";

// Simple, fast Markdown HTML converter
const parseMarkdown = (text) => {
  if (!text) return "";
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Code blocks: ```js ... ```
  html = html.replace(
    /```([\s\S]*?)```/g,
    '<pre class="bg-gray-950 p-3.5 rounded-lg border border-gray-800 font-mono text-[11px] text-indigo-300 my-3 overflow-x-auto whitespace-pre">$1</pre>'
  );

  // Inline code: `code`
  html = html.replace(
    /`([^`]+)`/g,
    '<code class="bg-gray-950 px-1.5 py-0.5 rounded font-mono text-xs text-indigo-400">$1</code>'
  );

  // Headers: # H1, ## H2, ### H3
  html = html.replace(
    /^# (.*?)$/gm,
    '<h1 class="text-xl font-extrabold border-b border-gray-800/80 pb-2 mt-5 mb-3 text-white font-display">$1</h1>'
  );
  html = html.replace(
    /^## (.*?)$/gm,
    '<h2 class="text-lg font-bold mt-4 mb-2 text-white font-display">$1</h2>'
  );
  html = html.replace(
    /^### (.*?)$/gm,
    '<h3 class="text-base font-bold mt-4 mb-1.5 text-white font-display">$1</h3>'
  );

  // Bold: **bold**
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-white">$1</strong>');

  // Italic: *italic*
  html = html.replace(/\*([^*]+)\*/g, '<em class="italic text-gray-300">$1</em>');

  // Lists: - item or * item
  html = html.replace(/^\s*[-*]\s+(.*?)$/gm, '<li class="list-disc ml-5 my-1 text-gray-300">$1</li>');

  // Paragraph breaks
  html = html.replace(/\n\n/g, '<p class="my-2"></p>');

  return html;
};

export default function Notes() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [notes, setNotes] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selection & Editor States
  const [selectedNote, setSelectedNote] = useState(null);
  const [editorTitle, setEditorTitle] = useState("");
  const [editorContent, setEditorContent] = useState("");
  const [editorCategory, setEditorCategory] = useState("General");
  const [editorProjectId, setEditorProjectId] = useState("all");

  // Filtering & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");

  // Editor View Mode: "edit" | "preview"
  const [viewMode, setViewMode] = useState("edit");

  // Auto-Save Status: "saved" | "saving" | "unsaved"
  const [saveStatus, setSaveStatus] = useState("saved");

  // Ref for debouncing auto-save
  const autoSaveTimerRef = useRef(null);

  // Load initial notes & projects
  const loadData = async () => {
    try {
      setLoading(true);
      const notesData = await NoteService.getAllForUser(user?.uid || "mock-user-123");
      const projectsData = await ProjectService.getAllForUser(user?.uid || "mock-user-123");
      
      setNotes(notesData);
      setProjects(projectsData);

      // Select first note if available
      if (notesData.length > 0) {
        selectNoteItem(notesData[0]);
      }
    } catch (err) {
      console.error("Error loading docs hub data:", err);
      addToast({ message: "Failed to load documentation hub.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Handle selecting a note
  const selectNoteItem = (note) => {
    // Clear save timer before switching
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    
    setSelectedNote(note);
    setEditorTitle(note.title);
    setEditorContent(note.content || "");
    setEditorCategory(note.category || "General");
    setEditorProjectId(note.projectId || "all");
    setSaveStatus("saved");
    setViewMode("edit");
  };

  // --- Auto-Save trigger ---
  const triggerAutoSave = (updatedFields) => {
    if (!selectedNote) return;
    setSaveStatus("unsaved");

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    // Set auto-save debounce of 1 second
    autoSaveTimerRef.current = setTimeout(async () => {
      setSaveStatus("saving");
      try {
        const docId = selectedNote.id;
        const notePayload = {
          title: editorTitle,
          content: editorContent,
          category: editorCategory,
          projectId: editorProjectId,
          ...updatedFields,
        };

        await NoteService.update(docId, notePayload);
        
        // Update local list state
        setNotes((prevNotes) =>
          prevNotes.map((n) => (n.id === docId ? { ...n, ...notePayload } : n))
        );

        setSaveStatus("saved");
      } catch (err) {
        console.error("Auto-save failed:", err);
        setSaveStatus("unsaved");
      }
    }, 1000);
  };

  // Trigger auto-saves when fields change
  const handleTitleChange = (val) => {
    setEditorTitle(val);
    triggerAutoSave({ title: val });
  };

  const handleContentChange = (val) => {
    setEditorContent(val);
    triggerAutoSave({ content: val });
  };

  const handleCategoryChange = (val) => {
    setEditorCategory(val);
    triggerAutoSave({ category: val });
  };

  const handleProjectChange = (val) => {
    setEditorProjectId(val);
    triggerAutoSave({ projectId: val });
  };

  // --- Note CRUD ---
  const handleCreateNote = async () => {
    try {
      const payload = {
        title: "Untitled Page",
        content: "# New Page\n\nStart typing here...",
        category: "General",
        projectId: projectFilter !== "all" ? projectFilter : "all",
      };

      const newNote = await NoteService.create(payload, user?.uid || "mock-user-123");
      setNotes([newNote, ...notes]);
      selectNoteItem(newNote);
      addToast({ message: "New documentation page created.", type: "success" });
    } catch (err) {
      console.error(err);
      addToast({ message: "Failed to create page.", type: "error" });
    }
  };

  const handleDeleteNote = async () => {
    if (!selectedNote) return;

    if (confirm(`Are you sure you want to delete "${selectedNote.title}"?`)) {
      try {
        if (autoSaveTimerRef.current) {
          clearTimeout(autoSaveTimerRef.current);
        }

        await NoteService.delete(selectedNote.id);
        const filtered = notes.filter((n) => n.id !== selectedNote.id);
        setNotes(filtered);

        addToast({ message: "Documentation page deleted.", type: "success" });

        // Select next note
        if (filtered.length > 0) {
          selectNoteItem(filtered[0]);
        } else {
          setSelectedNote(null);
        }
      } catch (err) {
        console.error(err);
        addToast({ message: "Failed to delete note.", type: "error" });
      }
    }
  };

  // Insert markdown helpers
  const handleFormat = (syntax) => {
    const textarea = document.getElementById("note-editor-textarea");
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);

    let replacement = "";
    if (syntax === "h1") replacement = `\n# ${selectedText}`;
    else if (syntax === "h2") replacement = `\n## ${selectedText}`;
    else if (syntax === "h3") replacement = `\n### ${selectedText}`;
    else if (syntax === "bold") replacement = `**${selectedText || "bold"}**`;
    else if (syntax === "italic") replacement = `*${selectedText || "italic"}*`;
    else if (syntax === "code") replacement = `\n\`\`\`javascript\n${selectedText || "// code"}\n\`\`\`\n`;
    else if (syntax === "list") replacement = `\n- ${selectedText || "item"}`;

    const newValue = text.substring(0, start) + replacement + text.substring(end);
    handleContentChange(newValue);

    // Reset cursor focus
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + replacement.length, start + replacement.length);
    }, 0);
  };

  // Clean filters computation
  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      // 1. Search text
      if (searchTerm.trim() !== "") {
        const query = searchTerm.toLowerCase().trim();
        const matchesTitle = note.title.toLowerCase().includes(query);
        const matchesContent = note.content?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesContent) return false;
      }

      // 2. Category Filter
      if (categoryFilter !== "all" && note.category !== categoryFilter) {
        return false;
      }

      // 3. Project Filter
      if (projectFilter !== "all" && note.projectId !== projectFilter) {
        return false;
      }

      return true;
    });
  }, [notes, searchTerm, categoryFilter, projectFilter]);

  // Extract unique categories for filter dropdown
  const uniqueCategories = useMemo(() => {
    const cats = notes.map((n) => n.category).filter(Boolean);
    return Array.from(new Set(cats));
  }, [notes]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="page-title text-3xl font-extrabold tracking-tight">Doc Vault</h1>
          <p className="page-subtitle text-sm text-gray-400">
            Notion-like documentation system with live Markdown editing and auto-save syncing.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col lg:flex-row gap-6 items-stretch h-auto lg:h-[calc(100vh-220px)] lg:min-h-[600px] overflow-hidden">
          <div className="w-full lg:w-[320px] flex-shrink-0 glass-card p-4">
            <SkeletonList count={5} />
          </div>
          <div className="flex-1 glass-card p-6 flex flex-col space-y-4">
            <div className="skeleton skeleton-title w-1/3 mb-4 flex-shrink-0" />
            <div className="skeleton skeleton-text w-full mb-2 flex-shrink-0" />
            <div className="skeleton skeleton-text w-full mb-2 flex-shrink-0" />
            <div className="skeleton skeleton-text w-3/4 mb-4 flex-shrink-0" />
            <div className="skeleton skeleton-card w-full flex-1" />
          </div>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6 items-stretch h-auto lg:h-[calc(100vh-220px)] lg:min-h-[600px] overflow-hidden">
          
          {/* LEFT SIDEBAR: Pages List */}
          <div className="w-full lg:w-[320px] flex-shrink-0 glass-card p-4 flex flex-col space-y-4 overflow-hidden">
            <button
              onClick={handleCreateNote}
              className="btn btn-primary w-full flex items-center justify-center gap-1.5 flex-shrink-0"
            >
              <RiAddLine /> New Page
            </button>

            {/* Search notes */}
            <div className="topbar-search w-full py-1.5 px-3 flex-shrink-0" style={{ background: "rgba(0,0,0,0.2)" }}>
              <RiSearchLine className="text-gray-500 text-xs" />
              <input
                type="search"
                placeholder="Quick find pages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent outline-none text-xs text-white"
              />
            </div>

            {/* Dropdown filters */}
            <div className="space-y-2 flex-shrink-0">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Project Workspace
                </label>
                <select
                  value={projectFilter}
                  onChange={(e) => setProjectFilter(e.target.value)}
                  className="bg-gray-950/60 border border-gray-900 text-[11px] text-gray-400 rounded w-full p-2 outline-none"
                >
                  <option value="all">All Workspace Docs</option>
                  <option value="all-general">General Docs</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Category
                </label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-gray-950/60 border border-gray-900 text-[11px] text-gray-400 rounded w-full p-2 outline-none"
                >
                  <option value="all">All Categories</option>
                  {uniqueCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Notes List */}
            <div className="flex-1 overflow-y-auto min-h-[200px] max-h-[300px] lg:max-h-none pr-1 space-y-1.5">
              <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider py-1.5 border-b border-gray-900">
                Pages ({filteredNotes.length})
              </span>
              {filteredNotes.length === 0 ? (
                <div className="text-center py-8 text-[11px] text-gray-500 font-bold uppercase tracking-wider">
                  No pages found
                </div>
              ) : (
                filteredNotes.map((note) => {
                  const isSelected = selectedNote?.id === note.id;
                  return (
                    <button
                      key={note.id}
                      onClick={() => selectNoteItem(note)}
                      className={`w-full text-left p-2.5 rounded-lg text-xs font-semibold flex flex-col space-y-1 transition-all ${
                        isSelected
                          ? "bg-indigo-500/15 border border-indigo-500/25 text-indigo-400"
                          : "hover:bg-gray-900/40 text-gray-400 hover:text-gray-200"
                      }`}
                    >
                      <span className="truncate block font-bold">{note.title || "Untitled Page"}</span>
                      <div className="flex justify-between items-center w-full text-[9px] text-gray-600">
                        <span className="bg-gray-950 px-1 py-0.5 rounded text-[8px] font-bold uppercase text-indigo-400/80">
                          {note.category || "General"}
                        </span>
                        <span>{note.date || "Doc"}</span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* RIGHT EDIT WORKSPACE: Notion Editor */}
          <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
            {!selectedNote ? (
              <div className="glass-card flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[50vh] lg:min-h-0">
                <RiBookmarkLine className="text-5xl text-gray-700 mb-2 animate-bounce" />
                <h3 className="text-base font-bold text-gray-400 mb-1">Select a Page</h3>
                <p className="text-xs text-gray-500 max-w-xs mb-4">
                  Select a documentation file from the list or create a new markdown canvas page.
                </p>
                <button onClick={handleCreateNote} className="btn btn-secondary btn-sm">
                  Create Page
                </button>
              </div>
            ) : (
              <div className="glass-card flex-1 flex flex-col p-6 space-y-4 overflow-hidden h-full">
                
                {/* Editor Top Options Bar */}
                <div className="flex-shrink-0 flex flex-wrap items-center justify-between gap-3 border-b border-gray-800 pb-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                    {/* Auto save indicator status */}
                    {saveStatus === "saved" && (
                      <span className="flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full text-[10px]">
                        <RiCheckDoubleLine /> Auto-saved
                      </span>
                    )}
                    {saveStatus === "saving" && (
                      <span className="flex items-center gap-1 text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full text-[10px] animate-pulse">
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-ping" /> Saving...
                      </span>
                    )}
                    {saveStatus === "unsaved" && (
                      <span className="flex items-center gap-1 text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full text-[10px]">
                        <RiTimeLine /> Unsaved changes
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Mode selector tab toggles */}
                    <div className="bg-gray-950 p-0.5 rounded-lg border border-gray-800 flex">
                      <button
                        onClick={() => setViewMode("edit")}
                        className={`px-3 py-1 rounded text-xs font-bold flex items-center gap-1 transition-all ${
                          viewMode === "edit" ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-gray-200"
                        }`}
                      >
                        <RiEditLine /> Edit
                      </button>
                      <button
                        onClick={() => setViewMode("preview")}
                        className={`px-3 py-1 rounded text-xs font-bold flex items-center gap-1 transition-all ${
                          viewMode === "preview" ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-gray-200"
                        }`}
                      >
                        <RiEyeLine /> Preview
                      </button>
                    </div>

                    <button
                      onClick={handleDeleteNote}
                      className="p-2 bg-gray-900/40 hover:bg-rose-950 border border-gray-800 hover:border-rose-900 text-gray-400 hover:text-rose-400 rounded-lg transition-colors"
                      title="Delete Page"
                    >
                      <RiDeleteBinLine />
                    </button>
                  </div>
                </div>

                {/* Categories & Project Workspace Tag Selectors */}
                <div className="flex-shrink-0 grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-950/40 border border-gray-900 p-3 rounded-lg">
                  <div>
                    <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <RiProjectorLine /> Associate Project
                    </label>
                    <select
                      value={editorProjectId}
                      onChange={(e) => handleProjectChange(e.target.value)}
                      className="bg-gray-900/60 border border-gray-800 text-xs font-semibold text-gray-300 rounded-lg p-1.5 w-full outline-none"
                    >
                      <option value="all">General Docs</option>
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <RiBookmarkLine /> Category Group
                    </label>
                    <select
                      value={editorCategory}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      className="bg-gray-900/60 border border-gray-800 text-xs font-semibold text-gray-300 rounded-lg p-1.5 w-full outline-none"
                    >
                      <option value="General">General</option>
                      <option value="Architecture">Architecture</option>
                      <option value="Security">Security</option>
                      <option value="Design">Design</option>
                      <option value="API">API</option>
                      <option value="Planning">Planning</option>
                    </select>
                  </div>
                </div>

                {/* Edit Mode Canvas */}
                {viewMode === "edit" ? (
                  <div className="flex-1 flex flex-col space-y-3 min-h-0 overflow-hidden">
                    {/* Title Input */}
                    <input
                      type="text"
                      value={editorTitle}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      placeholder="Enter page title..."
                      className="bg-transparent border-none text-2xl font-extrabold text-white outline-none w-full placeholder-gray-700 flex-shrink-0"
                    />

                    {/* Markdown formatting bar */}
                    <div className="flex flex-wrap items-center gap-1.5 border-y border-gray-800/80 py-2 flex-shrink-0">
                      <button
                        onClick={() => handleFormat("h1")}
                        className="p-1.5 hover:bg-gray-900 text-gray-400 hover:text-white rounded"
                        title="Heading 1"
                      >
                        <RiHeading className="text-sm font-black" />
                      </button>
                      <button
                        onClick={() => handleFormat("h2")}
                        className="p-1.5 hover:bg-gray-900 text-gray-400 hover:text-white rounded"
                        title="Heading 2"
                      >
                        <span className="text-xs font-bold">H2</span>
                      </button>
                      <button
                        onClick={() => handleFormat("bold")}
                        className="p-1.5 hover:bg-gray-900 text-gray-400 hover:text-white rounded"
                        title="Bold text"
                      >
                        <RiBold />
                      </button>
                      <button
                        onClick={() => handleFormat("italic")}
                        className="p-1.5 hover:bg-gray-900 text-gray-400 hover:text-white rounded"
                        title="Italic text"
                      >
                        <RiItalic />
                      </button>
                      <button
                        onClick={() => handleFormat("code")}
                        className="p-1.5 hover:bg-gray-900 text-gray-400 hover:text-white rounded"
                        title="Code block"
                      >
                        <RiCodeBoxLine />
                      </button>
                      <button
                        onClick={() => handleFormat("list")}
                        className="p-1.5 hover:bg-gray-900 text-gray-400 hover:text-white rounded"
                        title="Bullet List"
                      >
                        <RiListCheck2 />
                      </button>
                    </div>

                    {/* Textarea Markdown Editor */}
                    <textarea
                      id="note-editor-textarea"
                      value={editorContent}
                      onChange={(e) => handleContentChange(e.target.value)}
                      placeholder="Write markdown here... Use heading shortcuts or bold flags."
                      className="flex-1 w-full bg-transparent border-none outline-none resize-none font-mono text-sm text-gray-300 leading-relaxed overflow-y-auto custom-scrollbar"
                    />
                  </div>
                ) : (
                  /* Preview Mode Canvas (Markdown HTML parsed output) */
                  <div className="flex-1 overflow-y-auto pr-1 space-y-4 min-h-0 custom-scrollbar">
                    <h1 className="text-3xl font-extrabold text-white tracking-tight border-b border-gray-900 pb-2">
                      {editorTitle || "Untitled Page"}
                    </h1>
                    <div
                      className="markdown-preview text-sm text-gray-300 leading-relaxed font-sans"
                      dangerouslySetInnerHTML={{ __html: parseMarkdown(editorContent) }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
