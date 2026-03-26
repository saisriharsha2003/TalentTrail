import { Outlet, useNavigate } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode';
import { notify } from '../Toast';
import { useEffect, React } from 'react';

const StudentLayout = () => {
    const accessToken = localStorage.getItem('accessToken');
    const decoded = jwtDecode(accessToken);
    const navigate = useNavigate();

    const goback = () => navigate(-1)

    useEffect(() => {
        if (decoded?.userInfo?.role !== 'student')
            notify('failed', 'unauthorized');
    }, [decoded?.userInfo?.role])

    return (
        decoded?.userInfo?.role === 'student'
            ? <Outlet />
            : <button className='btn btn-primary' onClick={goback}>go back</button>

    )
}

export default StudentLayout;