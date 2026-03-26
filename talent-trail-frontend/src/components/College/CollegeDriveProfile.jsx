import React, { useState, useEffect } from 'react';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { notify } from '../Toast';
import { useParams } from 'react-router-dom';

const CollegeDriveProfile = () => {
    const jobDefault = {
        companyName: '',
        jobRole: '',
        cgpa: '',
        description: '',
        experience: '',
        seats: '',
        package: ''
    }

    const { id } = useParams();
    const [job, setJob] = useState(jobDefault);

    const axios = useAxiosPrivate();

    useEffect(() => {
        const fetchDriveProfile = async () => {
            try {
                const response = await axios.get('/college/job/' + id);

                const job = response?.data;
                setJob(job);
            } catch (err) {
                notify('failed', err?.response?.data?.message);
            }
        }
        fetchDriveProfile();
    }, [axios, id]);

    return (
        <div className='d-flex justify-content-center align-items-center my-5'>

            <section className="card container mx-5 p-3 overflow-auto shadow pb-4" style={{ width: '40rem', maxHeight: '55rem', scrollbarWidth: 'thin'}}>

                <section className="mb-3">
                    <div className="container">
                        <div className="row">
                            <div>
                                <h1 className='my-1'>Job profile</h1>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="my-2">
                    <div className="container">
                        <div className="row">
                            <div style={{ width: '15rem' }}>
                                <h5>Company name</h5>
                            </div>
                            <div style={{ width: '20rem' }}>
                                <div className="card-title">{job.companyName}</div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="my-2">
                    <div className="container">
                        <div className="row">
                            <div style={{ width: '15rem' }}>
                                <h5>Job role</h5>
                            </div>
                            <div style={{ width: '20rem' }}>
                                <div className="card-title">{job.jobRole}</div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="my-2">
                    <div className="container">
                        <div className="row">
                            <div style={{ width: '15rem' }}>
                                <h5>CGPA</h5>
                            </div>
                            <div style={{ width: '20rem' }}>
                                <div className="card-title">{job.cgpa}</div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="my-2">
                    <div className="container">
                        <div className="row">
                            <div style={{ width: '15rem' }}>
                                <h5>Description</h5>
                            </div>
                            <div style={{ width: '20rem' }}>
                                <div className="card-title">{job.description}</div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="my-2">
                    <div className="container">
                        <div className="row">
                            <div style={{ width: '15rem' }}>
                                <h5>Experience</h5>
                            </div>
                            <div style={{ width: '20rem' }}>
                                <div className="card-title">{job.experience}</div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="my-2">
                    <div className="container">
                        <div className="row">
                            <div style={{ width: '15rem' }}>
                                <h5>Seats</h5>
                            </div>
                            <div style={{ width: '20rem' }}>
                                <div className="card-title">{job.seats}</div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="my-2">
                    <div className="container">
                        <div className="row">
                            <div style={{ width: '15rem' }}>
                                <h5>Package</h5>
                            </div>
                            <div style={{ width: '20rem' }}>
                                <div className="card-title">{job.package}</div>
                            </div>
                        </div>
                    </div>
                </section>

            </section>

        </div>
    )
}

export default CollegeDriveProfile