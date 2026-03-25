import { Outlet, useLocation, Navigate } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode';

const UserLayout = () => {
    const accessToken = localStorage.getItem('accessToken');
    let decoded;
    if (accessToken)
        decoded = jwtDecode(accessToken);
    const location = useLocation();

    return (
        decoded?.userInfo?.username
            ? <Outlet />
            : <Navigate to='/login' state={{ from: location }} replace />
    )
}

export default UserLayout;