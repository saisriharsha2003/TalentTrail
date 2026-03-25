import React, { useEffect, useState } from 'react';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { notify } from '../Toast';
import '../../styles/dash.css'
import { useNavigate, useLocation } from 'react-router-dom';
import { Chart as ChartJs, defaults } from 'chart.js/auto'

import { Bar, Doughnut, Line, PolarArea } from 'react-chartjs-2'



const RecruiterDashboard = () => {
    const [posted, setPosted] = useState();
    const [applicantsSelected, setApplicantsSelected] = useState();
    const [applicantsRejected, setApplicantsRejected] = useState();
    const [applicants, setApplicants] = useState();
    const [username, setUsername] = useState();
    const [profile, setProfile] = useState('');
    const navigate = useNavigate();
    defaults.responsive = true;



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

    useEffect(() => {
        const fetchRecruiter = async () => {
            try {
                const response = await axios.get('/recruiter')

                const recruiter = response?.data
                console.log(recruiter)
                setPosted(recruiter?.posted || 0);
                setApplicantsSelected(recruiter?.selected || 0);
                setApplicantsRejected(recruiter?.rejected || 0);
                setApplicants(recruiter?.applicants || 0);
                setUsername(recruiter?.username || '');
                if (recruiter?.profile)
                    setProfile(`data:image/jpeg;base64,${bufferToBase64(recruiter?.profile?.data)}`);

            } catch (err) {
                notify('failed', err?.response?.data?.message);
            }
        }
        fetchRecruiter();
    }, [axios]);

    const barChartData = {
        labels: ['Applied', 'Openings', 'Selected', 'Rejected'],
        datasets: [
            {
                label: 'Count',
                backgroundColor: ['rgba(255, 99, 132, 0.8)',
                    'rgba(255, 159, 64, 0.8)',
                    'rgba(255, 205, 86, 0.8)',
                    'rgba(75, 192, 192, 0.8)',],
                borderColor: ['rgb(255, 99, 132)',
                    'rgb(255, 159, 64)',
                    'rgb(255, 205, 86)',
                    'rgb(75, 192, 192)'],
                borderWidth: 1,
                hoverBackgroundColor: ['rgba(255, 99, 132, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(255, 205, 86, 1)',
                    'rgba(75, 192, 192, 1)'],
                hoverBorderColor: '#000',
                data: [posted, applicants, applicantsSelected, applicantsRejected]
            }
        ]
    };

    const doughnutChartData = {
        labels: ['Selected', 'Rejected', 'Applied'],
        datasets: [
            {
                label: 'Count',
                backgroundColor: ['rgba(255, 159, 64, 0.8)', 'rgba(255, 205, 86, 0.8)', 'rgba(153, 102, 255, 0.8)'],
                borderColor: ['rgba(255, 159, 64, 0.7)', 'rgba(255, 205, 86, 0.7)', 'rgba(153, 102, 255, 0.7)',],
                borderWidth: 1,
                hoverBackgroundColor: ['rgba(255, 159, 64, 1)', 'rgba(255, 205, 86, 1)', 'rgba(153, 102, 255, 1)'],
                hoverBorderColor: '#000',
                data: [applicantsSelected, applicantsRejected, posted]
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
                            <div className="card m-3 box1 shadow profile-container" onClick={() => navigate('/user/recruiter/applications')} >
                                <div className="card-body">
                                    <h3 className="card-title">Jobs applied</h3>
                                    <h3 className="mb-2" style={{ color: '#3b82f6' }}>{posted}</h3>
                                </div>
                            </div>
                        </div>
                        <div className='col-md-6 col-sm-12'>
                            <div className="card m-3 box1 shadow profile-container" onClick={() => navigate('/user/recruiter/applications')} >
                                <div className="card-body">
                                    <h3 className="card-title">Jobs rejected</h3>
                                    <h3 className="mb-2" style={{ color: '#ef4444' }}>{applicantsRejected}</h3>
                                </div>
                            </div>
                        </div>
                        <div className='col-md-6 col-sm-12'>
                            <div className="card m-3 box1 shadow profile-container" onClick={() => navigate('/user/recruiter/applications')} >
                                <div className="card-body">
                                    <h3 className="card-title">Jobs selected</h3>
                                    <h3 className="mb-2" style={{ color: '#ffc107' }}>{applicantsSelected}</h3>
                                </div>
                            </div>
                        </div>
                        <div className='col-md-6 col-sm-12'>
                            <div className="card m-3 box1 shadow profile-container" onClick={() => navigate('/user/recruiter/posted')} >
                                <div className="card-body">
                                    <h3 className="card-title">Job Openings</h3>
                                    <h3 className="mb-2" style={{ color: '#28a745' }}>{applicants}</h3>
                                </div>
                            </div>
                        </div>

                    </div>

                </div>

                <div className='row mx-2 mb-5'>
                    <div className='col-md-6 col-sm-12'>
                        <div className='card m-4 shadow-sm' height="1000px" width="1000px">
                            <div className="card-body my-2 px-4 py-2">
                                <h2 className="card-title mb-3 mb-4 pb-1 mt-2 pb-md-0 mb-md-3">Company Analytics</h2>
                                {/* <div className='card shadow'> */}
                                <Bar data={barChartData} options={barChartOptions} className='mb-2 p-2' />
                                {/* </div> */}
                            </div>



                        </div>
                    </div>
                    <div className='col-md-6 col-sm-12'>
                        <div className='card m-4 shadow-sm' height="1000px" width="1000px">
                            <div className="card-body my-2 px-4 py-2">
                                <h2 className="card-title mb-3 mt-2 mb-4 pb-1 pb-md-0 mb-md-3">Recruitment Analytics</h2>
                                {/* <div className='card shadow'> */}
                                <PolarArea data={doughnutChartData} options={doughnutChartOptions} className='mb-2 p-2' />
                                {/* </div> */}
                            </div>


                        </div>
                    </div>
                </div>


            </div>

        </>
    )
}

export default RecruiterDashboard;