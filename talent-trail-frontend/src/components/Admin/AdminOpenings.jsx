import React, { useState, useEffect } from 'react';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { notify } from '../Toast';

const AdminOpenings = () => {
    const [openings, setOpenings] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const axios = useAxiosPrivate();

    useEffect(() => {
        const fetchOpenings = async () => {
            try {
                const response = await axios.get('/admin/openings');
                setOpenings(response?.data);
            } catch (err) {
                notify('failed', err?.response?.data?.message);
            }
        }
        fetchOpenings();
    }, [axios]);

    // Function to handle search input change
    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    // Filter openings based on search term
    const filteredOpenings = openings.filter((job) =>
        job?.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job?.jobRole?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>

            <div className="card m-2 mx-5 my-4">
                <div className="card-body">
                <div className="input-group mb-4 mt-1 rounded" style={{ maxWidth: '500px' }}>
                <span className="input-group-text"><i className="bi bi-search"></i></span>
                <input
                    type="text"
                    placeholder="Search by company name or job role..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="form-control"
                    style={{ outline: 'none', boxShadow: 'none' }}
                />
            </div>
                    <div className="table-responsive">
                        <table className="table table-hover">
                            <thead>
                                <tr>
                                    <th scope="col">Job id</th>
                                    <th scope="col">Company name</th>
                                    <th scope="col">Job role</th>
                                    <th scope="col">CGPA</th>
                                    <th scope="col">Salary</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOpenings.map((job, index) => (
                                    <tr key={index}>
                                        <th scope="row">{index + 1}</th>
                                        <td>{job?.companyName}</td>
                                        <td>{job?.jobRole}</td>
                                        <td>{job?.cgpa}</td>
                                        <td style={{maxWidth:"150px", maxHeight:"50px"}} className='overflow-auto'>{job?.package}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    )
}

export default AdminOpenings;
