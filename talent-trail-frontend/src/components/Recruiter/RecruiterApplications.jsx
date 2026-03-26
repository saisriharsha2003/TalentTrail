import React, { useState, useEffect } from 'react';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { notify } from '../Toast';
import { Link } from 'react-router-dom';

const RecruiterApplications = () => {
    const [applications, setApplications] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    const axios = useAxiosPrivate();

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const response = await axios.get('/recruiter/applications');
                const applications = response?.data;
                setApplications(applications);
            } catch (err) {
                notify('failed', err?.response?.data?.message);
            }
        };
        fetchApplications();
    }, [axios]);

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const filteredApplications = applications.filter((application) =>
        application?.userId?.personal?.fullName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>
            <div className="card m-4 shadow">
                <div className="card-body table-responsive" style={{ padding: '2rem' }}>
                    <div className="input-group mb-4 mt-1 rounded" style={{ maxWidth: '500px' }}>
                        <span className="input-group-text"><i className="bi bi-search"></i></span>
                        <input
                            type="text"
                            placeholder="Search by Student name..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className="form-control"
                            style={{ outline: 'none', boxShadow: 'none' }}

                        />
                    </div>
                    <table className="table table-hover">
                        <thead>
                            <tr>
                                <th scope="col">Student id</th>
                                <th scope="col">Student name</th>
                                <th scope="col">Applied on</th>
                                <th scope="col">Status</th>
                                <th scope="col">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredApplications.map((application, index) => (
                                <tr key={index}>
                                    <th scope="row">{index + 1}</th>
                                    <td>{application?.userId?.personal?.fullName}</td>
                                    <td>{new Date(application.appliedOn).toString().slice(4, 21)}</td>
                                    <td>{application.status}</td>
                                    <td>
                                        <Link className="btn btn-primary" to={application.userId._id} role="button">
                                            view
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

export default RecruiterApplications;
