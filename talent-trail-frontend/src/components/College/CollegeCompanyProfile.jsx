import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
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
        overview: ''
    }

    const { id } = useParams();
    const [company, setCompany] = useState(companyDefault);

    const axios = useAxiosPrivate();

    useEffect(() => {
        const fetchCompanyProfile = async () => {
            try {
                const response = await axios.get('/college/company/' + id);

                const profile = response?.data;
                setCompany(profile?.company);
            } catch (err) {
                notify('failed', err?.response?.data?.message);
            }
        }
        fetchCompanyProfile();
    }, [axios, id]);

    return (
        <>
            <div className='d-flex justify-content-center align-items-center my-5'>

                <section className="card container-auto mx-5 p-4 overflow-auto shadow-sm" style={{maxHeight: '40rem', scrollbarWidth: 'thin'}}>

                    <section className="mb-3">
                        <div className="container">
                            <div className="row">
                                <div>
                                    <h1>Company profile</h1>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="my-2">
                        <div className="container">
                            <div className="row">
                                <div style={{ width: '10rem' }}>
                                    <h5>Name</h5>
                                </div>
                                <div style={{ width: '15rem' }}>
                                    <div className="card-title">{company.name}</div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="my-2">
                        <div className="container">
                            <div className="row">
                                <div style={{ width: '10rem' }}>
                                    <h5>Industry</h5>
                                </div>
                                <div style={{ width: '15rem' }}>
                                    <div className="card-title">{company.industry}</div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="my-2">
                        <div className="container">
                            <div className="row">
                                <div style={{ width: '10rem' }}>
                                    <h5>Size</h5>
                                </div>
                                <div style={{ width: '15rem' }}>
                                    <div className="card-title">{company.size}</div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="my-2">
                        <div className="container">
                            <div className="row">
                                <div style={{ width: '10rem' }}>
                                    <h5>Website</h5>
                                </div>
                                <div style={{ width: '15rem' }}>
                                    <div className="card-title">{company.website}</div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="my-2">
                        <div className="container">
                            <div className="row">
                                <div style={{ width: '10rem' }}>
                                    <h5>Address</h5>
                                </div>
                                <div style={{ width: '15rem' }}>
                                    <div className="card-title">{company.address}</div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="my-2">
                        <div className="container">
                            <div className="row">
                                <div style={{ width: '10rem' }}>
                                    <h5>Mobile</h5>
                                </div>
                                <div style={{ width: '15rem' }}>
                                    <div className="card-title">{company.mobile}</div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="my-2">
                        <div className="container">
                            <div className="row">
                                <div style={{ width: '10rem' }}>
                                    <h5>Overview</h5>
                                </div>
                                <div style={{ width: '15rem' }}>
                                    <div className="card-title">{company.overview}</div>
                                </div>
                            </div>
                        </div>
                    </section>

                </section>

            </div>

        </>
    )
}

export default CollegeCompanyProfile;