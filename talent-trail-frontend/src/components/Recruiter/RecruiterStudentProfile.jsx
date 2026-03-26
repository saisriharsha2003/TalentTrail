import React, { useState, useEffect } from 'react';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { notify } from '../Toast';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';


const RESUMES_URL = 'http://localhost:3500/resumes';

const RecruiterStudentProfile = () => {
    const currentDefault = {
        college: '',
        course: '',
        joinDate: '',
        graduatingYear: '',
        city: '',
        state: '',
        studyYear: '',
        major: '',
        skills: [],
        interests: [],
        cgpa: ''
    };
    const previousDefault = {
        college: '',
        state: '',
        city: '',
        major: '',
        percentage: ''
    };
    const contactDefault = {
        email: '',
        mobile: '',
        currentAddress: '',
        permanentAddress: ''
    };
    const personalDefault = {
        fullName: '',
        fatherName: '',
        motherName: '',
        dateOfBirth: '',
        gender: ''
    };
    const scoreStyle = {
        padding: '8px 12px', // Adjust padding as needed
        backgroundColor: '#f5f5f5',// Use a different background color
        color: '#333', // Text color
        borderRadius: '4px', // Rounded corners
        fontSize: '16px', // Adjust font size
        fontWeight: 'bold', // Make the score bold
    };


    const { id } = useParams();
    const [jobs, setJobs] = useState([]);
    const [resume, setResume] = useState('');
    const [currentEducation, setCurrentEducation] = useState(currentDefault);
    const [previousEducation, setPreviousEducation] = useState(previousDefault);
    const [contact, setContact] = useState(contactDefault);
    const [personal, setPersonal] = useState(personalDefault);
    const [certifications, setCertifications] = useState([]);
    const [projects, setProjects] = useState([]);
    const [works, setWorks] = useState([]);
    const [sent1, setSent1] = useState()
    const [sent2, setSent2] = useState()
    const [scores, setScores] = useState({})


    const axios = useAxiosPrivate();

    const [activeIndex, setActiveIndex] = useState(0);

    const handleIndicatorClick = (index) => {
        setActiveIndex(index);
    };


    const fetchJobs = async () => {
        try {
            const response = await axios.get('/recruiter/studentProfile/' + id);

            const jobs = response?.data?.jobs.map((job) => ({ ...job.jobId, applicationId: job._id }));
            setJobs(jobs);
        } catch (err) {
            notify('failed', err?.response?.data?.message);
        }
    }

    useEffect(() => {
        const fetchStudentProfile = async () => {
            try {
                const response = await axios.get('/recruiter/studentProfile/' + id);
                // console.log(response.data)
                const jobs = response?.data?.jobs.map((job) => ({ ...job.jobId, applicationId: job._id }));
                setJobs(jobs);

                const student = response?.data?.student;
                setCurrentEducation({
                    ...student?.academic?.currentEducation,
                    interests: student?.academic?.currentEducation?.interests.join(),
                    skills: student?.academic?.currentEducation?.skills.join(),
                    academicId: student?.academic?._id
                });
                setPreviousEducation(student?.academic?.previousEducation);
                setContact(student?.contact);
                setPersonal(student?.personal);
                setCertifications(student?.certifications);
                setProjects(student?.projects);
                setWorks(student?.workExperiences);
                setResume(student?.resume);
                setSent1(student?.academic?.currentEducation?.skills.join(','))
                let studentProfile = '';
                if (student?.certifications && student?.certifications.length > 0) {
                    for (let i = 0; i < student?.certifications.length; i++) {
                        let temp = student?.certifications[i].name + " " + student?.certifications[i].organization + ",";
                        studentProfile += temp
                    }
                }
                setSent2(studentProfile);
            } catch (err) {
                notify('failed', err?.response?.data?.message);
            }
        }
        fetchStudentProfile();
    }, [axios, id]);

    const handleSelect = async (e) => {
        try {
            const response = await axios.post('/recruiter/application', {
                applicationId: jobs[parseInt(e.target.id)].applicationId,
                status: 'selected'
            });
            const success = response?.data?.success;
            if (success)
                notify('success', success);

            fetchJobs();
        } catch (err) {
            notify('failed', err?.response?.data?.message);
        }
    }

    const handleReject = async (e) => {
        try {
            const response = await axios.post('/recruiter/application', {
                applicationId: jobs[parseInt(e.target.id)].applicationId,
                status: 'rejected'
            });
            const success = response?.data?.success;
            if (success)
                notify('success', success);

            fetchJobs();
        } catch (err) {
            notify('failed', err?.response?.data?.message);
        }
    }

    const computeCapability = async (jobId, jd) => {
        try {

            let studentText = "skills:\n" + sent1 + "\n" + "certifications:\n" + sent2
            const requestBody = {
                sent1: studentText,
                sent2: jd
            };

            const response = await axios.post('/recruiter/capabilityCal', requestBody)
            const score = response?.data?.score?.similarity_matrix;
            console.log(score);
            setScores(prevScores => ({ ...prevScores, [jobId]: score }));

            notify('success', "done")
        } catch (err) {
            notify('failed', err?.response?.data?.message);
        }


    }

    return (
        <>

            <div className='d-flex justify-content-center align-items-center '>

                <div>

                    <div className="card container-auto m-5 p-4 d-flex justify-content-center align-items-center shadow-sm" style={{ backgroundColor: '#fff' }}>

                        <h2 className="card-title mb-4 pb-1 pb-md-0 mb-md-4">Student</h2>
                        <a href={`${RESUMES_URL}/${resume}`} className='link-offset-3-hover link-underline link-underline-opacity-0 link-underline-opacity-75-hover'>{resume?.slice(13,)}</a>

                        {/* Academic */}
                        <div className='card-body'>
                            <div className="card m-2 p-4 shadow-sm" style={{ backgroundColor: '#fff' }}>

                                <h3 className="card-title mb-4 pb-1 pb-md-0 mb-md-2">Academic</h3>

                                <div className='d-inline-flex'>
                                    <div className='card-body'>
                                        <div className="card container-auto m-2 p-3 shadow" style={{ backgroundColor: '#fff' }}>

                                            <h4 className="card-title mb-4 pb-1 pb-md-2 mb-md-2">Current education</h4>

                                            {/* <div className='d-inline-flex'> */}
                                            <div className='row p-2 justify-content-center' >
                                                <div className='col-md-4'>

                                                    <section className="my-3 mb-4">
                                                        <div className="container">
                                                            <div className="row">
                                                                <div style={{ width: '12rem' }} className='col-md-6'>
                                                                    <b>College</b>
                                                                </div>
                                                                <div style={{ width: '20rem' }} className='col-md-6'>
                                                                    <div className="card-title">{currentEducation?.college}</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </section>

                                                    <section className="mb-4">
                                                        <div className="container">
                                                            <div className="row">
                                                                <div style={{ width: '12rem' }} className='col-md-6'>
                                                                    <b>Course</b>
                                                                </div>
                                                                <div style={{ width: '15rem' }} className='col-md-6'>
                                                                    <div className="card-title">{currentEducation?.course}</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </section>

                                                    <section className="mb-4">
                                                        <div className="container">
                                                            <div className="row">
                                                                <div style={{ width: '12rem' }} className='col-md-6'>
                                                                    <b>Join date</b>
                                                                </div>
                                                                <div style={{ width: '15rem' }} className='col-md-6'>
                                                                    <div className="card-title">{currentEducation?.joinDate}</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </section>

                                                    <section className="mb-4">
                                                        <div className="container">
                                                            <div className="row">
                                                                <div style={{ width: '12rem' }} className='col-md-6'>
                                                                    <b>Graduating year</b>
                                                                </div>
                                                                <div style={{ width: '15rem' }} className='col-md-6'>
                                                                    <div className="card-title">{currentEducation?.graduatingYear}</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </section>

                                                    <section className="mb-4">
                                                        <div className="container">
                                                            <div className="row">
                                                                <div style={{ width: '12rem' }} className='col-md-6'>
                                                                    <b>City</b>
                                                                </div>
                                                                <div style={{ width: '15rem' }} className='col-md-6'>
                                                                    <div className="card-title">{currentEducation?.city}</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </section>

                                                    <section className="mb-4">
                                                        <div className="container">
                                                            <div className="row">
                                                                <div style={{ width: '12rem' }} className='col-md-6'>
                                                                    <b>State</b>
                                                                </div>
                                                                <div style={{ width: '15rem' }} className='col-md-6'>
                                                                    <div className="card-title">{currentEducation?.state}</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </section>
                                                </div>

                                                {/* <div className="vr col-md-1"></div> */}
                                                <div className='col-md-8'>
                                                    <section className="my-3 mb-4">
                                                        <div className="container">
                                                            <div className="row">
                                                                <div style={{ width: '12rem' }} className='col-md-6'>
                                                                    <b>Study year</b>
                                                                </div>
                                                                <div style={{ width: '15rem' }} className='col-md-6'>
                                                                    <div className="card-title">{currentEducation?.studyYear}</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </section>

                                                    <section className="mb-4 mt-2">
                                                        <div className="container">
                                                            <div className="row">
                                                                <div style={{ width: '12rem' }} className='col-md-6'>
                                                                    <b>Major</b>
                                                                </div>
                                                                <div style={{ width: '15rem' }} className='col-md-6'>
                                                                    <div className="card-title">{currentEducation?.major}</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </section>

                                                    <section className="mb-2">
                                                        <div className="container">
                                                            <div className="row">
                                                                <div style={{ width: '12rem' }} className='col-md-6'>
                                                                    <b>Skills</b>
                                                                </div>
                                                                <div style={{ width: '15rem', maxHeight: '14rem', scrollbarWidth: 'thin' }} className='col-md-6 overflow-auto'>
                                                                    <div className="card-title">{currentEducation?.skills}</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </section>

                                                    <section className="mb-5">
                                                        <div className="container">
                                                            <div className="row">
                                                                <div style={{ width: '12rem' }} className='col-md-6'>
                                                                    <b>Interests</b>
                                                                </div>
                                                                <div style={{ width: '15rem' }} className='col-md-6'>
                                                                    <div className="card-title">{currentEducation?.interests}</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </section>

                                                    <section className="mb-2">
                                                        <div className="container">
                                                            <div className="row">
                                                                <div style={{ width: '12rem' }} className='col-md-6'>
                                                                    <b>CGPA</b>
                                                                </div>
                                                                <div style={{ width: '15rem' }} className='col-md-6'>
                                                                    <div className="card-title">{currentEducation?.cgpa}</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </section>
                                                </div>
                                            </div>

                                        </div>
                                    </div>

                                    <div className='card-body'>
                                        <div className="card container-auto m-2 p-3 shadow" style={{ backgroundColor: '#fff' }}>

                                            <h4 className="card-title mb-4 pb-1 pb-md-0 mb-md-2">Previous education</h4>

                                            <div className='row'>
                                                <div className='col-md-12'>

                                                    <section className="my-2 mb-4">
                                                        <div className="container">
                                                            <div className="row">
                                                                <div className='col-md-5'>
                                                                    <b>College</b>
                                                                </div>
                                                                <div className='col-md-7'>
                                                                    <div className="card-title">{previousEducation?.college}</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </section>

                                                    <section className="mb-4">
                                                        <div className="container">
                                                            <div className="row">
                                                                <div className='col-md-5'>
                                                                    <b>State</b>
                                                                </div>
                                                                <div className='col-md-7'>
                                                                    <div className="card-title">{previousEducation?.state}</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </section>

                                                    <section className="mb-4">
                                                        <div className="container">
                                                            <div className="row">
                                                                <div className='col-md-5'>
                                                                    <b>City</b>
                                                                </div>
                                                                <div className='col-md-7'>
                                                                    <div className="card-title">{previousEducation?.city}</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </section>

                                                    <section className="mb-4">
                                                        <div className="container">
                                                            <div className="row">
                                                                <div className='col-md-5'>
                                                                    <b>Major</b>
                                                                </div>
                                                                <div className='col-md-7'>
                                                                    <div className="card-title">{previousEducation?.major}</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </section>

                                                    <section className="mb-4">
                                                        <div className="container">
                                                            <div className="row">
                                                                <div className='col-md-5'>
                                                                    <b>Percentage</b>
                                                                </div>
                                                                <div className='col-md-7'>
                                                                    <div className="card-title">{previousEducation?.percentage}</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </section>
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>

                        <div className='row p-2'>
                            {/* Personal */}
                            <div className='col-md-6'>
                                {/* <div className='card-body'> */}
                                <div className="card container-auto m-2 p-3 shadow" style={{ backgroundColor: '#fff' }}>

                                    <h3 className="card-title mb-4 pb-1 pb-md-2 mb-md-2">Personal</h3>

                                    <section className="my-2 mb-4">
                                        <div className="container">
                                            <div className="row">
                                                <div className='col-md-5'>
                                                    <b>Full name</b>
                                                </div>
                                                <div className='col-md-7'>
                                                    <div className="card-title">{personal?.fullName}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    <section className="mb-4">
                                        <div className="container">
                                            <div className="row">
                                                <div className='col-md-5'>
                                                    <b>Father name</b>
                                                </div>
                                                <div className='col-md-7'>
                                                    <div className="card-title">{personal?.fatherName}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    <section className="mb-4">
                                        <div className="container">
                                            <div className="row">
                                                <div className='col-md-5'>
                                                    <b>Mother name</b>
                                                </div>
                                                <div className='col-md-7'>
                                                    <div className="card-title">{personal?.motherName}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    <section className="mb-4">
                                        <div className="container">
                                            <div className="row">
                                                <div className='col-md-5'>
                                                    <b>Date of birth</b>
                                                </div>
                                                <div className='col-md-7'>
                                                    <div className="card-title">{personal?.dateOfBirth}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    <section className="mb-2">
                                        <div className="container">
                                            <div className="row">
                                                <div className='col-md-5'>
                                                    <b>Gender</b>
                                                </div>
                                                <div className='col-md-7'>
                                                    <div className="card-title">{personal?.gender}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    {/* </div> */}
                                </div>
                            </div>
                            {/* Contact */}
                            <div className='col-md-6'>
                                {/* <div className='card-body d-flex'> */}
                                <div className="card container-auto m-2 p-3 shadow" style={{ backgroundColor: '#fff' }}>

                                    <h3 className="card-title mb-4 pb-1 pb-md-2 mb-md-2">Contact</h3>

                                    <section className="my-2 mb-4">
                                        <div className="container">
                                            <div className="row">
                                                <div className='col-md-6'>
                                                    <b>Email</b>
                                                </div>
                                                <div className='col-md-6'>
                                                    <div className="card-title">{contact?.email}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    <section className="mb-4">
                                        <div className="container">
                                            <div className="row">
                                                <div className='col-md-6'>
                                                    <b>Mobile</b>
                                                </div>
                                                <div className='col-md-6'>
                                                    <div className="card-title">{contact?.mobile}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    <section className="mb-4">
                                        <div className="container">
                                            <div className="row">
                                                <div className='col-md-6'>
                                                    <b>Current address</b>
                                                </div>
                                                <div className='col-md-6'>
                                                    <div className="card-title">{contact?.currentAddress}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    <section className="mb-2">
                                        <div className="container">
                                            <div className="row">
                                                <div className='col-md-6'>
                                                    <b>Permanent address</b>
                                                </div>
                                                <div className='col-md-6'>
                                                    <div className="card-title">{contact?.permanentAddress}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </section>
                                </div>
                                {/* </div> */}
                            </div>
                        </div>

                        <div className='d-flex'>

                            <div>
                                {/* Certifications */}
                                {certifications.map((certification, index) => (
                                    <div key={index} className='card-body'>
                                        <div className="card container-auto m-2 p-3 shadow" style={{ backgroundColor: '#fff' }}>

                                            <h4 className="card-title mb-4 pb-1 pb-md-2 mb-md-2">Certification {index + 1}</h4>

                                            <div className='d-inline-flex '>

                                                <div>
                                                    <div className='card-body'>
                                                        <b>Name</b>
                                                    </div>

                                                    <div className='card-body'>
                                                        <b>Organization</b>
                                                    </div>
                                                </div>

                                                <div>
                                                    <div className='card-body'>
                                                        {certification?.name}
                                                    </div>

                                                    <div className='card-body'>
                                                        {certification?.organization}
                                                    </div>
                                                </div>

                                            </div>

                                        </div>
                                    </div>
                                ))}
                            </div>


                            <div>
                                {/* Projects */}
                                {projects.map((project, index) => (
                                    <div key={index} className='card-body'>
                                        <div className="card container-auto m-2 p-3 shadow" style={{ backgroundColor: '#fff' }}>

                                            <h4 className="card-title mb-4 pb-1 pb-md-2 mb-md-2">Project {index + 1}</h4>

                                            <div className='d-inline-flex '>

                                                <div>
                                                    <div className='card-body text-wrap' style={{ width: '13rem' }}>
                                                        <b>Name </b>
                                                    </div>

                                                    <div className='card-body text-wrap' style={{ width: '13rem' }}>
                                                        <b>Start date </b>
                                                    </div>

                                                    {
                                                        !project?.currentlyWorking &&
                                                        <div className='card-body text-wrap' style={{ width: '13rem' }}>
                                                            <b>End date </b>
                                                            {project?.endDate}
                                                        </div>
                                                    }

                                                    <div className='card-body text-wrap' style={{ width: '13rem' }}>
                                                        <b>Currently working </b>
                                                    </div>

                                                    <div className='card-body text-wrap' style={{ width: '13rem' }}>
                                                        <b>Description </b>
                                                    </div>

                                                    <div className='card-body text-wrap' style={{ width: '13rem' }}>
                                                        <b>Associated </b>
                                                    </div>
                                                </div>

                                                <div>
                                                    <div className='card-body'>
                                                        {project?.name}
                                                    </div>

                                                    <div className='card-body'>
                                                        {project?.startDate}
                                                    </div>
                                                    {
                                                        !project?.currentlyWorking &&
                                                        <div className='card-body'>
                                                            {project?.endDate}
                                                        </div>
                                                    }

                                                    <div className='card-body'>
                                                        {project?.currentlyWorking.toString()}
                                                    </div>
                                                    <div className='card-body overflow-auto' style={{ maxHeight: "3.5rem", scrollbarWidth: 'thin' }}>
                                                        {project?.description}
                                                    </div>

                                                    <div className='card-body'>
                                                        {project?.associated}
                                                    </div>
                                                </div>

                                            </div>

                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div>
                                {/* Works */}
                                {works.map((work, index) => (
                                    <div key={index} className='card-body'>
                                        <div className="card container-auto m-2 p-3 shadow" style={{ backgroundColor: '#fff' }}>

                                            <h4 className="card-title mb-4 pb-1 pb-md-2 mb-md-2">Work Experience {index + 1}</h4>

                                            {/* <div className='d-inline-flex '> */}

                                            <section className="my-3 mb-4">
                                                <div className="container">
                                                    <div className="row">
                                                        <div className='col-md-5'>
                                                            <b>Organization</b>
                                                        </div>
                                                        <div className='col-md-7'>
                                                            <div className="card-title text-wrap" style={{ width: '15rem' }}>{work?.organization}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </section>

                                            <section className="mb-4">
                                                <div className="container">
                                                    <div className="row">
                                                        <div className='col-md-5'>
                                                            <b>Role</b>
                                                        </div>
                                                        <div className='col-md-7'>
                                                            <div className="card-title text-wrap" style={{ width: '15rem' }}>{work?.role}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </section>

                                            <section className="mb-4">
                                                <div className="container">
                                                    <div className="row">
                                                        <div className='col-md-5'>
                                                            <b>Description</b>
                                                        </div>
                                                        <div className='col-md-7'>
                                                            <div className="card-title text-wrap overflow-auto" style={{ width: '15rem', maxHeight: "4rem", scrollbarWidth: 'thin' }}>{work?.description}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </section>

                                            <section className="mb-4">
                                                <div className="container">
                                                    <div className="row">
                                                        <div className='col-md-5'>
                                                            <b>Start date</b>
                                                        </div>
                                                        <div className='col-md-7'>
                                                            <div className="card-title text-wrap" style={{ width: '15rem' }}>{work?.startDate}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </section>

                                            <section className="mb-2">
                                                <div className="container">
                                                    <div className="row">
                                                        <div className='col-md-5'>
                                                            <b>End date</b>
                                                        </div>
                                                        <div className='col-md-7'>
                                                            <div className="card-title text-wrap" style={{ width: '15rem' }}>{work?.endDate}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </section>

                                            {/* </div> */}

                                        </div>
                                    </div>
                                ))}
                            </div>

                        </div>

                    </div>

                </div>

            </div>

            <div className='d-flex justify-content-center flex-wrap mx-5 mb-5'>{ jobs ?
                <div id="carouselExampleIndicators" className="carousel slide" data-bs-ride="carousel">
                    <div className="carousel-indicators">
                        {jobs.map((job, index) => (
                            <button
                                key={index}
                                type="button"
                                onClick={() => handleIndicatorClick(index)}
                                className={index === activeIndex ? "active btn btn-dark" : "btn btn-dark"}
                                aria-current={index === activeIndex ? "true" : "false"}
                                aria-label={`Slide ${index + 1}`}
                                data-bs-target="#carouselExampleIndicators"
                                data-bs-slide-to={index}
                                style={{ backgroundColor: index === activeIndex ? "black" : "darkgray" }}
                            ></button>
                        ))}
                    </div>
                    <div className="carousel-inner" style={{ width: '38rem' }}>
                        {jobs.map((job, index) => (
                            <div key={index} className={"carousel-item" + (index === 0 ? " active" : "")} style={{ height: "54rem" }}>
                                <div className='container'>
                                    <div className="card m-5 p-3 my-3 shadow-sm" style={{ height: "54rem" }}>
                                        <section className="mb-3">
                                            <div className="container">
                                                <div className="row">
                                                    <div>
                                                        <h2 className='mb-4 pb-1 pb-md-2 mb-md-2'>Job profile</h2>
                                                    </div>
                                                </div>
                                            </div>
                                        </section>
                                        <section className="my-2">
                                            <div className="container">
                                                <div className="row">
                                                    <div style={{ width: '12rem' }}>
                                                        <h5>Company name</h5>
                                                    </div>
                                                    <div style={{ width: '15rem' }}>
                                                        <div className="card-title">{job.companyName}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </section>
                                        <section className="my-2">
                                            <div className="container">
                                                <div className="row">
                                                    <div style={{ width: '12rem' }}>
                                                        <h5>Job role</h5>
                                                    </div>
                                                    <div style={{ width: '15rem' }}>
                                                        <div className="card-title">{job.jobRole}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </section>
                                        <section className="my-2">
                                            <div className="container">
                                                <div className="row">
                                                    <div style={{ width: '12rem' }}>
                                                        <h5>CGPA</h5>
                                                    </div>
                                                    <div style={{ width: '15rem' }}>
                                                        <div className="card-title">{job.cgpa}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </section>

                                        <section className="my-2">
                                            <div className="container">
                                                <div className="row">
                                                    <div style={{ width: '12rem' }}>
                                                        <h5>Description</h5>
                                                    </div>
                                                    <div style={{ width: '15rem' }}>
                                                        <div className="card-title overflow-auto" style={{ maxHeight: "15rem", scrollbarWidth: 'thin' }}>{job.description}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </section>

                                        <section className="my-2">
                                            <div className="container">
                                                <div className="row">
                                                    <div style={{ width: '12rem' }}>
                                                        <h5>Experience</h5>
                                                    </div>
                                                    <div style={{ width: '15rem' }}>
                                                        <div className="card-title">{job.experience}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </section>

                                        <section className="my-2">
                                            <div className="container">
                                                <div className="row">
                                                    <div style={{ width: '12rem' }}>
                                                        <h5>Seats</h5>
                                                    </div>
                                                    <div style={{ width: '15rem' }}>
                                                        <div className="card-title">{job.seats}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </section>

                                        <section className="my-2">
                                            <div className="container">
                                                <div className="row">
                                                    <div style={{ width: '12rem' }}>
                                                        <h5>Package</h5>
                                                    </div>
                                                    <div style={{ width: '15rem' }}>
                                                        <div className="card-title">{job.package}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </section>



                                        <div className='d-inline-flex mt-2'>
                                            <div className='card-body'>
                                                <button id={index} onClick={handleSelect} className='btn btn-primary'>Select</button>
                                            </div>
                                            <div className='card-body'>
                                                <button id={index} onClick={handleReject} className='btn btn-dark'>Reject</button>
                                            </div>
                                        </div>                                <section className="my-2">
                                            <div className="container">
                                                <div className="row">
                                                    <div>
                                                        <Link className="btn btn-dark my-3" onClick={() => computeCapability(job._id, job.description)} role="button">Calculate Capability</Link>
                                                        {scores[job._id] ? (
                                                            <span className="score-span mx-5" style={scoreStyle}>
                                                                {scores[job._id]}%
                                                            </span>
                                                        ) : null}
                                                    </div>
                                                </div>
                                            </div>
                                        </section>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="carousel-control-prev" type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide="prev" style={{ color: 'black', marginRight: '20%', zIndex: "1" }}>
                        <span className="carousel-control-prev-icon btn btn-dark" aria-hidden="true" style={{height:"10%", marginRight:"25%"}}></span>
                        <span className="visually-hidden">Previous</span>
                    </button>
                    <button className="carousel-control-next" type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide="next" style={{ color: 'black', marginLeft: '20p%', zIndex: "1" }}>
                        <span className="carousel-control-next-icon btn btn-dark" aria-hidden="true" style={{height:"10%", marginLeft:"25%"}}></span>
                        <span className="visually-hidden">Next</span>
                    </button>
                </div>
            : null}</div>

        </>
    )

}

export default RecruiterStudentProfile;