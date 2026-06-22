import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/**
 * ProtectedRoute — protects routes from unauthenticated users.
 * Redirects to `/login` if not authenticated.
 */
export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-bg-primary)] gap-3">
        <div className="spinner" />
        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Verifying session...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
