import React, { useEffect, useState } from 'react';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { notify } from '../Toast';
import '../../styles/dash.css';
import { Chart as ChartJs, defaults } from 'chart.js/auto'
import { Bar, Doughnut, Line, PolarArea, Pie, Radar } from 'react-chartjs-2'
import { useNavigate, useLocation } from 'react-router-dom';

const AdminDashboard = () => {
    const [studentsSelected, setStudentsSelected] = useState();
    const [students, setStudents] = useState();
    const [recruiters, setRecruiters] = useState();
    const [username, setUsername] = useState();
    const [profile, setProfile] = useState('');

    const bufferToBase64 = (bufferArray) => {
        const chunkSize = 100000;
        let base64String = '';

        for (let i = 0; i < bufferArray.length; i += chunkSize) {
            const chunk = bufferArray.slice(i, i + chunkSize);
            base64String += String.fromCharCode.apply(null, chunk);
        }

        return btoa(base64String);
    }

    const axios = useAxiosPrivate();
    defaults.responsive = true;


    useEffect(() => {
        const fetchAdmin = async () => {
            try {
                const response = await axios.get('/admin')

                const admin = response?.data
                setStudentsSelected(admin?.selected || 0);
                setStudents(admin?.students || 0);
                setRecruiters(admin?.recruiters || 0);
                setUsername(admin?.username || '');
                if (admin?.profile)
                    setProfile(`data:image/jpeg;base64,${bufferToBase64(admin?.profile?.data)}`);

            } catch (err) {
                notify('failed', err?.response?.data?.message);
            }
        }
        fetchAdmin();
    }, [axios]);
    const navigate = useNavigate();

    const barChartData = {
        labels: ['Selected students', 'Students', 'Recruiters'],
        datasets: [
            {
                label: 'Count',
                backgroundColor: ['rgba(255, 99, 132, 0.8)',
                    'rgba(255, 159, 64, 0.8)',
                    'rgba(255, 205, 86, 0.8)',
                   ],
                borderColor: ['rgb(255, 99, 132)',
                    'rgb(255, 159, 64)',
                    'rgb(255, 205, 86)',
                    ],
                borderWidth: 1,
                hoverBackgroundColor: ['rgba(255, 99, 132, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(255, 205, 86, 1)',
                   ],
                hoverBorderColor: '#000',
                data: [studentsSelected, students, recruiters]
            }
        ]
    };

    const doughnutChartData = {
        labels: ['Selected Students', 'Students', 'Recruiters'],
        datasets: [
            {
                label: 'Count',
                backgroundColor: ['rgba(153, 102, 255, 0.8)', 'rgba(255, 159, 64, 0.8)', 'rgba(53, 152, 195, 0.8)'],
                borderColor: ['rgba(153, 102, 255, 0.7)', 'rgba(255, 159, 64, 0.7)', 'rgba(53, 152, 195, 0.7)'],
                borderWidth: 1,
                hoverBackgroundColor: ['rgba(153, 102, 255, 1)', 'rgba(255, 159, 64, 1)', 'rgba(53, 152, 195, 1)'],
                hoverBorderColor: '#000',
                data: [studentsSelected, students, recruiters]
            }
        ]
    };

    const barChartOptions = {
        // maintainAspectRatio: false, // Disable aspect ratio so you can control width and height independently
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
        },
        scales: {
            y: {
                beginAtZero: true,
            },
        },
        aspectRatio: 1.3,
        // Adjust width and height as needed
        // width: 600,
        // height: 600,
    };

    // For the Doughnut chart
    const doughnutChartOptions = {
        // maintainAspectRatio: false, // Disable aspect ratio so you can control width and height independently
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
        },
        aspectRatio: 1.3,
        // Adjust width and height as needed
        // width: 600,
        // height: 600,
    };

    return (
        <>
            <div className='d-flex flex-column ml-3'>

            <div className="welcome-container my-5 mb-4 px-0 mx-0">
                    <div className="welcome-content d-flex flex-row justify-content-center align-items-center p-3 shadow">
                        <div className="profile-container pe-3"> 
                            {profile ? (
                                <img className="profile-image mx-auto d-block" src={profile} height={'125'} alt='' /> 
                            ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="155" height="155" fill="#0f172a" className="bi bi-person-circle" viewBox="0 0 16 16">
                                <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0" />
                                <path fillRule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1" />
                            </svg>
                            )}
                        </div>
                        <div className="welcome-message text-center"> {/* Add text-center class */}
                            <h2 className="welcome-title">Welcome back, {username}</h2>
                
                        </div>
                    </div>
                </div>

                

                <div className='d-flex justify-content-center align-items-center m-3'>

                    <div className='row'>
                        <div className='col-md-6 col-sm-12'>
                            <div className="card m-3 box1 shadow profile-container" onClick={() => navigate('/user/admin/students')} >
                                <div className="card-body">
                                    <h3 className="card-title">Students</h3>
                                    <h3 className="mb-2" style={{ color: '#3b82f6' }}>{students}</h3>
                                </div>
                            </div>
                        </div>
                        <div className='col-md-6 col-sm-12'>
                            <div className="card m-3 box1 shadow profile-container"  onClick={() => navigate('/user/admin/recruiters')} >
                                <div className="card-body">
                                    <h3 className="card-title">Recruiters</h3>
                                    <h3 className="mb-2" style={{ color: '#ef4444' }}>{recruiters}</h3>
                                </div>
                            </div>
                        </div>
                        <div className='col-md-12 col-sm-12'>
                            <div className="card m-3 box1 shadow profile-container" onClick={() => navigate('/user/admin/selected')} >
                                <div className="card-body">
                                    <h3 className="card-title">Selected students</h3>
                                    <h3 className="mb-2" style={{ color: '#ffc107' }}>{studentsSelected}</h3>
                                </div>
                            </div>
                        </div>

                    </div>

                </div>

                <div className='row mx-2 my-4'>
                <div className='col-md-6 col-sm-12'>
                    <div className='card m-4 shadow-sm' height="1000px" width="1000px">
                        <div className="card-body my-2 px-4 py-2">
                            <h2 className="card-title mb-3 mb-4 pb-1 mt-2 pb-md-0 mb-md-3">Count Analytics</h2>
                            {/* <div className='card shadow'> */}
                            <Radar data={barChartData} options={barChartOptions} className='mb-2 p-2' />
                            {/* </div> */}
                        </div>



                    </div>
                </div>
                <div className='col-md-6 col-sm-12'>
                    <div className='card m-4 shadow-sm' height="1000px" width="1000px">
                        <div className="card-body my-2 px-4 py-2">
                            <h2 className="card-title mb-3 mt-2 mb-4 pb-1 pb-md-0 mb-md-3">Students Analytics</h2>
                            {/* <div className='card shadow'> */}
                            <Pie data={doughnutChartData} options={doughnutChartOptions} className='mb-2 p-2' />
                            {/* </div> */}
                        </div>


                    </div>
                    {/* <PieChart/>s */}
                </div>
                </div>

            

                {/* <div className='d-flex justify-content-center align-items-center m-3'>

                    <div className="card m-2 box1" >
                        <div className="card-body">
                            <h3 className="card-title">Selected students</h3>
                            <h3 className="mb-2" style={{ color: '#3b82f6' }}>{studentsSelected}</h3>
                        </div>
                    </div>

                    <div className="card m-2 box1" >
                        <div className="card-body">
                            <h3 className="card-title">Students</h3>
                            <h3 className="mb-2" style={{ color: '#ef4444' }}>{students}</h3>
                        </div>
                    </div>

                    <div className="card m-2 box1" >
                        <div className="card-body">
                            <h3 className="card-title">Recruiters</h3>
                            <h3 className="mb-2" style={{ color: '#ffc107' }}>{recruiters}</h3>
                        </div>
                    </div>

                </div> */}

            </div>

        </>
    )

}

export default AdminDashboard;