import { Navigate, Outlet } from 'react-router';
import { useAuthStore } from '../stores/auth';

export function ProtectedRoute({ adminOnly = false }: { adminOnly?: boolean }) {
  const { accessToken, user } = useAuthStore();
  if (!accessToken) return <Navigate to="/login" replace />;
  if (adminOnly && user?.role !== 'admin') return <Navigate to="/avisos" replace />;
  return <Outlet />;
}
