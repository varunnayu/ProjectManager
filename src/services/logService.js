import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  getDocs,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase/config";

const COLLECTION = "dev_logs";

// Default initial dev logs for local storage fallback
const INITIAL_LOCAL_LOGS = [
  {
    id: "log-1",
    date: "2026-06-16",
    projectId: "proj-ai-generator",
    projectTitle: "AI Content Generator",
    completedWork: "Implemented regex-based vanilla Markdown compiler for preview windows. Optimized regex replace speed by debouncing typing inputs to 1 second.",
    issues: "Encountered inline backtick styling wrapping problems when header markup matches. Added separate text checks.",
    nextSteps: "Secure Cloud Storage upload file sizes. Configure Firestore security indexes for tags filtering.",
    createdAt: new Date().toISOString(),
    userId: "mock-user-123",
  },
  {
    id: "log-2",
    date: "2026-06-15",
    projectId: "proj-ecommerce",
    projectTitle: "E-commerce Dashboard",
    completedWork: "Wired project duplication service logic. Cloned database items copy title, set progress metrics to zero, and append (Copy) tags.",
    issues: "Duplication fails to copy linked checklist tasks due to missing array references.",
    nextSteps: "Map nested checklist task objects during duplication method execution.",
    createdAt: new Date().toISOString(),
    userId: "mock-user-123",
  },
  {
    id: "log-3",
    date: "2026-06-14",
    projectId: "proj-mobile-banking",
    projectTitle: "Mobile Banking App",
    completedWork: "Created app routing guards and authenticated sessions wrappers. Locked private dashboard subpaths under verification conditions.",
    issues: "onAuthStateChanged listener triggers hanging loading page states on blank configurations.",
    nextSteps: "Injected default mock profile checks to resolve verification loader instantly.",
    createdAt: new Date().toISOString(),
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
  getLogs() {
    const data = localStorage.getItem("pv_local_logs");
    if (!data) {
      localStorage.setItem("pv_local_logs", JSON.stringify(INITIAL_LOCAL_LOGS));
      return INITIAL_LOCAL_LOGS;
    }
    return JSON.parse(data);
  },
  saveLogs(logs) {
    localStorage.setItem("pv_local_logs", JSON.stringify(logs));
  },
  create(data, userId) {
    const logs = this.getLogs();
    const newLog = {
      id: `log-${Math.random().toString(36).substring(2, 9)}`,
      ...data,
      userId: userId || "mock-user-123",
      createdAt: new Date().toISOString(),
    };
    logs.unshift(newLog);
    this.saveLogs(logs);
    return newLog;
  },
  update(id, data) {
    const logs = this.getLogs();
    const updated = logs.map((l) => {
      if (l.id === id) {
        return {
          ...l,
          ...data,
          updatedAt: new Date().toISOString(),
        };
      }
      return l;
    });
    this.saveLogs(updated);
    return updated.find((l) => l.id === id);
  },
  delete(id) {
    const logs = this.getLogs();
    const filtered = logs.filter((l) => l.id !== id);
    this.saveLogs(filtered);
  },
  getAll(userId) {
    const logs = this.getLogs();
    // Sort by Date descending
    const sorted = [...logs].sort((a, b) => new Date(b.date) - new Date(a.date));
    return userId ? sorted.filter((l) => l.userId === userId) : sorted;
  },
};

/**
 * LogService — CRUD operations for Daily Development Logs.
 * Automatically falls back to LocalStorage if Firebase config is not initialized.
 */
export const LogService = {
  async create(data, userId) {
    if (!isFirebaseConfigured()) {
      return LocalStorageDB.create(data, userId);
    }
    const docRef = await addDoc(collection(db, COLLECTION), {
      ...data,
      userId,
      createdAt: serverTimestamp(),
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
      orderBy("date", "desc")
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  },
};
