import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, allowedRole }) {
  const { token, role, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!token) {
    return <Navigate to={`/${allowedRole}/login`} />;
  }

  if (role !== allowedRole) {
    return <Navigate to="/" />;
  }

  return children;
}