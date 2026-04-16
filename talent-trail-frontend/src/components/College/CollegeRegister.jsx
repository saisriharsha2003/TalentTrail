import React, { useState } from 'react';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { notify } from '../Toast';
import { useNavigate } from 'react-router-dom';

const CollegeRegister = () => {
    const [step, setStep] = useState(1);
    const navigate = useNavigate();
    const axios = useAxiosPrivate();

    const institutionDefault = { name: '', website: '', address: '', mobile: '' }
    const principalDefault = { fullName: '', position: '', mobile: '', email: '' }
    const placementDefault = { fullName: '', position: '', mobile: '', email: '' }
    const courseDefault = { name: '', duration: '', specialization: '' }

    const [institution, setInstitution] = useState(institutionDefault);
    const [principal, setPrincipal] = useState(principalDefault);
    const [placement, setPlacement] = useState(placementDefault);
    const [course, setCourse] = useState(courseDefault);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);

    const nextStep = () => setStep(prev => prev + 1);
    const prevStep = () => setStep(prev => prev - 1);

    const handleInstitution = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post('/college/institution', {
                ...institution,
                mobile: parseInt(institution.mobile) || institution.mobile
            });
            notify('success', 'Institution details saved');
            nextStep();
        } catch (err) {
            notify('failed', err?.response?.data?.message || 'Failed to save institution details');
        } finally {
            setLoading(false);
        }
    }

    const handleContacts = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post('/college/principal', {
                ...principal,
                mobile: parseInt(principal.mobile) || principal.mobile
            });
            await axios.post('/college/placement', {
                ...placement,
                mobile: parseInt(placement.mobile) || placement.mobile
            });
            notify('success', 'Contact details saved');
            nextStep();
        } catch (err) {
            notify('failed', err?.response?.data?.message || 'Failed to save contact details');
        } finally {
            setLoading(false);
        }
    }

    const handleAddCourse = async (e) => {
        e.preventDefault();
        if (!course.name || !course.duration) {
            notify('failed', 'Course name and duration are required');
            return;
        }
        setLoading(true);
        try {
            await axios.post('/college/course', { ...course });
            setCourses([...courses, course]);
            setCourse(courseDefault);
            notify('success', 'Course added successfully');
        } catch (err) {
            notify('failed', err?.response?.data?.message || 'Failed to add course');
        } finally {
            setLoading(false);
        }
    }

    const handleLogo = async (e) => {
        e.preventDefault();
        const profile = document.getElementById("profile");
        if (!profile.files[0]) {
            notify('failed', 'Please select a profile picture');
            return;
        }
        setLoading(true);
        try {
            const fd = new FormData();
            fd.append('profile', profile.files[0]);
            await axios.post('/college/profile', fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            notify('success', 'Profile picture uploaded');
            navigate('/user/college');
        } catch (err) {
            notify('failed', err?.response?.data?.message || 'Failed to upload profile picture');
        } finally {
            setLoading(false);
        }
    }

    const renderStepIndicator = () => (
        <div className="d-flex justify-content-between mb-5 position-relative">
            <div className="position-absolute top-50 start-0 end-0 border-top translate-middle-y" style={{ zIndex: 0 }}></div>
            {[1, 2, 3, 4].map((num) => (
                <div key={num} 
                    className={`rounded-circle d-flex align-items-center justify-content-center border shadow-sm ${step >= num ? 'bg-primary text-white border-primary' : 'bg-white text-muted border-secondary'}`}
                    style={{ width: '40px', height: '40px', zIndex: 1, transition: '0.3s' }}
                >
                    {num}
                </div>
            ))}
        </div>
    );

    return (
        <div className="container-fluid py-4 bg-light min-vh-100">
            <div className="card shadow-sm border-0 rounded-4 overflow-hidden mx-auto" style={{ width: '95%' }}>
                <div className="bg-primary p-4 text-white text-center">
                    <h2 className="fw-bold mb-0">College Registration</h2>
                    <p className="mb-0 opacity-75">Complete your institutional profile</p>
                </div>

                <div className="card-body p-4 p-md-5">
                    {renderStepIndicator()}

                    {step === 1 && (
                        <form onSubmit={handleInstitution} className="animate__animated animate__fadeIn">
                            <h4 className="mb-4 fw-semibold text-primary">Institution Details</h4>
                            <div className="row g-3">
                                <div className="col-md-12 form-floating mb-3">
                                    <input type="text" className="form-control rounded-3" id="in" placeholder="Name" value={institution.name} onChange={(e) => setInstitution({...institution, name: e.target.value})} required />
                                    <label className="ms-2" htmlFor="in">Institution Name</label>
                                </div>
                                <div className="col-md-12 form-floating mb-3">
                                    <input type="text" className="form-control rounded-3" id="iw" placeholder="Website" value={institution.website} onChange={(e) => setInstitution({...institution, website: e.target.value})} required />
                                    <label className="ms-2" htmlFor="iw">Website URL</label>
                                </div>
                                <div className="col-md-12 form-floating mb-3">
                                    <textarea className="form-control rounded-3" id="ia" placeholder="Address" style={{ height: '100px' }} value={institution.address} onChange={(e) => setInstitution({...institution, address: e.target.value})} required />
                                    <label className="ms-2" htmlFor="ia">Full Address</label>
                                </div>
                                <div className="col-md-12 form-floating mb-3">
                                    <input type="text" className="form-control rounded-3" id="im" placeholder="Mobile" value={institution.mobile} onChange={(e) => setInstitution({...institution, mobile: e.target.value})} required />
                                    <label className="ms-2" htmlFor="im">Contact Number</label>
                                </div>
                            </div>
                            <div className="d-flex justify-content-end mt-4">
                                <button type="submit" className="btn btn-primary px-5 py-2 rounded-3 fw-semibold" disabled={loading}>
                                    {loading ? 'Saving...' : 'Next Step'}
                                </button>
                            </div>
                        </form>
                    )}

                    {step === 2 && (
                        <form onSubmit={handleContacts} className="animate__animated animate__fadeIn">
                            <h4 className="mb-4 fw-semibold text-primary">Key Contacts</h4>
                            
                            <div className="mb-4">
                                <h5 className="text-muted mb-3 border-bottom pb-2">Principal Details</h5>
                                <div className="row g-3">
                                    <div className="col-md-6 form-floating mb-2">
                                        <input type="text" className="form-control rounded-3" placeholder="Full Name" value={principal.fullName} onChange={(e) => setPrincipal({...principal, fullName: e.target.value})} required />
                                        <label className="ms-2">Full Name</label>
                                    </div>
                                    <div className="col-md-6 form-floating mb-2">
                                        <input type="text" className="form-control rounded-3" placeholder="Position" value={principal.position} onChange={(e) => setPrincipal({...principal, position: e.target.value})} required />
                                        <label className="ms-2">Position</label>
                                    </div>
                                    <div className="col-md-6 form-floating mb-2">
                                        <input type="email" className="form-control rounded-3" placeholder="Email" value={principal.email} onChange={(e) => setPrincipal({...principal, email: e.target.value})} required />
                                        <label className="ms-2">Email</label>
                                    </div>
                                    <div className="col-md-6 form-floating mb-2">
                                        <input type="text" className="form-control rounded-3" placeholder="Mobile" value={principal.mobile} onChange={(e) => setPrincipal({...principal, mobile: e.target.value})} required />
                                        <label className="ms-2">Mobile</label>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-4">
                                <h5 className="text-muted mb-3 border-bottom pb-2">Placement Officer Details</h5>
                                <div className="row g-3">
                                    <div className="col-md-6 form-floating mb-2">
                                        <input type="text" className="form-control rounded-3" placeholder="Full Name" value={placement.fullName} onChange={(e) => setPlacement({...placement, fullName: e.target.value})} required />
                                        <label className="ms-2">Full Name</label>
                                    </div>
                                    <div className="col-md-6 form-floating mb-2">
                                        <input type="text" className="form-control rounded-3" placeholder="Position" value={placement.position} onChange={(e) => setPlacement({...placement, position: e.target.value})} required />
                                        <label className="ms-2">Position</label>
                                    </div>
                                    <div className="col-md-6 form-floating mb-2">
                                        <input type="email" className="form-control rounded-3" placeholder="Email" value={placement.email} onChange={(e) => setPlacement({...placement, email: e.target.value})} required />
                                        <label className="ms-2">Email</label>
                                    </div>
                                    <div className="col-md-6 form-floating mb-2">
                                        <input type="text" className="form-control rounded-3" placeholder="Mobile" value={placement.mobile} onChange={(e) => setPlacement({...placement, mobile: e.target.value})} required />
                                        <label className="ms-2">Mobile</label>
                                    </div>
                                </div>
                            </div>

                            <div className="d-flex justify-content-between mt-4">
                                <button type="button" className="btn btn-outline-secondary px-4 py-2 rounded-3" onClick={prevStep}>Back</button>
                                <button type="submit" className="btn btn-primary px-5 py-2 rounded-3 fw-semibold" disabled={loading}>
                                    {loading ? 'Saving...' : 'Next Step'}
                                </button>
                            </div>
                        </form>
                    )}

                    {step === 3 && (
                        <div className="animate__animated animate__fadeIn">
                            <h4 className="mb-4 fw-semibold text-primary">Academic Programs</h4>
                            
                            <form onSubmit={handleAddCourse} className="bg-light p-4 rounded-4 mb-4 border">
                                <div className="row g-3">
                                    <div className="col-md-6 form-floating mb-2">
                                        <input type="text" className="form-control rounded-3 border-0 shadow-sm" placeholder="Course Name" value={course.name} onChange={(e) => setCourse({...course, name: e.target.value})} />
                                        <label className="ms-2">Course Name (e.g. B.Tech)</label>
                                    </div>
                                    <div className="col-md-6 form-floating mb-2">
                                        <input type="text" className="form-control rounded-3 border-0 shadow-sm" placeholder="Duration" value={course.duration} onChange={(e) => setCourse({...course, duration: e.target.value})} />
                                        <label className="ms-2">Duration (e.g. 4 Years)</label>
                                    </div>
                                    <div className="col-md-12 form-floating mb-2">
                                        <input type="text" className="form-control rounded-3 border-0 shadow-sm" placeholder="Specialization" value={course.specialization} onChange={(e) => setCourse({...course, specialization: e.target.value})} />
                                        <label className="ms-2">Specialization (e.g. Computer Science)</label>
                                    </div>
                                    <div className="col-12 d-flex justify-content-end">
                                        <button type="submit" className="btn btn-dark px-4 py-2 rounded-3 fw-semibold shadow-sm" disabled={loading}>
                                            + Add Course
                                        </button>
                                    </div>
                                </div>
                            </form>

                            {courses.length > 0 && (
                                <div className="mb-4">
                                    <h6 className="text-muted mb-3">Added Courses:</h6>
                                    <div className="list-group list-group-flush border rounded-4 overflow-hidden shadow-sm">
                                        {courses.map((c, i) => (
                                            <div key={i} className="list-group-item d-flex justify-content-between align-items-center bg-white p-3">
                                                <div>
                                                    <span className="fw-bold text-primary">{c.name}</span>
                                                    <span className="text-muted mx-2">•</span>
                                                    <span>{c.specialization}</span>
                                                </div>
                                                <span className="badge bg-light text-dark border px-3 py-2 rounded-pill">{c.duration}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="d-flex justify-content-between mt-5">
                                <button type="button" className="btn btn-outline-secondary px-4 py-2 rounded-3" onClick={prevStep}>Back</button>
                                <button type="button" className="btn btn-primary px-5 py-2 rounded-3 fw-semibold" onClick={nextStep} disabled={courses.length === 0}>
                                    Next Step
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <form onSubmit={handleLogo} className="animate__animated animate__fadeIn text-center">
                            <h4 className="mb-4 fw-semibold text-primary">Final Step: Profile Setup</h4>
                            
                            <div className="mb-5">
                                <div className="upload-container mx-auto mb-4 border-2 border-dashed rounded-4 p-5 bg-light position-relative overflow-hidden shadow-sm" 
                                     style={{ maxWidth: '400px', cursor: 'pointer' }}
                                     onClick={() => document.getElementById('profile').click()}
                                >
                                    <input type="file" id="profile" className="d-none" accept="image/*" />
                                    <div className="text-muted">
                                        <i className="bi bi-cloud-arrow-up fs-1 text-primary mb-3 d-block"></i>
                                        <p className="mb-0 fw-medium">Click to upload institution logo</p>
                                        <small className="opacity-75">JPEG, JPG or PNG (Max 2MB)</small>
                                    </div>
                                </div>
                            </div>

                            <div className="d-flex justify-content-between mt-4">
                                <button type="button" className="btn btn-outline-secondary px-4 py-2 rounded-3" onClick={prevStep}>Back</button>
                                <button type="submit" className="btn btn-success px-5 py-2 rounded-3 fw-bold shadow" disabled={loading}>
                                    {loading ? 'Processing...' : 'Complete Registration 🚀'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CollegeRegister;
