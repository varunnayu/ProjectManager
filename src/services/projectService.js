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

/**
 * ProjectService — CRUD operations for the "projects" resource.
 */
export const ProjectService = {
  async create(data, userId) {
    const docRef = await addDoc(collection(db, COLLECTION), {
      ...data,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { id: docRef.id, ...data };
  },

  async update(id, data) {
    const ref = doc(db, COLLECTION, id);
    await updateDoc(ref, {
      ...data,
      updatedAt: serverTimestamp(),
    });
    return { id, ...data };
  },

  async archive(id) {
    return this.update(id, { status: "archived" });
  },

  async delete(id) {
    await deleteDoc(doc(db, COLLECTION, id));
  },

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

  async getById(id) {
    const snap = await getDoc(doc(db, COLLECTION, id));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  },

  async getAllForUser(userId) {
    const q = query(
      collection(db, COLLECTION),
      where("userId", "==", userId)
    );
    const snap = await getDocs(q);
    return snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
  },

  async getRecentActive(userId, n = 5) {
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
