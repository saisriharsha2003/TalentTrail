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
        <>

            <div className='d-flex flex-column justify-content-center mx-5 my-2'>

                <div>
                    <div>
                        <h1 className='text-center mt-2'>Past drives</h1>
                    </div>

                    {pastDrives.map((drive, index) => (
                        <div key={index} className="card container h-100 shadow-2-strong mt-5 p-4 shadow-sm" style={{ width: '53rem' }}>
                            <div className='d-flex justify-content-between'>
                                <h5 className="card-title mb-3 mb-4 pb-1 pb-md-0 mb-md-3">{drive.jobRole}</h5>
                                <h5 className="card-subtitle mb-2 text-muted">{drive.companyName}</h5>
                            </div>
                            <div className='card-body p-2 text-wrap' style={{ width: '50rem' }}>
                                <p className="card-text">{drive.description}</p>
                            </div>
                            <div className='card-body p-2'>
                                <Link className="btn btn-primary mt-2" to={drive._id} role="button">view</Link>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="d-flex justify-content-center">
                    <div className="border-top mt-5 mb-1 shadow" style={{ borderTop: "1px solid rgba(10, 10, 10, 0.7)", width: "75%" }}></div>
                    </div>
                <div className='mb-5'>
                    <div>
                        <h1 className='text-center mt-4' >Upcoming drives</h1>
                    </div>

                    {upcomingDrives.map((drive, index) => (
                        <div key={index} className="card container h-100 shadow-2-strong mt-5 p-4 shadow-sm" style={{ width: '53rem' }}>
                            <div className='d-flex justify-content-between'>
                                <h5 className="card-title mb-3 mb-4 pb-1 pb-md-0 mb-md-3">{drive.jobRole}</h5>
                                <h5 className="card-subtitle text-muted">{drive.companyName}</h5>
                            </div>
                            <div className='card-body p-2 text-wrap' style={{ width: '50rem' }}>
                                <p className="card-text">{drive.description}</p>
                            </div>
                            <div className='card-body p-2' style={{ width: '10rem' }}>
                                <div className='d-flex justify-content-between'>
                                    <Link className="btn btn-primary mt-2" to={drive._id} role="button">view</Link>
                                    <button id={drive._id} className="btn btn-dark mt-2 mx-3" onClick={handleApproval}>Approve</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

            </div>

        </>
    )
}

export default CollegeDrives