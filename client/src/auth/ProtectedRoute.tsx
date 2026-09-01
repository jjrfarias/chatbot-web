import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";

export function ProtectedRoute() {
  const { session, loading } = useAuth();

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-cr-muted">Carregando...</div>;
  }
  if (!session) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}
