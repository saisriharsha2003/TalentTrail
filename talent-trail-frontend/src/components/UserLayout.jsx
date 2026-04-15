import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

const UserLayout = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  return user
    ? <Outlet />
    : <Navigate to="/login" state={{ from: location }} replace />;
};

export default UserLayout;