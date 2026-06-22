import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "../firebase/config";

const COLLECTION = "projects";

// Default initial data for local storage fallback
const INITIAL_LOCAL_PROJECTS = [
  {
    id: "proj-ai-generator",
    title: "AI Content Generator",
    description: "Build a full-stack AI-powered content generation platform with GPT-4 integration and real-time preview.",
    status: "active",
    priority: "high",
    progress: 72,
    startDate: "2026-06-01",
    dueDate: "2026-07-15",
    tags: ["AI", "SaaS", "Content"],
    technologies: ["React", "Tailwind", "Node.js", "OpenAI"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: "mock-user-123",
  },
  {
    id: "proj-ecommerce",
    title: "E-commerce Dashboard",
    description: "Admin dashboard for managing products, orders, and customers with rich interactive analytics charts.",
    status: "in-progress",
    priority: "medium",
    progress: 45,
    startDate: "2026-05-10",
    dueDate: "2026-08-01",
    tags: ["Dashboard", "E-commerce"],
    technologies: ["Vue", "Firebase", "Chart.js", "Tailwind"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: "mock-user-123",
  },
  {
    id: "proj-mobile-banking",
    title: "Mobile Banking App",
    description: "Cross-platform mobile banking application with biometric authentication and real-time push notifications.",
    status: "completed",
    priority: "high",
    progress: 100,
    startDate: "2026-03-01",
    dueDate: "2026-06-30",
    tags: ["Finance", "Mobile", "Security"],
    technologies: ["React Native", "Expo", "Redux", "Node.js"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: "mock-user-123",
  },
];

// Helper to determine if Firebase is validly configured
const isFirebaseConfigured = () => {
  try {
    return (
      db &&
      db.app &&
      db.app.options &&
      db.app.options.apiKey &&
      db.app.options.apiKey !== "YOUR_API_KEY"
    );
  } catch {
    return false;
  }
};

// --- Local Storage fallback implementation ---
const LocalStorageDB = {
  getProjects() {
    const data = localStorage.getItem("pv_local_projects");
    if (!data) {
      localStorage.setItem("pv_local_projects", JSON.stringify(INITIAL_LOCAL_PROJECTS));
      return INITIAL_LOCAL_PROJECTS;
    }
    return JSON.parse(data);
  },
  saveProjects(projects) {
    localStorage.setItem("pv_local_projects", JSON.stringify(projects));
  },
  create(data, userId) {
    const projects = this.getProjects();
    const newProj = {
      id: `proj-${Math.random().toString(36).substring(2, 9)}`,
      ...data,
      userId: userId || "mock-user-123",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    projects.unshift(newProj);
    this.saveProjects(projects);
    return newProj;
  },
  update(id, data) {
    const projects = this.getProjects();
    const updated = projects.map((p) => {
      if (p.id === id) {
        return {
          ...p,
          ...data,
          updatedAt: new Date().toISOString(),
        };
      }
      return p;
    });
    this.saveProjects(updated);
    return updated.find((p) => p.id === id);
  },
  delete(id) {
    const projects = this.getProjects();
    const filtered = projects.filter((p) => p.id !== id);
    this.saveProjects(filtered);
  },
  getById(id) {
    return this.getProjects().find((p) => p.id === id) || null;
  },
  getAll(userId) {
    // Filter by userId if present, else return all
    const projects = this.getProjects();
    return userId ? projects.filter((p) => p.userId === userId) : projects;
  },
};

/**
 * ProjectService — CRUD operations for the "projects" resource.
 * Automatically falls back to LocalStorage if Firebase credentials are placeholder values.
 */
export const ProjectService = {
  /**
   * Create a new project document.
   * @param {object} data - Project fields
   * @param {string} userId - Owner's UID
   * @returns {Promise<object>}
   */
  async create(data, userId) {
    if (!isFirebaseConfigured()) {
      return LocalStorageDB.create(data, userId);
    }
    const docRef = await addDoc(collection(db, COLLECTION), {
      ...data,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { id: docRef.id, ...data };
  },

  /**
   * Update an existing project.
   * @param {string} id   - Document ID
   * @param {object} data - Partial updates
   */
  async update(id, data) {
    if (!isFirebaseConfigured()) {
      return LocalStorageDB.update(id, data);
    }
    const ref = doc(db, COLLECTION, id);
    await updateDoc(ref, {
      ...data,
      updatedAt: serverTimestamp(),
    });
    return { id, ...data };
  },

  /**
   * Soft-archive a project (sets status to "archived").
   * @param {string} id
   */
  async archive(id) {
    return this.update(id, { status: "archived" });
  },

  /**
   * Permanently delete a project document.
   * @param {string} id
   */
  async delete(id) {
    if (!isFirebaseConfigured()) {
      return LocalStorageDB.delete(id);
    }
    await deleteDoc(doc(db, COLLECTION, id));
  },

  /**
   * Duplicate a project.
   * @param {string} id - Project ID to clone
   * @returns {Promise<object>} - Cloned project details
   */
  async duplicate(id) {
    const origin = await this.getById(id);
    if (!origin) throw new Error("Project not found");

    const clonedData = {
      title: `${origin.title} (Copy)`,
      description: origin.description || "",
      status: "planning",
      priority: origin.priority || "medium",
      progress: 0,
      startDate: origin.startDate || "",
      dueDate: origin.dueDate || "",
      tags: origin.tags || [],
      technologies: origin.technologies || [],
    };

    return this.create(clonedData, origin.userId);
  },

  /**
   * Fetch a single project by ID.
   * @param {string} id
   * @returns {Promise<object | null>}
   */
  async getById(id) {
    if (!isFirebaseConfigured()) {
      return LocalStorageDB.getById(id);
    }
    const snap = await getDoc(doc(db, COLLECTION, id));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  },

  /**
   * Fetch all projects for a user.
   * @param {string} userId
   * @returns {Promise<object[]>}
   */
  async getAllForUser(userId) {
    if (!isFirebaseConfigured()) {
      return LocalStorageDB.getAll(userId);
    }
    const q = query(
      collection(db, COLLECTION),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  },

  /**
   * Fetch the N most recent active projects.
   * @param {string} userId
   * @param {number} [n=5]
   * @returns {Promise<object[]>}
   */
  async getRecentActive(userId, n = 5) {
    if (!isFirebaseConfigured()) {
      const all = LocalStorageDB.getAll(userId);
      return all
        .filter((p) => p.status === "active" || p.status === "in-progress")
        .slice(0, n);
    }
    const q = query(
      collection(db, COLLECTION),
      where("userId", "==", userId),
      where("status", "==", "active"),
      orderBy("updatedAt", "desc"),
      limit(n)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  },
};
