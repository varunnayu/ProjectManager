import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/config";

/**
 * useDocument — real-time Firestore single document listener.
 *
 * @param {string} collectionPath - Collection name (e.g. "projects")
 * @param {string} documentId     - Document ID to listen to
 * @returns {{ document: object | null, loading: boolean, error: Error | null }}
 *
 * @example
 * const { document: project, loading } = useDocument("projects", projectId);
 */
export function useDocument(collectionPath, documentId) {
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!collectionPath || !documentId) return;

    const ref = doc(db, collectionPath, documentId);

    const unsubscribe = onSnapshot(
      ref,
      (snapshot) => {
        if (snapshot.exists()) {
          setDocument({ id: snapshot.id, ...snapshot.data() });
        } else {
          setDocument(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error(`useDocument [${collectionPath}/${documentId}]:`, err);
        setError(err);
        setLoading(false);
      }
    );

    return () => {
      setTimeout(() => {
        unsubscribe();
      }, 100);
    };
  }, [collectionPath, documentId]);

  return { document, loading, error };
}
