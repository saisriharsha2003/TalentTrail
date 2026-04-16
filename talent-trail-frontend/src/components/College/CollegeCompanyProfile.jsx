import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { notify } from '../Toast';

const CollegeCompanyProfile = () => {
    const companyDefault = {
        name: '',
        industry: '',
        size: '',
        website: '',
        address: '',
        mobile: '',
        overview: '',
        logo: null
    }

    const { id } = useParams();
    const navigate = useNavigate();
    const [company, setCompany] = useState(companyDefault);
    const axios = useAxiosPrivate();

    useEffect(() => {
        const fetchCompanyProfile = async () => {
            try {
                const response = await axios.get('/college/company/' + id);
                setCompany(response?.data?.company || companyDefault);
            } catch (err) {
                notify('failed', err?.response?.data?.message);
            }
        }
        fetchCompanyProfile();
    }, [axios, id]);

    return (
        <div className="container-fluid py-4 bg-light min-vh-100">
            <div className="d-flex justify-content-between align-items-center mb-5 mx-4">
                <div>
                    <h2 className="fw-bold mb-1">Company Profile</h2>
                    <p className="text-muted mb-0">Detailed information about our recruitment partner.</p>
                </div>
                <button className="btn btn-outline-primary rounded-pill px-4" onClick={() => navigate(-1)}>
                    <i className="bi bi-arrow-left me-2"></i>Back
                </button>
            </div>

            <div className="row justify-content-center mx-2">
                <div className="col-12 px-md-4">
                    <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
                        <div className="bg-primary p-4 text-white d-flex align-items-center">
                            <div className="bg-white bg-opacity-25 rounded-circle d-flex align-items-center justify-content-center me-4" 
                                 style={{ width: '80px', height: '80px' }}>
                                <i className="bi bi-building fs-1"></i>
                            </div>
                            <div>
                                <h3 className="fw-bold mb-1">{company.name}</h3>
                                <p className="mb-0 opacity-75">{company.industry} • {company.size || 'Growth Stage'}</p>
                            </div>
                        </div>

                        <div className="card-body p-4 p-md-5">
                            <div className="row g-5">
                                <div className="col-lg-8">
                                    <h5 className="fw-bold mb-4">Company Overview</h5>
                                    <div className="p-4 bg-light rounded-4 text-muted mb-4" style={{ lineHeight: '1.8' }}>
                                        {company.overview || 'No overview provided by the company.'}
                                    </div>

                                    <h5 className="fw-bold mb-4">Office Location</h5>
                                    <div className="d-flex align-items-start gap-3 p-3 border rounded-4">
                                        <div className="bg-primary bg-opacity-10 rounded-3 p-3 text-primary">
                                            <i className="bi bi-geo-alt-fill fs-4"></i>
                                        </div>
                                        <div>
                                            <p className="mb-0 text-muted">{company.address || 'Location details not specified.'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-lg-4">
                                    <div className="card border-0 bg-light rounded-4">
                                        <div className="card-body p-4">
                                            <h5 className="fw-bold mb-4">Contact Information</h5>
                                            
                                            <div className="mb-4">
                                                <label className="small text-muted d-block mb-1">Official Website</label>
                                                <a href={company.website} target="_blank" rel="noopener noreferrer" 
                                                   className="text-primary fw-bold text-decoration-none d-flex align-items-center">
                                                    {company.website || 'Not provided'}
                                                    <i className="bi bi-box-arrow-up-right ms-2 small"></i>
                                                </a>
                                            </div>

                                            <div className="mb-4">
                                                <label className="small text-muted d-block mb-1">Contact Number</label>
                                                <span className="text-dark fw-bold">{company.mobile || 'Not provided'}</span>
                                            </div>

                                            <div className="p-3 bg-white rounded-4 border border-dashed text-center">
                                                <p className="small text-muted mb-2">Want to collaborate?</p>
                                                <button className="btn btn-primary w-100 rounded-pill">Send Message</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CollegeCompanyProfile;