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
} from "firebase/firestore";
import { db } from "../firebase/config";

const COLLECTION = "tasks";

// Default initial tasks for local storage fallback
const INITIAL_LOCAL_TASKS = [
  {
    id: "task-1",
    title: "Set up CI/CD pipeline",
    description: "Write GitHub Actions workflow to run lint, tests, and build bundles. Trigger deployments on main merge.",
    projectId: "proj-ai-generator",
    projectTitle: "AI Content Generator",
    status: "todo",
    priority: "high",
    dueDate: "2026-06-18",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: "mock-user-123",
  },
  {
    id: "task-2",
    title: "Design onboarding user flow",
    description: "Create wireframes for user landing, email verify, and first project setup wizard screens.",
    projectId: "all",
    projectTitle: "General Tasks",
    status: "in-progress",
    priority: "medium",
    dueDate: "2026-06-25",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: "mock-user-123",
  },
  {
    id: "task-3",
    title: "Write Firebase security rules",
    description: "Define rules for firestore collections. Check that resource links are public, projects private.",
    projectId: "proj-ecommerce",
    projectTitle: "E-commerce Dashboard",
    status: "todo",
    priority: "high",
    dueDate: "2026-06-20",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: "mock-user-123",
  },
  {
    id: "task-4",
    title: "Optimize web bundle size",
    description: "Analyze chunks, tree shake unused modules, and code-split heavy pages to run on loaders.",
    projectId: "proj-mobile-banking",
    projectTitle: "Mobile Banking App",
    status: "done",
    priority: "low",
    dueDate: "2026-06-10",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: "mock-user-123",
  },
  {
    id: "task-5",
    title: "Conduct API security audit",
    description: "Inspect rate limiting parameters, check JWT token expiration, and secure CORS headers.",
    projectId: "all",
    projectTitle: "General Tasks",
    status: "in-review",
    priority: "urgent",
    dueDate: "2026-06-17",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: "mock-user-123",
  },
];

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

const LocalStorageDB = {
  getTasks() {
    const data = localStorage.getItem("pv_local_tasks");
    if (!data) {
      localStorage.setItem("pv_local_tasks", JSON.stringify(INITIAL_LOCAL_TASKS));
      return INITIAL_LOCAL_TASKS;
    }
    return JSON.parse(data);
  },
  saveTasks(tasks) {
    localStorage.setItem("pv_local_tasks", JSON.stringify(tasks));
  },
  create(data, userId) {
    const tasks = this.getTasks();
    const newTask = {
      id: `task-${Math.random().toString(36).substring(2, 9)}`,
      ...data,
      userId: userId || "mock-user-123",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    tasks.unshift(newTask);
    this.saveTasks(tasks);
    return newTask;
  },
  update(id, data) {
    const tasks = this.getTasks();
    const updated = tasks.map((t) => {
      if (t.id === id) {
        return {
          ...t,
          ...data,
          updatedAt: new Date().toISOString(),
        };
      }
      return t;
    });
    this.saveTasks(updated);
    return updated.find((t) => t.id === id);
  },
  delete(id) {
    const tasks = this.getTasks();
    const filtered = tasks.filter((t) => t.id !== id);
    this.saveTasks(filtered);
  },
  getAll(userId) {
    const tasks = this.getTasks();
    return userId ? tasks.filter((t) => t.userId === userId) : tasks;
  },
  getByProject(projectId) {
    return this.getTasks().filter((t) => t.projectId === projectId);
  },
};

/**
 * TaskService — CRUD operations for advanced task management.
 * Automatically falls back to LocalStorage if Firebase credentials are placeholder values.
 */
export const TaskService = {
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

  async delete(id) {
    if (!isFirebaseConfigured()) {
      return LocalStorageDB.delete(id);
    }
    await deleteDoc(doc(db, COLLECTION, id));
  },

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

  async getByProjectId(projectId) {
    if (!isFirebaseConfigured()) {
      return LocalStorageDB.getByProject(projectId);
    }
    const q = query(
      collection(db, COLLECTION),
      where("projectId", "==", projectId),
      orderBy("createdAt", "desc")
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  },
};
