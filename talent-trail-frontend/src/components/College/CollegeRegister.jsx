import React, { useState } from 'react';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { notify } from '../Toast';
import { Link } from 'react-router-dom';

const CollegeRegister = () => {
    const disabledDefault = {
        institution: false,
        principal: false,
        placement: false,
        course: false
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

    const [disabled, setDisabled] = useState(disabledDefault);

    const axios = useAxiosPrivate();
    const [institution, setInstitution] = useState(institutionDefault);
    const [principal, setPrincipal] = useState(principalDefault);
    const [placement, setPlacement] = useState(placementDefault);
    const [course, setCourse] = useState(courseDefault);

    const handleInstitution = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/college/institution', {
                ...institution,
                mobile: parseInt(institution.mobile) || institution.mobile
            });
            const success = response?.data?.success;
            if (success)
                notify('success', success);

            setInstitution(institutionDefault);
            setDisabled(prev => ({ ...prev, institution: true }));
        } catch (err) {
            notify('failed', err?.response?.data?.message);
        }
    }

    const handlePrincipal = async (e) => {
        console.log('first')
        e.preventDefault();
        try {
            const response = await axios.post('/college/principal', {
                ...principal,
                mobile: parseInt(principal.mobile) || principal.mobile
            });
            const success = response?.data?.success;
            if (success)
                notify('success', success);

            setPrincipal(principalDefault);
            setDisabled(prev => ({ ...prev, principal: true }));
        } catch (err) {
            notify('failed', err?.response?.data?.message);
        }
    }

    const handlePlacement = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/college/placement', {
                ...placement,
                mobile: parseInt(placement.mobile) || placement.mobile
            });
            const success = response?.data?.success;
            if (success)
                notify('success', success);

            setPlacement(placementDefault);
            setDisabled(prev => ({ ...prev, placement: true }));
        } catch (err) {
            notify('failed', err?.response?.data?.message);
        }
    }

    const handleCourse = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/college/course', { ...course });
            const success = response?.data?.success;
            if (success)
                notify('success', success);

            setCourse(courseDefault);
            setDisabled(prev => ({ ...prev, course: true }));
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

        } catch (err) {
            notify('failed', err?.response?.data?.message);
        }
    }

    const addCourse = (e) => {
        e.preventDefault();
        setDisabled(prev => ({ ...prev, course: false }));
    }

    return (
        <>

            <div className='d-flex justify-content-center mt-3'>
                <h3>Provide all details</h3>
            </div>

            {/* Institution */}
            <div className='d-flex justify-content-center m-3'>
                {/* <div className='d-inline-flex p-2'> */}
                    <div className="card card container h-100 shadow-2-strong mt-5 p-4 shadow-sm" style={{ backgroundColor: '#f8f8f8' }}>
                        <form className="card-body">

                            <fieldset disabled={disabled.institution}>

                                <h2>Institution</h2>

                                <div className='row form-row'>

                                    <div className='col-md-6'>
                                        <div className="card-body">
                                            <div className="flex-nowrap form-floating">
                                                <input
                                                    id='in'
                                                    className="form-control"
                                                    type="text"
                                                    placeholder='Name'
                                                    autoComplete='off'
                                                    value={institution.name}
                                                    onChange={(e) => setInstitution(prev => ({ ...prev, name: e.target.value }))}
                                                    required
                                                />
                                                <label htmlFor='in'>Name</label>
                                            </div>
                                        </div>

                                        <div className="card-body">
                                            <div className="flex-nowrap form-floating">
                                                <input
                                                    id='iw'
                                                    className="form-control"
                                                    type="text"
                                                    placeholder='Website'
                                                    autoComplete='off'
                                                    value={institution.website}
                                                    onChange={(e) => setInstitution(prev => ({ ...prev, website: e.target.value }))}
                                                    required
                                                />
                                                <label htmlFor='iw'>Website</label>
                                            </div>
                                        </div>
                                    </div>

                                    <div className='col-md-6'>
                                        <div className="card-body">
                                            <div className="flex-nowrap form-floating">
                                                <input
                                                    id='ia'
                                                    className="form-control"
                                                    type="text"
                                                    placeholder='Address'
                                                    autoComplete='off'
                                                    value={institution.address}
                                                    onChange={(e) => setInstitution(prev => ({ ...prev, address: e.target.value }))}
                                                    required
                                                />
                                                <label htmlFor='ia'>Address</label>
                                            </div>
                                        </div>

                                        <div className="card-body">
                                            <div className="flex-nowrap form-floating">
                                                <input
                                                    id='im'
                                                    className="form-control"
                                                    type="text"
                                                    placeholder='Mobile'
                                                    autoComplete='off'
                                                    value={institution.mobile}
                                                    onChange={(e) => setInstitution(prev => ({ ...prev, mobile: e.target.value }))}
                                                    required
                                                />
                                                <label htmlFor='im'>Mobile</label>
                                            </div>
                                        </div>
                                    </div>

                                </div>

                                <div className="card-body">
                                    <button className="btn btn-success" onClick={handleInstitution}>submit</button>
                                </div>

                            </fieldset>

                        </form>
                    </div>
                {/* </div> */}
            </div>

            {/* Principal */}
            <div className='d-flex justify-content-center m-3'>
                {/* <div className='d-inline-flex p-2'> */}
                    <div className="card container h-100 shadow-2-strong mt-5 p-4 shadow-sm" style={{ backgroundColor: '#f8f8f8' }}>
                        <form className="card-body">

                            <fieldset disabled={disabled.principal}>

                                <h2>Principal</h2>

                                <div className='row form-row'>

                                    <div className='col-md-6'>
                                        <div className="card-body">
                                            <div className="flex-nowrap form-floating">
                                                <input
                                                    id='pf'
                                                    className="form-control"
                                                    type="text"
                                                    placeholder='Full name'
                                                    autoComplete='off'
                                                    value={principal.fullName}
                                                    onChange={(e) => setPrincipal(prev => ({ ...prev, fullName: e.target.value }))}
                                                    required
                                                />
                                                <label htmlFor='pf'>Full name</label>
                                            </div>
                                        </div>

                                        <div className="card-body">
                                            <div className="flex-nowrap form-floating">
                                                <input
                                                    id='prp'
                                                    className="form-control"
                                                    type="text"
                                                    placeholder='Position'
                                                    autoComplete='off'
                                                    value={principal.position}
                                                    onChange={(e) => setPrincipal(prev => ({ ...prev, position: e.target.value }))}
                                                    required
                                                />
                                                <label htmlFor='prp'>Position</label>
                                            </div>
                                        </div>
                                    </div>

                                    <div className='col-md-6'>
                                        <div className="card-body">
                                            <div className="flex-nowrap form-floating">
                                                <input
                                                    id='pe'
                                                    className="form-control"
                                                    type="text"
                                                    placeholder='Email'
                                                    autoComplete='off'
                                                    value={principal.email}
                                                    onChange={(e) => setPrincipal(prev => ({ ...prev, email: e.target.value }))}
                                                    required
                                                />
                                                <label htmlFor='pe'>Email</label>
                                            </div>
                                        </div>

                                        <div className="card-body">
                                            <div className="flex-nowrap form-floating">
                                                <input
                                                    id='pm'
                                                    className="form-control"
                                                    type="text"
                                                    placeholder='Mobile'
                                                    autoComplete='off'
                                                    value={principal.mobile}
                                                    onChange={(e) => setPrincipal(prev => ({ ...prev, mobile: e.target.value }))}
                                                    required
                                                />
                                                <label htmlFor='pm'>Mobile</label>
                                            </div>
                                        </div>
                                    </div>

                                </div>

                                <div className="card-body">
                                    <button className="btn btn-success" onClick={handlePrincipal}>submit</button>
                                </div>

                            </fieldset>

                        </form>
                    </div>
                {/* </div> */}
            </div>

            {/* Placement */}
            <div className='d-flex justify-content-center m-3'>
                {/* <div className='d-inline-flex p-2'> */}
                    <div className="card container h-100 shadow-2-strong mt-5 p-4 shadow-smard" style={{ backgroundColor: '#f8f8f8' }}>
                        <form className="card-body">

                            <fieldset disabled={disabled.placement}>

                                <h2>Placement</h2>

                                <div className='row form-row'>

                                    <div className='col-md-6'>
                                        <div className="card-body">
                                            <div className="flex-nowrap form-floating">
                                                <input
                                                    id='plf'
                                                    className="form-control"
                                                    type="text"
                                                    placeholder='Full name'
                                                    autoComplete='off'
                                                    value={placement.fullName}
                                                    onChange={(e) => setPlacement(prev => ({ ...prev, fullName: e.target.value }))}
                                                    required
                                                />
                                                <label htmlFor='plf'>Full name</label>
                                            </div>
                                        </div>

                                        <div className="card-body">
                                            <div className="flex-nowrap form-floating">
                                                <input
                                                    id='plp'
                                                    className="form-control"
                                                    type="text"
                                                    placeholder='Position'
                                                    autoComplete='off'
                                                    value={placement.position}
                                                    onChange={(e) => setPlacement(prev => ({ ...prev, position: e.target.value }))}
                                                    required
                                                />
                                                <label htmlFor='plp'>Position</label>
                                            </div>
                                        </div>
                                    </div>

                                    <div className='col-md-6'>
                                        <div className="card-body">
                                            <div className="flex-nowrap form-floating">
                                                <input
                                                    id='ple'
                                                    className="form-control"
                                                    type="text"
                                                    placeholder='Email'
                                                    autoComplete='off'
                                                    value={placement.email}
                                                    onChange={(e) => setPlacement(prev => ({ ...prev, email: e.target.value }))}
                                                    required
                                                />
                                                <label htmlFor='ple'>Email</label>
                                            </div>
                                        </div>

                                        <div className="card-body">
                                            <div className="flex-nowrap form-floating">
                                                <input
                                                    id='plm'
                                                    className="form-control"
                                                    type="text"
                                                    placeholder='Mobile'
                                                    autoComplete='off'
                                                    value={placement.mobile}
                                                    onChange={(e) => setPlacement(prev => ({ ...prev, mobile: e.target.value }))}
                                                    required
                                                />
                                                <label htmlFor='plm'>Mobile</label>
                                            </div>
                                        </div>
                                    </div>

                                </div>

                                <div className="card-body">
                                    <button className="btn btn-success" onClick={handlePlacement}>submit</button>
                                </div>

                            </fieldset>

                        </form>
                    </div>
                {/* </div> */}
            </div>

            {/* Course */}
            <div className='d-flex justify-content-center m-3'>
                {/* <div className='d-inline-flex p-2'> */}
                    <div className="card" style={{ backgroundColor: '#f8f8f8' }}>
                        <form className="card-body">

                            <fieldset disabled={disabled.course}>

                                <h2>Course</h2>

                                <div className='row form-row'>

                                    <div className='col-md-6'>
                                        <div className="card-body">
                                            <div className="flex-nowrap form-floating">
                                                <input
                                                    id='cn'
                                                    className="form-control"
                                                    type="text"
                                                    placeholder='Name'
                                                    autoComplete='off'
                                                    value={course.name}
                                                    onChange={(e) => setCourse(prev => ({ ...prev, name: e.target.value }))}
                                                    required
                                                />
                                                <label htmlFor='cn'>Name</label>
                                            </div>
                                        </div>

                                        <div className="card-body">
                                            <div className="flex-nowrap form-floating">
                                                <input
                                                    id='cd'
                                                    className="form-control"
                                                    type="text"
                                                    placeholder='Duration'
                                                    autoComplete='off'
                                                    value={course.duration}
                                                    onChange={(e) => setCourse(prev => ({ ...prev, duration: e.target.value }))}
                                                    required
                                                />
                                                <label htmlFor='cd'>Duration</label>
                                            </div>
                                        </div>
                                    </div>

                                    <div className='col-md-6'>
                                        <div className="card-body">
                                            <div className="flex-nowrap form-floating">
                                                <input
                                                    id='cs'
                                                    className="form-control"
                                                    type="text"
                                                    placeholder='Specialization'
                                                    autoComplete='off'
                                                    value={course.specialization}
                                                    onChange={(e) => setCourse(prev => ({ ...prev, specialization: e.target.value }))}
                                                    required
                                                />
                                                <label htmlFor='cs'>Specialization</label>
                                            </div>
                                        </div>
                                    </div>

                                </div>

                            </fieldset>

                            <div className='d-flex flex-row'>

                                <div className="card-body">
                                    <button disabled={disabled.course} className="btn btn-success" onClick={handleCourse}>submit</button>
                                </div>

                                <div className="card-body">
                                    <button className="btn btn-primary" onClick={addCourse}>add another</button>
                                </div>

                            </div>

                        </form>
                    </div>
                {/* </div> */}
            </div>

            {/* Profile */}
            <div className='d-flex justify-content-center align-items-end m-3'>
                {/* <div className='d-inline-flex p-2'> */}
                    <div className="card container h-100 shadow-2-strong mt-5 p-4 shadow-sm" style={{ backgroundColor: '#f8f8f8' }}>
                        <form className="card-body">

                            <h2>Profile</h2>

                            <div className="form-row row mb-4">
                                <div className="form-group col-md-9">
                                    <label htmlFor="profile" className="form-label">
                                        <b>Profile pic </b>
                                        (File should be less than 2mb and
                                        only jpeg, jpg and png's allowed)
                                    </label>
                                    <input
                                        className="form-control mt-lg-4"
                                        type="file"
                                        id="profile"
                                        name="profile"
                                    />
                                </div>
                                <div className="form-group col-md-2 mt-4 mt-md-5">
                                <button
                                        className="btn btn-primary m-2"
                                        onClick={handleLogo}
                                    >
                                        upload
                                    </button>   
                                </div>
                            </div>


                        </form>
                    </div>
                {/* </div> */}

                <div className='d-inline-flex p-2'>
                    <Link className="btn btn-primary" to="/college">Home</Link>
                </div>

            </div>

        </>
    )

}

export default CollegeRegister;
