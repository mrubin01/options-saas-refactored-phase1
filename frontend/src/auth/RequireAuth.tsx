import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { token, isInitializing } = useAuth();
  const location = useLocation();

  if (isInitializing) {
    return <div className="text-sm text-gray-500 py-6">Checking session…</div>;
  }

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
