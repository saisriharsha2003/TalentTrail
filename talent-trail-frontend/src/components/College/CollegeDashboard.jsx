import React, { useEffect, useState } from 'react';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import '../../assets/styles/dash.css';
import { notify } from '../Toast';
import { useNavigate, useLocation } from 'react-router-dom';
import { Chart as ChartJs, defaults } from 'chart.js/auto'

import { Bar, Doughnut, Line, PolarArea } from 'react-chartjs-2'

const CollegeDashboard = () => {
    const [totalPlacements, setTotalPlacements] = useState();
    const [ongoingDrives, setOngoingDrives] = useState();
    const [upcomingDrives, setUpcomingDrives] = useState();
    const [companiesRegistered, setCompaniesRegistered] = useState();
    const [username, setUsername] = useState();
    const [name, setName] = useState();
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
        const fetchCollege = async () => {
            try {
                const response = await axios.get('/college')

                const college = response?.data
                setTotalPlacements(college?.selectedStudents || 0);
                setOngoingDrives(college?.ongoingDrives || 0);
                setUpcomingDrives(college?.upcomingDrives || 0);
                setCompaniesRegistered(college?.registeredCompanies || 0);
                setUsername(college?.username || '');
                setName(college?.institution_name || '');
                if (college?.profile)
                    setProfile(`data:image/jpeg;base64,${bufferToBase64(college?.profile?.data)}`);

            } catch (err) {
                notify('failed', err?.response?.data?.message);
            }
        }
        fetchCollege();
    }, [axios]);

    const barChartData = {
        labels: ['Registered companies', 'Upcoming drives', 'Ongoing drives', 'Total placements'],
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
                data: [companiesRegistered, upcomingDrives, ongoingDrives, totalPlacements]
            }
        ]
    };

    const doughnutChartData = {
        labels: ['Registered companies', 'Upcoming drives', 'Ongoing drives'],
        datasets: [
            {
                label: 'Count',
                backgroundColor: ['rgba(255, 159, 64, 0.8)', 'rgba(255, 205, 86, 0.8)', 'rgba(153, 102, 255, 0.8)'],
                borderColor: ['rgba(255, 159, 64, 0.7)', 'rgba(255, 205, 86, 0.7)', 'rgba(153, 102, 255, 0.7)',],
                borderWidth: 1,
                hoverBackgroundColor: ['rgba(255, 159, 64, 1)', 'rgba(255, 205, 86, 1)', 'rgba(153, 102, 255, 1)'],
                hoverBorderColor: '#000',
                data: [companiesRegistered, upcomingDrives, ongoingDrives]
            }
        ]
    };

    const barChartOptions = {
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

    const doughnutChartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
        },
        aspectRatio: 1.3,
    };

    return (
        <div className="container-fluid py-4 bg-light min-vh-100">
            <div className="row mb-4">
                <div className="col-12">
                    <div className="card border-0 shadow-sm rounded-4 overflow-hidden" 
                         style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)' }}>
                        <div className="card-body p-4 d-flex align-items-center text-white">
                            <div className="me-4 profile-container">
                                {profile ? (
                                    <img src={profile} className="rounded-circle border border-4 border-white-50 shadow" 
                                         height="100" width="100" style={{ objectFit: 'cover' }} alt="Profile" />
                                ) : (
                                    <div className="bg-white-50 rounded-circle d-flex align-items-center justify-content-center" 
                                         style={{ width: '100px', height: '100px' }}>
                                        <i className="bi bi-person-circle fs-1 text-white"></i>
                                    </div>
                                )}
                            </div>
                            <div>
                                <h2 className="fw-bold mb-1">Welcome back, {name}! 👋</h2>
                                <p className="mb-0 opacity-75">Here's what's happening at your campus today.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="row g-4 mb-4">
                {[
                    { label: 'Total Placements', value: totalPlacements, color: '#4f46e5', icon: 'bi-mortarboard', path: '/user/college/drives' },
                    { label: 'Ongoing Drives', value: ongoingDrives, color: '#ef4444', icon: 'bi-play-circle', path: '/user/college/drives' },
                    { label: 'Upcoming Drives', value: upcomingDrives, color: '#f59e0b', icon: 'bi-calendar-event', path: '/user/college/drives' },
                    { label: 'Registered Companies', value: companiesRegistered, color: '#10b981', icon: 'bi-building', path: '/user/college/companies' }
                ].map((stat, i) => (
                    <div key={i} className="col-md-6 col-lg-3">
                        <div className="card border-0 shadow-sm rounded-4 h-100 stat-card" 
                             onClick={() => navigate(stat.path)} 
                             style={{ cursor: 'pointer', transition: '0.3s' }}>
                            <div className="card-body p-4">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <div className="rounded-3 p-3" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                                        <i className={`bi ${stat.icon} fs-4`}></i>
                                    </div>
                                    <span className="text-muted small fw-medium">View Details</span>
                                </div>
                                <h3 className="fw-bold mb-1" style={{ color: '#1e293b' }}>{stat.value}</h3>
                                <p className="text-muted mb-0 fw-medium">{stat.label}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Analytics Section */}
            <div className="row g-4">
                <div className="col-lg-7">
                    <div className="card border-0 shadow-sm rounded-4 h-100">
                        <div className="card-body p-4">
                            <h5 className="fw-bold mb-4 d-flex align-items-center">
                                <i className="bi bi-bar-chart-fill text-primary me-2"></i>
                                Placement Analytics
                            </h5>
                            <div style={{ height: '350px' }}>
                                <Bar data={barChartData} options={{...barChartOptions, maintainAspectRatio: false}} />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-lg-5">
                    <div className="card border-0 shadow-sm rounded-4 h-100">
                        <div className="card-body p-4 text-center">
                            <h5 className="fw-bold mb-4 text-start d-flex align-items-center">
                                <i className="bi bi-pie-chart-fill text-warning me-2"></i>
                                Drive Distribution
                            </h5>
                            <div style={{ height: '350px', display: 'flex', justifyContent: 'center' }}>
                                <Doughnut data={doughnutChartData} options={{...doughnutChartOptions, maintainAspectRatio: false}} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CollegeDashboard;