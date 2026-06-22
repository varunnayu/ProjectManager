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

const COLLECTION = "notes";

// Default initial data for local storage fallback
const INITIAL_LOCAL_NOTES = [
  {
    id: "note-1",
    title: "ProjectVault AI Architecture Decisions",
    content: "# Architecture Decision: Modular Monolith vs Microservices\n\nDate: June 2026\nStatus: **Approved**\n\nAfter reviewing team capacity and expected traffic, we decided to start with a modular monolith and migrate to microservices as needed.\n\n## Key Factors:\n- Team size (4 developers)\n- Deployment complexity (Vercel + Firebase)\n- Observability requirements\n\n```javascript\n// Simple directory routing structure\nsrc/\n├── components/\n├── pages/\n├── firebase/\n└── services/\n```",
    category: "Architecture",
    projectId: "proj-ai-generator",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: "mock-user-123",
  },
  {
    id: "note-2",
    title: "Firebase Security Rules Draft",
    content: "# Firebase Security Rules\n\n## Overview:\n- Users can only read/write their own data.\n- Admin role can access all collections.\n- Public read on the `resources` collection.\n\n```json\n{\n  \"rules\": {\n    \"projects\": {\n      \"$project_id\": {\n        \".read\": \"auth != null && data.child('userId').val() == auth.uid\"\n      }\n    }\n  }\n}\n```",
    category: "Security",
    projectId: "proj-ecommerce",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: "mock-user-123",
  },
  {
    id: "note-3",
    title: "UX Animation Guidelines",
    content: "# UX Animation Guidelines\n\nUse Framer Motion to stagger elements. Keep durations short and spring transitions snappy.\n\n### Timing Tokens:\n- Fast: `150ms` cubic-bezier(0.4, 0, 0.2, 1)\n- Base: `250ms` cubic-bezier(0.4, 0, 0.2, 1)\n- Slow: `400ms` cubic-bezier(0.4, 0, 0.2, 1)\n\n*Hover animations should translateY by -2px to -4px.*",
    category: "Design",
    projectId: "proj-ai-generator",
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
  getNotes() {
    const data = localStorage.getItem("pv_local_notes");
    if (!data) {
      localStorage.setItem("pv_local_notes", JSON.stringify(INITIAL_LOCAL_NOTES));
      return INITIAL_LOCAL_NOTES;
    }
    return JSON.parse(data);
  },
  saveNotes(notes) {
    localStorage.setItem("pv_local_notes", JSON.stringify(notes));
  },
  create(data, userId) {
    const notes = this.getNotes();
    const newNote = {
      id: `note-${Math.random().toString(36).substring(2, 9)}`,
      ...data,
      userId: userId || "mock-user-123",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    notes.unshift(newNote);
    this.saveNotes(notes);
    return newNote;
  },
  update(id, data) {
    const notes = this.getNotes();
    const updated = notes.map((n) => {
      if (n.id === id) {
        return {
          ...n,
          ...data,
          updatedAt: new Date().toISOString(),
        };
      }
      return n;
    });
    this.saveNotes(updated);
    return updated.find((n) => n.id === id);
  },
  delete(id) {
    const notes = this.getNotes();
    const filtered = notes.filter((n) => n.id !== id);
    this.saveNotes(filtered);
  },
  getAll(userId) {
    const notes = this.getNotes();
    return userId ? notes.filter((n) => n.userId === userId) : notes;
  },
  getByProject(projectId) {
    return this.getNotes().filter((n) => n.projectId === projectId);
  },
};

/**
 * NoteService — CRUD operations for Notion-like notes.
 * Automatically falls back to LocalStorage if Firebase credentials are placeholder values.
 */
export const NoteService = {
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
