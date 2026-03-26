import React, { useState, useEffect } from 'react';
import { notify } from '../Toast';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { useParams } from 'react-router-dom';

const CollegeStudents = () => {
    const [students, setStudents] = useState([]);

    const { id, course } = useParams();
    const axios = useAxiosPrivate();

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const response = await axios.get('/college/students/' + id);

                const students = response?.data
                setStudents(students);
            } catch (err) {
                notify('failed', err?.response?.data?.message);
            }
        }
        fetchStudents();
    }, [axios, id]);

    return (
        <div className='d-flex flex-column justify-content-center align-items-center mx-5 my-2'>

            <div>
                <div>
                    <h1 className='text-center my-4 mb-5'>{course}</h1>
                </div>

                {students.map((student, index) => (
                    <section key={index} className="card container mx-5 p-3 overflow-auto mb-5 shadow-sm" style={{ width: '38rem', maxHeight: '40rem', scrollbarWidth: 'thin'}}>

                        <section className="my-2">
                            <div className="container">
                                <div className="row">
                                    <div style={{ width: '15rem' }}>
                                        <h5>Name</h5>
                                    </div>
                                    <div style={{ width: '20rem' }}>
                                        <div className="card-title">{student?.personal?.fullName}</div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="my-2">
                            <div className="container">
                                <div className="row">
                                    <div style={{ width: '15rem' }}>
                                        <h5>Roll number</h5>
                                    </div>
                                    <div style={{ width: '20rem' }}>
                                        <div className="card-title">{student?.rollNo}</div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="my-2">
                            <div className="container">
                                <div className="row">
                                    <div style={{ width: '15rem' }}>
                                        <h5>College email</h5>
                                    </div>
                                    <div style={{ width: '20rem' }}>
                                        <div className="card-title">{student?.contact?.collegeEmail}</div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="my-2">
                            <div className="container">
                                <div className="row">
                                    <div style={{ width: '15rem' }}>
                                        <h5>Personal email</h5>
                                    </div>
                                    <div style={{ width: '20rem' }}>
                                        <div className="card-title">{student?.contact?.email}</div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="my-2">
                            <div className="container">
                                <div className="row">
                                    <div style={{ width: '15rem' }}>
                                        <h5>Mobile</h5>
                                    </div>
                                    <div style={{ width: '20rem' }}>
                                        <div className="card-title">{student?.contact?.mobile}</div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="my-2">
                            <div className="container">
                                <div className="row">
                                    <div style={{ width: '15rem' }}>
                                        <h5>CGPA</h5>
                                    </div>
                                    <div style={{ width: '20rem' }}>
                                        <div className="card-title">{student?.academic?.currentEducation?.cgpa}</div>
                                    </div>
                                </div>
                            </div>
                        </section>

                    </section>
                ))}
            </div>

        </div>
    )
}

export default CollegeStudents;