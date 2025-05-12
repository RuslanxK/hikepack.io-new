import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function AdminRoute() {
  const { isAuthenticated, isAdmin } = useAuth();
  return isAuthenticated && isAdmin ? <Outlet /> : <Navigate to="/welcome" />;
}

export default AdminRoute;
