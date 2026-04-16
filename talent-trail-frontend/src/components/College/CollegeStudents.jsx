import React, { useState, useEffect } from 'react';
import { notify } from '../Toast';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { useParams, useNavigate } from 'react-router-dom';

const CollegeStudents = () => {
    const [students, setStudents] = useState([]);
    const { id, course } = useParams();
    const axios = useAxiosPrivate();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const response = await axios.get('/college/students/' + id);
                setStudents(response?.data || []);
            } catch (err) {
                notify('failed', err?.response?.data?.message);
            }
        }
        fetchStudents();
    }, [axios, id]);

    return (
        <div className="container-fluid py-4 bg-light min-vh-100">
            <div className="d-flex justify-content-between align-items-center mb-5 mx-4">
                <div>
                    <h2 className="fw-bold mb-1">{course} Students</h2>
                    <p className="text-muted mb-0">Manage and view performance details of students in this section.</p>
                </div>
                <button className="btn btn-outline-primary rounded-pill px-4" onClick={() => navigate(-1)}>
                    <i className="bi bi-arrow-left me-2"></i>Back to Sections
                </button>
            </div>

            <div className="card border-0 shadow-sm rounded-4 overflow-hidden mx-4">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th className="ps-4 py-3 text-uppercase small fw-bold text-muted">Roll Number</th>
                                <th className="py-3 text-uppercase small fw-bold text-muted">Student Name</th>
                                <th className="py-3 text-uppercase small fw-bold text-muted">College Email</th>
                                <th className="py-3 text-uppercase small fw-bold text-muted">Mobile</th>
                                <th className="py-3 text-uppercase small fw-bold text-muted">CGPA</th>
                                <th className="pe-4 py-3 text-center text-uppercase small fw-bold text-muted">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.length > 0 ? (
                                students.map((student, index) => (
                                    <tr key={index}>
                                        <td className="ps-4 py-3">
                                            <span className="fw-bold text-primary">{student?.rollNo}</span>
                                        </td>
                                        <td className="py-3">
                                            <div className="d-flex align-items-center">
                                                <div className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center me-3" 
                                                     style={{ width: '40px', height: '40px' }}>
                                                    <span className="text-primary fw-bold">{student?.personal?.fullName?.charAt(0)}</span>
                                                </div>
                                                <span className="fw-medium text-dark">{student?.personal?.fullName}</span>
                                            </div>
                                        </td>
                                        <td className="py-3">
                                            <span className="text-muted">{student?.contact?.collegeEmail}</span>
                                        </td>
                                        <td className="py-3">
                                            <span className="text-muted">{student?.contact?.mobile}</span>
                                        </td>
                                        <td className="py-3">
                                            <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-3 py-2">
                                                {student?.academic?.currentEducation?.cgpa || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="pe-4 py-3 text-center">
                                            <button className="btn btn-sm btn-light border rounded-pill px-3" 
                                                    onClick={() => navigate(`/user/college/student/${student._id}`)}>
                                                View Profile
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="text-center py-5">
                                        <div className="text-muted">
                                            <i className="bi bi-people fs-1 d-block mb-3"></i>
                                            <p className="mb-0">No students found in this section.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default CollegeStudents;