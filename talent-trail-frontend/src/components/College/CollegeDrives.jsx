import React, { useState, useEffect } from 'react';
import { notify } from '../Toast';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { Link } from 'react-router-dom';

const CollegeDrives = () => {
    const [pastDrives, setPastDrives] = useState([]);
    const [upcomingDrives, setUpcomingDrives] = useState([]);

    const axios = useAxiosPrivate();

    const fetchDrives = async () => {
        try {
            const response = await axios.get('/college/drives');

            const drives = response?.data
            setPastDrives(drives?.approved);
            setUpcomingDrives(drives?.pending);
        } catch (err) {
            notify('failed', err?.response?.data?.message);
        }
    }

    useEffect(() => {
        const fetchDrives = async () => {
            try {
                const response = await axios.get('/college/drives');

                const drives = response?.data
                setPastDrives(drives?.approved);
                setUpcomingDrives(drives?.pending);
            } catch (err) {
                notify('failed', err?.response?.data?.message);
            }
        }
        fetchDrives();
    }, [axios]);

    const handleApproval = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/college/job/' + e.target.id);

            const success = response?.data?.success;
            if (success)
                notify('success', success);

            fetchDrives();
        } catch (err) {
            notify('failed', err?.response?.data?.message);
        }
    }


    return (
        <div className="container py-4 bg-light min-vh-100">
            <div className="mb-5 mx-4">
                <h2 className="fw-bold mb-1">Placement Drives</h2>
                <p className="text-muted mb-0">Approve and track recruitment drives for your institution.</p>
            </div>

            <div className="row g-4 mx-2">
                {/* Upcoming Drives Section */}
                <div className="col-12 mb-5">
                    <h4 className="fw-bold mb-4 d-flex align-items-center">
                        <span className="badge bg-warning text-dark me-2 rounded-pill px-3">Upcoming</span>
                        Pending Approvals
                    </h4>
                    
                    {upcomingDrives.length > 0 ? (
                        <div className="row g-3">
                            {upcomingDrives.map((drive, index) => (
                                <div key={index} className="col-12">
                                    <div className="card border-0 shadow-sm rounded-4 overflow-hidden stat-card">
                                        <div className="card-body p-4">
                                            <div className="d-flex justify-content-between align-items-start mb-3">
                                                <div>
                                                    <h5 className="fw-bold text-dark mb-1">{drive.jobRole}</h5>
                                                    <p className="text-primary fw-medium mb-0">{drive.companyName}</p>
                                                </div>
                                                <div className="d-flex gap-2">
                                                    <Link className="btn btn-outline-secondary btn-sm rounded-pill px-3" to={drive._id}>View Details</Link>
                                                    <button id={drive._id} className="btn btn-success btn-sm rounded-pill px-4" onClick={handleApproval}>Approve Drive</button>
                                                </div>
                                            </div>
                                            <p className="text-muted mb-0 text-truncate-3">{drive.description}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white p-4 rounded-4 shadow-sm text-center border-dashed border-2">
                            <p className="text-muted mb-0">No pending drive requests at the moment.</p>
                        </div>
                    )}
                </div>

                {/* Past Drives Section */}
                <div className="col-12">
                    <h4 className="fw-bold mb-4 d-flex align-items-center">
                        <span className="badge bg-success me-2 rounded-pill px-3">Active</span>
                        Approved Drives
                    </h4>
                    
                    {pastDrives.length > 0 ? (
                        <div className="row g-3">
                            {pastDrives.map((drive, index) => (
                                <div key={index} className="col-12">
                                    <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                                        <div className="card-body p-4">
                                            <div className="d-flex justify-content-between align-items-start mb-3">
                                                <div>
                                                    <h5 className="fw-bold text-dark mb-1">{drive.jobRole}</h5>
                                                    <p className="text-primary fw-medium mb-0">{drive.companyName}</p>
                                                </div>
                                                <Link className="btn btn-light btn-sm rounded-pill px-4 border" to={drive._id}>View Analytics</Link>
                                            </div>
                                            <p className="text-muted mb-0 text-truncate-3">{drive.description}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white p-4 rounded-4 shadow-sm text-center border-dashed border-2">
                            <p className="text-muted mb-0">No approved drives yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default CollegeDrives;