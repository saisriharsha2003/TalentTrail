import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { notify } from '../Toast';
import { useEffect } from 'react';
import { useAuth } from '../AuthContext';

const AdminLayout = () => {
    const { user, loading } = useAuth();
    const location = useLocation();

    useEffect(() => {
        if (user && user.userInfo.role !== 'admin') {
            notify('failed', 'Unauthorized');
        }
    }, [user]);

    if (loading) return null;

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (user.userInfo.role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default AdminLayout;