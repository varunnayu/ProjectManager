import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  getDocs,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase/config";

const COLLECTION = "resources";

// Default initial resources for local storage fallback
const INITIAL_LOCAL_RESOURCES = [
  {
    id: "res-1",
    title: "React 19 Official Docs",
    type: "documentation",
    url: "https://react.dev",
    projectId: "proj-ai-generator",
    projectTitle: "AI Content Generator",
    createdAt: new Date().toISOString(),
    userId: "mock-user-123",
  },
  {
    id: "res-2",
    title: "Framer Motion Recipes",
    type: "documentation",
    url: "https://www.framer.com/motion/",
    projectId: "all",
    projectTitle: "General Resources",
    createdAt: new Date().toISOString(),
    userId: "mock-user-123",
  },
  {
    id: "res-3",
    title: "Tailwind v4 Cheat Sheet",
    type: "link",
    url: "https://tailwindcss.com/docs",
    projectId: "proj-ecommerce",
    projectTitle: "E-commerce Dashboard",
    createdAt: new Date().toISOString(),
    userId: "mock-user-123",
  },
  {
    id: "res-4",
    title: "Project Repository Core",
    type: "github",
    url: "https://github.com",
    projectId: "proj-mobile-banking",
    projectTitle: "Mobile Banking App",
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
  getResources() {
    const data = localStorage.getItem("pv_local_resources");
    if (!data) {
      localStorage.setItem("pv_local_resources", JSON.stringify(INITIAL_LOCAL_RESOURCES));
      return INITIAL_LOCAL_RESOURCES;
    }
    return JSON.parse(data);
  },
  saveResources(resources) {
    localStorage.setItem("pv_local_resources", JSON.stringify(resources));
  },
  create(data, userId) {
    const resources = this.getResources();
    const newRes = {
      id: `res-${Math.random().toString(36).substring(2, 9)}`,
      ...data,
      userId: userId || "mock-user-123",
      createdAt: new Date().toISOString(),
    };
    resources.unshift(newRes);
    this.saveResources(resources);
    return newRes;
  },
  delete(id) {
    const resources = this.getResources();
    const filtered = resources.filter((r) => r.id !== id);
    this.saveResources(filtered);
  },
  getAll(userId) {
    const resources = this.getResources();
    return userId ? resources.filter((r) => r.userId === userId) : resources;
  },
};

/**
 * ResourceService — handles Firestore cataloging and Cloud Storage uploads.
 * Automatically falls back to LocalStorage & Local Blob files if Firebase config has default placeholder keys.
 */
export const ResourceService = {
  /**
   * Upload a file to Firebase Cloud Storage.
   * Falls back to a local URL.createObjectURL reference if Firebase is not linked.
   * @param {File} file - File object
   * @returns {Promise<string>} - Download URL
   */
  async uploadFile(file) {
    if (!isFirebaseConfigured() || !storage) {
      // Local demo mode: generate a temporary blob URL for previews
      return new Promise((resolve) => {
        setTimeout(() => {
          const blobUrl = URL.createObjectURL(file);
          resolve(blobUrl);
        }, 1200); // Simulate upload latency
      });
    }

    const fileRef = ref(storage, `resources/${Date.now()}_${file.name}`);
    await uploadBytes(fileRef, file);
    return getDownloadURL(fileRef);
  },

  /**
   * Create a new resource metadata record.
   * @param {object} data - Resource details
   * @param {string} userId - Owner's UID
   */
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

  /**
   * Permanently delete a resource.
   * @param {string} id
   */
  async delete(id) {
    if (!isFirebaseConfigured()) {
      return LocalStorageDB.delete(id);
    }
    await deleteDoc(doc(db, COLLECTION, id));
  },

  /**
   * Fetch all resources for a user.
   * @param {string} userId
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
};
