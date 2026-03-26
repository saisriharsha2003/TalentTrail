import React, { useState, useEffect } from 'react';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { notify } from '../Toast';

const StudentApplied = () => {
    const [appliedJobs, setAppliedJobs] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    const axios = useAxiosPrivate();

    useEffect(() => {
        const fetchApplied = async () => {
            try {
                const response = await axios.get('/student/applied');
                const appliedJobs = response?.data;
                setAppliedJobs(appliedJobs);
            } catch (err) {
                notify('failed', err?.response?.data?.message);
            }
        }
        fetchApplied();
    }, [axios]);

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    }

    const filteredJobs = appliedJobs.filter((job) =>
        job.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.jobRole.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>
            <div className="card m-4 shadow">
                <div className="card-body table-responsive" style={{ padding: '2rem' }}>
                    <div className="input-group mb-4 mt-1 rounded" style={{ maxWidth: '500px' }}>
                        <span className="input-group-text"><i className="bi bi-search"></i></span>
                        <input
                            type="text"
                            placeholder="Search by company name or job role..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className="form-control"
                            style={{ outline: 'none', boxShadow: 'none' }}

                        />
                    </div>
                    <table className="table table-hover">
                        <thead className='thead-dark'>
                            <tr>
                                <th scope="col">Job id</th>
                                <th scope="col">Company name</th>
                                <th scope="col">Job role</th>
                                <th scope="col">salary</th>
                                <th scope="col">Applied on</th>
                                <th scope="col">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredJobs.map((job, index) => (
                                <tr key={index}>
                                    <th scope="row">{index + 1}</th>
                                    <td>{job.companyName}</td>
                                    <td>{job.jobRole}</td>
                                    <td>{job.salary}</td>
                                    <td>{new Date(job.appliedOn).toString().slice(4, 21)}</td>
                                    <td>{job.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    )
}

export default StudentApplied;
