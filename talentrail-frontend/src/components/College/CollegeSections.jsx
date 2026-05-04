import React, { useState, useEffect } from 'react';
import { notify } from '../Toast';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { Link } from 'react-router-dom';

const CollegeSections = () => {
    const [courses, setCourses] = useState([]);

    const axios = useAxiosPrivate();

    useEffect(() => {
        const fetchSections = async () => {
            try {
                const response = await axios.get('/college/courses');

                const courses = response?.data
                setCourses(courses?.programs);
            } catch (err) {
                notify('failed', err?.response?.data?.message);
            }
        }
        fetchSections();
    }, [axios]);

    return (
        <div className="container py-4 bg-light min-vh-100">
            <div className="mb-5 mx-4">
                <h2 className="fw-bold mb-1">Academic Sections</h2>
                <p className="text-muted mb-0">Browse and manage students organized by their courses.</p>
            </div>

            <div className="row g-4 mx-2">
                {courses.length > 0 ? (
                    courses.map((course, index) => (
                        <div key={index} className="col-md-6 col-lg-4 col-xl-3">
                            <Link to={course.name + '/' + course._id} className="text-decoration-none">
                                <div className="card border-0 shadow-sm rounded-4 h-100 stat-card overflow-hidden" 
                                     style={{ transition: '0.3s' }}>
                                    <div className="card-body p-4 text-center">
                                        <div className="rounded-circle bg-success bg-opacity-10 d-flex align-items-center justify-content-center mx-auto mb-3" 
                                             style={{ width: '70px', height: '70px' }}>
                                            <i className="bi bi-mortarboard fs-2 text-success"></i>
                                        </div>
                                        <h5 className="fw-bold text-dark mb-1">{course.name}</h5>
                                        <p className="text-muted small mb-0">{course.specialization || 'General'}</p>
                                        <div className="mt-3">
                                            <span className="badge bg-light text-dark border rounded-pill px-3 py-2">
                                                {course.duration} Years Program
                                            </span>
                                        </div>
                                    </div>
                                    <div className="card-footer bg-light border-0 py-3 text-center">
                                        <span className="text-primary small fw-bold">View Student List <i className="bi bi-arrow-right ms-1"></i></span>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))
                ) : (
                    <div className="col-12 text-center py-5">
                        <div className="bg-white p-5 rounded-4 shadow-sm d-inline-block">
                            <i className="bi bi-journal-x fs-1 text-muted mb-3 d-block"></i>
                            <h4 className="fw-bold text-muted">No Sections Found</h4>
                            <p className="text-muted mb-0">Add courses in your profile to see sections here.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default CollegeSections;