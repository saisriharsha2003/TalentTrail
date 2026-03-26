import React from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode';
import { notify } from '../Toast';
import { useEffect } from 'react';

const CollegeLayout = () => {
    const accessToken = localStorage.getItem('accessToken');
    const decoded = jwtDecode(accessToken);
    const navigate = useNavigate();

    const goback = () => navigate(-1)

    useEffect(() => {
        if (decoded?.userInfo?.role !== 'college')
            notify('failed', 'unauthorized');
    }, [decoded?.userInfo?.role])

    return (
        decoded?.userInfo?.role === 'college'
            ? <Outlet />
            : <button onClick={goback}>go back</button>
    )
}

export default CollegeLayout