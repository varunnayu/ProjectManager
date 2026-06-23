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

/**
 * ResourceService — handles Firestore cataloging and Cloud Storage uploads.
 */
export const ResourceService = {
  /**
   * Upload a file to Firebase Cloud Storage.
   * @param {File} file - File object
   * @returns {Promise<string>} - Download URL
   */
  async uploadFile(file) {
    if (!storage) throw new Error("Firebase Storage is not initialized");

    const fileRef = ref(storage, `resources/${Date.now()}_${file.name}`);
    await uploadBytes(fileRef, file);
    return getDownloadURL(fileRef);
  },

  /**
   * Upload a user avatar to Firebase Cloud Storage.
   * @param {File} file - Image file
   * @param {string} userId - Owner's UID
   * @returns {Promise<string>} - Download URL
   */
  async uploadAvatar(file, userId) {
    if (!storage) throw new Error("Firebase Storage is not initialized");

    const fileRef = ref(storage, `avatars/${userId}_${Date.now()}`);
    await uploadBytes(fileRef, file);
    return getDownloadURL(fileRef);
  },

  /**
   * Create a new resource metadata record.
   * @param {object} data - Resource details
   * @param {string} userId - Owner's UID
   */
  async create(data, userId) {
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
    await deleteDoc(doc(db, COLLECTION, id));
  },

  /**
   * Fetch all resources for a user.
   * @param {string} userId
   */
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
};
