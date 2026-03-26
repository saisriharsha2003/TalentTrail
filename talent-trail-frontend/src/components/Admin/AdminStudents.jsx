import React, { useState, useEffect } from 'react';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { notify } from '../Toast';

const AdminStudents = () => {
    const [students, setStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const axios = useAxiosPrivate();

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const response = await axios.get('/admin/students');
                setStudents(response?.data);
            } catch (err) {
                notify('failed', err?.response?.data?.message);
            }
        }
        fetchStudents();
    }, [axios]);

    // Function to handle search input change
    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    // Filter students based on search term
    const filteredStudents = students.filter((student) =>
        student?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student?.personal?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student?.academic?.currentEducation?.college?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            

            <div className="card m-2 mx-5">
                <div className="card-body">

                <div className="input-group mb-4 mt-1 rounded" style={{ maxWidth: '500px' }}>
                <span className="input-group-text"><i className="bi bi-search"></i></span>
                <input
                    type="text"
                    placeholder="Search by username, student name, or college name..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="form-control"
                    style={{ outline: 'none', boxShadow: 'none' }}
                />
            </div>
                    <table className="table table-hover">
                        <thead>
                            <tr>
                                <th scope="col">Student id</th>
                                <th scope="col">Username</th>
                                <th scope="col">Student name</th>
                                <th scope="col">College name</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents.map((student, index) => (
                                <tr key={index}>
                                    <th scope="row">{index + 1}</th>
                                    <td>{student?.username}</td>
                                    <td>{student?.personal?.fullName}</td>
                                    <td>{student?.academic?.currentEducation?.college}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    )
}

export default AdminStudents;
