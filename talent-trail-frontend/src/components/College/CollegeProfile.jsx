import React, { useState, useEffect } from 'react';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { notify } from '../Toast';
import { useNavigate } from 'react-router-dom';

const CollegeProfile = () => {
    const disabledDefault = {
        institution: true,
        principal: true,
        placement: true,
        course: true,
        account: true
    }
    const institutionDefault = {
        name: '',
        website: '',
        address: '',
        mobile: ''
    }
    const principalDefault = {
        fullName: '',
        position: '',
        mobile: '',
        email: ''
    }
    const placementDefault = {
        fullName: '',
        position: '',
        mobile: '',
        email: ''
    }
    const courseDefault = {
        name: '',
        duration: '',
        specialization: ''
    }

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

    const [disabled, setDisabled] = useState(disabledDefault);

    const [institution, setInstitution] = useState(institutionDefault);
    const [principal, setPrincipal] = useState(principalDefault);
    const [placement, setPlacement] = useState(placementDefault);
    const [courses, setCourses] = useState([]);
    const [profile, setProfile] = useState('');
    const [username, setUsername] = useState('');
    const [prevPassword, setPrevPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newCourse, setNewCourse] = useState(courseDefault);

    const fetchCollege = async () => {
        try {
            const response = await axios.get('/college/details')

            const college = response?.data
            setInstitution(college?.institution);
            setPrincipal(college?.principal);
            setPlacement(college?.placement);
            setCourses(college?.programs);
            setUsername(college?.username);
            setProfile(`data:image/jpeg;base64,${bufferToBase64(college?.logo?.data)}`);

        } catch (err) {
            notify('failed', err?.response?.data?.message);
        }
    }

    useEffect(() => {
        const fetchCollege = async () => {
            try {
                const response = await axios.get('/college/details')

                const college = response?.data
                if (!college?.institution || !college?.principal || !college?.placement)
                    return navigate('/collegeRegister');
                setInstitution(college?.institution);
                setPrincipal(college?.principal);
                setPlacement(college?.placement);
                setCourses(college?.programs);
                setUsername(college?.username);
                setProfile(`data:image/jpeg;base64,${bufferToBase64(college?.logo?.data)}`);
            } catch (err) {
                notify('failed', err?.response?.data?.message);
            }
        }
        fetchCollege();
    }, [axios, navigate]);

    const handleInstitution = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.put('/college/institution', {
                ...institution,
                mobile: parseInt(institution.mobile) || institution.mobile,
                institutionId: institution._id
            });
            const success = response?.data?.success;
            if (success)
                notify('success', success);

        } catch (err) {
            notify('failed', err?.response?.data?.message);
        }
    }

    const handlePrincipal = async (e) => {
        console.log('first')
        e.preventDefault();
        try {
            const response = await axios.put('/college/principal', {
                ...principal,
                mobile: parseInt(principal.mobile) || principal.mobile,
                principalId: principal._id
            });
            const success = response?.data?.success;
            if (success)
                notify('success', success);

        } catch (err) {
            notify('failed', err?.response?.data?.message);
        }
    }

    const handlePlacement = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.put('/college/placement', {
                ...placement,
                mobile: parseInt(placement.mobile) || placement.mobile,
                placementId: placement._id
            });
            const success = response?.data?.success;
            if (success)
                notify('success', success);

        } catch (err) {
            notify('failed', err?.response?.data?.message);
        }
    }

    const handleCourse = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.put('/college/course', {
                ...courses[parseInt(e.target.id)],
                courseId: courses[parseInt(e.target.id)]._id
            });
            const success = response?.data?.success;
            if (success)
                notify('success', success);

        } catch (err) {
            notify('failed', err?.response?.data?.message);
        }
    }

    const deleteCourse = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.delete(`/college/course/${courses[parseInt(e.target.id)]._id}`);
            const success = response?.data?.success;
            if (success)
                notify('success', success);

            fetchCollege();
        } catch (err) {
            notify('failed', err?.response?.data?.message);
        }
    }

    const handleNewCourse = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/college/course', { ...newCourse });
            const success = response?.data?.success;
            if (success)
                notify('success', success);

            setNewCourse(courseDefault);
            setDisabled(prev => ({ ...prev, course: true }));
            fetchCollege();
        } catch (err) {
            notify('failed', err?.response?.data?.message);
        }
    }

    const handleLogo = async (e) => {
        e.preventDefault();
        try {
            const profile = document.getElementById("profile");
            const fd = new FormData();
            fd.append('profile', profile.files[0]);
            if (!fd) return

            const response = await axios.post('/college/profile', fd,
                {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });

            const success = response?.data?.success;
            if (success)
                notify('success', success);

            fetchCollege();
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

    const [activeTab, setActiveTab] = useState('institution');

    return (
        <div className="container-fluid py-4 bg-light min-vh-100">
            <div className="row justify-content-center">
                <div className="col-12 px-md-4">
                    <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
                        <div className="bg-primary p-4 text-white d-flex align-items-center">
                            <div className="me-4">
                                {profile ? (
                                    <img src={profile} className="rounded-circle border border-3 border-white-50" 
                                         height="80" width="80" style={{ objectFit: 'cover' }} alt="Logo" />
                                ) : (
                                    <div className="bg-white-50 rounded-circle d-flex align-items-center justify-content-center" 
                                         style={{ width: '80px', height: '80px' }}>
                                        <i className="bi bi-building fs-1"></i>
                                    </div>
                                )}
                            </div>
                            <div>
                                <h3 className="fw-bold mb-1">{institution.name || 'College Profile'}</h3>
                                <p className="mb-0 opacity-75">{username}</p>
                            </div>
                        </div>

                        <div className="card-header bg-white border-bottom-0 p-0">
                            <ul className="nav nav-tabs nav-fill border-0">
                                {[
                                    { id: 'institution', label: 'Institution', icon: 'bi-building' },
                                    { id: 'contacts', label: 'Contacts', icon: 'bi-people' },
                                    { id: 'courses', label: 'Courses', icon: 'bi-mortarboard' },
                                    { id: 'account', label: 'Account', icon: 'bi-shield-lock' }
                                ].map(tab => (
                                    <li key={tab.id} className="nav-item">
                                        <button 
                                            className={`nav-link py-3 border-0 rounded-0 d-flex align-items-center justify-content-center gap-2 ${activeTab === tab.id ? 'active border-bottom border-primary border-3 text-primary fw-bold' : 'text-muted'}`}
                                            onClick={() => setActiveTab(tab.id)}
                                        >
                                            <i className={`bi ${tab.icon}`}></i>
                                            {tab.label}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="card-body p-4 p-md-5 bg-white">
                            {activeTab === 'institution' && (
                                <form className="animate__animated animate__fadeIn">
                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <h5 className="fw-bold mb-0">Institution Details</h5>
                                        <button type="button" className="btn btn-sm btn-outline-danger rounded-pill px-3" onClick={() => setDisabled({...disabled, institution: !disabled.institution})}>
                                            {disabled.institution ? 'Edit Details' : 'Cancel Edit'}
                                        </button>
                                    </div>
                                    <fieldset disabled={disabled.institution}>
                                        <div className="row g-3">
                                            <div className="col-md-6 form-floating">
                                                <input type="text" className="form-control" placeholder="Name" value={institution.name} onChange={(e) => setInstitution({...institution, name: e.target.value})} />
                                                <label className="ms-2">Name</label>
                                            </div>
                                            <div className="col-md-6 form-floating">
                                                <input type="text" className="form-control" placeholder="Website" value={institution.website} onChange={(e) => setInstitution({...institution, website: e.target.value})} />
                                                <label className="ms-2">Website</label>
                                            </div>
                                            <div className="col-12 form-floating">
                                                <textarea className="form-control" placeholder="Address" style={{ height: '100px' }} value={institution.address} onChange={(e) => setInstitution({...institution, address: e.target.value})} />
                                                <label className="ms-2">Address</label>
                                            </div>
                                            <div className="col-md-6 form-floating">
                                                <input type="text" className="form-control" placeholder="Mobile" value={institution.mobile} onChange={(e) => setInstitution({...institution, mobile: e.target.value})} />
                                                <label className="ms-2">Mobile</label>
                                            </div>
                                        </div>
                                        {!disabled.institution && (
                                            <button className="btn btn-primary mt-4 px-4 py-2 rounded-3 shadow-sm" onClick={handleInstitution}>Save Changes</button>
                                        )}
                                    </fieldset>

                                    <hr className="my-5" />

                                    <h5 className="fw-bold mb-4">Institution Logo</h5>
                                    <div className="d-flex align-items-center gap-4 p-3 bg-light rounded-4">
                                        <div className="bg-white p-1 rounded-circle shadow-sm">
                                            {profile ? <img src={profile} className="rounded-circle" height="80" width="80" style={{ objectFit: 'cover' }} alt="Logo" /> : <div style={{width:80, height:80}}></div>}
                                        </div>
                                        <div className="flex-grow-1">
                                            <input className="form-control form-control-sm mb-2" type="file" id="profile" />
                                            <button className="btn btn-dark btn-sm rounded-pill px-4" onClick={handleLogo}>Upload New Logo</button>
                                        </div>
                                    </div>
                                </form>
                            )}

                            {activeTab === 'contacts' && (
                                <div className="animate__animated animate__fadeIn">
                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <h5 className="fw-bold mb-0">Principal Details</h5>
                                        <button type="button" className="btn btn-sm btn-outline-danger rounded-pill px-3" onClick={() => setDisabled({...disabled, principal: !disabled.principal})}>
                                            {disabled.principal ? 'Edit' : 'Cancel'}
                                        </button>
                                    </div>
                                    <fieldset disabled={disabled.principal} className="mb-5">
                                        <div className="row g-3">
                                            <div className="col-md-6 form-floating"><input type="text" className="form-control" value={principal.fullName} onChange={(e) => setPrincipal({...principal, fullName: e.target.value})} /><label className="ms-2">Full Name</label></div>
                                            <div className="col-md-6 form-floating"><input type="text" className="form-control" value={principal.position} onChange={(e) => setPrincipal({...principal, position: e.target.value})} /><label className="ms-2">Position</label></div>
                                            <div className="col-md-6 form-floating"><input type="email" className="form-control" value={principal.email} onChange={(e) => setPrincipal({...principal, email: e.target.value})} /><label className="ms-2">Email</label></div>
                                            <div className="col-md-6 form-floating"><input type="text" className="form-control" value={principal.mobile} onChange={(e) => setPrincipal({...principal, mobile: e.target.value})} /><label className="ms-2">Mobile</label></div>
                                        </div>
                                        {!disabled.principal && <button className="btn btn-primary mt-3" onClick={handlePrincipal}>Save Principal</button>}
                                    </fieldset>

                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <h5 className="fw-bold mb-0">Placement Officer</h5>
                                        <button type="button" className="btn btn-sm btn-outline-danger rounded-pill px-3" onClick={() => setDisabled({...disabled, placement: !disabled.placement})}>
                                            {disabled.placement ? 'Edit' : 'Cancel'}
                                        </button>
                                    </div>
                                    <fieldset disabled={disabled.placement}>
                                        <div className="row g-3">
                                            <div className="col-md-6 form-floating"><input type="text" className="form-control" value={placement.fullName} onChange={(e) => setPlacement({...placement, fullName: e.target.value})} /><label className="ms-2">Full Name</label></div>
                                            <div className="col-md-6 form-floating"><input type="text" className="form-control" value={placement.position} onChange={(e) => setPlacement({...placement, position: e.target.value})} /><label className="ms-2">Position</label></div>
                                            <div className="col-md-6 form-floating"><input type="email" className="form-control" value={placement.email} onChange={(e) => setPlacement({...placement, email: e.target.value})} /><label className="ms-2">Email</label></div>
                                            <div className="col-md-6 form-floating"><input type="text" className="form-control" value={placement.mobile} onChange={(e) => setPlacement({...placement, mobile: e.target.value})} /><label className="ms-2">Mobile</label></div>
                                        </div>
                                        {!disabled.placement && <button className="btn btn-primary mt-3" onClick={handlePlacement}>Save Placement Officer</button>}
                                    </fieldset>
                                </div>
                            )}

                            {activeTab === 'courses' && (
                                <div className="animate__animated animate__fadeIn">
                                    <h5 className="fw-bold mb-4">Active Courses</h5>
                                    <div className="list-group list-group-flush border rounded-4 overflow-hidden shadow-sm mb-5">
                                        {courses.map((course, index) => (
                                            <div key={index} className="list-group-item p-4 bg-white">
                                                <div className="row g-3">
                                                    <div className="col-md-4">
                                                        <label className="small text-muted mb-1">Name</label>
                                                        <input type="text" className="form-control border-0 bg-light rounded-3" value={course.name} onChange={(e) => {
                                                            const newCourses = [...courses];
                                                            newCourses[index].name = e.target.value;
                                                            setCourses(newCourses);
                                                        }} />
                                                    </div>
                                                    <div className="col-md-4">
                                                        <label className="small text-muted mb-1">Duration</label>
                                                        <input type="text" className="form-control border-0 bg-light rounded-3" value={course.duration} onChange={(e) => {
                                                            const newCourses = [...courses];
                                                            newCourses[index].duration = e.target.value;
                                                            setCourses(newCourses);
                                                        }} />
                                                    </div>
                                                    <div className="col-md-4">
                                                        <label className="small text-muted mb-1">Specialization</label>
                                                        <input type="text" className="form-control border-0 bg-light rounded-3" value={course.specialization} onChange={(e) => {
                                                            const newCourses = [...courses];
                                                            newCourses[index].specialization = e.target.value;
                                                            setCourses(newCourses);
                                                        }} />
                                                    </div>
                                                    <div className="col-12 d-flex justify-content-end gap-2 mt-3">
                                                        <button id={index} className="btn btn-sm btn-outline-primary rounded-pill px-4" onClick={handleCourse}>Update</button>
                                                        <button id={index} className="btn btn-sm btn-outline-danger rounded-pill px-4" onClick={deleteCourse}>Delete</button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <h5 className="fw-bold mb-4">Add New Course</h5>
                                    <div className="bg-light p-4 rounded-4 border">
                                        <div className="row g-3">
                                            <div className="col-md-4 form-floating"><input type="text" className="form-control border-0 shadow-sm" value={newCourse.name} onChange={(e) => setNewCourse({...newCourse, name: e.target.value})} /><label className="ms-2">Course Name</label></div>
                                            <div className="col-md-4 form-floating"><input type="text" className="form-control border-0 shadow-sm" value={newCourse.duration} onChange={(e) => setNewCourse({...newCourse, duration: e.target.value})} /><label className="ms-2">Duration</label></div>
                                            <div className="col-md-4 form-floating"><input type="text" className="form-control border-0 shadow-sm" value={newCourse.specialization} onChange={(e) => setNewCourse({...newCourse, specialization: e.target.value})} /><label className="ms-2">Specialization</label></div>
                                            <div className="col-12 d-flex justify-content-end mt-3">
                                                <button className="btn btn-dark px-4 py-2 rounded-3 shadow-sm" onClick={handleNewCourse}>+ Add to Program</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'account' && (
                                <div className="animate__animated animate__fadeIn">
                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <h5 className="fw-bold mb-0">Account Security</h5>
                                        <button type="button" className="btn btn-sm btn-outline-danger rounded-pill px-3" onClick={() => setDisabled({...disabled, account: !disabled.account})}>
                                            {disabled.account ? 'Manage Account' : 'Cancel'}
                                        </button>
                                    </div>
                                    <fieldset disabled={disabled.account}>
                                        <div className="mb-5">
                                            <h6 className="text-muted small mb-3">Update Username</h6>
                                            <div className="row g-3 align-items-center">
                                                <div className="col-md-8 form-floating">
                                                    <input type="text" className="form-control" value={username} onChange={(e) => setUsername(e.target.value)} />
                                                    <label className="ms-2">Current Username</label>
                                                </div>
                                                <div className="col-md-4">
                                                    <button className="btn btn-outline-primary w-100 py-3 rounded-3" onClick={handleUsername}>Update Username</button>
                                                </div>
                                            </div>
                                        </div>

                                        <hr className="my-5" />

                                        <div>
                                            <h6 className="text-muted small mb-3">Change Password</h6>
                                            <div className="row g-3">
                                                <div className="col-12 form-floating mb-2">
                                                    <input type="password" className="form-control" value={prevPassword} onChange={(e) => setPrevPassword(e.target.value)} placeholder="Old Password" />
                                                    <label className="ms-2">Current Password</label>
                                                </div>
                                                <div className="col-md-12 form-floating mb-3">
                                                    <input type="password" className="form-control" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New Password" />
                                                    <label className="ms-2">New Password</label>
                                                </div>
                                                <div className="col-12">
                                                    <button className="btn btn-success px-5 py-2 rounded-3 fw-bold" onClick={handlePassword}>Reset Password</button>
                                                </div>
                                            </div>
                                        </div>
                                    </fieldset>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CollegeProfile;
