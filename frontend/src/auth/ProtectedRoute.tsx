import {Navigate, Outlet} from "react-router-dom";
import {useAuth} from "./AuthContext"

interface Props {
    requiredRole?: "user"| "admin"
}

export function ProtectedRoute({ requiredRole }: Props) {
  const { user, token, isLoading } = useAuth();

  // Still checking localStorage / verifying token
  if (isLoading) {
    return <div style={{ padding: "2rem" }}>Loading...</div>;
  }

  // Not logged in
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but wrong role
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/403" replace />;
  }

  // All good — render the child route
  return <Outlet />;
}