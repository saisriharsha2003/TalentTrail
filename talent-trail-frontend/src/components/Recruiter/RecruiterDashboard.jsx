import React, { useEffect, useState } from 'react';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { notify } from '../Toast';
import '../../assets/styles/dash.css'
import { useNavigate } from 'react-router-dom';
import { Chart as ChartJs, defaults } from 'chart.js/auto'
import { Bar, Doughnut, PolarArea } from 'react-chartjs-2'

const RecruiterDashboard = () => {
    const [posted, setPosted] = useState(0);
    const [applicantsSelected, setApplicantsSelected] = useState(0);
    const [applicantsRejected, setApplicantsRejected] = useState(0);
    const [applicants, setApplicants] = useState(0);
    const [username, setUsername] = useState('');
    const [profile, setProfile] = useState('');

    const navigate = useNavigate();
    const axios = useAxiosPrivate();
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

    useEffect(() => {
        const fetchRecruiter = async () => {
            try {
                const response = await axios.get('/recruiter');
                const recruiter = response?.data;

                // ✅ Correct mapping
                setPosted(recruiter?.posted || 0);
                setApplicants(recruiter?.applicants || 0);
                setApplicantsSelected(recruiter?.selected || 0);
                setApplicantsRejected(recruiter?.rejected || 0);
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
        labels: ['Applicants', 'Selected', 'Rejected'],
        datasets: [
            {
                label: 'Candidates',
                backgroundColor: [
                    'rgba(99, 102, 241, 0.8)',
                    'rgba(34, 197, 94, 0.8)',
                    'rgba(239, 68, 68, 0.8)'
                ],
                borderWidth: 1,
                data: [applicants, applicantsSelected, applicantsRejected]
            }
        ]
    };

    const doughnutChartData = {
        labels: ['Selected', 'Rejected', 'Remaining'],
        datasets: [
            {
                label: 'Distribution',
                backgroundColor: [
                    'rgba(34, 197, 94, 0.8)',
                    'rgba(239, 68, 68, 0.8)',
                    'rgba(59, 130, 246, 0.8)'
                ],
                data: [
                    applicantsSelected,
                    applicantsRejected,
                    Math.max(applicants - applicantsSelected - applicantsRejected, 0)
                ]
            }
        ]
    };

    const chartOptions = {
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
                                <svg width="125" height="125" fill="#0f172a" viewBox="0 0 16 16">
                                    <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0" />
                                    <path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8" />
                                </svg>
                            )}
                        </div>
                        <div className="welcome-message text-center">
                            <h2 className="welcome-title">Welcome back, {username}</h2>
                        </div>
                    </div>
                </div>

                <div className='d-flex justify-content-center align-items-center m-3'>
                    <div className='row'>

                        <StatCard
                            title="📄 Jobs Posted"
                            value={posted}
                            color="#3b82f6"
                            onClick={() => navigate('/user/recruiter/posted')}
                        />

                        <StatCard
                            title="👥 Total Applicants"
                            value={applicants}
                            color="#8b5cf6"
                            onClick={() => navigate('/user/recruiter/applications')}
                        />

                        <StatCard
                            title="✅ Selected"
                            value={applicantsSelected}
                            color="#22c55e"
                        />

                        <StatCard
                            title="❌ Rejected"
                            value={applicantsRejected}
                            color="#ef4444"
                        />

                    </div>
                </div>

                <div className='row mx-2 mb-5'>

                    <div className='col-md-6 col-sm-12'>
                        <div className='card m-4 shadow-sm'>
                            <div className="card-body px-4 py-2">
                                <h2 className="card-title mt-2 mb-3">Candidate Analytics</h2>
                                <Bar data={barChartData} options={chartOptions} />
                            </div>
                        </div>
                    </div>

                    <div className='col-md-6 col-sm-12'>
                        <div className='card m-4 shadow-sm'>
                            <div className="card-body px-4 py-2">
                                <h2 className="card-title mt-2 mb-3">Selection Breakdown</h2>
                                <Doughnut data={doughnutChartData} options={chartOptions} />
                            </div>
                        </div>
                    </div>

                </div>

            </div>
        </>
    )
}

/* 🔥 REUSABLE STAT CARD */

const StatCard = ({ title, value, color, onClick }) => (
    <div className='col-md-6 col-sm-12'>
        <div
            className="card m-3 shadow"
            style={{ cursor: onClick ? "pointer" : "default" }}
            onClick={onClick}
        >
            <div className="card-body">
                <h5 className="card-title">{title}</h5>
                <h3 style={{ color }}>{value}</h3>
            </div>
        </div>
    </div>
);

export default RecruiterDashboard;