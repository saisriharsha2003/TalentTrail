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
        <>

            <div className='d-flex flex-column justify-content-center mx-5 my-2'>
                <div>
                    <h1>Sections</h1>
                </div>

                <div className='d-flex flex-row justify-content-evenly mx-5 my-2'>

                    {courses.map((course, index) => (
                        <div key={index} className="card container-auto shadow text-center my-2 mx-2 px-4 py-2" style={{ width: '10rem' }}>
                            <Link to={course.name + '/' + course._id} className='nav-link my-4'>
                                <div className='card-body p-2'>
                                    <b>{course.name}</b>
                                </div>
                            </Link>
                        </div>
                    ))}

                </div>

            </div>

        </>
    )
}

export default CollegeSections;