import React, { useState, useEffect } from 'react';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { notify } from '../Toast';
import { useNavigate } from 'react-router-dom';
// const RESUMES_URL = 'http://localhost:3500/resumes';
const RESUMES_URL = '/tmp';

const StudentProfile = () => {
    const [emailOTPSent, setEmailOTPSent] = useState(false);
    const [mobileOTPSent, setMobileOTPSent] = useState(false);
    const [emailOTP, setEmailOTP] = useState('');
    const [mobileOTP, setMobileOTP] = useState('');
    const [disableEmailOTP, setDisableEmailOTP] = useState(false);
    const [disableMobileOTP, setDisableMobileOTP] = useState(false);

    const axios = useAxiosPrivate();
    const navigate = useNavigate();
    const bufferToBase64 = (bufferArray) => {
        const chunkSize = 100000;
        let base64String = '';

        for (let i = 0; i < bufferArray.length; i += chunkSize) {
            const chunk = bufferArray.slice(i, i + chunkSize);
            base64String += String.fromCharCode.apply(null, chunk);
        }

        return btoa(base64String);
    }

    const disabledDefault = {
        academic: true,
        certification: true,
        contact: true,
        personal: true,
        project: true,
        work: true,
        account: true
    }
    const currentDefault = {
        college: '',
        course: '',
        joinDate: '',
        graduatingYear: '',
        city: '',
        state: '',
        rollNo: '',
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
    const certificationDefault = {
        name: '',
        organization: ''
    };
    const contactDefault = {
        email: '',
        collegeEmail: '',
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
    const projectDefault = {
        name: '',
        startDate: '',
        endDate: '',
        description: '',
        associated: '',
        current: false
    };
    const workDefault = {
        organization: '',
        role: '',
        description: '',
        startDate: '',
        endDate: ''
    };
    const [disabled, setDisabled] = useState(disabledDefault);
    const [newCertification, setNewCertification] = useState(certificationDefault);
    const [newProject, setNewProject] = useState(projectDefault);
    const [newWork, setNewWork] = useState(workDefault);

    const [profile, setProfile] = useState('');
    const [resume, setResume] = useState('');
    const [currentEducation, setCurrentEducation] = useState(currentDefault);
    const [previousEducation, setPreviousEducation] = useState(previousDefault);
    const [contact, setContact] = useState(contactDefault);
    const [personal, setPersonal] = useState(personalDefault);
    const [certifications, setCertifications] = useState([]);
    const [projects, setProjects] = useState([]);
    const [works, setWorks] = useState([]);
    const [username, setUsername] = useState('');
    const [prevPassword, setPrevPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [currentCertIndex, setCurrentCertIndex] = useState(0);
    const [currentProjectIndex, setCurrentProjectIndex] = useState(0);
    const [currentWorkIndex, setCurrentWorkIndex] = useState(0);

    const fetchStudent = async () => {
        try {
            const response = await axios.get('/student/details')

            const student = response?.data
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
            setUsername(student?.username);
            setResume(student?.resume);
            if (student?.profile?.data.length)
                setProfile(`data:image/jpeg;base64,${bufferToBase64(student?.profile?.data)}`);
        } catch (err) {
            notify('failed', err?.response?.data?.message);
        }
    }

    useEffect(() => {
        const fetchStudent = async () => {
            try {
                const response = await axios.get('/student/details')

                const student = response?.data
                if (!student?.academic || !student?.contact || !student?.personal)
                    return navigate('/studentRegister');
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
                setUsername(student?.username);
                setResume(student?.resume);
                if (student?.profile?.data.length)
                    setProfile(`data:image/jpeg;base64,${bufferToBase64(student?.profile?.data)}`);

            } catch (err) {
                notify('failed', err?.response?.data?.message);
            }
        }
        fetchStudent();
    }, [axios, navigate]);

    const handleAcademic = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.put('/student/academic', {
                currentEducation: {
                    ...currentEducation,
                    graduatingYear: parseInt(currentEducation.graduatingYear),
                    studyYear: parseInt(currentEducation.studyYear),
                    cgpa: parseInt(currentEducation.cgpa)
                },
                previousEducation: {
                    ...previousEducation,
                    percentage: parseInt(previousEducation.percentage)
                },
                rollNo: currentEducation.rollNo,
                academicId: currentEducation.academicId
            });
            const success = response?.data?.success;
            if (success)
                notify('success', success);

        } catch (err) {
            notify('failed', err?.response?.data?.message);
        }
    }

    const handleCertification = async (index) => {
        try {
            const cert = certifications[index];

            const response = await axios.put('/student/certification', {
                ...cert,
                certificationId: cert._id
            });

            if (response?.data?.success) {
                notify('success', response.data.success);
            }

            fetchStudent();

        } catch (err) {
            notify('failed', err?.response?.data?.message);
        }
    };

    const handleNewCertification = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/student/certification', {
                ...newCertification
            });
            const success = response?.data?.success;
            if (success)
                notify('success', success);

            setNewCertification(certificationDefault);
            fetchStudent();
        } catch (err) {
            notify('failed', err?.response?.data?.message);
        }
    }

    const deleteCertification = async (index) => {
        try {
            const id = certifications[index]._id;

            const response = await axios.delete(`/student/certification/${id}`);

            if (response?.data?.success) {
                notify('success', response.data.success);
            }

            fetchStudent();

        } catch (err) {
            notify('failed', err?.response?.data?.message);
        }
    };

    const handleContact = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.put('/student/contact', {
                ...contact,
                mobile: parseInt(contact.mobile) || contact.mobile,
                contactId: contact._id
            });
            const success = response?.data?.success;
            if (success)
                notify('success', success);

            fetchStudent();
        } catch (err) {
            notify('failed', err?.response?.data?.message);
        }
    }

    const handlePersonal = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.put('/student/personal', {
                ...personal,
                personalId: personal._id
            });
            const success = response?.data?.success;
            if (success)
                notify('success', success);

        } catch (err) {
            notify('failed', err?.response?.data?.message);
        }
    }

    const handleProject = async (index) => {
        try {
            const proj = projects[index];

            const response = await axios.put('/student/project', {
                ...proj,
                projectId: proj._id
            });

            if (response?.data?.success) {
                notify('success', response.data.success);
            }

            fetchStudent();

        } catch (err) {
            notify('failed', err?.response?.data?.message);
        }
    };

    const handleNewProject = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/student/project', {
                ...newProject
            });
            const success = response?.data?.success;
            if (success)
                notify('success', success);

            setNewProject(projectDefault);
            fetchStudent();
        } catch (err) {
            notify('failed', err?.response?.data?.message);
        }
    }

    const deleteProject = async (index) => {
        try {
            const id = projects[index]._id;

            const response = await axios.delete(`/student/project/${id}`);

            if (response?.data?.success) {
                notify('success', response.data.success);
            }

            fetchStudent();

        } catch (err) {
            notify('failed', err?.response?.data?.message);
        }
    };
    const handleWork = async (index) => {
        try {
            const work = works[index];

            const response = await axios.put('/student/work', {
                ...work,
                workId: work._id
            });

            if (response?.data?.success) {
                notify('success', response.data.success);
            }

            fetchStudent();

        } catch (err) {
            notify('failed', err?.response?.data?.message);
        }
    };

    const handleNewWork = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/student/work', {
                ...newWork
            });
            const success = response?.data?.success;
            if (success)
                notify('success', success);

            setNewWork(workDefault);
            fetchStudent();
        } catch (err) {
            notify('failed', err?.response?.data?.message);
        }
    }

    const deleteWork = async (index) => {
        try {
            const id = works[index]._id;

            const response = await axios.delete(`/student/work/${id}`);

            if (response?.data?.success) {
                notify('success', response.data.success);
            }

            fetchStudent();

        } catch (err) {
            notify('failed', err?.response?.data?.message);
        }
    };

    const handleProfile = async (e) => {
        e.preventDefault();
        try {
            const profile = document.getElementById("profile");
            const fd = new FormData();
            fd.append('profile', profile.files[0]);
            if (!fd) return

            const response = await axios.post('/student/profile', fd,
                {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });

            const success = response?.data?.success;
            if (success)
                notify('success', success);

            fetchStudent();
        } catch (err) {
            notify('failed', err?.response?.data?.message);
        }
    }

    const handleResume = async (e) => {
        e.preventDefault();
        try {
            const resume = document.getElementById("resume");
            const fd = new FormData();
            fd.append('resume', resume.files[0]);
            if (!fd) return

            const response = await axios.put('/student/resume', fd,
                {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });

            const success = response?.data?.success;
            if (success)
                notify('success', success);

            fetchStudent();
        } catch (err) {
            notify('failed', err?.response?.data?.message);
        }
    }

    const handleUsername = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.put('/username', { newUsername: username });
            const success = response?.data?.success;
            if (success)
                notify('success', success);

        } catch (err) {
            notify('failed', err?.response?.data?.message);
        }
    }

    const handlePassword = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.put('/password', { prevPassword, newPassword });
            const success = response?.data?.success;
            if (success)
                notify('success', success);

            setPrevPassword('');
            setNewPassword('');
        } catch (err) {
            notify('failed', err?.response?.data?.message);
        }
    }

    const getEmailOTP = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/student/sendMail', { email: contact.email });
            const success = response?.data?.success;
            if (success)
                notify('success', success);

            setEmailOTPSent(true);
        } catch (err) {
            notify('failed', err?.response?.data?.message);
        }
    }

    const getMobileOTP = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/student/sendMobile', { mobile: '+91' + contact.mobile });
            const success = response?.data?.success;
            if (success)
                notify('success', success);

            setMobileOTPSent(true);
        } catch (err) {
            notify('failed', err?.response?.data?.message);
        }
    }

    const verifyEmailOTP = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/student/verifyMail', { otp: emailOTP });
            const success = response?.data?.success;
            if (success)
                notify('success', success);

            setEmailOTP('');
            setDisableEmailOTP(true);
        } catch (err) {
            notify('failed', err?.response?.data?.message);
        }
    }

    const verifyMobileOTP = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post('/student/verifyMobile', { otp: mobileOTP });
            const success = response?.data?.success;
            if (success)
                notify('success', success);

            setMobileOTP('');
            setDisableMobileOTP(true);
        } catch (err) {
            notify('failed', err?.response?.data?.message);
        }
    }

    const resendEmailOTP = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/student/resendMail', { email: contact.email });
            const success = response?.data?.success;
            if (success)
                notify('success', success);

            setEmailOTPSent(true);
        } catch (err) {
            notify('failed', err?.response?.data?.message);
        }
    }

    const resendMobileOTP = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/student/resendMobile', { mobile: '+91' + contact.mobile });
            const success = response?.data?.success;
            if (success)
                notify('success', success);

            setMobileOTPSent(true);
        } catch (err) {
            notify('failed', err?.response?.data?.message);
        }
    }

    return (
        <>

            {/* Personal */}
            < div className='d-flex justify-content-center m-3'>
                {/* <div className='d-inline-flex p-4'> */}
                    <div className="card container h-100 shadow-2-strong mt-5 p-4 shadow-sm" style={{ backgroundColor: '#fff' }}>
                        <form className="card-body">

                            <div className='d-flex justify-content-between'>
                            <h2 className="mb-4 pb-1 pb-md-0 mb-md-4">Personal</h2>

                                {disabled.personal && (
                                    <div >
                                        <button onClick={(e) => setDisabled(prev => ({ ...prev, personal: false }))} className="btn btn-dark">Edit</button>
                                    </div>
                                )}
                            </div>

                            <fieldset disabled={disabled.personal}>

                                <div className='from-row row'>
                                    <div className='col-md-6'>

                                        <div className="card-body">
                                            <div className="flex-nowrap form-floating form-group">
                                                <input
                                                    id='pef'
                                                    className="form-control"
                                                    type="text"
                                                    placeholder='Full name'
                                                    autoComplete='off'
                                                    value={personal.fullName}
                                                    onChange={(e) => setPersonal(prev => ({ ...prev, fullName: e.target.value }))}
                                                    required
                                                />
                                                <label htmlFor='pef'>Full name</label>
                                            </div>
                                        </div>

                                        <div className="card-body">
                                            <div className="flex-nowrap form-floating">
                                                <input
                                                    id='pefa'
                                                    className="form-control"
                                                    type="text"
                                                    placeholder='Father name'
                                                    autoComplete='off'
                                                    value={personal.fatherName}
                                                    onChange={(e) => setPersonal(prev => ({ ...prev, fatherName: e.target.value }))}
                                                    required
                                                />
                                                <label htmlFor='pefa'>Father name</label>
                                            </div>
                                        </div>

                                        <div className="card-body">
                                            <div className="flex-nowrap form-floating">
                                                <input
                                                    id='pem'
                                                    className="form-control"
                                                    type="text"
                                                    placeholder='Mother name'
                                                    autoComplete='off'
                                                    value={personal.motherName}
                                                    onChange={(e) => setPersonal(prev => ({ ...prev, motherName: e.target.value }))}
                                                    required
                                                />
                                                <label htmlFor='pem'>Mother name</label>
                                            </div>
                                        </div>

                                    </div>

                                    <div className='col-md-6'>

                                        <div className="card-body">
                                            <div className="flex-nowrap form-floating">
                                                <input
                                                    id='ped'
                                                    className="form-control"
                                                    type="text"
                                                    placeholder='Date of birth'
                                                    autoComplete='off'
                                                    value={personal.dateOfBirth}
                                                    onChange={(e) => setPersonal(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                                                    required
                                                />
                                                <label htmlFor='ped'>Date of birth</label>
                                                {/* <p className="card-subtitle text-body-secondary">&nbsp;DD/MM/YYYY</p> */}
                                            </div>
                                        </div>

                                        <div className="card-body">
                                            <div className="flex-nowrap form-floating">
                                                <select required id='peg' className="form-select" value={personal.gender} onChange={(e) => setPersonal(prev => ({ ...prev, gender: e.target.value }))}>
                                                    <option defaultValue=''></option>
                                                    <option value='male'>Male</option>
                                                    <option value='female'>Female</option>
                                                </select>
                                                <label htmlFor='peg'>Gender</label>
                                            </div>
                                        </div>

                                    </div>
                                </div>

                                <div className="card-body">
                                    <button className="btn btn-primary" onClick={handlePersonal}>Save</button>
                                </div>

                            </fieldset>

                        </form>
                    </div>
                {/* </div> */}
            </div >

            {/* Contact */}
            < div className='d-flex justify-content-center m-3' >
                {/* <div className='d-inline-flex p-2'> */}
                    <div className="card container h-100 shadow-2-strong p-4 shadow-sm" style={{ backgroundColor: '#fff' }}>
                        <form className="card-body">

                            <div className='d-flex justify-content-between'>
                            <h2 className="mb-4 pb-1 pb-md-0 mb-md-4">Contact</h2>

                                {disabled.contact && (
                                    <div >
                                        <button onClick={(e) => setDisabled(prev => ({ ...prev, contact: false }))} className="btn btn-dark">Edit</button>
                                    </div>
                                )}
                            </div>

                            <fieldset disabled={disabled.contact}>
                                <div className='form-row row'>
                                    <div className='col-md-6'>

                                        <div className="card-body">
                                            <div className="flex-nowrap form-floating ">
                                                <input
                                                    id='cone'
                                                    className="form-control"
                                                    type="email"
                                                    placeholder='Email'
                                                    autoComplete='off'
                                                    value={contact.email}
                                                    onChange={(e) => setContact(prev => ({ ...prev, email: e.target.value }))}
                                                    required
                                                    disabled={emailOTPSent}
                                                />
                                                <label htmlFor='cone'>Email</label>
                                            </div>
                                        </div>

                                        {contact.email && !emailOTPSent && !disableEmailOTP && !contact.emailVerified && (
                                            <div className="card-body mt-0">
                                                <button className="btn btn-primary" onClick={getEmailOTP}>send otp</button>
                                            </div>)}

                                        {emailOTPSent && !disableEmailOTP && !contact.emailVerified && (
                                            <>
                                                <div className="card-body">
                                                    <div className="flex-nowrap form-floating">
                                                        <input
                                                            id='emailOTP'
                                                            className="form-control"
                                                            type="text"
                                                            placeholder='otp'
                                                            minLength={4}
                                                            maxLength={4}
                                                            autoComplete='off'
                                                            value={emailOTP}
                                                            onChange={(e) => setEmailOTP(e.target.value)}
                                                            required
                                                        />
                                                        <label htmlFor='emailOTP'>otp</label>
                                                    </div>
                                                </div>
                                                <div className='d-inline-flex'>
                                                    <div className="card-body">
                                                        <button className="btn btn-primary" onClick={verifyEmailOTP}>verify</button>
                                                    </div>
                                                    <div className="card-body">
                                                        <button className="btn btn-primary" onClick={resendEmailOTP}>resend</button>
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        <div className="card-body">
                                            <div className="flex-nowrap form-floating">
                                                <input
                                                    id='conce'
                                                    className="form-control"
                                                    type="email"
                                                    placeholder='College email'
                                                    autoComplete='off'
                                                    value={contact.collegeEmail}
                                                    onChange={(e) => setContact(prev => ({ ...prev, collegeEmail: e.target.value }))}
                                                    required
                                                />
                                                <label htmlFor='conce'>College email</label>
                                            </div>
                                        </div>

                                        <div className="card-body">
                                            <div className="flex-nowrap form-floating">
                                                <textarea
                                                    id='conec'
                                                    className="form-control"
                                                    rows="5"
                                                    data-spy="scroll"
                                                    type="text"
                                                    placeholder='Current address'
                                                    autoComplete='off'
                                                    value={contact.currentAddress}
                                                    onChange={(e) => setContact(prev => ({ ...prev, currentAddress: e.target.value }))}
                                                    required
                                                />
                                                <label htmlFor='conec'>Current address</label>
                                            </div>
                                        </div>

                                    </div>

                                    <div className='col-md-6'>

                                        <div className="card-body">
                                            <div className="flex-nowrap form-floating">
                                                <input
                                                    id='conm'
                                                    className="form-control"
                                                    type="text"
                                                    placeholder='Mobile'
                                                    minLength={10}
                                                    maxLength={10}
                                                    autoComplete='off'
                                                    value={contact.mobile}
                                                    onChange={(e) => setContact(prev => ({ ...prev, mobile: e.target.value }))}
                                                    required
                                                    disabled={mobileOTPSent}
                                                />
                                                <label htmlFor='conm'>Mobile</label>
                                            </div>
                                        </div>

                                        {contact.mobile && !disableMobileOTP && !mobileOTPSent && !contact.mobileVerified && (
                                            <div className="card-body">
                                                <button className="btn btn-primary" onClick={getMobileOTP}>send otp</button>
                                            </div>)}

                                        {(!disableMobileOTP && mobileOTPSent && !contact.mobileVerified &&
                                            <>
                                                <div className="card-body">
                                                    <div className="flex-nowrap form-floating">
                                                        <input
                                                            id='mobileOTP'
                                                            className="form-control"
                                                            type="text"
                                                            minLength={4}
                                                            maxLength={4}
                                                            placeholder='otp'
                                                            autoComplete='off'
                                                            value={mobileOTP}
                                                            onChange={(e) => setMobileOTP(e.target.value)}
                                                            required
                                                        />
                                                        <label htmlFor='mobileOTP'>otp</label>
                                                    </div>
                                                </div>
                                                <div className='d-inline-flex'>
                                                    <div className="card-body">
                                                        <button className="btn btn-primary" onClick={verifyMobileOTP}>verify</button>
                                                    </div>
                                                    <div className="card-body">
                                                        <button className="btn btn-primary" onClick={resendMobileOTP}>resend</button>
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        <div className="card-body">
                                            <div className="flex-nowrap form-floating">
                                                <textarea
                                                    id='conp'
                                                    rows="5"
                                                    data-spy="scroll"
                                                    className="form-control"
                                                    type="text"
                                                    placeholder='Permanent address'
                                                    autoComplete='off'
                                                    value={contact.permanentAddress}
                                                    onChange={(e) => setContact(prev => ({ ...prev, permanentAddress: e.target.value }))}
                                                    required
                                                />
                                                <label htmlFor='conp'>Permanent address</label>
                                            </div>
                                        </div>

                                    </div>
                                </div>

                                <div className="card-body">
                                    <button className="btn btn-primary" onClick={handleContact}>Save</button>
                                </div>

                            </fieldset>

                        </form>
                    </div>
                {/* </div> */}
            </div >

            {/* Academic */}
            < div className='d-flex justify-content-center m-3' >
                {/* <div className='d-inline-flex p-2'> */}
                    <div className="card container h-100 shadow-2-strong p-4 shadow-sm" style={{ backgroundColor: '#fff' }}>
                        <form className="card-body">

                            <div className='d-flex justify-content-between'>
                            <h2 className="mb-4 pb-1 pb-md-0 mb-md-4">Academic</h2>

                                {disabled.academic && (
                                    <div >
                                        <button onClick={(e) => setDisabled(prev => ({ ...prev, academic: false }))} className="btn btn-dark">Edit</button>
                                    </div>
                                )}
                            </div>

                            <fieldset disabled={disabled.academic}>

                                <div className="card m-2 p-3 mb-5 shadow" style={{ backgroundColor: '#fff' }}>

                                    <div className="card-body">
                                    <h2 className="mb-4 pb-1 pb-md-0 mb-md-2">Current Education</h2>
                                    </div>

                                    <div className='form-row row'>

                                        <div className='col-md-6'>

                                            <div className="card-body">
                                                <div className="flex-nowrap form-floating">
                                                    <input
                                                        id='cc'
                                                        className="form-control"
                                                        type="text"
                                                        placeholder='College name'
                                                        autoComplete='off'
                                                        value={currentEducation.college}
                                                        onChange={(e) => setCurrentEducation(prev => ({ ...prev, college: e.target.value }))}
                                                        required
                                                    />
                                                    <label htmlFor='cc'>College name</label>
                                                </div>
                                            </div>

                                            <div className="card-body">
                                                <div className="flex-nowrap form-floating">
                                                    <input
                                                        id='co'
                                                        className="form-control"
                                                        type="text"
                                                        placeholder='Major'
                                                        autoComplete='off'
                                                        value={currentEducation.course}
                                                        onChange={(e) => setCurrentEducation(prev => ({ ...prev, course: e.target.value }))}
                                                        required
                                                    />
                                                    <label htmlFor='co'>Major</label>
                                                </div>
                                            </div>

                                            <div className="card-body">
                                                <div className="flex-nowrap form-floating">
                                                    <input
                                                        id='cj'
                                                        className="form-control"
                                                        type="text"
                                                        placeholder='Join Date'
                                                        autoComplete='off'
                                                        value={currentEducation.joinDate}
                                                        onChange={(e) => setCurrentEducation(prev => ({ ...prev, joinDate: e.target.value }))}
                                                        required
                                                    />
                                                    <label htmlFor='cj'>Join Date</label>
                                                    {/* <p className="card-subtitle text-body-secondary">&nbsp;DD/MM/YYYY</p> */}
                                                </div>
                                            </div>

                                            <div className="card-body">
                                                <div className="flex-nowrap form-floating">
                                                    <input
                                                        id='cg'
                                                        className="form-control"
                                                        type="text"
                                                        placeholder='Graduating Year'
                                                        autoComplete='off'
                                                        value={currentEducation.graduatingYear}
                                                        onChange={(e) => setCurrentEducation(prev => ({ ...prev, graduatingYear: e.target.value }))}
                                                        required
                                                    />
                                                    <label htmlFor='cg'>Graduating year</label>
                                                </div>
                                            </div>

                                            <div className="card-body">
                                                <div className="flex-nowrap form-floating">
                                                    <input
                                                        id='ci'
                                                        className="form-control"
                                                        type="text"
                                                        placeholder='City'
                                                        autoComplete='off'
                                                        value={currentEducation.city}
                                                        onChange={(e) => setCurrentEducation(prev => ({ ...prev, city: e.target.value }))}
                                                        required
                                                    />
                                                    <label htmlFor='ci'>City</label>
                                                </div>
                                            </div>

                                            <div className="card-body">
                                                <div className="flex-nowrap form-floating">
                                                    <input
                                                        id='cs'
                                                        className="form-control"
                                                        type="text"
                                                        placeholder='State'
                                                        autoComplete='off'
                                                        value={currentEducation.state}
                                                        onChange={(e) => setCurrentEducation(prev => ({ ...prev, state: e.target.value }))}
                                                        required
                                                    />
                                                    <label htmlFor='cs'>State</label>
                                                </div>
                                            </div>

                                        </div>

                                        <div className='col-md-6 mb-3'>

                                            <div className="card-body">
                                                <div className="flex-nowrap form-floating">
                                                    <input
                                                        id='ct'
                                                        className="form-control"
                                                        type="text"
                                                        placeholder='Study Year'
                                                        autoComplete='off'
                                                        value={currentEducation.studyYear}
                                                        onChange={(e) => setCurrentEducation(prev => ({ ...prev, studyYear: e.target.value }))}
                                                        required
                                                    />
                                                    <label htmlFor='ct'>Study year</label>
                                                </div>
                                            </div>

                                            <div className="card-body">
                                                <div className="flex-nowrap form-floating">
                                                    <input
                                                        id='cm'
                                                        className="form-control"
                                                        type="text"
                                                        placeholder='Course'
                                                        autoComplete='off'
                                                        value={currentEducation.major}
                                                        onChange={(e) => setCurrentEducation(prev => ({ ...prev, major: e.target.value }))}
                                                        required
                                                    />
                                                    <label htmlFor='cm'>Course</label>
                                                </div>
                                            </div>

                                            <div className="card-body">
                                                <div className="flex-nowrap form-floating">
                                                    <input
                                                        id='cr'
                                                        className="form-control"
                                                        type="text"
                                                        placeholder='Roll No.'
                                                        autoComplete='off'
                                                        value={currentEducation.rollNo}
                                                        onChange={(e) => setCurrentEducation(prev => ({ ...prev, rollNo: e.target.value }))}
                                                        required
                                                    />
                                                    <label htmlFor='cr'>Roll No.</label>
                                                </div>
                                            </div>

                                            <div className="card-body">
                                                <div className="flex-nowrap form-floating">
                                                    <input
                                                        id='ck'
                                                        className="form-control"
                                                        type="text"
                                                        placeholder='Skills'
                                                        autoComplete='off'
                                                        value={currentEducation.skills}
                                                        onChange={(e) => setCurrentEducation(prev => ({ ...prev, skills: e.target.value.split(',') }))}
                                                        required
                                                    />
                                                    <label htmlFor='ck'>Skills</label>
                                                </div>
                                            </div>

                                            <div className="card-body">
                                                <div className="flex-nowrap form-floating">
                                                    <input
                                                        id='cn'
                                                        className="form-control"
                                                        type="text"
                                                        placeholder='Interests'
                                                        autoComplete='off'
                                                        value={currentEducation.interests}
                                                        onChange={(e) => setCurrentEducation(prev => ({ ...prev, interests: e.target.value.split(',') }))}
                                                        required
                                                    />
                                                    <label htmlFor='cn'>Interests</label>
                                                </div>
                                            </div>

                                            <div className="card-body">
                                                <div className="flex-nowrap form-floating">
                                                    <input
                                                        id='cp'
                                                        className="form-control"
                                                        type="text"
                                                        placeholder='cgpa'
                                                        autoComplete='off'
                                                        value={currentEducation.cgpa}
                                                        onChange={(e) => setCurrentEducation(prev => ({ ...prev, cgpa: e.target.value }))}
                                                        required
                                                    />
                                                    <label htmlFor='cp'>cgpa</label>
                                                </div>
                                            </div>

                                        </div>

                                    </div>

                                </div>

                                <div className="card m-2 p-3 mb-4 shadow" style={{ backgroundColor: '#fff' }}>

                                    <div className="card-body">
                                    <h2 className="mb-4 pb-1 pb-md-0 mb-md-3">Previous Education</h2>
                                    </div>

                                    <div className='form-row row'>

                                        <div className='col-md-6 mb-3'>

                                            <div className="card-body">
                                                <div className="flex-nowrap form-floating">
                                                    <input
                                                        id='pc'
                                                        className="form-control"
                                                        type="text"
                                                        placeholder='College name'
                                                        autoComplete='off'
                                                        value={previousEducation.college}
                                                        onChange={(e) => setPreviousEducation(prev => ({ ...prev, college: e.target.value }))}
                                                        required
                                                    />
                                                    <label htmlFor='pc'>College</label>
                                                </div>
                                            </div>

                                            <div className="card-body">
                                                <div className="flex-nowrap form-floating">
                                                    <input
                                                        id='ps'
                                                        className="form-control"
                                                        type="text"
                                                        placeholder='State'
                                                        autoComplete='off'
                                                        value={previousEducation.state}
                                                        onChange={(e) => setPreviousEducation(prev => ({ ...prev, state: e.target.value }))}
                                                        required
                                                    />
                                                    <label htmlFor='ps'>State</label>
                                                </div>
                                            </div>

                                            <div className="card-body">
                                                <div className="flex-nowrap form-floating">
                                                    <input
                                                        id='pi'
                                                        className="form-control"
                                                        type="text"
                                                        placeholder='City'
                                                        autoComplete='off'
                                                        value={previousEducation.city}
                                                        onChange={(e) => setPreviousEducation(prev => ({ ...prev, city: e.target.value }))}
                                                        required
                                                    />
                                                    <label htmlFor='pi'>City</label>
                                                </div>
                                            </div>

                                        </div>

                                        <div className='col-md-6'>

                                            <div className="card-body">
                                                <div className="flex-nowrap form-floating">
                                                    <input
                                                        id='pm'
                                                        className="form-control"
                                                        type="text"
                                                        placeholder='Major'
                                                        autoComplete='off'
                                                        value={previousEducation.major}
                                                        onChange={(e) => setPreviousEducation(prev => ({ ...prev, major: e.target.value }))}
                                                        required
                                                    />
                                                    <label htmlFor='pm'>Major</label>
                                                </div>
                                            </div>

                                            <div className="card-body">
                                                <div className="flex-nowrap form-floating">
                                                    <input
                                                        id='pp'
                                                        className="form-control"
                                                        type="text"
                                                        placeholder='Percentage'
                                                        autoComplete='off'
                                                        value={previousEducation.percentage}
                                                        onChange={(e) => setPreviousEducation(prev => ({ ...prev, percentage: e.target.value }))}
                                                        required
                                                    />
                                                    <label htmlFor='pp'>Percentage</label>
                                                </div>
                                            </div>

                                        </div>

                                    </div>

                                </div>

                                <div className="card-body">
                                    <button className="btn btn-primary" onClick={handleAcademic}>Save</button>
                                </div>

                            </fieldset>

                        </form>
                    </div>
                {/* </div > */}
            </div >

            {/* Certification */}
            {certifications.length > 0 && (
                <div className="d-flex justify-content-center m-3">
                    <div className="card container p-4 shadow-sm">

                        <h3 className="mb-4">Certifications</h3>

                        {/* NAV */}
                        <div className="d-flex justify-content-between mb-3">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                disabled={currentCertIndex === 0}
                                onClick={() => setCurrentCertIndex(prev => prev - 1)}
                            >
                                ⬅ Prev
                            </button>

                            <span>
                                {currentCertIndex + 1} / {certifications.length}
                            </span>

                            <button
                                type="button"
                                className="btn btn-secondary"
                                disabled={currentCertIndex === certifications.length - 1}
                                onClick={() => setCurrentCertIndex(prev => prev + 1)}
                            >
                                Next ➡
                            </button>
                        </div>

                        {/* FORM */}
                        <input
                            className="form-control mb-3"
                            value={certifications[currentCertIndex]?.name || ""}
                            onChange={(e) => {
                                const updated = [...certifications];
                                updated[currentCertIndex].name = e.target.value;
                                setCertifications(updated);
                            }}
                            placeholder="Name"
                        />

                        <input
                            className="form-control mb-3"
                            value={certifications[currentCertIndex]?.organization || ""}
                            onChange={(e) => {
                                const updated = [...certifications];
                                updated[currentCertIndex].organization = e.target.value;
                                setCertifications(updated);
                            }}
                            placeholder="Organization"
                        />

                        {/* BUTTONS */}
                        <div className="d-grid gap-3 mt-3">
                            <button
                                type="button"
                                className="btn btn-dark"
                                onClick={() => deleteCertification(currentCertIndex)}
                            >
                                Remove
                            </button>

                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={() => handleCertification(currentCertIndex)}
                            >
                                Save
                            </button>
                        </div>

                    </div>
                </div>
            )}

            {/* New Certification */}
            <div className='d-flex justify-content-center m-3'>
                {/* <div className='d-inline-flex p-2'> */}
                    <div className="card container h-100 shadow-2-strong p-4 shadow-sm" style={{ backgroundColor: '#fff' }}>
                        <form className="card-body">

                            <fieldset>

                            <h2 className="mb-4 pb-1 pb-md-0 mb-md-4">New Certification</h2>

                                <div className='from-row row'>
                                    <div className='col-md-6'>
                                    <div className="card-body">
                                        <div className="flex-nowrap form-floating">
                                            <input
                                                id='ncen'
                                                className="form-control"
                                                type="text"
                                                placeholder='Name'
                                                autoComplete='off'
                                                value={newCertification.name}
                                                onChange={(e) => setNewCertification(prev => ({ ...prev, name: e.target.value }))}
                                                required
                                            />
                                            <label htmlFor='ncen'>Name</label>
                                        </div>
                                    </div>
                                    </div>
                                    <div className='col-md-6'>
                                    <div className="card-body">
                                        <div className="flex-nowrap form-floating">
                                            <input
                                                id='nceo'
                                                className="form-control"
                                                type="text"
                                                placeholder='Organization'
                                                autoComplete='off'
                                                value={newCertification.organization}
                                                onChange={(e) => setNewCertification(prev => ({ ...prev, organization: e.target.value }))}
                                                required
                                            />
                                            <label htmlFor='nceo'>Organization</label>
                                        </div>
                                    </div>
                                    </div>
                                </div>

                                <div className="card-body">
                                    <button className="btn btn-primary" onClick={handleNewCertification}>submit</button>
                                </div>

                            </fieldset>

                        </form>
                    </div>
                {/* </div> */}
            </div>

            {/* Project */}
            {projects.length > 0 && (
                <div className="d-flex justify-content-center m-3">
                    <div className="card container p-4 shadow-sm">

                        <h3 className="mb-4">Projects</h3>

                        <div className="d-flex justify-content-between mb-3">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                disabled={currentProjectIndex === 0}
                                onClick={() => setCurrentProjectIndex(prev => prev - 1)}
                            >
                                ⬅ Prev
                            </button>

                            <span>
                                {currentProjectIndex + 1} / {projects.length}
                            </span>

                            <button
                                type="button"
                                className="btn btn-secondary"
                                disabled={currentProjectIndex === projects.length - 1}
                                onClick={() => setCurrentProjectIndex(prev => prev + 1)}
                            >
                                Next ➡
                            </button>
                        </div>

                        <input
                            className="form-control mb-3"
                            value={projects[currentProjectIndex]?.name || ""}
                            onChange={(e) => {
                                const updated = [...projects];
                                updated[currentProjectIndex].name = e.target.value;
                                setProjects(updated);
                            }}
                            placeholder="Project Name"
                        />

                        <textarea
                            className="form-control mb-3"
                            value={projects[currentProjectIndex]?.description || ""}
                            onChange={(e) => {
                                const updated = [...projects];
                                updated[currentProjectIndex].description = e.target.value;
                                setProjects(updated);
                            }}
                            placeholder="Description"
                        />

                        <div className="d-grid gap-3 mt-3">
                            <button
                                type="button"
                                className="btn btn-dark"
                                onClick={() => deleteProject(currentProjectIndex)}
                            >
                                Remove
                            </button>

                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={() => handleProject(currentProjectIndex)}
                            >
                                Save
                            </button>
                        </div>

                    </div>
                </div>
            )}
            {/* New Project */}
            <div className='d-flex justify-content-center m-3'>
                {/* <div className='d-inline-flex p-2'> */}
                    <div className="card container h-100 shadow-2-strong p-4 shadow-sm" style={{ backgroundColor: '#fff' }}>
                        <form className="card-body">

                            <fieldset>

                            <h2 className="mb-4 pb-1 pb-md-0 mb-md-4">New Project</h2>

                                <div className='form-row row'>
                                    <div className='col-md-6'>

                                        <div className="card-body">
                                            <div className="flex-nowrap form-floating">
                                                <input
                                                    id='prnnew'
                                                    className="form-control"
                                                    type="text"
                                                    placeholder='Name'
                                                    autoComplete='off'
                                                    value={newProject.name}
                                                    onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
                                                    required
                                                />
                                                <label htmlFor='prnnew'>Name</label>
                                            </div>
                                        </div>

                                        <div className="card-body">
                                            <div className="flex-nowrap form-floating">
                                                <input
                                                    id='prsnew'
                                                    className="form-control"
                                                    type="text"
                                                    placeholder='Start date'
                                                    autoComplete='off'
                                                    value={newProject.startDate}
                                                    onChange={(e) => setNewProject(prev => ({ ...prev, startDate: e.target.value }))}
                                                    required
                                                />
                                                <label htmlFor='prsnew'>Start date</label>
                                                {/* <p className="card-subtitle text-body-secondary">&nbsp;DD/MM/YYYY</p> */}
                                            </div>
                                        </div>

                                        <div className="card-body">
                                            <div className="flex-nowrap form-floating">
                                                <input
                                                    id='pranew'
                                                    className="form-control"
                                                    type="text"
                                                    placeholder='Associated'
                                                    autoComplete='off'
                                                    value={newProject.associated}
                                                    onChange={(e) => setNewProject(prev => ({ ...prev, associated: e.target.value }))}
                                                    required
                                                />
                                                <label htmlFor='pranew'>Associated</label>
                                            </div>
                                        </div>

                                    </div>

                                    <div className='col-md-6'>

                                        <div className="card-body">
                                            <div className="flex-nowrap form-floating">
                                                <textarea
                                                    id='prdnew'
                                                    rows="5"
                                                    data-spy="scroll"
                                                    className="form-control"
                                                    type="text"
                                                    placeholder='Description'
                                                    autoComplete='off'
                                                    value={newProject.description}
                                                    onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                                                    required
                                                />
                                                <label htmlFor='prdnew'>Description</label>
                                            </div>
                                        </div>

                                        <div className="card-body">
                                            <div className="flex-nowrap form-floating">
                                                <input
                                                    id='prenew'
                                                    className="form-control"
                                                    type="text"
                                                    placeholder='End date'
                                                    autoComplete='off'
                                                    value={newProject.endDate}
                                                    disabled={newProject.current}
                                                    onChange={(e) => setNewProject(prev => ({ ...prev, endDate: e.target.value }))}
                                                />
                                                <label htmlFor='prenew'>End date</label>
                                                {/* <p className="card-subtitle text-body-secondary">&nbsp;DD/MM/YYYY</p> */}
                                            </div>
                                        </div>

                                        <div className="card-body mt-3">
                                            <div className="flex-nowrap form-check">
                                                <input
                                                    id='prcnew'
                                                    className='form-check-input'
                                                    type="checkbox"
                                                    value={newProject.current}
                                                    onChange={(e) => setNewProject(prev => {
                                                        return ({ ...prev, endDate: '', current: !prev.current })
                                                    })}
                                                />
                                                <label className="form-check-label" htmlFor="prcnew">Currently working</label>
                                            </div>
                                        </div>

                                    </div>
                                </div>

                                <div className="card-body">
                                    <button className="btn btn-primary" onClick={handleNewProject}>submit</button>
                                </div>

                            </fieldset>

                        </form>
                    </div>
                {/* </div> */}
            </div>

            {/* Work */}
            {works.length > 0 && (
                <div className="d-flex justify-content-center m-3">
                    <div className="card container p-4 shadow-sm">

                        <h3 className="mb-4">Work Experience</h3>

                        <div className="d-flex justify-content-between mb-3">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                disabled={currentWorkIndex === 0}
                                onClick={() => setCurrentWorkIndex(prev => prev - 1)}
                            >
                                ⬅ Prev
                            </button>

                            <span>
                                {currentWorkIndex + 1} / {works.length}
                            </span>

                            <button
                                type="button"
                                className="btn btn-secondary"
                                disabled={currentWorkIndex === works.length - 1}
                                onClick={() => setCurrentWorkIndex(prev => prev + 1)}
                            >
                                Next ➡
                            </button>
                        </div>

                        <input
                            className="form-control mb-3"
                            value={works[currentWorkIndex]?.organization || ""}
                            onChange={(e) => {
                                const updated = [...works];
                                updated[currentWorkIndex].organization = e.target.value;
                                setWorks(updated);
                            }}
                            placeholder="Organization"
                        />

                        <input
                            className="form-control mb-3"
                            value={works[currentWorkIndex]?.role || ""}
                            onChange={(e) => {
                                const updated = [...works];
                                updated[currentWorkIndex].role = e.target.value;
                                setWorks(updated);
                            }}
                            placeholder="Role"
                        />

                        <textarea
                            className="form-control mb-3"
                            value={works[currentWorkIndex]?.description || ""}
                            onChange={(e) => {
                                const updated = [...works];
                                updated[currentWorkIndex].description = e.target.value;
                                setWorks(updated);
                            }}
                            placeholder="Description"
                        />

                        <div className="d-grid gap-3 mt-3">
                            <button
                                type="button"
                                className="btn btn-dark"
                                onClick={() => deleteWork(currentWorkIndex)}
                            >
                                Remove
                            </button>

                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={() => handleWork(currentWorkIndex)}
                            >
                                Save
                            </button>
                        </div>

                    </div>
                </div>
            )}

            {/* New Work */}
            <div className='d-flex justify-content-center m-3'>
                {/* <div className='d-inline-flex p-2'> */}
                    <div className="card container h-100 shadow-2-strong p-4 shadow-sm" style={{ backgroundColor: '#fff' }}>
                        <form className="card-body">

                            <fieldset>

                            <h2 className="mb-4 pb-1 pb-md-0 mb-md-4">New Work</h2>

                                <div className='form-row row'>
                                    <div className='col-md-6'>

                                        <div className="card-body">
                                            <div className="flex-nowrap form-floating">
                                                <input
                                                    id='wo'
                                                    className="form-control"
                                                    type="text"
                                                    placeholder='Organization'
                                                    autoComplete='off'
                                                    value={newWork.organization}
                                                    onChange={(e) => setNewWork(prev => ({ ...prev, organization: e.target.value }))}
                                                    required
                                                />
                                                <label htmlFor='wo'>Organization</label>
                                            </div>
                                        </div>

                                        <div className="card-body">
                                            <div className="flex-nowrap form-floating">
                                                <input
                                                    id='ws'
                                                    className="form-control"
                                                    type="text"
                                                    placeholder='Start date'
                                                    autoComplete='off'
                                                    value={newWork.startDate}
                                                    onChange={(e) => setNewWork(prev => ({ ...prev, startDate: e.target.value }))}
                                                    required
                                                />
                                                <label htmlFor='ws'>Start date</label>
                                                {/* <p className="card-subtitle text-body-secondary">&nbsp;DD/MM/YYYY</p> */}
                                            </div>
                                        </div>

                                        <div className="card-body">
                                            <div className="flex-nowrap form-floating">
                                                <textarea
                                                    id='wd'
                                                    rows="5"
                                                    data-spy="scroll"
                                                    className="form-control"
                                                    type="text"
                                                    placeholder='Description'
                                                    autoComplete='off'
                                                    value={newWork.description}
                                                    onChange={(e) => setNewWork(prev => ({ ...prev, description: e.target.value }))}
                                                    required
                                                />
                                                <label htmlFor='wd'>Description</label>
                                            </div>
                                        </div>

                                    </div>

                                    <div className='col-md-6'>

                                        <div className="card-body">
                                            <div className="flex-nowrap form-floating">
                                                <input
                                                    id='wr'
                                                    className="form-control"
                                                    type="text"
                                                    placeholder='Role'
                                                    autoComplete='off'
                                                    value={newWork.role}
                                                    onChange={(e) => setNewWork(prev => ({ ...prev, role: e.target.value }))}
                                                    required
                                                />
                                                <label htmlFor='wr'>Role</label>
                                            </div>
                                        </div>

                                        <div className="card-body">
                                            <div className="flex-nowrap form-floating">
                                                <input
                                                    id='we'
                                                    className="form-control"
                                                    type="text"
                                                    placeholder='End date'
                                                    autoComplete='off'
                                                    value={newWork.endDate}
                                                    onChange={(e) => setNewWork(prev => ({ ...prev, endDate: e.target.value }))}
                                                    required
                                                />
                                                <label htmlFor='we'>End date</label>
                                                {/* <p className="card-subtitle text-body-secondary">&nbsp;DD/MM/YYYY</p> */}
                                            </div>
                                        </div>

                                    </div>
                                </div>

                                <div className="card-body">
                                    <button className="btn btn-primary" onClick={handleNewWork}>submit</button>
                                </div>

                            </fieldset>

                        </form>
                    </div>
                {/* </div> */}
            </div>

            {/* Profile */}
            <div className='d-flex justify-content-center m-3'>
                {/* <div className='d-inline-flex p-2'> */}
                    <div className="card container h-100 shadow-2-strong p-4 shadow-sm  " style={{ backgroundColor: '#fff' }}>
                        <form className="card-body">

                        <h2 className="mb-4 pb-1 pb-md-0 mb-md-4">Profile</h2>

                            <div className='form-row row'>

                                <div className='col-md-3'>
                                    <div className='card-body'>
                                {       profile && <img className="rounded-circle " src={profile} height={'120'} width={'120'} alt='profile' />}
                                    </div>
                                </div>
                                <div className="col-md-9">
                                    <div className='card-body'>
                                    <div className="flex-nowrap">
                                        <label htmlFor="profile" className="form-label"><b>Change Profile pic</b> (File should be less than 2mb and
                                        only jpeg, jpg and png's allowed)</label>
                                        <input
                                            className="form-control"
                                            type="file"
                                            id="profile"
                                            name='profile'
                                        />
                                    </div>
                                    {/* <div className='d-flex flex-row'> */}
                                        {/* <label className="form-label fs-6">File should be lessthan 2 mb and<br /> only jpeg, jpg and png's allwoed</label> */}
                                        <button className="btn btn-primary mt-3" onClick={handleProfile}>upload</button>
                                    {/* </div> */}
                                    </div>
                                </div>

                            </div>
                            <div className='form-row row'>
                                {resume&&(<div className='col-md-3'>
                                    <div className='card-body'>
                                    <a href={`${RESUMES_URL}/${resume}`} className='link-offset-3-hover link-underline link-underline-opacity-0 link-underline-opacity-75-hover'>{resume}</a>
                                    </div>
                                </div>)}
                            <div className='col-md-9'>
                            <div className="card-body">
                                <div className="flex-nowrap">
                                    <label htmlFor="resume" className="form-label"><b>Resume</b> (File should be less than 2 mb and
                                        only pdf's are allowed)</label>
                                    <input
                                        className="form-control"
                                        type="file"
                                        id="resume"
                                        name='resume'
                                    />
                                </div>
                                {/* <div className='d-flex flex-row'> */}
                                    {/* <label className="form-label">File should be lessthan 2 mb and<br /> only pdf's allowed</label> */}
                                    <button className="btn btn-primary mt-3" onClick={handleResume}>upload</button>
                                {/* </div> */}
                            </div>
                            </div>
                            </div>
                        </form>
                    </div>
                {/* </div> */}
            </div>

            {/* Account */}
            <div className='d-flex justify-content-center m-3'>
                {/* <div className='d-inline-flex p-2'> */}
                    <div className="card container h-100 shadow-2-strong p-4 shadow-sm mb-5" style={{ backgroundColor: '#fff' }}>
                        <form className="card-body">

                            <div className='d-flex justify-content-between'>
                            <h2 className="mb-4 pb-1 pb-md-0 mb-md-4">Account</h2>

                                {disabled.account && (
                                    <div >
                                        <button onClick={(e) => setDisabled(prev => ({ ...prev, account: false }))} className="btn btn-dark">Edit</button>
                                    </div>
                                )}
                            </div>

                            <fieldset disabled={disabled.account}>

                                <div className='form-row row'>

                                    <div className='col-md-6'>

                                        <div className="card-body">
                                            <div className="form-floating flex-nowrap">
                                                <input
                                                    className="form-control"
                                                    type="text"
                                                    placeholder='Username'
                                                    id='username'
                                                    minLength={8}
                                                    maxLength={30}
                                                    autoComplete='off'
                                                    value={username}
                                                    onChange={(e) => setUsername(e.target.value)}
                                                    required
                                                />
                                                <label htmlFor='username'>Username</label>
                                            </div>
                                        </div>

                                        <div className="card-body">
                                            <button onClick={handleUsername} className="btn btn-primary">Save</button>
                                        </div>

                                    </div>

                                    <div className='col-md-6'>

                                        <div className="card-body">
                                            <div className="form-floating flex-nowrap">
                                                <input
                                                    className="form-control"
                                                    type="password"
                                                    autoComplete='off'
                                                    id='prevPassword'
                                                    placeholder='Previous password'
                                                    value={prevPassword}
                                                    min={8}
                                                    onChange={(e) => setPrevPassword(e.target.value)}
                                                    required
                                                />
                                                <label htmlFor='prevPassword'>Previous password</label>
                                            </div>
                                        </div>

                                        <div className="card-body">
                                            <div className="form-floating flex-nowrap">
                                                <input
                                                    className="form-control"
                                                    type="password"
                                                    autoComplete='off'
                                                    id='newPassword'
                                                    placeholder='New password'
                                                    value={newPassword}
                                                    min={8}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    required
                                                />
                                                <label htmlFor='newPassword'>New password</label>
                                            </div>
                                        </div>

                                        <div className="card-body">
                                            <button onClick={handlePassword} className="btn btn-primary">Save</button>
                                        </div>

                                    </div>

                                </div>

                            </fieldset>

                        </form>
                    </div>
                {/* </div> */}
            </div>

        </>
    )

}

export default StudentProfile;
