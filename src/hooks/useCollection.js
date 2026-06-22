import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase/config";

/**
 * useCollection — real-time Firestore collection listener.
 *
 * @param {string} collectionPath   - Firestore collection path (e.g. "projects")
 * @param {Array}  [constraints=[]] - Array of Firestore query constraints
 * @param {string} [orderField]     - Field to order by (optional)
 * @returns {{ data: Array, loading: boolean, error: Error | null }}
 *
 * @example
 * const { data: projects, loading } = useCollection("projects", [
 *   where("userId", "==", user.uid)
 * ], "createdAt");
 */
export function useCollection(collectionPath, constraints = [], orderField = null) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!collectionPath) return;

    const queryConstraints = [...constraints];
    if (orderField) {
      queryConstraints.push(orderBy(orderField, "desc"));
    }

    const ref = collection(db, collectionPath);
    const q = query(ref, ...queryConstraints);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setData(docs);
        setLoading(false);
      },
      (err) => {
        console.error(`useCollection [${collectionPath}]:`, err);
        setError(err);
        setLoading(false);
      }
    );

    return unsubscribe;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionPath, orderField]);

  return { data, loading, error };
}
