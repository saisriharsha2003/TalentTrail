import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { notify } from '../Toast';
import { useEffect } from 'react';
import { useAuth } from '../AuthContext';

const StudentLayout = () => {
    const { user, loading } = useAuth();
    const location = useLocation();

    useEffect(() => {
        if (user && user.userInfo.role !== 'student') {
            notify('failed', 'Unauthorized');
        }
    }, [user]);

    if (loading) return null;

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (user.userInfo.role !== 'student') {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default StudentLayout;