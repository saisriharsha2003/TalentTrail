import { Outlet, useNavigate, Link } from 'react-router-dom';
import axios from '../api/axios';
import useAxiosPrivate from '../hooks/useAxiosPrivate';
import { jwtDecode } from 'jwt-decode';
import { notify } from './Toast';
import '../styles/nav.css'
import React, { useEffect, useState } from 'react';


const Layout = () => {
    const navigate = useNavigate();
    const axiosP = useAxiosPrivate();
    const [profile, setProfile] = useState('');
    const [notifications, setNotifications] = useState([]);
    const [newN, setNewN] = useState(false);
    const [interval, setinterval] = useState();
    const [link,setLink]=useState('/');

    const accessToken = localStorage.getItem('accessToken');
    let decoded;
    if (accessToken)
        decoded = jwtDecode(accessToken);

    const bufferToBase64 = (bufferArray) => {
        const chunkSize = 100000;
        let base64String = '';

        for (let i = 0; i < bufferArray.length; i += chunkSize) {
            const chunk = bufferArray.slice(i, i + chunkSize);
            base64String += String.fromCharCode.apply(null, chunk);
        }

        return btoa(base64String);
    }

    useEffect(() => {
        const fetchNotifications = async () => {
            let decoded;
            if (accessToken)
                decoded = jwtDecode(accessToken);
            else return
            if (decoded?.userInfo?.role === 'admin' || decoded?.userInfo?.role === 'college') return
            try {
                const notificationResponse = await axiosP.get(`/${decoded?.userInfo?.role}/notifications`);
                setNotifications(notificationResponse?.data);
                setinterval(setInterval(async () => {
                    const notificationResponse = await axiosP.get(`/${decoded?.userInfo?.role}/notifications`);
                    // if (notifications[0] !== notificationResponse?.data[0])
                    //     setNewN(true);
                    // else setNewN(false);
                    setNotifications(notificationResponse?.data);
                }, 60000))

                return () => {
                    const i = interval;
                    clearInterval(i)
                }
            } catch (err) {
                const i = interval;
                clearInterval(i)
                notify('failed', err?.response?.data?.message);
            }
        }
        fetchNotifications();
    }, []);

    useEffect(() => {
        const fetchProfile = async () => {
            let decoded;
            if (accessToken)
                decoded = jwtDecode(accessToken);
            else return
            try {
                setLink('/user/'+decoded?.userInfo?.role);
                const response = await axiosP.get(`/${decoded?.userInfo?.role}/profile`);

                const photo = response?.data
                if (photo?.data.length)
                    setProfile(`data:image/jpeg;base64,${bufferToBase64(photo?.data)}`);

            } catch (err) {
                notify('failed', err?.response?.data?.message);
            }
        }
        fetchProfile();
    }, [accessToken, axiosP]);

    const logout = async () => {
        try {
            const accessToken = localStorage.getItem('accessToken');
            const decoded = jwtDecode(accessToken);
            await axios.post('/logout', { role: decoded.userInfo.role })
            localStorage.removeItem('accessToken');
            localStorage.removeItem('parsedOutput');
            localStorage.removeItem("jdOutput")
            setProfile('');
            const i = interval;
            clearInterval(i)
            notify('success', 'Successfully logged out');
        } catch (err) {
            notify('failed', err?.response?.data?.message);
        }
        navigate('/');
    }

    const [isOpen, setIsOpen] = useState(false);

    const toggleNavbar = () => {
        setIsOpen(!isOpen);
    };

    return (
        <>
        
            <nav className="navbar px-2" data-bs-theme="dark" style={{ backgroundColor: '#0f172a' }}>
            <link rel="preconnect" href="https://fonts.googleapis.com"/>
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/>
            <link href="https://fonts.googleapis.com/css2?family=Pacifico&display=swap" rel="stylesheet"/>
                <div className="container-fluid">
                    <div className='d-flex align-items-center'>
                        {
                            !decoded?.userInfo?.username ? null :  <button className="navbar-toggler" type="button" onClick={toggleNavbar}>
                            <span className="navbar-toggler-icon"></span> {/* Hamburger icon */}
                        </button>
                        }
                            
                        <Link className="navbar-brand mx-5 fs-3 pacifico-regular" to={link || "/"}>Talentrail</Link>    
                    </div>
                    <ul className="navbar-nav d-flex flex-row align-items-center">
                        {!decoded?.userInfo?.username
                            ? <>
                                <li className="nav-item mx-md-3 mx-lg-4 mx-sm-2 mx-xs-1"><a className="nav-link" href="#iirxi">Features</a></li>
                                <li className="nav-item mx-md-3 mx-lg-4 mx-sm-2 mx-xs-1"><a className="nav-link" href="#footer">Contact</a></li>
                                <li className="nav-item mx-md-3 mx-lg-4 mx-sm-2 mx-xs-1"><Link className="nav-link" to="/login">Login</Link></li>
                                <li className="nav-item mx-md-3 mx-lg-4 mx-sm-2 mx-xs-1"><Link className="nav-link" to="/signup">Signup</Link></li>
                            </>
                            : <>
                                <li className="nav-item mx-1">
                                    <div className="dropdown" style={{ float: 'right' }}>
                                        <button className="position-relative nav-button" onMouseOver={() => setNewN(false)}>
                                            <svg width="55" height="55" viewBox="0 0 24.00 24.00" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff" strokeWidth="0.00024000000000000003">
                                                <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                                                <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round" stroke="#CCCCCC" strokeWidth="0.048"></g>
                                                <g id="SVGRepo_iconCarrier">
                                                    <path d="M9.75005 4.75C9.33584 4.75 9.00005 5.08579 9.00005 5.5C9.00005 5.91421 9.33584 6.25 9.75005 6.25V4.75ZM12.6751 6.25C13.0893 6.25 13.4251 5.91421 13.4251 5.5C13.4251 5.08579 13.0893 4.75 12.6751 4.75V6.25ZM9.48794 17.0191C9.48249 16.605 9.14232 16.2736 8.72814 16.2791C8.31396 16.2845 7.98262 16.6247 7.98807 17.0389L9.48794 17.0191ZM11.2126 19.5L11.2228 18.7501C11.216 18.75 11.2092 18.75 11.2023 18.7501L11.2126 19.5ZM14.437 17.0389C14.4425 16.6247 14.1111 16.2845 13.697 16.2791C13.2828 16.2736 12.9426 16.605 12.9372 17.0191L14.437 17.0389ZM8.73703 17.779C9.15124 17.779 9.48703 17.4432 9.48703 17.029C9.48703 16.6148 9.15124 16.279 8.73703 16.279V17.779ZM7.63723 17.029L7.631 17.779H7.63723V17.029ZM5.85005 15.168L6.60005 15.1732V15.168H5.85005ZM6.57058 12.676L5.82897 12.5641L5.82888 12.5647L6.57058 12.676ZM6.76558 11.276L7.50406 11.4069C7.50578 11.3972 7.50731 11.3875 7.50865 11.3777L6.76558 11.276ZM11.2126 7.147L11.2433 6.39763C11.2228 6.39679 11.2022 6.39679 11.1817 6.39763L11.2126 7.147ZM15.6595 11.273L14.9165 11.3751C14.9177 11.3836 14.919 11.392 14.9204 11.4004L15.6595 11.273ZM15.8545 12.673L16.5962 12.5617L16.596 12.5605L15.8545 12.673ZM16.5751 15.165L15.825 15.165L15.8251 15.1706L16.5751 15.165ZM14.7879 17.027L14.7879 17.777L14.7941 17.777L14.7879 17.027ZM13.6871 16.277C13.2729 16.277 12.9371 16.6128 12.9371 17.027C12.9371 17.4412 13.2729 17.777 13.6871 17.777V16.277ZM8.73703 16.277C8.32281 16.277 7.98703 16.6128 7.98703 17.027C7.98703 17.4412 8.32281 17.777 8.73703 17.777V16.277ZM13.6871 17.777C14.1013 17.777 14.4371 17.4412 14.4371 17.027C14.4371 16.6128 14.1013 16.277 13.6871 16.277V17.777ZM9.75005 6.25H12.6751V4.75H9.75005V6.25ZM7.98807 17.0389C8.01146 18.8183 9.4421 20.2742 11.2228 20.2499L11.2023 18.7501C10.2859 18.7625 9.50091 18.006 9.48794 17.0191L7.98807 17.0389ZM11.2023 20.2499C12.983 20.2742 14.4136 18.8183 14.437 17.0389L12.9372 17.0191C12.9242 18.006 12.1392 18.7625 11.2228 18.7501L11.2023 20.2499ZM8.73703 16.279H7.63723V17.779H8.73703V16.279ZM7.64345 16.279C7.08063 16.2744 6.59573 15.7972 6.60003 15.1732L5.10007 15.1628C5.09031 16.5785 6.20512 17.7671 7.631 17.779L7.64345 16.279ZM6.60005 15.168C6.60005 14.891 6.69326 14.6047 6.85708 14.1992C7.00452 13.8342 7.23096 13.3291 7.31227 12.7873L5.82888 12.5647C5.78052 12.8869 5.6467 13.1908 5.46629 13.6373C5.30227 14.0433 5.10005 14.571 5.10005 15.168H6.60005ZM7.31219 12.7879C7.40448 12.1759 7.4489 11.7181 7.50406 11.4069L6.02709 11.1451C5.97305 11.4499 5.90047 12.0901 5.82897 12.5641L7.31219 12.7879ZM7.50865 11.3777C7.77569 9.42625 9.35923 7.97389 11.2434 7.89637L11.1817 6.39763C8.54483 6.50613 6.38434 8.53009 6.0225 11.1743L7.50865 11.3777ZM11.1818 7.89637C13.0651 7.97369 14.6484 9.42473 14.9165 11.3751L16.4025 11.1709C16.0392 8.52798 13.8791 6.50584 11.2433 6.39763L11.1818 7.89637ZM14.9204 11.4004C14.9759 11.7223 15.0202 12.1736 15.113 12.7855L16.596 12.5605C16.525 12.0924 16.4504 11.4457 16.3986 11.1456L14.9204 11.4004ZM15.1128 12.7843C15.1941 13.3261 15.4206 13.8312 15.568 14.1962C15.7318 14.6017 15.8251 14.888 15.8251 15.165H17.3251C17.3251 14.568 17.1228 14.0403 16.9588 13.6343C16.7784 13.1878 16.6446 12.8839 16.5962 12.5617L15.1128 12.7843ZM15.8251 15.1706C15.8297 15.7949 15.3447 16.2724 14.7817 16.277L14.7941 17.777C16.2205 17.7651 17.3355 16.5756 17.325 15.1594L15.8251 15.1706ZM14.7879 16.277H13.6871V17.777H14.7879V16.277ZM8.73703 17.777H13.6871V16.277H8.73703V17.777Z" fill="#ffffff"></path>
                                                </g>
                                            </svg>
                                            {newN && (
                                                <span className="position-absolute start-50 bg-danger border border-light rounded-circle">
                                                    <span className="visually-hidden"></span>
                                                </span>
                                            )}
                                        </button>
                                        <ul className="notification-dropdown-content list-group">
                                            {
                                                notifications.length
                                                    ? notifications.map((notification, index) =>
                                                    (
                                                        <li key={index} className='list-group-item'>{notification}</li>
                                                    ))
                                                    : <li className='list-group-item'>No notifications</li>
                                            }
                                        </ul>
                                    </div>
                                </li>
                                <li className="nav-item mx-1">
                                    <div className="dropdown" style={{ float: 'right' }}>
                                        <button className="nav-button dropbtn">
                                            {profile ?
                                                <img className='profile' src={profile} height={'35'} alt='' />
                                                : <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="white" className="bi bi-person-circle" viewBox="0 0 16 16">
                                                    <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0" />
                                                    <path fillRule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1" />
                                                </svg>
                                            }
                                        </button>
                                        <ul className="dropdown-content list-group">
                                            <li className='list-group-item' onClick={() => navigate(`/user/${decoded?.userInfo?.role}/profile`)}>Profile</li>
                                            <li className='list-group-item' onClick={logout}>Logout</li>
                                        </ul>
                                    </div>
                                </li>
                            </>}
                    </ul>
                </div>
            </nav >

            <div className='d-flex'>

                {decoded?.userInfo?.username &&
                    (
                        <nav id="ibd6" className={`sidebar ${isOpen ? 'active' : ''}`}>
                            <div className={`collapse navbar-collapse ${isOpen ? '' : 'show'}`}>
                            {decoded?.userInfo?.role === 'student' && (
                                <ul className="list-unstyled components sidebar-ul">
                                    <li className="sidebar-list">
                                        <Link className='nav-link active rounded' to='/user/student'>Dashboard</Link>
                                    </li>
                                    <li className="sidebar-list">
                                        <Link className='nav-link active rounded' to='/user/student/jobOpenings'>Job openings</Link>
                                    </li>
                                    <li className="sidebar-list">
                                        <Link className='nav-link active rounded' to='/user/student/applied'>Applied jobs</Link>
                                    </li>
                                    {/* <li className="sidebar-list">
                                        <Link className='nav-link active'>Match jobs</Link>
                                    </li> */}
                                    <li className="sidebar-list">
                                        <Link className='nav-link active rounded' to='/user/student/profile'>Profile</Link>
                                    </li>
                                </ul>
                            )}
                            </div>
                            <div className={`collapse navbar-collapse ${isOpen ? '' : 'show'}`}>

                            {decoded?.userInfo?.role === 'recruiter' && (
                                <ul className="list-group list-group-flush">
                                    <li className="sidebar-list">
                                        <Link className='nav-link active rounded' to='/user/recruiter'>Dashboard</Link>
                                    </li>
                                    <li className="sidebar-list">
                                        <Link className='nav-link active rounded' to='/user/recruiter/new'>Post new job</Link>
                                    </li>
                                    <li className="sidebar-list">
                                        <Link className='nav-link active rounded' to='/user/recruiter/posted'>Posted jobs</Link>
                                    </li>
                                    <li className="sidebar-list">
                                        <Link className='nav-link active rounded' to='/user/recruiter/applications'>Applications</Link >
                                    </li>
                                    <li className="sidebar-list">
                                        <Link className='nav-link active rounded' to='/user/recruiter/profile'>Profile</Link >
                                    </li>
                                </ul >
                            )}
                            </div>
                            <div className={`collapse navbar-collapse ${isOpen ? '' : 'show'}`}>

                            {
                                decoded?.userInfo?.role === 'college' && (
                                    <ul className="list-group list-group-flush">
                                        <li className="sidebar-list">
                                            <Link className='nav-link active rounded' to='/user/college'>Dashboard</Link>
                                        </li>
                                        <li className="sidebar-list">
                                            <Link className='nav-link active rounded' to='/user/college/companies'>Companies</Link>
                                        </li>
                                        <li className="sidebar-list">
                                            <Link className='nav-link active rounded' to='/user/college/sections'>Sections</Link>
                                        </li>
                                        <li className="sidebar-list">
                                            <Link className='nav-link active rounded' to='/user/college/drives'>Placement drives</Link>
                                        </li>
                                        <li className="sidebar-list">
                                            <Link className='nav-link active rounded' to='/user/college/profile'>Profile</Link>
                                        </li>
                                    </ul >
                                )
                            }
                            </div>
                            <div className={`collapse navbar-collapse ${isOpen ? '' : 'show'}`}>
                            {
                                decoded?.userInfo?.role === 'admin' && (
                                    <ul className="list-group list-group-flush">
                                        <li className="sidebar-list">
                                            <Link className='nav-link active rounded' to='/user/admin'>Dashboard</Link>
                                        </li>
                                        <li className="sidebar-list">
                                            <Link className='nav-link active rounded' to='/user/admin/students'>Students</Link >
                                        </li>
                                        <li className="sidebar-list">
                                            <Link className='nav-link active rounded' to='/user/admin/recruiters'>Recruiters</Link >
                                        </li>
                                        <li className="sidebar-list">
                                            <Link className='nav-link active rounded' to='/user/admin/openings'>Openings</Link >
                                        </li>
                                        <li className="sidebar-list">
                                            <Link className='nav-link active rounded' to='/user/admin/selected'>Selected</Link >
                                        </li>
                                        <li className="sidebar-list">
                                            <Link className='nav-link active rounded' to='/user/admin/profile'>Profile</Link >
                                        </li>
                                    </ul >
                                )
                            }
                            </div>
                        </nav >
                    )
                }

                <div className='outlet'>
                    <Outlet />
                </div>

            </div >
        </>
    )
}

export default Layout;
