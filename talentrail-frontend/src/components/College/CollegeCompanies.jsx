import React, { useState, useEffect } from 'react';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { notify } from '../Toast';
import { useNavigate } from 'react-router-dom';

const CollegeCompanies = () => {
    const [recruiters, setRecruiters] = useState([]);
    const navigate = useNavigate();
    const axios = useAxiosPrivate();

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
        const fetchCompanies = async () => {
            try {
                const response = await axios.get('/college/companies');

                const recruiters = response?.data
                setRecruiters(recruiters);
            } catch (err) {
                notify('failed', err?.response?.data?.message);
            }
        }
        fetchCompanies();
    }, [axios]);

    return (
        <div className="container py-4 bg-light min-vh-100">
            <div className="d-flex justify-content-between align-items-center mb-5 mx-4">
                <div>
                    <h2 className="fw-bold mb-1">Partner Companies</h2>
                    <p className="text-muted mb-0">Manage and view all recruiters registered with your college.</p>
                </div>
            </div>

            <div className="row g-4 mx-2">
                {recruiters.length > 0 ? (
                    recruiters.map((recruiter, index) => (
                        <div key={index} className="col-md-6 col-lg-4 col-xl-3">
                            <div className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden stat-card" 
                                 style={{ transition: '0.3s', cursor: 'pointer' }}
                                 onClick={() => navigate(recruiter._id)}>
                                <div className="card-body p-4 text-center">
                                    <div className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center mx-auto mb-3" 
                                         style={{ width: '80px', height: '80px' }}>
                                        {recruiter?.company?.logo ? (
                                            <img src={`data:image/jpeg;base64,${bufferToBase64(recruiter.company.logo.data)}`} 
                                                 alt={recruiter?.company?.name} 
                                                 className="rounded-circle" 
                                                 style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <span className="fs-2 fw-bold text-primary">
                                                {recruiter?.company?.name?.charAt(0) || 'C'}
                                            </span>
                                        )}
                                    </div>
                                    <h5 className="fw-bold text-dark mb-1">{recruiter?.company?.name}</h5>
                                    <p className="text-muted small mb-3">{recruiter?.company?.industry || 'Recruitment Partner'}</p>
                                    <div className="d-grid">
                                        <button className="btn btn-outline-primary btn-sm rounded-pill px-4">View Profile</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-12 text-center py-5">
                        <div className="bg-white p-5 rounded-4 shadow-sm d-inline-block">
                            <i className="bi bi-building-exclamation fs-1 text-muted mb-3 d-block"></i>
                            <h4 className="fw-bold text-muted">No Companies Registered</h4>
                            <p className="text-muted mb-0">Approved recruiters will appear here.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default CollegeCompanies;