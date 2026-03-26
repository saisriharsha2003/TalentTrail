import React, { useState, useEffect } from 'react';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { notify } from '../Toast';
import { Link } from 'react-router-dom';

const RecruiterPosted = () => {
    const [posted, setPosted] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    const axios = useAxiosPrivate();

    useEffect(() => {
        const fetchPosted = async () => {
            try {
                const response = await axios.get('/recruiter/jobs');
                const posted = response?.data;
                setPosted(posted);
            } catch (err) {
                notify('failed', err?.response?.data?.message);
            }
        };
        fetchPosted();
    }, [axios]);

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const filteredPostedJobs = posted.filter((job) =>
        job?.jobRole?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>
            <div className="card m-4 mb-5 shadow">
                <div className="card-body table-responsive" style={{ padding: '2rem' }}>
                    <div className="input-group mb-4 mt-1 rounded" style={{ maxWidth: '500px' }}>
                        <span className="input-group-text"><i className="bi bi-search"></i></span>
                        <input
                            type="text"
                            placeholder="Search by company role."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className="form-control"
                            style={{ outline: 'none', boxShadow: 'none' }}

                        />
                    </div>
                    <table className="table table-hover">
                        <thead>
                            <tr>
                                <th scope="col">Job id</th>
                                <th scope="col">Company name</th>
                                <th scope="col">Job role</th>
                                <th scope="col">CGPA</th>
                                <th scope="col">Salary</th>
                                <th scope="col">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPostedJobs.map((job, index) => (
                                <tr key={index}>
                                    <th scope="row">{index + 1}</th>
                                    <td>{job.companyName}</td>
                                    <td>{job.jobRole}</td>
                                    <td>{job.cgpa}</td>
                                    <td>{job.package}</td>
                                    <td>
                                        <Link className="btn btn-primary" to={job._id} role="button">
                                            View
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default RecruiterPosted;
