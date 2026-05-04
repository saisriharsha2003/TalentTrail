import React, { useState, useEffect } from 'react';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { notify } from '../Toast';

const AdminRecruiters = () => {
    const [recruiters, setRecruiters] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const axios = useAxiosPrivate();

    useEffect(() => {
        const fetchRecruiters = async () => {
            try {
                const response = await axios.get('/admin/recruiters');
                setRecruiters(response?.data);
            } catch (err) {
                notify('failed', err?.response?.data?.message);
            }
        }
        fetchRecruiters();
    }, [axios]);

    // Function to handle search input change
    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    // Filter recruiters based on search term
    const filteredRecruiters = recruiters.filter((recruiter) =>
        recruiter?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recruiter?.recruiterDetail?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recruiter?.company?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            
            <div className="card m-2 mx-5 my-4">
                <div className="card-body">
                <div className="input-group mb-4 mt-1 rounded" style={{ maxWidth: '500px' }}>
                <span className="input-group-text"><i className="bi bi-search"></i></span>
                <input
                    type="text"
                    placeholder="Search by username, recruiter name, or company..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="form-control"
                    style={{ outline: 'none', boxShadow: 'none' }}
                />
            </div>

                    <table className="table table-hover">
                        <thead>
                            <tr>
                                <th scope="col">Recruiter id</th>
                                <th scope="col">Username</th>
                                <th scope="col">Recruiter name</th>
                                <th scope="col">Company</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRecruiters.map((recruiter, index) => (
                                <tr key={index}>
                                    <th scope="row">{index + 1}</th>
                                    <td>{recruiter?.username}</td>
                                    <td>{recruiter?.recruiterDetail?.fullName}</td>
                                    <td>{recruiter?.company?.name}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    )
}

export default AdminRecruiters;
